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
    console.log('开始迁移数据库...');
    
    // 1. 添加文章表的comment_count字段
    console.log('添加 articles.comment_count 字段...');
    await connection.execute(`
      ALTER TABLE articles 
      ADD COLUMN comment_count INT DEFAULT 0 AFTER like_count
    `).catch(err => {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        throw err;
      }
      console.log('  articles.comment_count 字段已存在');
    });
    
    // 2. 创建评论点赞表
    console.log('创建 comment_likes 表...');
    await connection.execute(`
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
    
    // 3. 添加评论表的like_count字段
    console.log('添加 comments.like_count 字段...');
    await connection.execute(`
      ALTER TABLE comments 
      ADD COLUMN like_count INT DEFAULT 0 AFTER content
    `).catch(err => {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        throw err;
      }
      console.log('  comments.like_count 字段已存在');
    });
    
    // 4. 创建订阅表
    console.log('创建 subscriptions 表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        follower_id INT NOT NULL COMMENT '关注者ID',
        following_id INT NOT NULL COMMENT '被关注者ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_subscription (follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 5. 添加用户表的关注相关字段
    console.log('添加 users.follower_count 字段...');
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN follower_count INT DEFAULT 0 AFTER profile_completed
    `).catch(err => {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        throw err;
      }
      console.log('  users.follower_count 字段已存在');
    });
    
    console.log('添加 users.following_count 字段...');
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN following_count INT DEFAULT 0 AFTER follower_count
    `).catch(err => {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        throw err;
      }
      console.log('  users.following_count 字段已存在');
    });
    
    console.log('数据库迁移完成！');
    
  } catch (error) {
    console.error('迁移失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate();
