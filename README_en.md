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

2. Configure environment variables (create `.env` file in `ptstack_hou/` directory):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306
JWT_SECRET=your_jwt_secret
```

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

### v0.7 - Feature Enhancement
- ✨ Added article cover AI generation feature based on Doubao Seedream 4.5 model
- ✨ Added AI generate cover button in article edit page, supports automatic cover generation based on article title and content
- 🔧 Added backend /ai/generate-cover endpoint, calls Doubao image generation API
- 🔧 Environment variables added for Doubao image generation API configuration (DOUBAO_IMAGE_API_URL, DOUBAO_IMAGE_MODEL)
- 🔧 Frontend API service added generateCover method, supports custom image size
- 🔧 Added generation frequency limit, can only generate one cover within 60 seconds
- 🔧 Code formatting to ensure compliance with project standards
- ✨ Added AI management functionality, supporting online configuration of Doubao API parameters
- ✨ Added AI configuration data table (ai_config), supporting key-value pair storage
- ✨ Added AI configuration backend API interfaces (CRUD, batch update, initialize default configuration)
- ✨ Backend AI controller updated to support reading configuration from database, prioritizing online configuration
- ✨ Added AI management frontend page (AiConfigPage), providing visual configuration interface
- ✨ Added AI management menu to frontend sidebar, using MagicStick icon
- ✨ Supported encrypted storage of configuration to protect sensitive information (such as API keys)
- ✨ Supported batch saving of configuration to improve configuration efficiency
- 🔧 Database initialization script added ai_config table creation logic
- 🔧 Route configuration added aiConfig route
- 🔧 Frontend API service added aiConfig interface
- 🔧 Frontend route constants added AI_CONFIG path and ADMIN_AI_CONFIG name
- ✨ Refactored AI configuration data model from key-value pairs to structured AI provider management
- ✨ Added AI provider table (ai_providers), each AI with independent configuration (API key, address, model ID)
- ✨ Supported AI type classification: language model (chat) for generating summaries, image model (image) for generating covers
- ✨ Supported multi-AI configuration management, multiple AIs of the same type can be configured to achieve load balancing and failover
- ✨ Added priority mechanism, smaller numbers have higher priority, supporting AI call priority sorting
- ✨ Added enable/disable switch for flexible control of AI provider usage status
- ✨ Implemented automatic failover: when an AI has insufficient tokens, it automatically switches to other enabled AIs of the same type
- ✨ Backend AI call logic refactoring, supporting AI list retrieval by purpose (summary/cover) and automatic switching
- ✨ Frontend AI management page refactoring, card-based layout to display AI configurations, supporting filtering and quick operations
- ✨ Added AI type and purpose filtering functionality for easy management of large numbers of AI configurations
- 🔧 Database table structure refactoring: ai_config → ai_providers, added indexes to optimize query performance
- 🔧 Backend API interface refactoring: RESTful-style AI provider management interface
- 🔧 Frontend API service update to adapt to new data structure
- ✨ Implemented daily automatic update mechanism for statistics charts, including user growth, article publishing, and comment trends
- ✨ Added online user count line chart, displaying hourly online user count
- ✨ Implemented correct handling of zero-value data to ensure chart trend continuity
- ✨ Established historical data storage mechanism, supporting at least 30 days of historical data query
- ✨ Implemented data caching mechanism to improve chart loading performance
- 🔧 Added stats data table to store daily and hourly statistics
- 🔧 Modified users table, added last_activity field for online user statistics
- 🔧 Implemented scheduled task mechanism to automatically update statistics every hour
- 🔧 Added online user statistics API endpoint
- 🔧 Optimized frontend chart layout from 3 columns to 2 columns to accommodate the new online user chart

### v0.6 - Router System Optimization
- 🔧 Split navigation guard logic, extracted permission check functions (checkIsAdmin, checkIsAuthenticated, checkNeedsProfileCompletion)
- 🔧 Created independent guards.js file and migrated navigation guard logic
- 🔧 Fixed manualChunks configuration in Vite, using functional approach for optimized code splitting
- 🔧 Extracted route path constants (ROUTE_PATHS, ROUTE_NAMES, ROUTE_META, VIEW_TYPES) to reduce magic strings
- 🔧 Added static resource hash naming configuration (assetFileNames, chunkFileNames, entryFileNames) for long-term caching
- 🔧 Modularized route configuration, split into three independent modules: admin.js, client.js, public.js
- 🔧 Added necessary comments and rewrote variable naming, following camelCase convention and unified boolean prefix rules

### v0.5 - Client Pages Refactoring
- ✨ Added ClientHomePage - Modern homepage design with dynamic text carousel and number animations
- ✨ Added ClientArticleCenterPage - Category sidebar and article list display
- ✨ Added ClientProfilePage - User profile, articles, comments, and followers display
- ✨ Added ClientLayout - Responsive top navigation bar with scroll hide/show support
- ✨ Added ClientAboutPage - Team member showcase and portfolio
- 🔧 Added frontend environment variable configuration files

### v0.4 - Clean Version
- ✨ Added functional comments to all Vue files
- 🔧 Modified avatar upload functionality to automatically delete old avatar files when uploading new ones
- 🗄️ Organized project structure, keeping code clean
- 📝 Updated documentation, improved usage instructions

### v0.4 - System Optimization
- 🔧 Removed achievement system to simplify project structure
- 🗄️ Organized database scripts, cleaned up historical migration files

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
