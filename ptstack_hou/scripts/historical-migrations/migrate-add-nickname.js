/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - users 表：添加用户昵称字段
 * 
 * 功能说明：
 * - 添加 nickname 字段：用户昵称
 * - 将现有用户的 username 复制到 nickname
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
    console.log('开始数据库迁移...');
    
    connection = await mysql.createConnection(config);
    console.log('已连接到数据库');
    
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'nickname'"
    );
    
    if (columns.length > 0) {
      console.log('nickname字段已存在，跳过添加');
    } else {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN nickname VARCHAR(50) COMMENT '昵称，用于显示，可以是中文' 
        AFTER username
      `);
      console.log('nickname字段添加成功');
      
      await connection.execute(`
        UPDATE users SET nickname = username WHERE nickname IS NULL
      `);
      console.log('已将现有用户的username复制到nickname');
    }
    
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
