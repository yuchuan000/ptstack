# PTStack 前端项目

基于 Vue 3 + Vite 的开发者知识分享平台前端应用。

## 技术栈
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 7.x
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 5.x
- **HTTP 客户端**: Axios
- **样式**: SCSS
- **Markdown编辑器**: md-editor-v3

## 功能特性
- ✅ 用户注册和登录
- ✅ JWT 认证与 Token 刷新
- ✅ 个人资料管理（头像、昵称、简介）
- ✅ 文章发布与编辑
- ✅ 文章详情与评论
- ✅ 用户关注与粉丝
- ✅ 点赞功能
- ✅ 公告系统
- ✅ 消息通知
- ✅ 分类管理
- ✅ 用户管理（管理员）
- ✅ 举报功能

## 开发指南

### 项目设置
```sh
pnpm install
```

### 编译和热重载（开发模式）
```sh
pnpm dev
```

### 编译和压缩（生产模式）
```sh
pnpm build
```

### 代码检查和修复
```sh
pnpm lint
```

### 代码格式化
```sh
pnpm format
```

## 项目结构
```
ptstack_qian/
├── src/
│   ├── api/              # API 接口
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── style/            # 全局样式
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── vite.config.js        # Vite 配置
├── eslint.config.js      # ESLint 配置
└── package.json          # 项目配置
```

## 版本历史
### v0.4 - 纯净版
- ✨ 为所有Vue文件添加了功能注释
- 🔧 修改头像上传功能，上传新头像时自动删除旧头像文件
- 🗄️ 整理项目结构，保持代码简洁
