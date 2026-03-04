import { createRouter, createWebHistory } from 'vue-router'
import { setupNavigationGuards } from './guards'
import { adminRoutes, clientRoutes, publicRoutes } from './routes'

/**
 * 创建 Vue Router 实例
 * 组合管理端、客户端和公共路由配置
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...adminRoutes, ...clientRoutes, ...publicRoutes]
})

// 配置全局导航守卫
setupNavigationGuards(router)

export default router
