import { createRouter, createWebHistory } from 'vue-router' // 导入Vue Router的创建方法
import { useUserStore } from '@/stores/user' // 导入用户状态管理

// 创建路由实例
const router = createRouter({
  // 使用HTML5 History模式
  history: createWebHistory(import.meta.env.BASE_URL),
  // 路由配置数组
  routes: [
    {
      path: '/login', // 登录页面路径
      component: () => import('@/views/AuthPage/AuthPage.vue'), // 懒加载认证页面组件
      meta: { requiresAuth: false, view: 'login' } // 路由元信息，不需要认证，显示登录视图
    },
    {
      path: '/register', // 注册页面路径
      component: () => import('@/views/AuthPage/AuthPage.vue'), // 懒加载认证页面组件
      meta: { requiresAuth: false, view: 'register' } // 路由元信息，不需要认证，显示注册视图
    },
    {
      path: '/terms', // 服务条款页面路径
      component: () => import('@/views/TermsPage/TermsPage.vue'), // 懒加载服务条款页面组件
      meta: { requiresAuth: false } // 路由元信息，不需要认证
    },
    {
      path: '/privacy', // 隐私政策页面路径
      component: () => import('@/views/PrivacyPage/PrivacyPage.vue'), // 懒加载隐私政策页面组件
      meta: { requiresAuth: false } // 路由元信息，不需要认证
    },
    {
      path: '/complete-profile', // 资料完善页面路径
      component: () => import('@/views/CompleteProfilePage/CompleteProfilePage.vue'), // 懒加载资料完善页面组件
      meta: { requiresAuth: true } // 路由元信息，需要认证
    },
    {
      path: '/article/:id', // 文章详情页面路径，带动态参数id
      component: () => import('@/views/ArticleDetailPage/ArticleDetailPage.vue'), // 懒加载文章详情页面组件
      meta: { requiresAuth: false } // 路由元信息，不需要认证
    },
    {
      path: '/report/article/:id', // 文章举报页面路径，带动态参数id
      component: () => import('@/views/ReportPage/ReportPage.vue'), // 懒加载文章举报页面组件
      meta: { requiresAuth: true } // 路由元信息，需要认证
    },
    {
      path: '/profile/:userId', // 用户个人主页路径，带动态参数userId
      component: () => import('@/views/ProfilePage/ProfilePage.vue'), // 懒加载用户个人主页组件
      meta: { requiresAuth: false } // 路由元信息，不需要认证
    },
    {
      path: '/', // 根路径
      component: () => import('@/views/PannelPage/PannelPage.vue'), // 懒加载主面板页面组件
      meta: { requiresAuth: true }, // 路由元信息，需要认证
      // 子路由配置
      children: [
        {
          path: '', // 空路径，默认显示首页
          component: () => import('@/views/HomePage/HomePage.vue'), // 懒加载首页组件
          meta: { requiresAuth: true } // 路由元信息，需要认证
        },
        {
          path: 'articles', // 文章列表路径
          component: () => import('@/views/ArticleListPage/ArticleListPage.vue'), // 懒加载文章列表组件
          meta: { requiresAuth: true } // 路由元信息，需要认证
        },
        {
          path: 'article/create', // 创建文章路径
          component: () => import('@/views/ArticleEditPage/ArticleEditPage.vue'), // 懒加载文章编辑组件
          meta: { requiresAuth: true } // 路由元信息，需要认证
        },
        {
          path: 'article/edit/:id', // 编辑文章路径，带动态参数id
          component: () => import('@/views/ArticleEditPage/ArticleEditPage.vue'), // 懒加载文章编辑组件
          meta: { requiresAuth: true } // 路由元信息，需要认证
        },
        {
          path: 'categories', // 分类管理路径
          component: () => import('@/views/CategoryManagePage/CategoryManagePage.vue'), // 懒加载分类管理组件
          meta: { requiresAuth: true } // 路由元信息，需要认证
        },
        {
          path: 'settings', // 设置页面路径
          component: () => import('@/views/SettingsPage/SettingsPage.vue'), // 懒加载设置页面组件
          meta: { requiresAuth: true } // 路由元信息，需要认证
        }
      ]
    }
  ],
})

// 全局前置导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore() // 获取用户状态仓库实例

  // 判断目标路由是否需要认证
  if (to.meta.requiresAuth) {
    // 如果有Access Token或Refresh Token
    if (userStore.accessToken || userStore.refreshToken) {
      // 检查是否已完善资料，但资料完善页本身不需要检查
      if (to.path !== '/complete-profile' && userStore.userInfo && !userStore.userInfo.profileCompleted) {
        next('/complete-profile') // 跳转到资料完善页
      } else {
        next() // 放行，继续导航
      }
    } else {
      // 两个token都没有，跳转到登录页
      next('/login')
    }
  }
  // 如果访问登录或注册页，但用户已登录
  else if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
    // 检查是否需要完善资料
    if (userStore.userInfo && !userStore.userInfo.profileCompleted) {
      next('/complete-profile')
    } else {
      next('/') // 重定向到首页
    }
  }
  // 如果访问资料完善页但已完善资料
  else if (to.path === '/complete-profile' && userStore.userInfo && userStore.userInfo.profileCompleted) {
    next('/') // 重定向到首页
  }
  // 其他情况，正常放行
  else {
    next() // 放行，继续导航
  }
})

export default router // 导出路由实例
