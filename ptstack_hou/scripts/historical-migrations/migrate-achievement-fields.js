/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - achievements 表：添加成就系统扩展字段
 * 
 * 功能说明：
 * - 添加 is_event 字段：标记是否为活动成就
 * - 添加 is_limited 字段：标记是否为限定成就
 * - 添加 is_unconditional 字段：标记是否为无条件成就
 * - 添加 custom_tag 字段：自定义标签
 * - 将旧的 type='event' 记录迁移到 is_event=1
 * 
 * 此脚本已弃用，功能已被 setup-database.js 完全替代
 * 此文件仅作为历史记录保留
 */

import { execute } from '../config/db.js'

const migrateAchievements = async () => {
  try {
    console.log('开始迁移成就表结构...')
    
    // 检查并添加 is_event 字段
    const checkIsEvent = await execute("SHOW COLUMNS FROM achievements LIKE 'is_event'")
    if (checkIsEvent.length === 0) {
      console.log('添加 is_event 字段...')
      await execute('ALTER TABLE achievements ADD COLUMN is_event TINYINT(1) DEFAULT 0')
      // 把原来 type='event' 的记录设为 is_event=1
      await execute("UPDATE achievements SET is_event = 1 WHERE type = 'event'")
      console.log('is_event 字段添加完成')
    }
    
    // 添加 is_limited 字段
    const checkIsLimited = await execute("SHOW COLUMNS FROM achievements LIKE 'is_limited'")
    if (checkIsLimited.length === 0) {
      console.log('添加 is_limited 字段...')
      await execute('ALTER TABLE achievements ADD COLUMN is_limited TINYINT(1) DEFAULT 0')
      console.log('is_limited 字段添加完成')
    }
    
    // 添加 is_unconditional 字段
    const checkIsUnconditional = await execute("SHOW COLUMNS FROM achievements LIKE 'is_unconditional'")
    if (checkIsUnconditional.length === 0) {
      console.log('添加 is_unconditional 字段...')
      await execute('ALTER TABLE achievements ADD COLUMN is_unconditional TINYINT(1) DEFAULT 0')
      console.log('is_unconditional 字段添加完成')
    }
    
    // 添加 custom_tag 字段
    const checkCustomTag = await execute("SHOW COLUMNS FROM achievements LIKE 'custom_tag'")
    if (checkCustomTag.length === 0) {
      console.log('添加 custom_tag 字段...')
      await execute('ALTER TABLE achievements ADD COLUMN custom_tag VARCHAR(50) DEFAULT NULL')
      console.log('custom_tag 字段添加完成')
    }
    
    console.log('成就表结构迁移完成！')
    process.exit(0)
  } catch (error) {
    console.error('迁移失败:', error)
    process.exit(1)
  }
}

migrateAchievements()
