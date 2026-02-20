/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - email_verifications 表：从令牌验证迁移到验证码验证
 * 
 * 功能说明：
 * - 备份旧的 email_verifications 表
 * - 删除旧的 email_verifications 表
 * - 创建新的 email_verifications 表，使用验证码而不是令牌
 * - 添加 verification_code 和 verification_code_expires_at 字段
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
  database: 'ptstack_db'
};

async function migrateVerificationTable() {
  let connection;
  
  try {
    console.log('开始迁移邮箱验证表...');
    
    connection = await mysql.createConnection(config);
    console.log('已连接到数据库');
    
    try {
      const [rows] = await connection.query(`SHOW TABLES LIKE 'email_verifications'`);
      if (rows.length > 0) {
        console.log('发现旧表，正在备份...');
        await connection.query(`CREATE TABLE IF NOT EXISTS email_verifications_backup AS SELECT * FROM email_verifications`);
        console.log('旧表已备份到 email_verifications_backup');
      }
    } catch (backupError) {
      console.log('备份旧表时出错:', backupError.message);
    }
    
    try {
      await connection.query(`DROP TABLE IF EXISTS email_verifications`);
      console.log('旧表已删除');
    } catch (dropError) {
      console.log('删除旧表时出错:', dropError.message);
    }
    
    await connection.query(`
      CREATE TABLE email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL COMMENT '待验证的邮箱',
        verification_code VARCHAR(10) NOT NULL COMMENT '邮箱验证码（6位数字+大小写字母）',
        verification_code_expires_at DATETIME NOT NULL COMMENT '验证码过期时间',
        email_verified TINYINT DEFAULT 0 COMMENT '邮箱是否已验证：0-未验证，1-已验证',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_expires (verification_code_expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('新表创建成功');
    
    console.log('邮箱验证表迁移完成！');
    
  } catch (error) {
    console.error('迁移失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

migrateVerificationTable().catch(console.error);

export default migrateVerificationTable;
