import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量配置（从.env文件读取）
dotenv.config();

// 数据库基础配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: 'ptstack_db',
};

// 数据库迁移主函数
async function migrateDatabase() {
  let connection;
  
  try {
    console.log('开始数据库迁移...');
    
    // 连接到数据库
    connection = await mysql.createConnection(config);
    console.log('已连接到数据库');
    
    // 检查nickname字段是否已存在
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'nickname'"
    );
    
    if (columns.length > 0) {
      console.log('nickname字段已存在，跳过添加');
    } else {
      // 添加nickname字段
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN nickname VARCHAR(50) COMMENT '昵称，用于显示，可以是中文' 
        AFTER username
      `);
      console.log('nickname字段添加成功');
      
      // 将现有用户的username复制到nickname
      await connection.execute(`
        UPDATE users SET nickname = username WHERE nickname IS NULL
      `);
      console.log('已将现有用户的username复制到nickname');
    }
    
    console.log('数据库迁移完成！');
    
  } catch (error) {
    console.error('数据库迁移失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行迁移（如果直接运行此脚本）
migrateDatabase().catch(console.error);

export default migrateDatabase;
