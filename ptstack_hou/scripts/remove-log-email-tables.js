/**
 * 移除日志管理和邮箱管理相关表结构的迁移脚本
 *
 * 此脚本用于删除与日志管理和邮箱管理相关的表结构，包括：
 * 1. email_verifications - 邮箱验证表
 * 2. logs - 系统日志表
 * 3. email_configs - 邮箱配置表
 * 4. email_logs - 邮件发送日志表
 *
 * 使用方法：
 *   node scripts/remove-log-email-tables.js
 */

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: path.join(__dirname, '..', envFile) })

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'ptstack_db',
  multipleStatements: true,
}

/**
 * 删除表（如果存在）
 * @param {Object} connection - 数据库连接对象
 * @param {string} tableName - 表名
 */
async function dropTableIfExists(connection, tableName) {
  try {
    await connection.execute(`DROP TABLE IF EXISTS ${tableName}`)
    console.log(`✓ 删除表 ${tableName} 成功（或不存在）`)
  } catch (error) {
    console.error(`✗ 删除表 ${tableName} 失败:`, error.message)
  }
}

/**
 * 主函数：执行删除操作
 */
async function main() {
  console.log('========================================')
  console.log('移除日志管理和邮箱管理相关表结构')
  console.log('========================================')
  console.log('开始执行删除操作...\n')

  let connection

  try {
    // 连接数据库
    connection = await mysql.createConnection(config)
    console.log('✓ 已连接到数据库')

    // 删除与邮箱管理相关的表
    await dropTableIfExists(connection, 'email_verifications')
    await dropTableIfExists(connection, 'email_configs')
    await dropTableIfExists(connection, 'email_logs')

    // 删除与日志管理相关的表
    await dropTableIfExists(connection, 'logs')

    console.log('\n========================================')
    console.log('✓ 表结构删除完成！')
    console.log('========================================\n')
  } catch (error) {
    console.error('\n✗ 操作失败:', error.message)
    console.error('错误详情:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('✓ 数据库连接已关闭')
    }
  }
}

main()
