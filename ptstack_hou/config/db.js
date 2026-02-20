import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'ptstack', // 指定数据库名称
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 连接池优化配置
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // 增加连接超时和重连配置
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 60000,
  // 连接重试配置
  reconnect: true,
  // 增加最大包大小限制（64MB）
  maxAllowedPacket: 67108864,
  // 增加连接池健康检查
  idleTimeout: 60000,
  // 禁用SSL（本地开发环境）
  ssl: false
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    return false;
  }
}

// 执行SQL语句（带重试机制）
async function execute(sql, params = [], retries = 3) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error(`SQL执行失败 (尝试 ${i + 1}/${retries}):`, error.message);
      lastError = error;
      
      // 如果是连接错误，等待后重试
      if (error.code === 'ECONNRESET' || error.code === 'EPIPE' || error.code === 'ECONNREFUSED') {
        if (i < retries - 1) {
          console.log('等待500ms后重试...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        // 非连接错误，直接抛出
        throw error;
      }
    }
  }
  
  // 所有重试都失败
  throw lastError;
}

export { pool, testConnection, execute };
