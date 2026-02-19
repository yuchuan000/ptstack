import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量配置
dotenv.config();

// 数据库配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: 'ptstack_db'
};

// 数据库迁移主函数
async function migrateVerificationTable() {
  let connection;
  
  try {
    console.log('开始迁移邮箱验证表...');
    
    // 连接到数据库
    connection = await mysql.createConnection(config);
    console.log('已连接到数据库');
    
    // 备份旧表数据（如果有）
    try {
      // 先检查表是否存在
      const [rows] = await connection.query(`SHOW TABLES LIKE 'email_verifications'`);
      if (rows.length > 0) {
        console.log('发现旧表，正在备份...');
        // 创建备份表
        await connection.query(`CREATE TABLE IF NOT EXISTS email_verifications_backup AS SELECT * FROM email_verifications`);
        console.log('旧表已备份到 email_verifications_backup');
      }
    } catch (backupError) {
      console.log('备份旧表时出错:', backupError.message);
    }
    
    // 删除旧表
    try {
      await connection.query(`DROP TABLE IF EXISTS email_verifications`);
      console.log('旧表已删除');
    } catch (dropError) {
      console.log('删除旧表时出错:', dropError.message);
    }
    
    // 创建新表
    await connection.query(`
      CREATE TABLE email_verifications (
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
    console.log('新表创建成功');
    
    console.log('邮箱验证表迁移完成！');
    
  } catch (error) {
    console.error('迁移失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行迁移（如果直接运行此脚本）
migrateVerificationTable().catch(console.error);

export default migrateVerificationTable;
