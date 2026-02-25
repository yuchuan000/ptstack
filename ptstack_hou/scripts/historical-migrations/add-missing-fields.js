/**
 * ========================================
 * 历史迁移脚本：添加缺失字段
 * ========================================
 * 
 * 功能说明：
 * - 为 announcements 表添加缺失的字段
 * - 此脚本为历史迁移脚本，已归档
 * 
 * 注意事项：
 * - 此脚本已不再需要单独运行，setup-database.js 已包含所有字段
 * - 如需初始化数据库，请直接运行 setup-database.js
 * - 此脚本保留仅用于历史记录参考
 * 
 * 使用方法（已废弃）：
 *   node scripts/add-missing-fields.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'ptstack',
  multipleStatements: true
};

async function addMissingFields() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('开始添加缺失的字段...');
    
    // 检查 announcements 表的结构
    const [columns] = await connection.query('SHOW COLUMNS FROM announcements');
    const existingColumns = columns.map(c => c.Field);
    console.log('announcements 表现有字段:', existingColumns);
    
    // 需要的字段列表
    const requiredFields = [
      { name: 'overview', definition: 'VARCHAR(500) DEFAULT NULL COMMENT "公告概述" AFTER content' },
      { name: 'priority', definition: 'INT DEFAULT 0 COMMENT "优先级" AFTER overview' },
      { name: 'is_marquee', definition: 'TINYINT DEFAULT 0 COMMENT "是否首页顶部通告" AFTER priority' },
      { name: 'target_type', definition: 'VARCHAR(20) DEFAULT "all" COMMENT "目标类型" AFTER is_marquee' },
      { name: 'target_user_ids', definition: 'TEXT COMMENT "目标用户ID" AFTER target_type' },
      { name: 'delivery_methods', definition: 'TEXT COMMENT "发送方式" AFTER target_user_ids' },
      { name: 'created_by', definition: 'INT DEFAULT NULL COMMENT "创建者ID" AFTER delivery_methods' },
      { name: 'start_time', definition: 'TIMESTAMP NULL COMMENT "开始时间" AFTER created_by' },
      { name: 'end_time', definition: 'TIMESTAMP NULL COMMENT "结束时间" AFTER start_time' },
      { name: 'is_active', definition: 'TINYINT DEFAULT 1 COMMENT "是否激活" AFTER end_time' }
    ];
    
    // 添加缺失的字段
    for (const field of requiredFields) {
      if (!existingColumns.includes(field.name)) {
        try {
          await connection.query(`ALTER TABLE announcements ADD COLUMN ${field.name} ${field.definition}`);
          console.log(`✓ 添加字段 announcements.${field.name} 成功`);
        } catch (error) {
          console.log(`⚠ 添加字段 announcements.${field.name} 失败:`, error.message);
        }
      } else {
        console.log(`✓ 字段 announcements.${field.name} 已存在`);
      }
    }
    
    console.log('\n所有字段添加完成！');
    
  } catch (error) {
    console.error('添加字段失败:', error);
  } finally {
    await connection.end();
  }
}

addMissingFields();
