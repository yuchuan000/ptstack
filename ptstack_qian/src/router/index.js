/**
 * 路由配置文件
 * 管理应用的路由实例创建和导航守卫配置
 */

import { createRouter, createWebHistory } from 'vue-router' // 导入路由创建函数
import { setupNavigationGuards } from './guards' // 导入导航守卫配置
import { adminRoutes, clientRoutes, publicRoutes } from './routes' // 导入路由配置

/**
 * Vue Router 实例
 * 组合管理端、客户端和公共路由配置
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 使用 HTML5 History 模式
  routes: [...adminRoutes, ...clientRoutes, ...publicRoutes], // 合并所有路由配置
})

/**
 * 配置全局导航守卫
 * 处理路由权限和认证
 */
setupNavigationGuards(router)

export default router
