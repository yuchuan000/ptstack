/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - comments 表：添加评论点赞数字段
 * - comment_likes 表：创建评论点赞记录表
 * 
 * 功能说明：
 * - 添加 comments.like_count 字段：评论点赞数
 * - 创建 comment_likes 表：记录用户对评论的点赞
 * 
 * 此脚本已弃用，功能已被 setup-database.js 完全替代
 * 此文件仅作为历史记录保留
 */

import mysql2 from 'mysql2/promise';
import 'dotenv/config';

const migrate = async () => {
  console.log('开始评论点赞表迁移...');
  
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
      ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0
    `);
    console.log('comments 表 like_count 字段添加成功');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_comment_like (comment_id, user_id),
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('comment_likes 表创建成功');
    
    console.log('迁移完成！');
  } catch (error) {
    console.error('迁移失败:', error);
    try {
      await connection.query(`
        ALTER TABLE comments 
        ADD COLUMN like_count INT DEFAULT 0
      `);
      await connection.query(`
        CREATE TABLE comment_likes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          comment_id INT NOT NULL,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_comment_like (comment_id, user_id),
          FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('迁移成功（简化版）');
    } catch (simpleError) {
      console.error('简化迁移也失败:', simpleError.message);
    }
  } finally {
    await connection.end();
    console.log('数据库连接已关闭');
  }
};

migrate().catch(console.error);
