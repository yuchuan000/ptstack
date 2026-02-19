/**
 * ========================================
 * 历史归档脚本 - 已弃用
 * ========================================
 * 
 * 此脚本已过时，功能已被 setup-database.js 完全替代
 * 请使用 scripts/setup-database.js 进行数据库初始化
 * 此文件仅作为历史记录保留
 */

import mysql2 from 'mysql2/promise';
import 'dotenv/config';

const migrate = async () => {
  console.log('开始数据库迁移...');
  
  const connection = await mysql2.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ptstack_db',
  });
  
  try {
    console.log('已连接到数据库');
    
    await connection.query(`
      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS parent_id INT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS reply_to_user_id INT DEFAULT NULL,
      ADD INDEX IF NOT EXISTS idx_parent_id (parent_id),
      ADD CONSTRAINT IF NOT EXISTS fk_comment_parent 
        FOREIGN KEY IF NOT EXISTS (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
      ADD CONSTRAINT IF NOT EXISTS fk_reply_to_user 
        FOREIGN KEY IF NOT EXISTS (reply_to_user_id) REFERENCES users(id) ON DELETE SET NULL
    `);
    console.log('comments 表字段添加成功');
    
    console.log('数据库迁移完成！');
  } catch (error) {
    console.error('迁移失败:', error);
    try {
      await connection.query(`
        ALTER TABLE comments 
        ADD COLUMN parent_id INT DEFAULT NULL
      `);
      await connection.query(`
        ALTER TABLE comments 
        ADD COLUMN reply_to_user_id INT DEFAULT NULL
      `);
      console.log('comments 表字段添加成功（简化版）');
    } catch (simpleError) {
      console.error('简化迁移也失败:', simpleError.message);
    }
  } finally {
    await connection.end();
    console.log('数据库连接已关闭');
  }
};

migrate().catch(console.error);
