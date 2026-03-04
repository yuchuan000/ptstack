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
├── bin/                        # 启动脚本
│   └── www.js                 # 应用启动入口
├── config/                     # 配置文件
│   ├── db.js                  # 数据库配置
│   ├── jwt.js                 # JWT 配置
│   ├── routes.js              # 路由配置
│   └── swagger.js             # Swagger API 文档配置
├── controllers/                # 控制器层
│   ├── aiController.js        # AI 控制器
│   ├── announcementsController.js  # 公告控制器
│   ├── articlesController.js  # 文章控制器
│   ├── authController.js      # 认证控制器
│   ├── commentLikesController.js    # 评论点赞控制器
│   ├── commentsController.js  # 评论控制器
│   ├── indexController.js     # 首页控制器
│   ├── likesController.js     # 点赞控制器
│   ├── notificationsController.js  # 通知控制器
│   ├── subscriptionsController.js  # 订阅控制器
│   ├── uploadController.js    # 上传控制器
│   └── usersController.js     # 用户控制器
├── middlewares/                # 中间件
│   ├── auth.js                # 认证中间件
│   └── error-handler.js       # 错误处理中间件
├── public/                     # 静态资源
│   └── stylesheets/
│       └── style.css          # 样式文件
├── routes/                     # 路由层
│   ├── ai.js                  # AI 路由
│   ├── announcements.js       # 公告路由
│   ├── articles.js            # 文章路由
│   ├── auth.js                # 认证路由
│   ├── commentLikes.js        # 评论点赞路由
│   ├── comments.js            # 评论路由
│   ├── emailVerification.js   # 邮箱验证路由
│   ├── index.js               # 首页路由
│   ├── likes.js               # 点赞路由
│   ├── notifications.js       # 通知路由
│   ├── subscriptions.js       # 订阅路由
│   ├── upload.js              # 上传路由
│   ├── user.js                # 用户路由
│   └── users.js               # 用户管理路由
├── scripts/                    # 脚本文件
│   ├── setup-database.js      # 数据库初始化脚本
│   └── historical-migrations/ # 历史迁移脚本
│       ├── add-missing-fields.js
│       ├── add-verification-token.js
│       ├── check-email-verification-table.js
│       ├── init-db.js
│       ├── migrate-add-announcement-overview.js
│       ├── migrate-add-avatar-profile.js
│       ├── migrate-add-comments.js
│       ├── migrate-add-email-verification.js
│       ├── migrate-add-nickname.js
│       ├── migrate-add-remaining-fields.js
│       ├── migrate-add-verification-table.js
│       ├── migrate-add-verification-token.js
│       ├── migrate-announcements.js
│       ├── migrate-article-comments.js
│       ├── migrate-comment-likes.js
│       ├── migrate-db.js
│       ├── migrate-missing-tables.js
│       ├── migrate-public-ids.js
│       ├── migrate-subscriptions.js
│       ├── migrate-update-verification-table.js
│       ├── migrate-verification-to-code.js
│       └── sync-comment-count.js
├── services/                   # 服务层
│   └── emailService.js        # 邮件服务
├── utils/                      # 工具函数
│   └── idGenerator.js         # ID 生成器
├── views/                      # 视图模板
│   ├── error.ejs              # 错误页面
│   └── index.ejs              # 首页
├── .env.development           # 开发环境变量
├── .env.development.example   # 开发环境变量示例
├── .env.example               # 环境变量示例
├── .env.production            # 生产环境变量
├── .env.production.example    # 生产环境变量示例
├── .gitignore                 # Git 忽略文件
├── .prettierrc.json           # Prettier 配置
├── app.js                     # 应用主文件
├── docker-compose.yml         # Docker Compose 配置
├── package.json               # 项目配置
├── pnpm-lock.yaml             # 依赖锁定文件
└── README.md                  # 本文档
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

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 邮件配置（可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
```

### 4. 初始化数据库

```bash
# 在 ptstack_hou 目录下执行
node scripts/setup-database.js
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
pnpm start
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
5. **文件上传**：确保上传目录有正确的读写权限
6. **环境变量**：不要将 `.env` 文件提交到版本控制系统

## 生产环境建议

1. **JWT 认证**：使用 jsonwebtoken 库生成真实的 JWT token
2. **HTTPS**：配置 SSL 证书，使用 HTTPS 协议
3. **数据库备份**：定期备份数据库
4. **日志管理**：配置更完善的日志系统
5. **监控**：添加应用监控和告警机制
6. **限流**：添加 API 限流中间件，防止滥用
7. **安全**：
   - 使用 helmet 中间件增强安全性
   - 配置 CORS 白名单
   - 验证和清理所有用户输入
   - 使用参数化查询防止 SQL 注入
8. **性能**：
   - 启用 gzip 压缩
   - 配置缓存策略
   - 使用连接池管理数据库连接
9. **部署**：
   - 使用 PM2 或类似工具管理进程
   - 配置反向代理（如 Nginx）
   - 设置自动重启策略

## API 文档

启动服务后，访问 Swagger API 文档：
http://localhost:3000/api-docs

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器（带热重载）
pnpm dev

# 启动生产服务器
pnpm start

# 运行数据库初始化脚本
node scripts/setup-database.js

# 代码格式化
pnpm format

# 代码检查
pnpm lint
```
