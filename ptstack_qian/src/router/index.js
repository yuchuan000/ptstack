import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginPage/LoginPage.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      component: () => import('@/views/RegisterPage/RegisterPage.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/terms',
      component: () => import('@/views/TermsPage/TermsPage.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/privacy',
      component: () => import('@/views/PrivacyPage/PrivacyPage.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/views/PannelPage/PannelPage.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/views/HomePage/HomePage.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'settings',
          component: () => import('@/views/HomePage/HomePage.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ],
})

/**
 * 全局前置导航守卫
 * 在每次路由跳转前执行，用于权限控制
 * @param {object} to - 即将要进入的目标路由
 * @param {object} from - 当前导航正要离开的路由
 * @param {function} next - 必须调用该方法来 resolve 这个钩子
 */
router.beforeEach((to, from, next) => {
  // 获取用户状态仓库
  const userStore = useUserStore()

  // 情况1：目标路由需要认证
  if (to.meta.requiresAuth) {
    // 如果有 Access Token 或 Refresh Token，先放行，让 axios 拦截器处理
    // 企业常用做法：不在这里判断 token 是否过期，统一由后端 API 验证
    if (userStore.accessToken || userStore.refreshToken) {
      next()
    } else {
      // 两个 token 都没有，才跳转到登录页
      next('/login')
    }
  }
  // 情况2：访问登录/注册页，但用户有有效 token
  else if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
    next('/')
  }
  // 情况3：其他情况，正常放行
  else {
    next()
  }
})

export default router
