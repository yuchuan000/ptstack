import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: 'ptstack_db',
};

async function migrateDatabase() {
  let connection;
  
  try {
    console.log('开始数据库迁移：添加临时邮箱验证表...');
    
    connection = await mysql.createConnection(config);
    console.log('已连接到数据库');
    
    // 创建临时邮箱验证表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL COMMENT '预注册的用户名',
        nickname VARCHAR(50) COMMENT '预注册的昵称',
        password VARCHAR(255) NOT NULL COMMENT '加密后的密码',
        email VARCHAR(100) NOT NULL COMMENT '预注册的邮箱',
        verification_token VARCHAR(255) NOT NULL UNIQUE COMMENT '邮箱验证令牌',
        verification_token_expires_at DATETIME NOT NULL COMMENT '验证令牌过期时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (verification_token),
        INDEX idx_email (email),
        INDEX idx_expires (verification_token_expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('临时邮箱验证表创建成功');
    
    // 从users表移除旧的验证相关字段（可选，保留也没关系）
    // 为了向后兼容，我们不移除字段，只是不再使用
    
    console.log('数据库迁移完成！');
    
  } catch (error) {
    console.error('数据库迁移失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

migrateDatabase().catch(console.error);

export default migrateDatabase;
