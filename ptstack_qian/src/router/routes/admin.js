import { markRaw } from 'vue'
import {
  House,
  Tickets,
  Collection,
  Bell,
  User,
  Setting,
  InfoFilled,
  MagicStick,
} from '@element-plus/icons-vue'
import { ROUTE_PATHS, ROUTE_NAMES } from '../constants'

/**
 * 管理端路由配置
 * 包含后台管理系统的所有页面路由
 */
export const adminRoutes = [
  {
    path: ROUTE_PATHS.ADMIN,
    component: () => import('@/views/PannelPage/PannelPage.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: ROUTE_NAMES.ADMIN_DASHBOARD,
        component: () => import('@/views/HomePage/HomePage.vue'),
        meta: {
          requiresAuth: true,
          menuName: '首页',
          menuIcon: markRaw(House),
        },
      },
      {
        path: 'articles',
        name: ROUTE_NAMES.ADMIN_ARTICLES,
        component: () => import('@/views/ArticleListPage/ArticleListPage.vue'),
        meta: {
          requiresAuth: true,
          menuName: '文章列表',
          menuIcon: markRaw(Tickets),
        },
      },
      {
        path: 'categories',
        name: ROUTE_NAMES.ADMIN_CATEGORIES,
        component: () => import('@/views/CategoryManagePage/CategoryManagePage.vue'),
        meta: {
          requiresAuth: true,
          requiredPermission: 'category_manage',
          menuName: '分类管理',
          menuIcon: markRaw(Collection),
        },
      },
      {
        path: 'announcements',
        name: ROUTE_NAMES.ADMIN_ANNOUNCEMENTS,
        component: () => import('@/views/AnnouncementManagePage/AnnouncementManagePage.vue'),
        meta: {
          requiresAuth: true,
          requiredPermission: 'announcement_manage',
          menuName: '公告管理',
          menuIcon: markRaw(Bell),
        },
      },
      {
        path: 'users',
        name: ROUTE_NAMES.ADMIN_USERS,
        component: () => import('@/views/UserManagePage/UserManagePage.vue'),
        meta: {
          requiresAuth: true,
          requiredPermission: 'user_manage',
          menuName: '用户管理',
          menuIcon: markRaw(User),
        },
      },
      {
        path: 'settings',
        name: ROUTE_NAMES.ADMIN_SETTINGS,
        component: () => import('@/views/SettingsPage/SettingsPage.vue'),
        meta: {
          requiresAuth: true,
          menuName: '设置',
          menuIcon: markRaw(Setting),
        },
      },
      {
        path: 'about-config',
        name: ROUTE_NAMES.ADMIN_ABOUT_CONFIG,
        component: () => import('@/views/AboutConfigPage/AboutConfigPage.vue'),
        meta: {
          requiresAuth: true,
          requiredLevel: 1,
          menuName: '客户端配置',
          menuIcon: markRaw(InfoFilled),
        },
      },
      {
        path: 'ai-config',
        name: ROUTE_NAMES.ADMIN_AI_CONFIG,
        component: () => import('@/views/AiConfigPage/AiConfigPage.vue'),
        meta: {
          requiresAuth: true,
          requiredLevel: 1,
          menuName: 'AI管理',
          menuIcon: markRaw(MagicStick),
        },
      },

    ],
  },
]
