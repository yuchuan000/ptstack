# PTStack - 开发者知识分享平台

一个现代化的全栈 Web 应用，致力于打造开发者知识分享和交流的社区平台。

## 📦 项目结构

```
ptstack/
├── ptstack_qian/          # 前端项目 (Vue 3 + Vite)
├── ptstack_hou/           # 后端项目 (Express + MySQL)
└── README.md              # 项目说明文档
```

## 🚀 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **样式**: SCSS

### 后端
- **框架**: Express.js
- **数据库**: MySQL
- **ORM**: mysql2
- **认证**: JWT (JSON Web Token)
- **API 文档**: Swagger
- **密码加密**: bcrypt

## 🛠️ 快速开始

### 前置要求
- Node.js >= 18.x
- MySQL >= 8.0
- pnpm (推荐) 或 npm/yarn

### 数据库配置

1. 创建数据库：
```sql
CREATE DATABASE ptstack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置环境变量：
   - 复制 `ptstack_hou/.env.example` 为 `ptstack_hou/.env`
   - 填写 `.env` 文件中的实际配置信息


### 启动项目

#### 1. 启动后端
```bash
cd ptstack_hou
pnpm install
pnpm start
```
后端服务将在 http://localhost:3000 启动

#### 2. 启动前端
```bash
cd ptstack_qian
pnpm install
pnpm dev
```
前端应用将在 http://localhost:5173 启动

## 📋 版本历史

### v0.3 - 成就系统重构
- 🔧 成就系统数据模型重构
- ✨ 新增活动成就(is_event)、限定成就(is_limited)、无条件成就(is_unconditional)概念
- 🎯 支持自定义标签(custom_tag)显示
- 🐛 修复活动成就筛选逻辑错误
- 📝 为活动和限定标签设置不同图标
- 🗄️ 整理数据库脚本，归档历史迁移脚本

### v0.2 - 公告系统
- 📢 公告管理系统
- 🏃 首页跑马灯公告
- 📊 公告阅读记录
- 🔔 消息中心

## ✨ 功能特性

- ✅ 用户注册和登录
- ✅ JWT 认证与 Token 刷新
- ✅ 隐私政策页面
- ✅ 服务协议页面
- ✅ 现代化首页设计
- ✅ 响应式面板布局
- ✅ 企业级 UI 设计风格
- ✅ 公告管理系统
- ✅ 成就系统
- ✅ 文章管理
- ✅ 评论系统
- ✅ 用户关注
- ✅ 点赞功能

## 📚 API 文档

启动后端服务后，访问 Swagger API 文档：
http://localhost:3000/api-docs

## 🤝 开发指南

### 提交代码

```bash
git add .
git commit -m "feat: 你的提交信息"
git push
```

### 分支管理

- `main`: 主分支，用于生产环境
- `develop`: 开发分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支

## 📄 许可证

MIT License

## 📞 联系方式

- 项目地址: https://github.com/yuchuan000/ptstack
- 问题反馈: https://github.com/yuchuan000/ptstack/issues
