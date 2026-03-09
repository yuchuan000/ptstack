/**
 * 定时任务管理器
 * 
 * 此脚本用于管理系统的定时任务，包括：
 * 1. 每日统计数据更新（每天凌晨00:00执行）
 * 
 * 使用方法：
 *   node scripts/cron-jobs.js
 * 
 * 启动后会在后台运行，自动执行定时任务
 */

import cron from 'node-cron'
import { exec } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 执行统计数据更新脚本
 */
function runUpdateStats() {
  console.log('========================================')
  console.log('执行统计数据更新任务')
  console.log('========================================')
  console.log(`开始执行：${new Date().toISOString()}`)

  const updateStatsScript = path.join(__dirname, 'update-stats.js')
  const command = `node ${updateStatsScript}`

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('✗ 统计数据更新失败:', error.message)
      return
    }
    if (stderr) {
      console.error('✗ 执行过程中出现错误:', stderr)
      return
    }
    console.log('✓ 统计数据更新执行结果:')
    console.log(stdout)
    console.log(`✓ 执行完成：${new Date().toISOString()}`)
  })
}

/**
 * 初始化定时任务
 */
function initCronJobs() {
  console.log('========================================')
  console.log('初始化定时任务')
  console.log('========================================')
  console.log('开始启动定时任务管理器...\n')

  // 每小时统计数据更新（每小时执行一次）
  const statsJob = cron.schedule('0 * * * *', () => {
    runUpdateStats()
  })

  console.log('✓ 每小时统计数据更新任务已启动（每小时执行一次）')

  // 立即执行一次统计数据更新，测试任务是否正常
  console.log('\n✓ 立即执行一次统计数据更新，测试任务是否正常...')
  runUpdateStats()

  console.log('\n========================================')
  console.log('定时任务管理器启动完成！')
  console.log('========================================\n')
  console.log('按 Ctrl+C 停止定时任务管理器')
}

// 启动定时任务管理器
initCronJobs()