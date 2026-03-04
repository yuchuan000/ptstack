import { ROUTE_PATHS, VIEW_TYPES } from '../constants'

/**
 * 公共路由配置
 * 包含无需布局或跨模块共享的独立页面路由
 */
export const publicRoutes = [
  {
    path: ROUTE_PATHS.LOGIN,
    component: () => import('@/views/AuthPage/AuthPage.vue'),
    meta: { requiresAuth: false, view: VIEW_TYPES.LOGIN }
  },
  {
    path: ROUTE_PATHS.REGISTER,
    component: () => import('@/views/AuthPage/AuthPage.vue'),
    meta: { requiresAuth: false, view: VIEW_TYPES.REGISTER }
  },
  {
    path: ROUTE_PATHS.TERMS,
    component: () => import('@/views/TermsPage/TermsPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: ROUTE_PATHS.PRIVACY,
    component: () => import('@/views/PrivacyPage/PrivacyPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: ROUTE_PATHS.COMPLETE_PROFILE,
    component: () => import('@/views/CompleteProfilePage/CompleteProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ROUTE_PATHS.ARTICLE_DETAIL,
    component: () => import('@/views/ArticleDetailPage/ArticleDetailPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: ROUTE_PATHS.REPORT_ARTICLE,
    component: () => import('@/views/ReportPage/ReportPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ROUTE_PATHS.PROFILE_DETAIL,
    component: () => import('@/views/ProfilePage/ProfilePage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: ROUTE_PATHS.NOTIFICATIONS,
    component: () => import('@/views/NotificationsPage/NotificationsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ROUTE_PATHS.ARTICLE_CREATE,
    component: () => import('@/views/ArticleEditPage/ArticleEditPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ROUTE_PATHS.ARTICLE_EDIT,
    component: () => import('@/views/ArticleEditPage/ArticleEditPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ROUTE_PATHS.ANNOUNCEMENT_DETAIL,
    component: () => import('@/views/AnnouncementDetailPage/AnnouncementDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: ROUTE_PATHS.ANNOUNCEMENT_CREATE,
    component: () => import('@/views/AnnouncementEditPage/AnnouncementEditPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: ROUTE_PATHS.ANNOUNCEMENT_EDIT,
    component: () => import('@/views/AnnouncementEditPage/AnnouncementEditPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: ROUTE_PATHS.NOT_FOUND,
    redirect: ROUTE_PATHS.ROOT
  }
]
