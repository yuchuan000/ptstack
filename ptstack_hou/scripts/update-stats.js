/**
 * 统计数据更新脚本
 * 
 * 此脚本用于每日自动更新统计数据，包括：
 * 1. 用户增长数据
 * 2. 文章发布数据
 * 3. 评论数据
 * 
 * 使用方法：
 *   node scripts/update-stats.js
 * 
 * 定时任务配置：每天凌晨00:00执行
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
 * 获取前一天的日期
 * @returns {string} 前一天的日期（YYYY-MM-DD格式）
 */
function getYesterdayDate() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
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
 * 计算在线用户数
 * @param {Object} connection - 数据库连接对象
 * @returns {Promise<number>} 在线用户数量
 */
async function calculateOnlineUsers(connection) {
  // 计算最近15分钟内有活动的用户数
  const [result] = await connection.execute(
    `SELECT COUNT(*) as count FROM users WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)`
  )
  return result[0].count
}

/**
 * 保存统计数据
 * @param {Object} connection - 数据库连接对象
 * @param {string} date - 日期（YYYY-MM-DD格式）
 * @param {string} metricType - 指标类型
 * @param {number} value - 指标值
 * @param {number} hour - 小时（可选）
 */
async function saveStats(connection, date, metricType, value, hour = null) {
  if (hour !== null) {
    await connection.execute(
      `INSERT INTO stats (date, metric_type, value, hour) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE value = ?`,
      [date, metricType, value, hour, value]
    )
  } else {
    await connection.execute(
      `INSERT INTO stats (date, metric_type, value) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE value = ?`,
      [date, metricType, value, value]
    )
  }
}

/**
 * 更新统计数据
 */
async function updateStats() {
  console.log('========================================')
  console.log('更新统计数据')
  console.log('========================================')
  console.log('开始执行统计数据更新...\n')

  let connection

  try {
    // 连接数据库
    connection = await mysql.createConnection(config)
    console.log('✓ 已连接到数据库')

    // 获取当前日期和小时
    const today = new Date().toISOString().split('T')[0]
    const currentHour = new Date().getHours()
    console.log(`✓ 当前日期：${today}`)
    console.log(`✓ 当前小时：${currentHour}`)

    // 计算各项统计数据
    console.log('✓ 开始计算统计数据...')
    
    // 计算在线用户数
    const onlineUsers = await calculateOnlineUsers(connection)
    console.log(`✓ 在线用户数：${onlineUsers}`)

    // 保存在线用户数统计数据
    console.log('✓ 开始保存在线用户数统计数据...')
    await saveStats(connection, today, 'online_users', onlineUsers, currentHour)
    console.log('✓ 在线用户数统计数据保存成功')

    // 获取前一天的日期
    const yesterday = getYesterdayDate()
    console.log(`\n✓ 统计日期（日统计）：${yesterday}`)

    // 计算日统计数据
    const userGrowth = await calculateUserGrowth(connection, yesterday)
    const articlePublish = await calculateArticlePublish(connection, yesterday)
    const comment = await calculateComment(connection, yesterday)

    console.log(`✓ 用户增长：${userGrowth}`)
    console.log(`✓ 文章发布：${articlePublish}`)
    console.log(`✓ 评论数量：${comment}`)

    // 保存日统计数据
    console.log('✓ 开始保存日统计数据...')
    await saveStats(connection, yesterday, 'user_growth', userGrowth)
    await saveStats(connection, yesterday, 'article_publishing', articlePublish)
    await saveStats(connection, yesterday, 'comment_trend', comment)

    console.log('✓ 日统计数据保存成功')

    console.log('\n========================================')
    console.log('✓ 统计数据更新完成！')
    console.log('========================================\n')
  } catch (error) {
    console.error('\n✗ 统计数据更新失败:', error.message)
    console.error('错误详情:', error)
  } finally {
    if (connection) {
      await connection.end()
      console.log('✓ 数据库连接已关闭')
    }
  }
}

// 执行统计数据更新
updateStats()