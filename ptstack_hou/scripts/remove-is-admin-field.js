/**
 * ========================================
 * 移除 users 表中的 is_admin 字段
 * ========================================
 *
 * 此脚本用于从 users 表中删除 is_admin 字段，
 * 因为该字段已被 avatar_badge 相关字段替代。
 *
 * 使用方法：
 *   node scripts/remove-is-admin-field.js
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
 * 检查字段是否存在
 * @param {Object} connection - 数据库连接对象
 * @param {string} table - 表名
 * @param {string} column - 字段名
 * @returns {boolean} 字段是否存在
 */
async function columnExists(connection, table, column) {
  const [columns] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`)
  return columns.length > 0
}

/**
 * 移除 is_admin 字段
 */
async function removeIsAdminField() {
  console.log('========================================')
  console.log('移除 users 表中的 is_admin 字段')
  console.log('========================================')

  const connection = await mysql.createConnection(config)

  try {
    // 检查 is_admin 字段是否存在
    const exists = await columnExists(connection, 'users', 'is_admin')

    if (exists) {
      // 删除 is_admin 字段
      await connection.query(`ALTER TABLE users DROP COLUMN is_admin`)
      console.log('✓ 成功移除 users.is_admin 字段')
    } else {
      console.log('✓ users.is_admin 字段不存在，无需移除')
    }
  } catch (error) {
    console.error('✗ 移除字段失败:', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    await removeIsAdminField()
    console.log('\n========================================')
    console.log('✓ 操作完成！')
    console.log('========================================')
  } catch (error) {
    console.error('\n✗ 操作失败:', error)
    process.exit(1)
  }
}

main()
