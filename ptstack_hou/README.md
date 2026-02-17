# 后端服务说明

## 技术栈
- Express.js 5.2.1
- MySQL 8.0+
- bcrypt (密码加密)
- CORS (跨域支持)
- Nodemon (热加载)

## 目录结构
```
ptstack_hou/
├── config/
│   ├── db.js          # 数据库配置
│   └── routes.js      # 路由配置
├── controllers/
│   ├── authController.js  # 认证控制器
│   ├── indexController.js # 首页控制器
│   └── usersController.js # 用户控制器
├── middlewares/
│   └── error-handler.js   # 错误处理中间件
├── routes/
│   ├── auth.js        # 认证路由
│   ├── index.js       # 首页路由
│   └── users.js       # 用户路由
├── scripts/
│   └── init-db.js     # 数据库初始化脚本
├── app.js             # 应用主文件
├── package.json       # 项目配置
└── README.md          # 本文档
```

## 执行步骤

### 1. 前提条件
- 已安装 Node.js (v20+)
- 已安装 MySQL 8.0+ 数据库服务
- 已安装 pnpm 包管理器

### 2. 安装依赖
```bash
# 在 ptstack_hou 目录下执行
pnpm install
```

### 3. 配置环境变量
创建 `.env` 文件，配置数据库连接信息：
```env
# 数据库连接配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### 4. 初始化数据库
```bash
# 在 ptstack_hou 目录下执行
node scripts/init-db.js
```

执行结果示例：
```
开始初始化数据库...
已连接到MySQL服务器
数据库 ptstack_db 创建成功（或已存在）
已选择数据库 ptstack_db
用户表创建成功（或已存在）
数据库初始化完成！
```

### 5. 启动服务
```bash
# 在 ptstack_hou 目录下执行
npm start
```

服务将在 `http://localhost:3000` 启动

### 6. 测试登录注册功能

#### 测试注册接口
```bash
# 使用 curl 命令测试
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "123456", "email": "test@example.com"}'
```

预期响应：
```json
{
  "message": "注册成功",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

#### 测试登录接口
```bash
# 使用 curl 命令测试
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "123456"}'
```

预期响应：
```json
{
  "message": "登录成功",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "mock-token-1"
}
```

## 注意事项

1. **数据库配置**：确保 `.env` 文件中的数据库连接信息正确，且 MySQL 服务正在运行
2. **密码安全**：生产环境中应使用强密码，并定期更新
3. **错误处理**：如果遇到数据库连接错误，请检查 MySQL 服务状态和连接配置
4. **端口冲突**：如果 3000 端口被占用，请修改 `bin/www` 文件中的端口配置

## 生产环境建议

1. **JWT 认证**：使用 jsonwebtoken 库生成真实的 JWT token
2. **HTTPS**：配置 SSL 证书，使用 HTTPS 协议
3. **数据库备份**：定期备份数据库
4. **日志管理**：配置更完善的日志系统
5. **监控**：添加应用监控和告警机制
