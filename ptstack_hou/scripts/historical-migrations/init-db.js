/**
 * ========================================
 * 历史归档脚本 - 已弃用
 * ========================================
 * 
 * 此脚本已过时，功能已被 setup-database.js 完全替代
 * 请使用 scripts/setup-database.js 进行数据库初始化
 * 此文件仅作为历史记录保留
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量配置（从.env文件读取）
dotenv.config();

// 数据库基础配置（不包含数据库名）
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

// 数据库名称
const DB_NAME = 'ptstack_db';

// 数据库初始化主函数
async function initDatabase() {
  let connection;
  
  try {
    console.log('开始初始化数据库...');
    
    // 第一步：连接到MySQL服务器（不指定数据库）
    connection = await mysql.createConnection({
      ...config,
      multipleStatements: true
    });
    
    console.log('已连接到MySQL服务器');
    
    try {
      // 创建数据库（如果不存在）
      // 使用utf8mb4字符集，支持完整的Unicode字符（包括emoji）
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`数据库 ${DB_NAME} 创建成功（或已存在）`);
    } catch (createDbError) {
      console.log('⚠️  创建数据库失败:', createDbError.message);
      console.log('尝试使用现有数据库...');
    }
    
    // 关闭临时连接
    await connection.end();
    console.log('已关闭临时连接');
    
    // 第二步：使用指定数据库重新连接
    try {
      connection = await mysql.createConnection({
        ...config,
        database: DB_NAME
      });
      console.log(`已连接到数据库 ${DB_NAME}`);
      
      // 创建用户表
      // 存储用户基本信息：用户名、密码（加密）、邮箱等
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号，只能是英文、数字、下划线',
          nickname VARCHAR(50) COMMENT '昵称，用于显示，可以是中文',
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          avatar VARCHAR(500) COMMENT '用户头像URL',
          profile_completed TINYINT DEFAULT 0 COMMENT '资料是否已完善：0-未完善，1-已完善',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // 创建临时邮箱验证表
      // 存储预注册信息，验证成功后才创建正式用户
      await connection.query(`
        CREATE TABLE IF NOT EXISTS email_verifications (
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
      console.log('用户表创建成功（或已存在）');
      
      // 创建分类表
      // 存储文章分类信息，如技术分享、项目实战等
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          description VARCHAR(200),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('分类表创建成功（或已存在）');
      
      // 创建标签表
      // 存储文章标签，可灵活添加
      await connection.query(`
        CREATE TABLE IF NOT EXISTS tags (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('标签表创建成功（或已存在）');
      
      // 创建文章表
      // 存储文章核心内容，包括标题、正文、摘要、封面等
      await connection.query(`
        CREATE TABLE IF NOT EXISTS articles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          content TEXT NOT NULL,
          summary VARCHAR(500),
          cover VARCHAR(500),
          author_id INT NOT NULL,
          category_id INT,
          status TINYINT DEFAULT 1 COMMENT '1:已发布 0:草稿',
          view_count INT DEFAULT 0,
          like_count INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('文章表创建成功（或已存在）');
      
      // 创建文章-标签关联表
      // 实现文章和标签的多对多关系
      await connection.query(`
        CREATE TABLE IF NOT EXISTS article_tags (
          article_id INT NOT NULL,
          tag_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (article_id, tag_id),
          FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('文章-标签关联表创建成功（或已存在）');
      
      // 创建评论表
      // 存储文章评论，支持多级评论（通过parent_id关联）
      await connection.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          article_id INT NOT NULL,
          user_id INT NOT NULL,
          parent_id INT DEFAULT NULL,
          reply_to_user_id INT DEFAULT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
          FOREIGN KEY (reply_to_user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('评论表创建成功（或已存在）');
      
      // 创建点赞表
      // 存储用户对文章的点赞记录，使用unique_like防止重复点赞
      await connection.query(`
        CREATE TABLE IF NOT EXISTS likes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          article_id INT NOT NULL,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_like (article_id, user_id),
          FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('点赞表创建成功（或已存在）');
      
      // 插入默认分类（如果不存在）
      await connection.query(`
        INSERT IGNORE INTO categories (name, description) VALUES
        ('技术分享', '技术相关的分享文章'),
        ('项目实战', '项目开发实战经验'),
        ('心得体会', '学习和工作心得体会'),
        ('其他', '其他类型的文章')
      `);
      console.log('默认分类插入成功');
      
      console.log('数据库初始化完成！');
      
    } catch (dbError) {
      console.log('⚠️  连接到数据库失败:', dbError.message);
      console.log('原因分析: 数据库可能不存在或用户没有访问权限');
      console.log('解决方案: 1. 手动创建数据库 2. 确保用户有访问权限');
      throw dbError;
    }
    
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    console.log('错误代码:', error.code);
    
    // 针对常见错误的分析和解决方案
    if (error.code === 'ER_DBACCESS_DENIED_ERROR') {
      console.log('原因分析: 用户权限不足，请确保用户有创建和访问数据库的权限');
      console.log('解决方案: 1. 检查MySQL用户权限 2. 使用有足够权限的用户 3. 手动创建数据库');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('原因分析: 数据库不存在，请先创建数据库');
      console.log('解决方案: 1. 手动创建数据库 2. 使用有创建权限的用户');
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行初始化（如果直接运行此脚本）
initDatabase().catch(console.error);

export default initDatabase;
