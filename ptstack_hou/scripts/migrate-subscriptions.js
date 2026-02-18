import mysql2 from 'mysql2/promise';
import 'dotenv/config';

const migrate = async () => {
  console.log('开始数据库迁移（订阅功能和用户隐私设置）...');
  
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
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        follower_id INT NOT NULL,
        following_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_subscription (follower_id, following_id),
        INDEX idx_follower_id (follower_id),
        INDEX idx_following_id (following_id),
        CONSTRAINT fk_subscription_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_subscription_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('subscriptions 表创建成功');
    
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS website VARCHAR(255),
      ADD COLUMN IF NOT EXISTS show_followers BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS show_following BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS show_articles BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS show_comments BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS follower_count INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0
    `);
    console.log('users 表字段添加成功');
    
    console.log('数据库迁移完成！');
  } catch (error) {
    console.error('迁移失败:', error);
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          follower_id INT NOT NULL,
          following_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_subscription (follower_id, following_id),
          INDEX idx_follower_id (follower_id),
          INDEX idx_following_id (following_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('subscriptions 表创建成功（简化版）');
      
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN bio TEXT,
        ADD COLUMN website VARCHAR(255),
        ADD COLUMN show_followers BOOLEAN DEFAULT TRUE,
        ADD COLUMN show_following BOOLEAN DEFAULT TRUE,
        ADD COLUMN show_articles BOOLEAN DEFAULT TRUE,
        ADD COLUMN show_comments BOOLEAN DEFAULT TRUE,
        ADD COLUMN follower_count INT DEFAULT 0,
        ADD COLUMN following_count INT DEFAULT 0
      `);
      console.log('users 表字段添加成功（简化版）');
    } catch (simpleError) {
      console.error('简化迁移也失败:', simpleError.message);
    }
  } finally {
    await connection.end();
    console.log('数据库连接已关闭');
  }
};

migrate().catch(console.error);
