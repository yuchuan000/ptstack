/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - email_verifications 表：添加邮箱验证令牌字段
 * 
 * 功能说明：
 * - 添加 verification_token 字段
 * - 用于邮箱验证的令牌存储
 * 
 * 此脚本已弃用，功能已被 setup-database.js 完全替代
 * 此文件仅作为历史记录保留
 */

// 迁移脚本：添加验证令牌字段
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

// 加载环境变量
dotenv.config()

async function migrate() {
  console.log('开始迁移邮箱验证表，添加验证令牌字段...')
  
  // 创建数据库连接
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ptstack_db'
  })

  try {
    console.log('已连接到数据库')

    // 检查表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'email_verifications'"
    )

    if (tables.length === 0) {
      console.log('email_verifications表不存在，无需迁移')
      return
    }

    // 检查字段是否已存在
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM email_verifications LIKE 'verification_token'"
    )

    if (columns.length > 0) {
      console.log('verification_token字段已存在，无需迁移')
      return
    }

    // 添加验证令牌字段
    await connection.execute(`
      ALTER TABLE email_verifications 
      ADD COLUMN verification_token VARCHAR(255) NULL COMMENT '邮箱验证令牌' AFTER email_verified
    `)

    console.log('验证令牌字段添加成功！')

  } catch (error) {
    console.error('迁移失败:', error.message)
    throw error
  } finally {
    await connection.end()
    console.log('数据库连接已关闭')
  }
}

migrate().catch(console.error)
