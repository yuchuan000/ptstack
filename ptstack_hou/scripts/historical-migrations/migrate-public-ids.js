/**
 * ========================================
 * 历史迁移脚本 - 已弃用
 * ========================================
 * 
 * 数据表及功能说明：
 * - users 表：public_id 格式迁移
 * - articles 表：public_id 格式迁移
 * - announcements 表：public_id 格式迁移
 * 
 * 功能说明：
 * - 根据 .env 中配置的 ID 格式模式，重新生成所有表的 public_id
 * - 支持自定义 ID 格式，如 user_{digit}{12}
 * 
 * 此脚本已弃用，功能已被 setup-database.js 完全替代
 * 此文件仅作为历史记录保留
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { customAlphabet } from 'nanoid';

dotenv.config();

const USER_ID_PATTERN = process.env.USER_ID_PATTERN || 'user_{digit}{12}';
const ARTICLE_ID_PATTERN = process.env.ARTICLE_ID_PATTERN || 'article_{digit}{12}';
const ANNOUNCEMENT_ID_PATTERN = process.env.ANNOUNCEMENT_ID_PATTERN || 'announce_{digit}{12}';

const ALPHABETS = {
  letter: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digit: '0123456789',
  symbol: '_-',
  alphanumeric: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  all: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'
};

function generateIdByPattern(pattern) {
  const regex = /\{([a-z]+)\}\{(\d+)\}/g;
  let result = pattern;
  let match;
  
  while ((match = regex.exec(pattern)) !== null) {
    const type = match[1];
    const length = parseInt(match[2]);
    const placeholder = match[0];
    const alphabet = ALPHABETS[type] || ALPHABETS.alphanumeric;
    const generator = customAlphabet(alphabet, length);
    result = result.replace(placeholder, generator());
  }
  
  return result;
}

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'ptstack_db',
  multipleStatements: true
};

async function migratePublicIds() {
  console.log('========================================');
  console.log('开始迁移 public_id 格式');
  console.log('========================================\n');

  const connection = await mysql.createConnection(config);

  try {
    console.log('步骤 1: 更新 users 表的 public_id');
    const [users] = await connection.query('SELECT id FROM users');
    for (const user of users) {
      const publicId = generateIdByPattern(USER_ID_PATTERN);
      await connection.execute('UPDATE users SET public_id = ? WHERE id = ?', [publicId, user.id]);
    }
    console.log(`✓ 已更新 ${users.length} 个用户的 public_id\n`);

    console.log('步骤 2: 更新 articles 表的 public_id');
    const [articles] = await connection.query('SELECT id FROM articles');
    for (const article of articles) {
      const publicId = generateIdByPattern(ARTICLE_ID_PATTERN);
      await connection.execute('UPDATE articles SET public_id = ? WHERE id = ?', [publicId, article.id]);
    }
    console.log(`✓ 已更新 ${articles.length} 篇文章的 public_id\n`);

    console.log('步骤 3: 更新 announcements 表的 public_id');
    const [announcements] = await connection.query('SELECT id FROM announcements');
    for (const announcement of announcements) {
      const publicId = generateIdByPattern(ANNOUNCEMENT_ID_PATTERN);
      await connection.execute('UPDATE announcements SET public_id = ? WHERE id = ?', [publicId, announcement.id]);
    }
    console.log(`✓ 已更新 ${announcements.length} 条公告的 public_id\n`);

    console.log('========================================');
    console.log('✓ public_id 格式迁移完成！');
    console.log('========================================');
  } catch (error) {
    console.error('\n✗ 迁移失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migratePublicIds();
