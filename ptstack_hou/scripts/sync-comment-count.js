import mysql2 from 'mysql2/promise';
import 'dotenv/config';

const syncCommentCount = async () => {
  console.log('开始同步文章评论数...');
  
  const connection = await mysql2.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ptstack_db',
  });
  
  try {
    console.log('已连接到数据库');
    
    await connection.query(`
      UPDATE articles a 
      SET comment_count = (
        SELECT COUNT(*) 
        FROM comments c 
        WHERE c.article_id = a.id
      )
    `);
    console.log('评论数已同步！');
    
  } catch (error) {
    console.error('同步失败:', error);
  } finally {
    await connection.end();
    console.log('数据库连接已关闭');
  }
};

syncCommentCount().catch(console.error);
