import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

// 数据库名称
const DB_NAME = 'ptstack_db';

async function initDatabase() {
  let connection;
  
  try {
    console.log('开始初始化数据库...');
    
    // 连接到MySQL服务器
    connection = await mysql.createConnection({
      ...config,
      multipleStatements: true
    });
    
    console.log('已连接到MySQL服务器');
    
    try {
      // 尝试创建数据库（如果不存在）
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`数据库 ${DB_NAME} 创建成功（或已存在）`);
    } catch (createDbError) {
      console.log('⚠️  创建数据库失败:', createDbError.message);
      console.log('尝试使用现有数据库...');
    }
    
    // 关闭当前连接
    await connection.end();
    console.log('已关闭临时连接');
    
    // 使用指定数据库重新连接
    try {
      connection = await mysql.createConnection({
        ...config,
        database: DB_NAME
      });
      console.log(`已连接到数据库 ${DB_NAME}`);
      
      // 创建用户表（如果不存在）
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('用户表创建成功（或已存在）');
      
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
    
    // 分析错误原因
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

// 执行初始化
initDatabase().catch(console.error);

export default initDatabase;
