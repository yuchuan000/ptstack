/**
 * ========================================
 * PTStack 数据库清理脚本
 * ========================================
 *
 * 功能：清理数据库中多余的字段和表
 *
 * 清理内容：
 * 1. 删除 about_footer 表中的 row_id 字段（已被 pc_row_id 和 mobile_row_id 替代）
 *
 * 使用方法：
 *   node scripts/cleanup-database.js
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
 * @returns {Promise<boolean>} 是否存在
 */
async function checkColumnExists(connection, table, column) {
  const [columns] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`)
  return columns.length > 0
}

/**
 * 删除字段
 * @param {Object} connection - 数据库连接对象
 * @param {string} table - 表名
 * @param {string} column - 字段名
 * @returns {Promise<boolean>} 是否成功删除
 */
async function dropColumn(connection, table, column) {
  try {
    await connection.query(`ALTER TABLE ${table} DROP COLUMN ${column}`)
    console.log(`✓ 删除字段 ${table}.${column} 成功`)
    return true
  } catch (error) {
    console.error(`✗ 删除字段 ${table}.${column} 失败:`, error.message)
    return false
  }
}

/**
 * 清理数据库
 */
async function cleanupDatabase() {
  console.log('========================================')
  console.log('PTStack 数据库清理脚本')
  console.log('========================================')
  console.log('开始清理数据库...\n')

  const connection = await mysql.createConnection(config)

  try {
    // 检查并删除 about_footer 表中的 row_id 字段
    console.log('\n----------------------------------------')
    console.log('清理 about_footer 表...')
    console.log('----------------------------------------')

    const rowIdExists = await checkColumnExists(connection, 'about_footer', 'row_id')
    if (rowIdExists) {
      await dropColumn(connection, 'about_footer', 'row_id')
    } else {
      console.log('✓ about_footer.row_id 字段不存在，无需清理')
    }

    // 检查其他可能的多余字段
    console.log('\n----------------------------------------')
    console.log('检查其他表...')
    console.log('----------------------------------------')

    // 这里可以添加其他表的清理逻辑

    console.log('\n========================================')
    console.log('✓ 数据库清理完成！')
    console.log('========================================\n')
  } catch (error) {
    console.error('\n✗ 数据库清理失败:', error.message)
    console.error('错误详情:', error)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

// 执行清理
cleanupDatabase()
