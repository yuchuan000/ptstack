/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - users 表：添加用户头像和资料完善字段
 * 
 * 功能说明：
 * - 添加 avatar 字段：用户头像URL
 * - 添加 profile_completed 字段：资料是否已完善
 * - 将现有用户设置为资料已完善
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
    console.log('开始数据库迁移：添加用户头像和资料完成字段...');
    
    connection = await mysql.createConnection(config);
    console.log('已连接到数据库');
    
    // 添加avatar字段
    const [avatarCol] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'avatar'"
    );
    
    if (avatarCol.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN avatar VARCHAR(500) COMMENT '用户头像URL'
        AFTER email
      `);
      console.log('avatar字段添加成功');
    } else {
      console.log('avatar字段已存在');
    }
    
    // 添加profile_completed字段
    const [profileCol] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'profile_completed'"
    );
    
    if (profileCol.length === 0) {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN profile_completed TINYINT DEFAULT 0 COMMENT '资料是否已完善：0-未完善，1-已完善'
        AFTER avatar
      `);
      console.log('profile_completed字段添加成功');
    } else {
      console.log('profile_completed字段已存在');
    }
    
    // 将现有用户设置为资料已完善
    await connection.execute(`
      UPDATE users SET profile_completed = 1 WHERE profile_completed = 0
    `);
    console.log('已将现有用户设置为资料已完善');
    
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
