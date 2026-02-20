/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - email_verifications 表：更新临时验证表结构
 * 
 * 功能说明：
 * - 删除旧的 email_verifications 表
 * - 创建新的 email_verifications 表
 * - 简化表结构，移除预注册用户信息字段
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
  database: 'ptstack_db',
};

async function migrateDatabase() {
  let connection;
  
  try {
    console.log('开始数据库迁移：更新临时验证表结构...');
    
    connection = await mysql.createConnection(config);
    console.log('已连接到数据库');
    
    await connection.execute('DROP TABLE IF EXISTS email_verifications');
    console.log('旧的临时验证表已删除');
    
    await connection.execute(`
      CREATE TABLE email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL COMMENT '待验证的邮箱',
        verification_token VARCHAR(255) NOT NULL UNIQUE COMMENT '邮箱验证令牌',
        verification_token_expires_at DATETIME NOT NULL COMMENT '验证令牌过期时间',
        email_verified TINYINT DEFAULT 0 COMMENT '邮箱是否已验证：0-未验证，1-已验证',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (verification_token),
        INDEX idx_email (email),
        INDEX idx_expires (verification_token_expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('新的临时验证表创建成功');
    
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
