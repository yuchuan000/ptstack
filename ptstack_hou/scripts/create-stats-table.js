/**
 * 创建统计数据表的脚本
 * 
 * 此脚本用于创建统计数据表，存储用户增长、文章发布和评论趋势等指标
 * 表结构：
 * - id: 主键
 * - date: 日期（YYYY-MM-DD格式）
 * - metric_type: 指标类型（user_growth, article_publish, comment）
 * - value: 指标值
 * - created_at: 创建时间
 * - updated_at: 更新时间
 * 
 * 使用方法：
 *   node scripts/create-stats-table.js
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
 * 创建统计数据表
 */
async function createStatsTable() {
  console.log('========================================')
  console.log('创建统计数据表')
  console.log('========================================')
  console.log('开始执行数据库操作...\n')

  let connection

  try {
    // 连接数据库
    connection = await mysql.createConnection(config)
    console.log('✓ 已连接到数据库')

    // 删除现有表（如果存在）
    await connection.execute(`DROP TABLE IF EXISTS stats`)
    console.log('✓ 已删除现有统计数据表')

    // 创建统计数据表
    await connection.execute(`
      CREATE TABLE stats (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '统计记录ID',
        date DATE NOT NULL COMMENT '统计日期（YYYY-MM-DD）',
        metric_type ENUM('user_growth', 'article_publishing', 'comment_trend') NOT NULL COMMENT '指标类型',
        value INT DEFAULT 0 COMMENT '指标值',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        UNIQUE KEY unique_stats (date, metric_type),
        INDEX idx_date (date),
        INDEX idx_metric_type (metric_type),
        INDEX idx_date_metric_type (date, metric_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ 统计数据表创建成功（或已存在）')

    console.log('\n========================================')
    console.log('✓ 操作完成！')
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

createStatsTable()