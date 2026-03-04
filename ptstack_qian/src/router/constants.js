/**
 * 路由路径常量
 * 统一管理所有路由路径，避免魔法字符串
 */
export const ROUTE_PATHS = {
  // 根路径
  ROOT: '/',

  // 认证相关
  LOGIN: '/login',
  REGISTER: '/register',

  // 管理端
  ADMIN: '/admin',

  // 用户资料
  COMPLETE_PROFILE: '/complete-profile',
  PROFILE: '/profile',
  PROFILE_DETAIL: '/profile/:userId',

  // 文章相关
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/article/:id',
  ARTICLE_CREATE: '/article/create',
  ARTICLE_EDIT: '/article/edit/:id',

  // 公告相关
  ANNOUNCEMENT_DETAIL: '/announcement/:id',
  ANNOUNCEMENT_CREATE: '/announcement/create',
  ANNOUNCEMENT_EDIT: '/announcement/edit/:id',

  // 其他页面
  ABOUT: '/about',
  NOTIFICATIONS: '/notifications',
  REPORT_ARTICLE: '/report/article/:id',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  // 通配符（404）
  NOT_FOUND: '/:pathMatch(.*)*',
}

/**
 * 路由名称常量
 * 用于编程式导航和路由标识
 */
export const ROUTE_NAMES = {
  // 管理端
  ADMIN_DASHBOARD: 'AdminDashboard',
  ADMIN_ARTICLES: 'AdminArticles',
  ADMIN_CATEGORIES: 'AdminCategories',
  ADMIN_ANNOUNCEMENTS: 'AdminAnnouncements',
  ADMIN_USERS: 'AdminUsers',
  ADMIN_SETTINGS: 'AdminSettings',
}

/**
 * 路由元信息字段常量
 * 定义路由配置中 meta 对象的字段名
 */
export const ROUTE_META = {
  // 认证要求
  REQUIRES_AUTH: 'requiresAuth',
  REQUIRES_ADMIN: 'requiresAdmin',

  // 菜单相关
  MENU_NAME: 'menuName',
  MENU_ICON: 'menuIcon',

  // 视图类型
  VIEW: 'view',
}

/**
 * 视图类型常量
 * 用于区分同一组件的不同展示模式
 */
export const VIEW_TYPES = {
  LOGIN: 'login',
  REGISTER: 'register',
}
