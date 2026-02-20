/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - achievements 表：清理重复成就数据
 * 
 * 功能说明：
 * - 查找并删除 achievements 表中的重复记录
 * - 添加唯一约束防止未来重复
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
  console.log('开始清理重复成就数据...');
  
  const connection = await mysql.createConnection(config);
  
  try {
    // 1. 查看当前有哪些成就
    console.log('\n1. 查询当前所有成就：');
    const [achievements] = await connection.execute('SELECT * FROM achievements ORDER BY type, condition_value');
    console.log(`  共有 ${achievements.length} 条成就记录`);
    
    // 2. 找出重复的成就（按 type 和 condition_value 重复）
    console.log('\n2. 查找重复的成就：');
    const [duplicates] = await connection.execute(`
      SELECT name, description, type, condition_value, COUNT(*) as count
      FROM achievements
      GROUP BY name, description, type, condition_value
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.length === 0) {
      console.log('  没有发现重复的成就');
    } else {
      console.log(`  发现 ${duplicates.length} 组重复成就：`);
      duplicates.forEach(d => {
        console.log(`    - ${d.name} (${d.type} × ${d.condition_value}): ${d.count} 条`);
      });
    }
    
    // 3. 清理重复数据，保留每个组合的最小ID
    console.log('\n3. 清理重复数据...');
    const [deleteResult] = await connection.execute(`
      DELETE a1 FROM achievements a1
      INNER JOIN achievements a2 
      WHERE a1.id > a2.id 
      AND a1.name = a2.name 
      AND a1.type = a2.type 
      AND a1.condition_value = a2.condition_value
    `);
    console.log(`  删除了 ${deleteResult.affectedRows} 条重复记录`);
    
    // 4. 添加唯一约束防止未来重复
    console.log('\n4. 添加唯一约束...');
    await connection.execute(`
      ALTER TABLE achievements 
      ADD UNIQUE KEY unique_achievement (name, type, condition_value)
    `);
    console.log('  唯一约束添加成功');
    
    // 5. 验证清理结果
    console.log('\n5. 验证清理结果：');
    const [remaining] = await connection.execute('SELECT * FROM achievements ORDER BY type, condition_value');
    console.log(`  现在共有 ${remaining.length} 条成就记录：`);
    remaining.forEach(a => {
      console.log(`    - [${a.id}] ${a.name} (${a.type} × ${a.condition_value})`);
    });
    
    console.log('\n✓ 清理完成！');
    
  } catch (error) {
    // 如果唯一约束已经存在，会报错，但这没关系
    if (error.code === 'ER_DUP_KEYNAME') {
      console.log('\n  唯一约束已经存在，跳过添加');
    } else {
      console.error('\n✗ 清理失败:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('执行失败:', error);
  process.exit(1);
});
