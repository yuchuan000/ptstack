/**
 * ========================================
 * 用户等级制重构数据迁移脚本
 * ========================================
 *
 * 功能说明：
 * 1. 修改 users 表，添加 level 字段（用户等级）
 * 2. 添加 user_permissions 表，存储用户权限信息
 * 3. 添加 email_configs 表，存储邮箱配置信息
 * 4. 添加 system_logs 表，存储系统操作和邮件发送日志
 * 5. 迁移现有用户数据，将所有用户设置为三级用户
 * 6. 设置第一个用户为一级用户（站长）
 */

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: path.join(__dirname, '..', envFile) })

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'ptstack_db',
  multipleStatements: true,
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
  const [columns] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`)
  if (columns.length === 0) {
    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    console.log(`  ✓ 添加字段 ${table}.${column} 成功`)
    return true
  }
  return false
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
  const [indexes] = await connection.query(
    `SHOW INDEX FROM ${table} WHERE Key_name = '${indexName}'`,
  )
  if (indexes.length === 0) {
    await connection.query(`ALTER TABLE ${table} ADD INDEX ${indexName} ${indexDefinition}`)
    console.log(`  ✓ 添加索引 ${table}.${indexName} 成功`)
    return true
  }
  return false
}

/**
 * 步骤 1: 修改 users 表，添加 level 字段
 */
async function step1ModifyUsersTable(connection) {
  console.log('\n========================================')
  console.log('步骤 1: 修改 users 表，添加 level 字段')
  console.log('========================================')

  // 添加 level 字段
  await addColumnIfNotExists(
    connection,
    'users',
    'level',
    'TINYINT DEFAULT 3 COMMENT "用户等级：1-站长，2-管理员，3-普通用户" AFTER is_admin',
  )

  // 添加 avatar_badge 字段
  await addColumnIfNotExists(
    connection,
    'users',
    'avatar_badge',
    'VARCHAR(1) DEFAULT NULL COMMENT "头像旁展示的单字" AFTER avatar',
  )

  // 添加 avatar_badge_bg_color 字段
  await addColumnIfNotExists(
    connection,
    'users',
    'avatar_badge_bg_color',
    'VARCHAR(20) DEFAULT NULL COMMENT "头像旁单字背景色" AFTER avatar_badge',
  )

  // 添加 avatar_badge_text_color 字段
  await addColumnIfNotExists(
    connection,
    'users',
    'avatar_badge_text_color',
    'VARCHAR(20) DEFAULT NULL COMMENT "头像旁单字文字色" AFTER avatar_badge_bg_color',
  )

  // 添加 show_avatar_badge 字段
  await addColumnIfNotExists(
    connection,
    'users',
    'show_avatar_badge',
    'TINYINT DEFAULT 0 COMMENT "是否显示头像旁单字：0-否，1-是" AFTER avatar_badge_text_color',
  )
}

/**
 * 步骤 2: 创建 user_permissions 表
 */
async function step2CreateUserPermissionsTable(connection) {
  console.log('\n========================================')
  console.log('步骤 2: 创建 user_permissions 表')
  console.log('========================================')

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS user_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '权限ID',
      user_id INT NOT NULL COMMENT '用户ID',
      permission VARCHAR(50) NOT NULL COMMENT '权限名称：category_manage, announcement_manage, user_manage, email_send',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      UNIQUE KEY unique_user_permission (user_id, permission),
      INDEX idx_user_id (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
  console.log('✓ user_permissions 表创建成功（或已存在）')
}

/**
 * 步骤 3: 创建 email_configs 表
 */
async function step3CreateEmailConfigsTable(connection) {
  console.log('\n========================================')
  console.log('步骤 3: 创建 email_configs 表')
  console.log('========================================')

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS email_configs (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '邮箱配置ID',
      name VARCHAR(100) NOT NULL COMMENT '配置名称',
      email VARCHAR(100) NOT NULL COMMENT '发件邮箱',
      password VARCHAR(255) NOT NULL COMMENT '邮箱密码/授权码',
      smtp_host VARCHAR(100) NOT NULL COMMENT 'SMTP服务器地址',
      smtp_port INT NOT NULL COMMENT 'SMTP服务器端口',
      is_ssl TINYINT DEFAULT 1 COMMENT '是否使用SSL：0-否，1-是',
      is_default TINYINT DEFAULT 0 COMMENT '是否默认：0-否，1-是',
      is_enabled TINYINT DEFAULT 1 COMMENT '是否启用：0-禁用，1-启用',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      UNIQUE KEY unique_email (email),
      INDEX idx_is_default (is_default),
      INDEX idx_is_enabled (is_enabled)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
  console.log('✓ email_configs 表创建成功（或已存在）')
}

/**
 * 步骤 4: 创建 system_logs 表
 */
async function step4CreateSystemLogsTable(connection) {
  console.log('\n========================================')
  console.log('步骤 4: 创建 system_logs 表')
  console.log('========================================')

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
      type VARCHAR(50) NOT NULL COMMENT '日志类型：system, email',
      action VARCHAR(100) NOT NULL COMMENT '操作类型',
      user_id INT DEFAULT NULL COMMENT '操作用户ID',
      content TEXT DEFAULT NULL COMMENT '日志内容',
      status VARCHAR(20) DEFAULT 'success' COMMENT '操作状态：success, failed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      INDEX idx_type (type),
      INDEX idx_action (action),
      INDEX idx_user_id (user_id),
      INDEX idx_created_at (created_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
  console.log('✓ system_logs 表创建成功（或已存在）')
}

/**
 * 步骤 5: 迁移现有用户数据
 */
async function step5MigrateUserData(connection) {
  console.log('\n========================================')
  console.log('步骤 5: 迁移现有用户数据')
  console.log('========================================')

  // 将所有用户设置为三级用户
  await connection.execute(`
    UPDATE users SET level = 3 WHERE level IS NULL
  `)
  console.log('✓ 现有用户已迁移为三级用户')

  // 设置第一个用户为一级用户（站长）
  const [users] = await connection.query(`
    SELECT id FROM users ORDER BY id ASC LIMIT 1
  `)
  if (users.length > 0) {
    await connection.execute(
      `
      UPDATE users SET level = 1 WHERE id = ?
    `,
      [users[0].id],
    )
    console.log(`✓ 用户 ID ${users[0].id} 已设置为一级用户（站长）`)
  } else {
    console.log('⚠ 没有找到用户，跳过一级用户设置')
  }
}

/**
 * 步骤 6: 初始化邮箱配置（从环境变量）
 */
async function step6InitializeEmailConfig(connection) {
  console.log('\n========================================')
  console.log('步骤 6: 初始化邮箱配置')
  console.log('========================================')

  const email = process.env.EMAIL_USER
  const password = process.env.EMAIL_PASS
  const smtpHost = process.env.EMAIL_HOST
  const smtpPort = process.env.EMAIL_PORT

  if (email && password && smtpHost && smtpPort) {
    await connection.execute(
      `
      INSERT IGNORE INTO email_configs (name, email, password, smtp_host, smtp_port, is_ssl, is_default, is_enabled)
      VALUES (?, ?, ?, ?, ?, 1, 1, 1)
    `,
      ['默认邮箱', email, password, smtpHost, smtpPort],
    )
    console.log('✓ 从环境变量初始化邮箱配置成功')
  } else {
    console.log('⚠ 环境变量中没有邮箱配置，跳过初始化')
  }
}

/**
 * 主函数：执行数据迁移的所有步骤
 */
async function main() {
  console.log('========================================')
  console.log('用户等级制重构数据迁移脚本')
  console.log('========================================')
  console.log('开始迁移数据...\n')

  const connection = await mysql.createConnection(config)

  try {
    await step1ModifyUsersTable(connection)
    await step2CreateUserPermissionsTable(connection)
    await step3CreateEmailConfigsTable(connection)
    await step4CreateSystemLogsTable(connection)
    await step5MigrateUserData(connection)
    await step6InitializeEmailConfig(connection)

    console.log('\n========================================')
    console.log('✓ 数据迁移完成！')
    console.log('========================================\n')
  } catch (error) {
    console.error('\n✗ 数据迁移失败:', error.message)
    console.error('错误详情:', error)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

main()
