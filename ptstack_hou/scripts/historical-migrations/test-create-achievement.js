/**
 * ========================================
 * 历史测试脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - achievements 表：测试成就创建功能
 * 
 * 功能说明：
 * - 测试创建不同类型的成就
 * - 验证字段是否可以正确为 NULL
 * - 测试新字段（is_event, is_limited, is_unconditional, custom_tag）
 * 
 * 此脚本已弃用，仅用于历史记录
 * 此文件仅作为历史记录保留
 */

import { execute } from '../config/db.js'

console.log('开始测试成就创建逻辑...')

const testData = {
  name: '测试成就',
  description: '这是一个测试成就',
  type: null,
  condition_value: null,
  icon: null,
  category: 'regular',
  start_time: null,
  end_time: null,
  is_event: false,
  is_limited: true,
  is_unconditional: true,
  custom_tag: '测试标签'
}

console.log('测试数据:', testData)

try {
  const result = await execute(
    'INSERT INTO achievements (name, description, type, condition_value, icon, category, start_time, end_time, is_event, is_limited, is_unconditional, custom_tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      testData.name, 
      testData.description, 
      testData.type || null, 
      testData.condition_value || null, 
      testData.icon || null, 
      testData.category || 'regular', 
      testData.start_time || null, 
      testData.end_time || null,
      testData.is_event ? 1 : 0,
      testData.is_limited ? 1 : 0,
      testData.is_unconditional ? 1 : 0,
      testData.custom_tag || null
    ]
  )

  console.log('✅ 创建成功！成就ID:', result.insertId)
} catch (error) {
  console.error('❌ 创建失败:', error.message)
  console.error('错误详情:', error)
}

process.exit(0)
