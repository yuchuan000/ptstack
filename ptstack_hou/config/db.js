/**
 * 数据库配置文件
 * 负责创建数据库连接池和提供数据库操作方法
 */
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url)
// 获取当前目录路径
const __dirname = path.dirname(__filename)

// 根据环境变量选择配置文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
// 加载环境变量
dotenv.config({ path: path.join(__dirname, '..', envFile) })

/**
 * 数据库连接池
 * 配置连接池参数，优化连接管理
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // 数据库主机
  user: process.env.DB_USER || 'root', // 数据库用户名
  password: process.env.DB_PASSWORD || '', // 数据库密码
  port: process.env.DB_PORT || 3306, // 数据库端口
  database: process.env.DB_NAME || 'ptstack', // 数据库名称
  waitForConnections: true, // 等待连接
  connectionLimit: 10, // 连接池最大连接数
  queueLimit: 0, // 队列限制（0表示无限制）
  // 连接池优化配置
  enableKeepAlive: true, // 启用保持连接
  keepAliveInitialDelay: 0, // 保持连接初始延迟
  connectTimeout: 30000, // 连接超时时间
  ssl: false, // 禁用SSL（本地开发环境）
})

/**
 * 测试数据库连接
 * @returns {Promise<boolean>} 连接是否成功
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('数据库连接成功')
    connection.release()
    return true
  } catch (error) {
    console.error('数据库连接失败:', error.message)
    return false
  }
}

/**
 * 执行SQL语句（带重试机制）
 * @param {string} sql - SQL语句
 * @param {Array} params - SQL参数
 * @param {number} retries - 重试次数
 * @returns {Promise<Array>} 执行结果
 */
async function execute(sql, params = [], retries = 3) {
  let lastError

  for (let i = 0; i < retries; i++) {
    try {
      const [results] = await pool.execute(sql, params)
      return results
    } catch (error) {
      console.error(`SQL执行失败 (尝试 ${i + 1}/${retries}):`, error.message)
      lastError = error

      // 如果是连接错误，等待后重试
      if (error.code === 'ECONNRESET' || error.code === 'EPIPE' || error.code === 'ECONNREFUSED') {
        if (i < retries - 1) {
          console.log('等待500ms后重试...')
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      } else {
        // 非连接错误，直接抛出
        throw error
      }
    }
  }

  // 所有重试都失败
  throw lastError
}

export { pool, testConnection, execute }
