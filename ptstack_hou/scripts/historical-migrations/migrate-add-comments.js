import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: 'ptstack_db',
  multipleStatements: true
};

async function migrate() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('开始更新数据库字段备注...\n');
    
    // 更新 users 表
    console.log('更新 users 表...');
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '用户ID',
      MODIFY COLUMN username VARCHAR(50) NOT NULL COMMENT '登录账号（英文、数字、下划线）',
      MODIFY COLUMN nickname VARCHAR(50) DEFAULT NULL COMMENT '用户昵称',
      MODIFY COLUMN password VARCHAR(255) NOT NULL COMMENT '加密密码',
      MODIFY COLUMN email VARCHAR(100) NOT NULL COMMENT '邮箱地址',
      MODIFY COLUMN avatar VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
      MODIFY COLUMN bio VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
      MODIFY COLUMN profile_completed TINYINT DEFAULT 0 COMMENT '资料是否已完善：0-未完善，1-已完善',
      MODIFY COLUMN follower_count INT DEFAULT 0 COMMENT '粉丝数',
      MODIFY COLUMN following_count INT DEFAULT 0 COMMENT '关注数',
      MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
    `);
    console.log('  users 表更新完成');
    
    // 更新 email_verifications 表
    console.log('更新 email_verifications 表...');
    await connection.execute(`
      ALTER TABLE email_verifications 
      MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '记录ID',
      MODIFY COLUMN email VARCHAR(100) NOT NULL COMMENT '待验证的邮箱',
      MODIFY COLUMN verification_code VARCHAR(10) NOT NULL COMMENT '邮箱验证码',
      MODIFY COLUMN verification_code_expires_at DATETIME NOT NULL COMMENT '验证码过期时间',
      MODIFY COLUMN email_verified TINYINT DEFAULT 0 COMMENT '邮箱是否已验证：0-未验证，1-已验证',
      MODIFY COLUMN verification_token VARCHAR(64) DEFAULT NULL COMMENT '邮箱验证令牌',
      MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    `);
    console.log('  email_verifications 表更新完成');
    
    // 更新 categories 表
    console.log('更新 categories 表...');
    await connection.execute(`
      ALTER TABLE categories 
      MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '分类ID',
      MODIFY COLUMN name VARCHAR(50) NOT NULL COMMENT '分类名称',
      MODIFY COLUMN description VARCHAR(200) DEFAULT NULL COMMENT '分类描述',
      MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    `);
    console.log('  categories 表更新完成');
    
    // 更新 tags 表
    console.log('更新 tags 表...');
    await connection.execute(`
      ALTER TABLE tags 
      MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '标签ID',
      MODIFY COLUMN name VARCHAR(50) NOT NULL COMMENT '标签名称',
      MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    `);
    console.log('  tags 表更新完成');
    
    // 更新 articles 表
    console.log('更新 articles 表...');
    await connection.execute(`
      ALTER TABLE articles 
      MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '文章ID',
      MODIFY COLUMN title VARCHAR(200) NOT NULL COMMENT '文章标题',
      MODIFY COLUMN content TEXT NOT NULL COMMENT '文章内容',
      MODIFY COLUMN summary VARCHAR(500) DEFAULT NULL COMMENT '文章摘要',
      MODIFY COLUMN cover VARCHAR(500) DEFAULT NULL COMMENT '封面图片URL',
      MODIFY COLUMN author_id INT NOT NULL COMMENT '作者ID',
      MODIFY COLUMN category_id INT DEFAULT NULL COMMENT '分类ID',
      MODIFY COLUMN status TINYINT DEFAULT 1 COMMENT '发布状态：1-已发布，0-草稿',
      MODIFY COLUMN view_count INT DEFAULT 0 COMMENT '阅读次数',
      MODIFY COLUMN like_count INT DEFAULT 0 COMMENT '点赞次数',
      MODIFY COLUMN share_count INT DEFAULT 0 COMMENT '分享次数',
      MODIFY COLUMN comment_count INT DEFAULT 0 COMMENT '评论次数',
      MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
    `);
    console.log('  articles 表更新完成');
    
    // 更新 article_tags 表
    console.log('更新 article_tags 表...');
    await connection.execute(`
      ALTER TABLE article_tags 
      MODIFY COLUMN article_id INT NOT NULL COMMENT '文章ID',
      MODIFY COLUMN tag_id INT NOT NULL COMMENT '标签ID',
      MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    `);
    console.log('  article_tags 表更新完成');
    
    // 更新 comments 表
    console.log('更新 comments 表...');
    await connection.execute(`
      ALTER TABLE comments 
      MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '评论ID',
      MODIFY COLUMN article_id INT NOT NULL COMMENT '文章ID',
      MODIFY COLUMN user_id INT NOT NULL COMMENT '评论用户ID',
      MODIFY COLUMN parent_id INT DEFAULT NULL COMMENT '父评论ID（一级评论为NULL）',
      MODIFY COLUMN reply_to_comment_id INT DEFAULT NULL COMMENT '回复的评论ID',
      MODIFY COLUMN reply_to_user_id INT DEFAULT NULL COMMENT '回复的用户ID',
      MODIFY COLUMN content TEXT NOT NULL COMMENT '评论内容',
      MODIFY COLUMN like_count INT DEFAULT 0 COMMENT '点赞次数',
      MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
    `);
    console.log('  comments 表更新完成');
    
    // 更新 likes 表
    console.log('更新 likes 表...');
    await connection.execute(`
      ALTER TABLE likes 
      MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '点赞记录ID',
      MODIFY COLUMN article_id INT NOT NULL COMMENT '文章ID',
      MODIFY COLUMN user_id INT NOT NULL COMMENT '点赞用户ID',
      MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    `);
    console.log('  likes 表更新完成');
    
    // 更新 comment_likes 表
    console.log('更新 comment_likes 表...');
    await connection.execute(`
      ALTER TABLE comment_likes 
      MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '评论点赞记录ID',
      MODIFY COLUMN comment_id INT NOT NULL COMMENT '评论ID',
      MODIFY COLUMN user_id INT NOT NULL COMMENT '点赞用户ID',
      MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    `);
    console.log('  comment_likes 表更新完成');
    
    // 更新 subscriptions 表
    console.log('更新 subscriptions 表...');
    await connection.execute(`
      ALTER TABLE subscriptions 
      MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '订阅记录ID',
      MODIFY COLUMN follower_id INT NOT NULL COMMENT '关注者ID',
      MODIFY COLUMN following_id INT NOT NULL COMMENT '被关注者ID',
      MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    `);
    console.log('  subscriptions 表更新完成');
    
    console.log('\n所有表字段备注更新完成！');
    
  } catch (error) {
    console.error('更新失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate();
