/**
 * ========================================
 * 历史检查脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - email_verifications 表：检查表结构
 * 
 * 功能说明：
 * - 检查并输出 email_verifications 表的当前字段结构
 * - 用于开发调试
 * 
 * 此脚本已弃用，仅用于历史记录
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

async function check() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('检查 email_verifications 表结构...');
    const [columns] = await connection.execute('SHOW COLUMNS FROM email_verifications');
    console.log('当前字段：');
    columns.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await connection.end();
  }
}

check();
