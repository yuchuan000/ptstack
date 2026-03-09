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
- ✅ 客户端首页（动态文字轮播、数字动画）
- ✅ 客户端文章中心（分类侧边栏）
- ✅ 客户端个人主页（用户资料、文章、评论、关注者）
- ✅ 客户端关于我们（团队成员展示）

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
├── public/                      # 静态资源目录
│   └── favicon.ico             # 网站图标
├── src/                        # 源代码目录
│   ├── api/                    # API 接口层
│   │   ├── about.js           # 关于我们接口
│   │   ├── ai.js              # AI 相关接口
│   │   ├── aiConfig.js        # AI配置接口
│   │   ├── announcements.js    # 公告接口
│   │   ├── articles.js        # 文章接口
│   │   ├── auth.js            # 认证接口
│   │   ├── notifications.js   # 通知接口
│   │   ├── subscriptions.js   # 订阅接口
│   │   └── users.js           # 用户接口
│   ├── assets/                 # 静态资源
│   │   └── login_background.svg # 登录页背景图
│   ├── components/             # 公共组件
│   │   ├── ArticleFilter/     # 文章筛选组件
│   │   │   └── ArticleFilter.vue
│   │   ├── MentionInput/      # 提及输入组件
│   │   │   └── MentionInput.vue
│   │   ├── MentionText/       # 提及文本组件
│   │   │   └── MentionText.vue
│   │   ├── PageHeader/        # 页面头部组件
│   │   │   └── PageHeader.vue
│   │   ├── PolicyPage/        # 政策页面组件
│   │   │   └── PolicyPage.vue
│   │   └── TabContainer/      # 标签容器组件
│   │       └── TabContainer.vue
│   ├── router/                 # 路由配置
│   │   ├── index.js           # 路由主文件
│   │   ├── guards.js          # 导航守卫
│   │   ├── constants.js        # 路由常量
│   │   └── routes/            # 路由模块
│   │       ├── index.js       # 路由模块统一导出
│   │       ├── admin.js      # 管理端路由
│   │       ├── client.js     # 客户端路由
│   │       └── public.js     # 公共路由
│   ├── stores/                 # Pinia 状态管理
│   │   └── user.js            # 用户状态
│   ├── style/                  # 全局样式
│   │   └── main.scss          # 主样式文件
│   ├── utils/                  # 工具函数
│   │   ├── request.js         # HTTP 请求封装
│   │   └── url.js             # URL 处理工具
│   ├── views/                  # 页面组件
│   │   ├── AboutConfigPage/    # 客户端配置页
│   │   │   └── AboutConfigPage.vue
│   │   ├── AiConfigPage/       # AI配置页
│   │   │   └── AiConfigPage.vue
│   │   ├── AnnouncementDetailPage/    # 公告详情页
│   │   │   └── AnnouncementDetailPage.vue
│   │   ├── AnnouncementEditPage/      # 公告编辑页
│   │   │   └── AnnouncementEditPage.vue
│   │   ├── AnnouncementManagePage/    # 公告管理页
│   │   │   └── AnnouncementManagePage.vue
│   │   ├── ArticleDetailPage/         # 文章详情页
│   │   │   └── ArticleDetailPage.vue
│   │   ├── ArticleEditPage/           # 文章编辑页
│   │   │   └── ArticleEditPage.vue
│   │   ├── ArticleListPage/           # 文章列表页
│   │   │   └── ArticleListPage.vue
│   │   ├── AuthPage/                  # 认证页（登录/注册）
│   │   │   └── AuthPage.vue
│   │   ├── CategoryManagePage/        # 分类管理页
│   │   │   └── CategoryManagePage.vue
│   │   ├── ClientAboutPage/           # 客户端关于我们页
│   │   │   └── ClientAboutPage.vue
│   │   ├── ClientArticleCenterPage/   # 客户端文章中心页
│   │   │   └── ClientArticleCenterPage.vue
│   │   ├── ClientHomePage/            # 客户端首页
│   │   │   └── ClientHomePage.vue
│   │   ├── ClientLayout/              # 客户端布局组件
│   │   │   └── ClientLayout.vue
│   │   ├── ClientProfilePage/         # 客户端个人主页
│   │   │   └── ClientProfilePage.vue
│   │   ├── CompleteProfilePage/        # 完善资料页
│   │   │   └── CompleteProfilePage.vue
│   │   ├── HomePage/                  # 管理后台首页
│   │   │   └── HomePage.vue
│   │   ├── NotificationsPage/         # 通知页
│   │   │   └── NotificationsPage.vue
│   │   ├── PannelPage/                # 面板页
│   │   │   └── PannelPage.vue
│   │   ├── PrivacyPage/               # 隐私政策页
│   │   │   └── PrivacyPage.vue
│   │   ├── ProfilePage/               # 个人主页
│   │   │   └── ProfilePage.vue
│   │   ├── ReportPage/                # 举报页
│   │   │   └── ReportPage.vue
│   │   ├── SettingsPage/              # 设置页
│   │   │   └── SettingsPage.vue
│   │   ├── TermsPage/                 # 服务协议页
│   │   │   └── TermsPage.vue
│   │   └── UserManagePage/            # 用户管理页
│   │       └── UserManagePage.vue
│   ├── App.vue                  # 根组件
│   └── main.js                  # 应用入口文件
├── 设计规范/                     # 设计规范文档
│   └── 头像和管理员角标设计规范.md
├── .editorconfig               # 编辑器配置
├── .env.development            # 开发环境变量
├── .env.development.example    # 开发环境变量示例
├── .env.production             # 生产环境变量
├── .env.production.example     # 生产环境变量示例
├── .gitattributes              # Git 属性配置
├── .gitignore                  # Git 忽略文件
├── .oxlintrc.json              # OxLint 配置
├── .prettierrc.json            # Prettier 配置
├── eslint.config.js            # ESLint 配置
├── index.html                  # HTML 模板
├── jsconfig.json               # JS 配置
├── package.json                # 项目配置
├── pnpm-lock.yaml              # 依赖锁定文件
├── vite.config.js              # Vite 配置
└── README.md                   # 本文档
```
