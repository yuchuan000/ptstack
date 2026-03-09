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

2. 配置环境变量（在 `ptstack_hou/` 目录下创建 `.env` 文件）：
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的密码
DB_PORT=3306
JWT_SECRET=你的JWT密钥
```

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

### v0.7 - 功能增强
- ✨ 新增文章封面AI生成功能，基于豆包Seedream 4.5模型
- ✨ 在文章编辑页面添加AI生成封面按钮，支持根据文章标题和内容自动生成封面
- 🔧 后端新增/ai/generate-cover接口，调用豆包图片生成API
- 🔧 环境变量新增豆包图片生成API配置（DOUBAO_IMAGE_API_URL、DOUBAO_IMAGE_MODEL）
- 🔧 前端API服务新增generateCover方法，支持自定义图片尺寸
- 🔧 添加生成频率限制，60秒内只能生成一次封面
- 🔧 代码格式化，确保符合项目规范
- ✨ 新增AI管理功能，支持在线配置豆包API参数
- ✨ 新增AI配置数据表（ai_config），支持配置键值对存储
- ✨ 新增AI配置后端API接口（增删改查、批量更新、初始化默认配置）
- ✨ 后端AI控制器更新，支持从数据库读取配置，优先使用在线配置
- ✨ 新增AI管理前端页面（AiConfigPage），提供可视化配置界面
- ✨ 前端侧边栏新增AI管理菜单，使用MagicStick图标
- ✨ 支持配置加密存储，保护敏感信息（如API密钥）
- ✨ 支持批量保存配置，提高配置效率
- 🔧 数据库初始化脚本新增ai_config表创建逻辑
- 🔧 路由配置新增aiConfig路由
- 🔧 前端API服务新增aiConfig接口
- 🔧 前端路由常量新增AI_CONFIG路径和ADMIN_AI_CONFIG名称
- ✨ 重构AI配置数据模型，从键值对改为结构化AI提供商管理
- ✨ 新增AI提供商表（ai_providers），每个AI独立配置（API密钥、地址、模型ID）
- ✨ 支持AI类型分类：语言模型（chat）用于生成总结，图片模型（image）用于生成封面
- ✨ 支持多AI配置管理，可配置多个同类型AI实现负载均衡和故障切换
- ✨ 新增优先级机制，数字越小优先级越高，支持AI调用优先级排序
- ✨ 新增启用/禁用开关，灵活控制AI提供商的使用状态
- ✨ 实现自动故障切换：当某个AI的token不足时，自动切换到同类型其他启用的AI
- ✨ 后端AI调用逻辑重构，支持按用途（summary/cover）获取AI列表并自动切换
- ✨ 前端AI管理页面重构，卡片式布局展示AI配置，支持筛选和快速操作
- ✨ 新增AI类型和用途筛选功能，便于管理大量AI配置
- 🔧 数据库表结构重构：ai_config → ai_providers，新增索引优化查询性能
- 🔧 后端API接口重构：RESTful风格的AI提供商管理接口
- 🔧 前端API服务更新，适配新的数据结构
- ✨ 实现统计图表的每日自动更新机制，包括用户增长、文章发布和评论趋势
- ✨ 新增在线用户数的折线图，显示每小时的在线用户数
- ✨ 实现零值数据的正确处理，确保图表趋势的连续性
- ✨ 建立历史数据存储机制，支持至少30天的历史数据查询
- ✨ 实现数据缓存机制，提高图表加载性能
- 🔧 新增stats数据表，存储每日和每小时的统计数据
- 🔧 修改users表，添加last_activity字段用于在线用户统计
- 🔧 实现定时任务机制，每小时自动更新统计数据
- 🔧 新增在线用户统计API接口
- 🔧 前端图表布局优化，从3列改为2列，适应新增的在线用户图表

### v0.6 - 路由系统优化
- 🔧 拆分导航守卫逻辑，提取权限检查函数（checkIsAdmin、checkIsAuthenticated、checkNeedsProfileCompletion）
- 🔧 创建独立的 guards.js 文件并迁移导航守卫逻辑
- 🔧 修正 Vite 配置中的 manualChunks，使用函数式写法优化代码拆分
- 🔧 提取路由路径常量（ROUTE_PATHS、ROUTE_NAMES、ROUTE_META、VIEW_TYPES），减少魔法字符串
- 🔧 添加静态资源哈希命名配置（assetFileNames、chunkFileNames、entryFileNames），支持长期缓存
- 🔧 路由配置模块化，拆分为 admin.js、client.js、public.js 三个独立模块
- 🔧 添加必要注释并重写变量命名，遵循小驼峰规范和布尔前缀统一规则

### v0.5 - 客户端页面重构
- ✨ 新增客户端首页（ClientHomePage）- 现代化首页设计，包含动态文字轮播和数字动画
- ✨ 新增客户端文章中心（ClientArticleCenterPage）- 分类侧边栏和文章列表展示
- ✨ 新增客户端个人主页（ClientProfilePage）- 用户资料、文章、评论、关注者展示
- ✨ 新增客户端布局（ClientLayout）- 响应式顶部导航栏，支持滚动隐藏/显示
- ✨ 新增客户端关于我们（ClientAboutPage）- 团队成员展示和作品集
- 🔧 新增前端环境变量配置文件

### v0.4 - 纯净版
- ✨ 为所有Vue文件添加了功能注释
- 🔧 修改头像上传功能，上传新头像时自动删除旧头像文件
- 🗄️ 整理项目结构，保持代码简洁
- 📝 更新文档，完善使用说明

### v0.4 - 系统优化
- 🔧 移除成就系统，简化项目结构
- 🗄️ 整理数据库脚本，清理历史迁移文件

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
