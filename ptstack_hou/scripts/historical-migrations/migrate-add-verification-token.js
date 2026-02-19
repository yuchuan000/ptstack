import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: 'ptstack_db'
};

async function migrate() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('开始添加 verification_token 字段...');
    
    const [columns] = await connection.execute('SHOW COLUMNS FROM email_verifications LIKE "verification_token"');
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE email_verifications 
        ADD COLUMN verification_token VARCHAR(64) DEFAULT NULL AFTER email_verified
      `);
      console.log('  verification_token 字段添加成功');
    } else {
      console.log('  verification_token 字段已存在');
    }
    
    console.log('迁移完成！');
    
  } catch (error) {
    console.error('迁移失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate();
