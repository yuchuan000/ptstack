import { execute } from '../../config/db.js'

const addOverviewField = async () => {
  try {
    console.log('开始添加公告概述字段...')

    const columns = await execute(`
      SHOW COLUMNS FROM announcements LIKE 'overview'
    `)

    if (columns.length === 0) {
      await execute(`
        ALTER TABLE announcements 
        ADD COLUMN overview TEXT COMMENT '公告概述' 
        AFTER content
      `)
      console.log('✓ 成功添加 overview 字段')
    } else {
      console.log('✓ overview 字段已存在')
    }

    console.log('迁移完成！')
  } catch (error) {
    console.error('迁移失败:', error.message)
  }
}

addOverviewField()
