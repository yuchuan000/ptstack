/**
 * 统计数据回填脚本
 * 
 * 此脚本用于批量生成过去30天的统计数据，包括：
 * 1. 用户增长数据
 * 2. 文章发布数据
 * 3. 评论数据
 * 
 * 使用方法：
 *   node scripts/backfill-stats.js
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
 * 获取指定天数前的日期
 * @param {number} days - 天数
 * @returns {string} 日期（YYYY-MM-DD格式）
 */
function getDateDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

/**
 * 计算用户增长数据
 * @param {Object} connection - 数据库连接对象
 * @param {string} date - 日期（YYYY-MM-DD格式）
 * @returns {Promise<number>} 用户增长数量
 */
async function calculateUserGrowth(connection, date) {
  const [result] = await connection.execute(
    `SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?`,
    [date]
  )
  return result[0].count
}

/**
 * 计算文章发布数据
 * @param {Object} connection - 数据库连接对象
 * @param {string} date - 日期（YYYY-MM-DD格式）
 * @returns {Promise<number>} 文章发布数量
 */
async function calculateArticlePublish(connection, date) {
  const [result] = await connection.execute(
    `SELECT COUNT(*) as count FROM articles WHERE DATE(created_at) = ? AND status = 1`,
    [date]
  )
  return result[0].count
}

/**
 * 计算评论数据
 * @param {Object} connection - 数据库连接对象
 * @param {string} date - 日期（YYYY-MM-DD格式）
 * @returns {Promise<number>} 评论数量
 */
async function calculateComment(connection, date) {
  const [result] = await connection.execute(
    `SELECT COUNT(*) as count FROM comments WHERE DATE(created_at) = ?`,
    [date]
  )
  return result[0].count
}

/**
 * 保存统计数据
 * @param {Object} connection - 数据库连接对象
 * @param {string} date - 日期（YYYY-MM-DD格式）
 * @param {string} metricType - 指标类型
 * @param {number} value - 指标值
 */
async function saveStats(connection, date, metricType, value) {
  await connection.execute(
    `INSERT INTO stats (date, metric_type, value) 
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE value = ?`,
    [date, metricType, value, value]
  )
}

/**
 * 回填统计数据
 */
async function backfillStats() {
  console.log('========================================')
  console.log('回填统计数据')
  console.log('========================================')
  console.log('开始执行统计数据回填...\n')

  let connection

  try {
    // 连接数据库
    connection = await mysql.createConnection(config)
    console.log('✓ 已连接到数据库')

    // 计算过去30天的统计数据
    console.log('✓ 开始计算过去30天的统计数据...')
    for (let i = 30; i >= 1; i--) {
      const date = getDateDaysAgo(i)
      console.log(`\n处理日期：${date}`)

      // 计算各项统计数据
      const userGrowth = await calculateUserGrowth(connection, date)
      const articlePublish = await calculateArticlePublish(connection, date)
      const comment = await calculateComment(connection, date)

      console.log(`  - 用户增长：${userGrowth}`)
      console.log(`  - 文章发布：${articlePublish}`)
      console.log(`  - 评论数量：${comment}`)

      // 保存统计数据
      await saveStats(connection, date, 'user_growth', userGrowth)
      await saveStats(connection, date, 'article_publishing', articlePublish)
      await saveStats(connection, date, 'comment_trend', comment)

      console.log(`  ✓ 数据保存成功`)
    }

    console.log('\n✓ 统计数据回填完成！')
    console.log('========================================\n')
  } catch (error) {
    console.error('\n✗ 统计数据回填失败:', error.message)
    console.error('错误详情:', error)
  } finally {
    if (connection) {
      await connection.end()
      console.log('✓ 数据库连接已关闭')
    }
  }
}

// 执行统计数据回填
backfillStats()
