/**
 * 文章私密功能迁移脚本
 * 功能：更新articles表的status字段注释，支持私密文章
 * status字段含义：
 *   0 - 草稿
 *   1 - 公开
 *   2 - 私密
 */

import { execute } from '../../config/db.js'

async function migrateArticlePrivacy() {
  console.log('========================================')
  console.log('开始迁移：文章私密功能')
  console.log('========================================')

  try {
    console.log('\n1. 更新 articles 表 status 字段注释...')
    await execute(`
      ALTER TABLE articles 
      MODIFY COLUMN status TINYINT DEFAULT 1 
      COMMENT '发布状态：0-草稿，1-公开，2-私密'
    `)
    console.log('✓ status 字段注释更新成功')

    console.log('\n2. 确保所有已发布的文章（status=1）保持公开状态...')
    const result = await execute(`
      UPDATE articles 
      SET status = 1 
      WHERE status = 1
    `)
    console.log(`✓ 已更新 ${result.affectedRows} 篇文章的状态为公开`)

    console.log('\n========================================')
    console.log('迁移完成！')
    console.log('========================================')
    console.log('\nstatus 字段说明：')
    console.log('  0 - 草稿')
    console.log('  1 - 公开（默认）')
    console.log('  2 - 私密（仅作者可见）')
  } catch (error) {
    console.error('迁移失败:', error)
    process.exit(1)
  }
}

migrateArticlePrivacy()
