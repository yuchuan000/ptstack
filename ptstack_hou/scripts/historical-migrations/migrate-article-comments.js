/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - articles 表：添加评论数字段并同步数据
 * 
 * 功能说明：
 * - 添加 articles.comment_count 字段：文章评论数
 * - 从 comments 表统计并同步评论数到 articles 表
 * 
 * 此脚本已弃用，功能已被 setup-database.js 完全替代
 * 此文件仅作为历史记录保留
 */

import mysql2 from 'mysql2/promise';
import 'dotenv/config';

const migrate = async () => {
  console.log('开始文章评论数字段迁移...');
  
  const connection = await mysql2.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ptstack_db',
  });
  
  try {
    console.log('已连接到数据库');
    
    await connection.query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS comment_count INT DEFAULT 0
    `);
    console.log('articles 表 comment_count 字段添加成功');
    
    await connection.query(`
      UPDATE articles a 
      SET comment_count = (
        SELECT COUNT(*) 
        FROM comments c 
        WHERE c.article_id = a.id
      )
    `);
    console.log('评论数已同步');
    
    console.log('迁移完成！');
  } catch (error) {
    console.error('迁移失败:', error);
    try {
      await connection.query(`
        ALTER TABLE articles 
        ADD COLUMN comment_count INT DEFAULT 0
      `);
      console.log('articles 表 comment_count 字段添加成功（简化版）');
    } catch (simpleError) {
      console.error('简化迁移也失败:', simpleError.message);
    }
  } finally {
    await connection.end();
    console.log('数据库连接已关闭');
  }
};

migrate().catch(console.error);
