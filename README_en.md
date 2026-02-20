# PTStack - Developer Knowledge Sharing Platform

A modern full-stack web application dedicated to building a community platform for developers to share and exchange knowledge.

## 📦 Project Structure

```
ptstack/
├── ptstack_qian/          # Frontend project (Vue 3 + Vite)
├── ptstack_hou/           # Backend project (Express + MySQL)
└── README.md              # Project documentation
```

## 🚀 Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **UI Component Library**: Element Plus
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Styling**: SCSS

### Backend
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: mysql2
- **Authentication**: JWT (JSON Web Token)
- **API Documentation**: Swagger
- **Password Encryption**: bcrypt

## 🛠️ Quick Start

### Prerequisites
- Node.js >= 18.x
- MySQL >= 8.0
- pnpm (recommended) or npm/yarn

### Database Setup

1. Create database:
```sql
CREATE DATABASE ptstack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Configure environment variables:
   - Copy `ptstack_hou/.env.example` to `ptstack_hou/.env`
   - Fill in actual configuration information in the `.env` file


### Start the Project

#### 1. Start Backend
```bash
cd ptstack_hou
pnpm install
pnpm start
```
Backend service will start at http://localhost:3000

#### 2. Start Frontend
```bash
cd ptstack_qian
pnpm install
pnpm dev
```
Frontend application will start at http://localhost:5173

## 📋 Version History

### v0.3 - Achievement System Refactoring
- 🔧 Achievement system data model refactoring
- ✨ Added event achievement (is_event), limited achievement (is_limited), unconditional achievement (is_unconditional) concepts
- 🎯 Support custom tag (custom_tag) display
- 🐛 Fixed event achievement filter logic error
- 📝 Added different icons for event and limited tags
- 🗄️ Organized database scripts, archived historical migration scripts

### v0.2 - Announcement System
- 📢 Announcement management system
- 🏃 Homepage marquee announcements
- 📊 Announcement read records
- 🔔 Notification center

## ✨ Features

- ✅ User registration and login
- ✅ JWT authentication and token refresh
- ✅ Privacy policy page
- ✅ Terms of service page
- ✅ Modern home page design
- ✅ Responsive panel layout
- ✅ Enterprise-level UI design style
- ✅ Announcement management system
- ✅ Achievement system
- ✅ Article management
- ✅ Comment system
- ✅ User follow
- ✅ Like feature

## 📚 API Documentation

After starting the backend service, visit Swagger API documentation:
http://localhost:3000/api-docs

## 🤝 Development Guide

### Committing Code

```bash
git add .
git commit -m "feat: your commit message"
git push
```

### Branch Management

- `main`: Main branch, for production environment
- `develop`: Development branch
- `feature/*`: Feature branches
- `fix/*`: Fix branches

## 📄 License

MIT License

## 📞 Contact

- Project URL: https://github.com/yuchuan000/ptstack
- Issue Tracker: https://github.com/yuchuan000/ptstack/issues
