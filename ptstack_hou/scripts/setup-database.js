/**
 * ========================================
 * PTStack 数据库初始化脚本
 * ========================================
 * 
 * 功能说明：
 * - 创建数据库（如果不存在）
 * - 创建所有必要的表（幂等设计，可重复运行）
 * - 添加缺失的字段（使用 addColumnIfNotExists 函数）
 * - 添加缺失的索引（使用 addIndexIfNotExists 函数）
 * - 插入默认数据
 * 
 * 使用方法：
 *   node scripts/setup-database.js
 * 
 * 注意事项：
 * - 此脚本可安全重复运行，不会覆盖现有数据
 * - 确保 .env 文件中配置了正确的数据库连接信息
 * - 历史迁移脚本已归档到 historical-migrations 文件夹
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
  multipleStatements: true
};

const DB_NAME = 'ptstack_db';

/**
 * 步骤 1: 创建数据库
 * 如果数据库不存在则创建，使用 utf8mb4 字符集（支持 emoji）
 */
async function step1CreateDatabase() {
  console.log('\n========================================');
  console.log('步骤 1: 创建数据库');
  console.log('========================================');

  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    multipleStatements: true
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✓ 数据库 ${DB_NAME} 创建成功（或已存在）`);
  } finally {
    await connection.end();
  }
}

/**
 * 幂等添加字段：如果字段不存在则添加
 * @param {Object} connection - 数据库连接对象
 * @param {string} table - 表名
 * @param {string} column - 字段名
 * @param {string} definition - 字段定义
 * @returns {boolean} 是否成功添加了字段
 */
async function addColumnIfNotExists(connection, table, column, definition) {
  const [columns] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
  if (columns.length === 0) {
    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`  ✓ 添加字段 ${table}.${column} 成功`);
    return true;
  }
  return false;
}

/**
 * 幂等添加索引：如果索引不存在则添加
 * @param {Object} connection - 数据库连接对象
 * @param {string} table - 表名
 * @param {string} indexName - 索引名
 * @param {string} indexDefinition - 索引定义
 * @returns {boolean} 是否成功添加了索引
 */
async function addIndexIfNotExists(connection, table, indexName, indexDefinition) {
  const [indexes] = await connection.query(`SHOW INDEX FROM ${table} WHERE Key_name = '${indexName}'`);
  if (indexes.length === 0) {
    await connection.query(`ALTER TABLE ${table} ADD INDEX ${indexName} ${indexDefinition}`);
    console.log(`  ✓ 添加索引 ${table}.${indexName} 成功`);
    return true;
  }
  return false;
}

/**
 * 步骤 2: 创建/更新所有基础表
 * 包括：users, email_verifications, categories, tags, articles,
 * article_tags, comments, likes, comment_likes, subscriptions
 */
async function step2CreateBaseTables() {
  console.log('\n========================================');
  console.log('步骤 2: 创建/更新基础表');
  console.log('========================================');

  const connection = await mysql.createConnection(config);

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
        username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号（英文、数字、下划线）',
        nickname VARCHAR(50) DEFAULT NULL COMMENT '用户昵称',
        password VARCHAR(255) NOT NULL COMMENT '加密密码',
        email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱地址',
        avatar VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
        bio VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
        profile_completed TINYINT DEFAULT 0 COMMENT '资料是否已完善：0-未完善，1-已完善',
        follower_count INT DEFAULT 0 COMMENT '粉丝数',
        following_count INT DEFAULT 0 COMMENT '关注数',
        is_admin TINYINT DEFAULT 0 COMMENT '是否为管理员：0-否，1-是',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ users 表创建成功（或已存在）');
    await addColumnIfNotExists(connection, 'users', 'nickname', 'VARCHAR(50) DEFAULT NULL COMMENT "用户昵称" AFTER username');
    await addColumnIfNotExists(connection, 'users', 'avatar', 'VARCHAR(500) DEFAULT NULL COMMENT "头像URL" AFTER email');
    await addColumnIfNotExists(connection, 'users', 'bio', 'VARCHAR(500) DEFAULT NULL COMMENT "个人简介" AFTER avatar');
    await addColumnIfNotExists(connection, 'users', 'follower_count', 'INT DEFAULT 0 COMMENT "粉丝数" AFTER profile_completed');
    await addColumnIfNotExists(connection, 'users', 'following_count', 'INT DEFAULT 0 COMMENT "关注数" AFTER follower_count');
    await addColumnIfNotExists(connection, 'users', 'is_admin', 'TINYINT DEFAULT 0 COMMENT "是否为管理员：0-否，1-是" AFTER following_count');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
        email VARCHAR(100) NOT NULL COMMENT '待验证的邮箱',
        verification_code VARCHAR(10) NOT NULL COMMENT '邮箱验证码',
        verification_code_expires_at DATETIME NOT NULL COMMENT '验证码过期时间',
        email_verified TINYINT DEFAULT 0 COMMENT '邮箱是否已验证：0-未验证，1-已验证',
        verification_token VARCHAR(64) DEFAULT NULL COMMENT '邮箱验证令牌',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_email (email),
        INDEX idx_expires (verification_code_expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ email_verifications 表创建成功（或已存在）');
    await addColumnIfNotExists(connection, 'email_verifications', 'verification_token', 'VARCHAR(64) DEFAULT NULL COMMENT "邮箱验证令牌" AFTER email_verified');
    await addIndexIfNotExists(connection, 'email_verifications', 'idx_email', '(email)');
    await addIndexIfNotExists(connection, 'email_verifications', 'idx_expires', '(verification_code_expires_at)');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
        name VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名称',
        description VARCHAR(200) DEFAULT NULL COMMENT '分类描述',
        created_by INT DEFAULT NULL COMMENT '创建者ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ categories 表创建成功（或已存在）');
    await addColumnIfNotExists(connection, 'categories', 'created_by', 'INT DEFAULT NULL COMMENT "创建者ID" AFTER description');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS category_applications (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '申请ID',
        user_id INT NOT NULL COMMENT '申请人ID',
        name VARCHAR(50) NOT NULL COMMENT '申请的分类名称',
        description VARCHAR(200) DEFAULT NULL COMMENT '分类描述',
        status TINYINT DEFAULT 0 COMMENT '审核状态：0-待审核，1-已通过，2-已拒绝',
        review_comment VARCHAR(200) DEFAULT NULL COMMENT '审核意见',
        reviewed_by INT DEFAULT NULL COMMENT '审核人ID',
        reviewed_at TIMESTAMP NULL COMMENT '审核时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ category_applications 表创建成功（或已存在）');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
        name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ tags 表创建成功（或已存在）');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '文章ID',
        title VARCHAR(200) NOT NULL COMMENT '文章标题',
        content TEXT NOT NULL COMMENT '文章内容',
        summary VARCHAR(500) DEFAULT NULL COMMENT '文章摘要',
        cover VARCHAR(500) DEFAULT NULL COMMENT '封面图片URL',
        author_id INT NOT NULL COMMENT '作者ID',
        category_id INT DEFAULT NULL COMMENT '分类ID',
        status TINYINT DEFAULT 1 COMMENT '发布状态：1-已发布，0-草稿',
        view_count INT DEFAULT 0 COMMENT '阅读次数',
        like_count INT DEFAULT 0 COMMENT '点赞次数',
        share_count INT DEFAULT 0 COMMENT '分享次数',
        comment_count INT DEFAULT 0 COMMENT '评论次数',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ articles 表创建成功（或已存在）');
    await addColumnIfNotExists(connection, 'articles', 'share_count', 'INT DEFAULT 0 COMMENT "分享次数" AFTER like_count');
    await addColumnIfNotExists(connection, 'articles', 'comment_count', 'INT DEFAULT 0 COMMENT "评论次数" AFTER share_count');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS article_tags (
        article_id INT NOT NULL COMMENT '文章ID',
        tag_id INT NOT NULL COMMENT '标签ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        PRIMARY KEY (article_id, tag_id),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ article_tags 表创建成功（或已存在）');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
        article_id INT NOT NULL COMMENT '文章ID',
        user_id INT NOT NULL COMMENT '评论用户ID',
        parent_id INT DEFAULT NULL COMMENT '父评论ID（一级评论为NULL）',
        reply_to_comment_id INT DEFAULT NULL COMMENT '回复的评论ID',
        reply_to_user_id INT DEFAULT NULL COMMENT '回复的用户ID',
        content TEXT NOT NULL COMMENT '评论内容',
        like_count INT DEFAULT 0 COMMENT '点赞次数',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
        FOREIGN KEY (reply_to_comment_id) REFERENCES comments(id) ON DELETE SET NULL,
        FOREIGN KEY (reply_to_user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ comments 表创建成功（或已存在）');
    await addColumnIfNotExists(connection, 'comments', 'reply_to_comment_id', 'INT DEFAULT NULL COMMENT "回复的评论ID" AFTER parent_id');
    await addColumnIfNotExists(connection, 'comments', 'reply_to_user_id', 'INT DEFAULT NULL COMMENT "回复的用户ID" AFTER reply_to_comment_id');
    await addColumnIfNotExists(connection, 'comments', 'like_count', 'INT DEFAULT 0 COMMENT "点赞次数" AFTER content');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '点赞记录ID',
        article_id INT NOT NULL COMMENT '文章ID',
        user_id INT NOT NULL COMMENT '点赞用户ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        UNIQUE KEY unique_like (article_id, user_id),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ likes 表创建成功（或已存在）');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评论点赞记录ID',
        comment_id INT NOT NULL COMMENT '评论ID',
        user_id INT NOT NULL COMMENT '点赞用户ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        UNIQUE KEY unique_comment_like (comment_id, user_id),
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ comment_likes 表创建成功（或已存在）');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '订阅记录ID',
        follower_id INT NOT NULL COMMENT '关注者ID',
        following_id INT NOT NULL COMMENT '被关注者ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        UNIQUE KEY unique_subscription (follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ subscriptions 表创建成功（或已存在）');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '消息ID',
        user_id INT NOT NULL COMMENT '接收用户ID',
        type VARCHAR(50) NOT NULL COMMENT '消息类型：comment, like, follow',
        content TEXT NOT NULL COMMENT '消息内容',
        related_id INT DEFAULT NULL COMMENT '关联ID（文章ID或用户ID）',
        is_read TINYINT DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ notifications 表创建成功（或已存在）');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '公告ID',
        title VARCHAR(255) NOT NULL COMMENT '公告标题',
        content TEXT NOT NULL COMMENT '公告内容',
        priority INT DEFAULT 0 COMMENT '优先级：数字越大越优先',
        is_marquee TINYINT DEFAULT 0 COMMENT '是否显示在首页跑马灯：0-否，1-是',
        target_type VARCHAR(20) DEFAULT 'all' COMMENT '目标类型：all-全部用户，group-用户组，specific-指定用户',
        target_user_ids TEXT COMMENT '目标用户ID列表，JSON格式',
        delivery_methods TEXT COMMENT '发送方式：email-邮箱，popup-弹窗，notification-消息中心，JSON数组格式',
        created_by INT DEFAULT NULL COMMENT '创建者ID',
        start_time TIMESTAMP NULL COMMENT '开始显示时间',
        end_time TIMESTAMP NULL COMMENT '结束显示时间',
        is_active TINYINT DEFAULT 1 COMMENT '是否激活：1-激活，0-不激活',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_created_by (created_by),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ announcements 表创建成功（或已存在）');
    await addColumnIfNotExists(connection, 'announcements', 'priority', 'INT DEFAULT 0 COMMENT "优先级：数字越大越优先" AFTER content');
    await addColumnIfNotExists(connection, 'announcements', 'is_marquee', 'TINYINT DEFAULT 0 COMMENT "是否显示在首页跑马灯：0-否，1-是" AFTER priority');
    await addColumnIfNotExists(connection, 'announcements', 'target_type', 'VARCHAR(20) DEFAULT "all" COMMENT "目标类型：all-全部用户，group-用户组，specific-指定用户" AFTER is_marquee');
    await addColumnIfNotExists(connection, 'announcements', 'target_user_ids', 'TEXT COMMENT "目标用户ID列表，JSON格式" AFTER target_type');
    await addColumnIfNotExists(connection, 'announcements', 'delivery_methods', 'TEXT COMMENT "发送方式：email-邮箱，popup-弹窗，notification-消息中心，JSON数组格式" AFTER target_user_ids');
    await addColumnIfNotExists(connection, 'announcements', 'created_by', 'INT DEFAULT NULL COMMENT "创建者ID" AFTER delivery_methods');
    await addColumnIfNotExists(connection, 'announcements', 'start_time', 'TIMESTAMP NULL COMMENT "开始显示时间" AFTER created_by');
    await addColumnIfNotExists(connection, 'announcements', 'end_time', 'TIMESTAMP NULL COMMENT "结束显示时间" AFTER start_time');
    await addIndexIfNotExists(connection, 'announcements', 'idx_created_by', '(created_by)');

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

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '成就ID',
        name VARCHAR(100) NOT NULL COMMENT '成就名称',
        description TEXT NOT NULL COMMENT '成就描述',
        type VARCHAR(50) NOT NULL COMMENT '成就类型：article, comment, like, follow, etc.',
        condition_value INT NOT NULL COMMENT '达成条件数值',
        icon VARCHAR(100) DEFAULT NULL COMMENT '成就图标',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ achievements 表创建成功（或已存在）');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
        user_id INT NOT NULL COMMENT '用户ID',
        achievement_id INT NOT NULL COMMENT '成就ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
        UNIQUE KEY unique_user_achievement (user_id, achievement_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ user_achievements 表创建成功（或已存在）');

    await addColumnIfNotExists(connection, 'users', 'last_read_notifications', 'TIMESTAMP NULL COMMENT "最后一次查看消息的时间" AFTER following_count');

  } finally {
    await connection.end();
  }
}

/**
 * 步骤 3: 插入默认数据
 * 包括：默认分类数据
 */
async function step3InsertDefaultData() {
  console.log('\n========================================');
  console.log('步骤 3: 插入默认数据');
  console.log('========================================');

  const connection = await mysql.createConnection(config);

  try {
    await connection.execute(`
      INSERT IGNORE INTO categories (name, description) VALUES
      ('技术分享', '技术相关的分享文章'),
      ('项目实战', '项目开发实战经验'),
      ('心得体会', '学习和工作心得体会'),
      ('其他', '其他类型的文章')
    `);
    console.log('✓ 默认分类插入成功（或已存在）');

    await connection.execute(`
      INSERT IGNORE INTO achievements (name, description, type, condition_value, icon) VALUES
      ('初出茅庐', '发布第 1 篇文章', 'article', 1, 'Document'),
      ('小有所成', '发布 5 篇文章', 'article', 5, 'Document'),
      ('著作等身', '发布 20 篇文章', 'article', 20, 'Document'),
      ('妙语连珠', '发布第 1 条评论', 'comment', 1, 'ChatDotRound'),
      ('口若悬河', '发布 10 条评论', 'comment', 10, 'ChatDotRound'),
      ('点赞达人', '收到第 1 个点赞', 'like', 1, 'Star'),
      ('万众瞩目', '收到 50 个点赞', 'like', 50, 'Star'),
      ('广结善缘', '关注第 1 位用户', 'follow', 1, 'User'),
      ('人气爆棚', '拥有 100 位粉丝', 'follower', 100, 'UserFilled')
    `);
    console.log('✓ 默认成就插入成功（或已存在）');

  } finally {
    await connection.end();
  }
}

/**
 * 主函数：执行数据库初始化的所有步骤
 */
async function main() {
  console.log('========================================');
  console.log('PTStack 数据库初始化脚本');
  console.log('========================================');
  console.log('开始初始化数据库...\n');

  try {
    await step1CreateDatabase();
    await step2CreateBaseTables();
    await step3InsertDefaultData();

    console.log('\n========================================');
    console.log('✓ 数据库初始化完成！');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n✗ 数据库初始化失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
}

main();
