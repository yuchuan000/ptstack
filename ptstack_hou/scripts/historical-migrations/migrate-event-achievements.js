/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - achievements 表：活动成就功能扩展
 * 
 * 功能说明：
 * - 添加 category 字段：成就分类（regular-常规，event-活动）
 * - 添加 start_time/end_time 字段：活动开始和结束时间
 * - 更新唯一约束，包含 category 字段
 * - 标记现有成就为常规成就
 * 
 * 此脚本已弃用，功能已被 setup-database.js 完全替代
 * 此文件仅作为历史记录保留
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'ptstack_db',
  multipleStatements: true
};

async function main() {
  console.log('开始添加活动成就功能...');
  
  const connection = await mysql.createConnection(config);
  
  try {
    // 1. 添加成就分类字段
    console.log('\n1. 添加成就分类字段...');
    const [columns] = await connection.query(`SHOW COLUMNS FROM achievements LIKE 'category'`);
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE achievements 
        ADD COLUMN category VARCHAR(50) DEFAULT 'regular' COMMENT '成就分类：regular-常规成就，event-活动成就' AFTER type
      `);
      console.log('  ✓ 成就分类字段添加成功');
    } else {
      console.log('  ✓ 成就分类字段已存在');
    }
    
    // 2. 添加活动开始时间
    console.log('\n2. 添加活动开始时间字段...');
    const [startTimeColumns] = await connection.query(`SHOW COLUMNS FROM achievements LIKE 'start_time'`);
    if (startTimeColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE achievements 
        ADD COLUMN start_time TIMESTAMP NULL COMMENT '活动开始时间' AFTER icon
      `);
      console.log('  ✓ 活动开始时间字段添加成功');
    } else {
      console.log('  ✓ 活动开始时间字段已存在');
    }
    
    // 3. 添加活动结束时间
    console.log('\n3. 添加活动结束时间字段...');
    const [endTimeColumns] = await connection.query(`SHOW COLUMNS FROM achievements LIKE 'end_time'`);
    if (endTimeColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE achievements 
        ADD COLUMN end_time TIMESTAMP NULL COMMENT '活动结束时间' AFTER start_time
      `);
      console.log('  ✓ 活动结束时间字段添加成功');
    } else {
      console.log('  ✓ 活动结束时间字段已存在');
    }
    
    // 4. 添加活动成就的唯一约束
    console.log('\n4. 更新唯一约束，包含分类...');
    try {
      await connection.execute(`ALTER TABLE achievements DROP INDEX unique_achievement`);
    } catch (error) {
      console.log('  唯一约束不存在或已删除');
    }
    
    await connection.execute(`
      ALTER TABLE achievements 
      ADD UNIQUE KEY unique_achievement (name, type, category, condition_value)
    `);
    console.log('  ✓ 唯一约束更新成功');
    
    // 5. 将现有成就标记为常规成就
    console.log('\n5. 标记现有成就为常规成就...');
    await connection.execute(`
      UPDATE achievements SET category = 'regular' WHERE category IS NULL OR category = ''
    `);
    console.log('  ✓ 现有成就标记完成');
    
    // 6. 验证结果
    console.log('\n6. 验证结果：');
    const [achievements] = await connection.execute('SELECT * FROM achievements ORDER BY category, type, condition_value');
    console.log(`  共有 ${achievements.length} 条成就记录`);
    achievements.forEach(a => {
      const categoryLabel = a.category === 'event' ? '活动成就' : '常规成就';
      console.log(`    - [${a.id}] ${a.name} (${categoryLabel})`);
    });
    
    console.log('\n✓ 数据库更新完成！');
    
  } catch (error) {
    console.error('\n✗ 更新失败:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('执行失败:', error);
  process.exit(1);
});
