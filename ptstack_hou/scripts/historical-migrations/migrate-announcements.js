/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - announcements 表：公告系统扩展字段
 * - announcement_reads 表：公告阅读记录
 * 
 * 功能说明：
 * - 添加 priority 字段：公告优先级
 * - 添加 is_marquee 字段：是否显示在首页跑马灯
 * - 添加 target_type 字段：目标用户类型
 * - 添加 target_user_ids 字段：目标用户ID列表
 * - 添加 delivery_methods 字段：发送方式
 * - 添加 created_by 字段：创建者ID
 * - 添加 start_time/end_time 字段：显示时间范围
 * - 创建 announcement_reads 表：记录用户阅读公告的时间
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
  database: process.env.DB_NAME || 'ptstack_db',
  multipleStatements: true
};

async function addColumnIfNotExists(connection, table, column, definition) {
  const [columns] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
  if (columns.length === 0) {
    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`  ✓ 添加字段 ${table}.${column} 成功`);
    return true;
  }
  return false;
}

async function main() {
  console.log('========================================');
  console.log('公告系统数据库升级');
  console.log('========================================');

  const connection = await mysql.createConnection(config);

  try {
    console.log('\n正在升级 announcements 表...');

    await addColumnIfNotExists(connection, 'announcements', 'priority', 'INT DEFAULT 0 COMMENT "优先级：数字越大越优先" AFTER content');
    await addColumnIfNotExists(connection, 'announcements', 'is_marquee', 'TINYINT DEFAULT 0 COMMENT "是否显示在首页跑马灯：0-否，1-是" AFTER priority');
    await addColumnIfNotExists(connection, 'announcements', 'target_type', 'VARCHAR(20) DEFAULT "all" COMMENT "目标类型：all-全部用户，group-用户组，specific-指定用户" AFTER is_marquee');
    await addColumnIfNotExists(connection, 'announcements', 'target_user_ids', 'TEXT COMMENT "目标用户ID列表，JSON格式" AFTER target_type');
    await addColumnIfNotExists(connection, 'announcements', 'delivery_methods', 'TEXT COMMENT "发送方式：email-邮箱，popup-弹窗，notification-消息中心，JSON数组格式" AFTER target_user_ids');
    await addColumnIfNotExists(connection, 'announcements', 'created_by', 'INT DEFAULT NULL COMMENT "创建者ID" AFTER delivery_methods');
    await addColumnIfNotExists(connection, 'announcements', 'start_time', 'TIMESTAMP NULL COMMENT "开始显示时间" AFTER created_by');
    await addColumnIfNotExists(connection, 'announcements', 'end_time', 'TIMESTAMP NULL COMMENT "结束显示时间" AFTER start_time');

    console.log('\n创建公告阅读记录表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS announcement_reads (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
        announcement_id INT NOT NULL COMMENT '公告ID',
        user_id INT NOT NULL COMMENT '用户ID',
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
        UNIQUE KEY unique_read (announcement_id, user_id),
        INDEX idx_announcement_id (announcement_id),
        INDEX idx_user_id (user_id),
        FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ announcement_reads 表创建成功（或已存在）');

    console.log('\n========================================');
    console.log('✓ 公告系统数据库升级完成！');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n✗ 升级失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
