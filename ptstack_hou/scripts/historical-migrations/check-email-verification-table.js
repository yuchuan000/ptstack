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

async function check() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('检查 email_verifications 表结构...');
    const [columns] = await connection.execute('SHOW COLUMNS FROM email_verifications');
    console.log('当前字段：');
    columns.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await connection.end();
  }
}

check();
