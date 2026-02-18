import mysql from 'mysql2/promise';

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  database: 'ptstack_db', // 指定数据库名称
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 连接池优化配置
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // 增加连接超时和重连配置
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 60000,
  // 连接重试配置
  reconnect: true,
  // 增加最大包大小限制（64MB）
  maxAllowedPacket: 67108864,
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    return false;
  }
}

// 执行SQL语句
async function execute(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('SQL执行失败:', error.message);
    throw error;
  }
}

export { pool, testConnection, execute };
