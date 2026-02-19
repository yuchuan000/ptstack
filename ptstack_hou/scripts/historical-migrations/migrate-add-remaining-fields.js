import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: 'ptstack_db'
};

async function migrate() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('开始迁移剩余字段...');
    
    // 1. 添加 comments.reply_to_comment_id 字段
    console.log('添加 comments.reply_to_comment_id 字段...');
    const [columns] = await connection.execute('SHOW COLUMNS FROM comments LIKE "reply_to_comment_id"');
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE comments 
        ADD COLUMN reply_to_comment_id INT DEFAULT NULL AFTER parent_id,
        ADD INDEX idx_reply_to_comment (reply_to_comment_id),
        ADD CONSTRAINT fk_reply_to_comment FOREIGN KEY (reply_to_comment_id) REFERENCES comments(id) ON DELETE SET NULL
      `);
      console.log('  comments.reply_to_comment_id 添加成功');
    } else {
      console.log('  comments.reply_to_comment_id 字段已存在');
    }
    
    // 2. 添加 articles.share_count 字段
    console.log('添加 articles.share_count 字段...');
    const [shareColumns] = await connection.execute('SHOW COLUMNS FROM articles LIKE "share_count"');
    if (shareColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE articles 
        ADD COLUMN share_count INT DEFAULT 0 AFTER like_count
      `);
      console.log('  articles.share_count 添加成功');
    } else {
      console.log('  articles.share_count 字段已存在');
    }
    
    // 3. 添加 users.bio 字段
    console.log('添加 users.bio 字段...');
    const [bioColumns] = await connection.execute('SHOW COLUMNS FROM users LIKE "bio"');
    if (bioColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN bio VARCHAR(500) DEFAULT NULL AFTER avatar
      `);
      console.log('  users.bio 添加成功');
    } else {
      console.log('  users.bio 字段已存在');
    }
    
    console.log('剩余字段迁移完成！');
    
  } catch (error) {
    console.error('迁移失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate();
