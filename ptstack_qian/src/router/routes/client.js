import { ROUTE_PATHS } from '../constants'

/**
 * 客户端路由配置
 * 包含前台展示页面的所有路由
 */
export const clientRoutes = [
  {
    path: ROUTE_PATHS.ROOT,
    component: () => import('@/views/ClientLayout/ClientLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      {
        path: '',
        component: () => import('@/views/ClientHomePage/ClientHomePage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'articles',
        component: () => import('@/views/ClientArticleCenterPage/ClientArticleCenterPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'about',
        component: () => import('@/views/ClientAboutPage/ClientAboutPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'profile',
        component: () => import('@/views/ClientProfilePage/ClientProfilePage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
]
