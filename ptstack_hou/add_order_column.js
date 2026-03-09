import { execute } from './config/db.js'
;(async () => {
  try {
    await execute('ALTER TABLE categories ADD COLUMN `order` INTEGER DEFAULT 0;')
    console.log('添加排序字段成功')
  } catch (error) {
    console.error('添加排序字段失败:', error.message)
  }
})()
