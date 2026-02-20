/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - achievements 表：修改 condition_value 字段，允许为 NULL
 * 
 * 功能说明：
 * - 将 achievements 表的 condition_value 字段从 NOT NULL 改为允许 NULL
 * - 支持创建无条件成就
 * 
 * 此脚本已弃用，功能已被 setup-database.js 完全替代
 * 此文件仅作为历史记录保留
 */

import { execute } from '../config/db.js'

console.log('开始修改 condition_value 字段，允许为空...')

try {
  await execute('ALTER TABLE achievements MODIFY COLUMN condition_value VARCHAR(255) DEFAULT NULL')
  
  console.log('✅ condition_value 字段修改成功！')
  process.exit(0)
} catch (error) {
  console.error('❌ 修改失败:', error.message)
  
  const columns = await execute("SHOW COLUMNS FROM achievements LIKE 'condition_value'")
  console.log('当前 condition_value 字段定义:', columns[0])
  
  process.exit(0)
}
