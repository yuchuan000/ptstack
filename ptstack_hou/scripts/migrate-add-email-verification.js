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
    console.log('开始数据库迁移：添加邮箱验证字段...');
    
    connection = await mysql.createConnection(config);
    console.log('已连接到数据库');
    
    // 检查email_verified字段
    const [emailVerifiedCol] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'email_verified'"
    );
    
    if (emailVerifiedCol.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN email_verified TINYINT DEFAULT 0 COMMENT '邮箱是否已验证：0-未验证，1-已验证'
        AFTER email
      `);
      console.log('email_verified字段添加成功');
    } else {
      console.log('email_verified字段已存在');
    }
    
    // 检查verification_token字段
    const [tokenCol] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'verification_token'"
    );
    
    if (tokenCol.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN verification_token VARCHAR(255) COMMENT '邮箱验证令牌'
        AFTER email_verified
      `);
      console.log('verification_token字段添加成功');
    } else {
      console.log('verification_token字段已存在');
    }
    
    // 检查verification_token_expires_at字段
    const [expiresCol] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'verification_token_expires_at'"
    );
    
    if (expiresCol.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN verification_token_expires_at DATETIME COMMENT '验证令牌过期时间'
        AFTER verification_token
      `);
      console.log('verification_token_expires_at字段添加成功');
    } else {
      console.log('verification_token_expires_at字段已存在');
    }
    
    // 将现有用户设置为已验证
    await connection.execute(`
      UPDATE users SET email_verified = 1 WHERE email_verified = 0
    `);
    console.log('已将现有用户设置为已验证');
    
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
