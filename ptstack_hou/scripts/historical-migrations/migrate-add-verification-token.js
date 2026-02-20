/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - email_verifications 表：添加邮箱验证令牌字段
 * 
 * 功能说明：
 * - 添加 verification_token 字段到 email_verifications 表
 * - 用于邮箱验证的令牌存储
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

async function migrate() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('开始添加 verification_token 字段...');
    
    const [columns] = await connection.execute('SHOW COLUMNS FROM email_verifications LIKE "verification_token"');
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE email_verifications 
        ADD COLUMN verification_token VARCHAR(64) DEFAULT NULL AFTER email_verified
      `);
      console.log('  verification_token 字段添加成功');
    } else {
      console.log('  verification_token 字段已存在');
    }
    
    console.log('迁移完成！');
    
  } catch (error) {
    console.error('迁移失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate();
