import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { markRaw } from 'vue'
import { House, Tickets, Collection, Bell, User, Setting } from '@element-plus/icons-vue'

// 管理端路由配置
const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/views/PannelPage/PannelPage.vue'),
    meta: { requiresAuth: true, isAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/HomePage/HomePage.vue'),
        meta: {
          requiresAuth: true,
          isAdmin: true,
          menuName: '首页',
          menuIcon: markRaw(House)
        }
      },
      {
        path: 'articles',
        name: 'AdminArticles',
        component: () => import('@/views/ArticleListPage/ArticleListPage.vue'),
        meta: {
          requiresAuth: true,
          isAdmin: true,
          menuName: '文章列表',
          menuIcon: markRaw(Tickets)
        }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/CategoryManagePage/CategoryManagePage.vue'),
        meta: {
          requiresAuth: true,
          isAdmin: true,
          requiresAdmin: true,
          menuName: '分类管理',
          menuIcon: markRaw(Collection)
        }
      },
      {
        path: 'announcements',
        name: 'AdminAnnouncements',
        component: () => import('@/views/AnnouncementManagePage/AnnouncementManagePage.vue'),
        meta: {
          requiresAuth: true,
          isAdmin: true,
          requiresAdmin: true,
          menuName: '公告管理',
          menuIcon: markRaw(Bell)
        }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/UserManagePage/UserManagePage.vue'),
        meta: {
          requiresAuth: true,
          isAdmin: true,
          requiresAdmin: true,
          menuName: '用户管理',
          menuIcon: markRaw(User)
        }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/SettingsPage/SettingsPage.vue'),
        meta: {
          requiresAuth: true,
          isAdmin: true,
          menuName: '设置',
          menuIcon: markRaw(Setting)
        }
      }
    ]
  }
]

// 客户端路由配置
const clientRoutes = [
  {
    path: '/',
    component: () => import('@/views/ClientLayout/ClientLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      {
        path: '',
        component: () => import('@/views/ClientHomePage/ClientHomePage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'articles',
        component: () => import('@/views/ClientArticleCenterPage/ClientArticleCenterPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'about',
        component: () => import('@/views/ClientAboutPage/ClientAboutPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'profile',
        component: () => import('@/views/ClientProfilePage/ClientProfilePage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]

// 公共路由配置
const publicRoutes = [
  {
    path: '/login',
    component: () => import('@/views/AuthPage/AuthPage.vue'),
    meta: { requiresAuth: false, view: 'login' }
  },
  {
    path: '/register',
    component: () => import('@/views/AuthPage/AuthPage.vue'),
    meta: { requiresAuth: false, view: 'register' }
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
    path: '/complete-profile',
    component: () => import('@/views/CompleteProfilePage/CompleteProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/article/:id',
    component: () => import('@/views/ArticleDetailPage/ArticleDetailPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/report/article/:id',
    component: () => import('@/views/ReportPage/ReportPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:userId',
    component: () => import('@/views/ProfilePage/ProfilePage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/notifications',
    component: () => import('@/views/NotificationsPage/NotificationsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/article/create',
    component: () => import('@/views/ArticleEditPage/ArticleEditPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/article/edit/:id',
    component: () => import('@/views/ArticleEditPage/ArticleEditPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/announcement/:id',
    component: () => import('@/views/AnnouncementDetailPage/AnnouncementDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/announcement/create',
    component: () => import('@/views/AnnouncementEditPage/AnnouncementEditPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/announcement/edit/:id',
    component: () => import('@/views/AnnouncementEditPage/AnnouncementEditPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...adminRoutes, ...clientRoutes, ...publicRoutes]
})

// 判断用户是否为管理员
const isAdmin = (userInfo) => {
  return userInfo?.isAdmin === true || userInfo?.isAdmin === 1
}

// 全局前置导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 判断目标路由是否需要认证
  if (to.meta.requiresAuth) {
    // 如果有Access Token或Refresh Token
    if (userStore.accessToken || userStore.refreshToken) {
      // 检查是否需要管理员权限
      if (to.meta.requiresAdmin && !isAdmin(userStore.userInfo)) {
        ElMessage.warning('您没有权限访问此页面')
        next('/')
        return
      }
      // 检查是否已完善资料，但资料完善页本身不需要检查
      if (to.path !== '/complete-profile' && userStore.userInfo && !userStore.userInfo.profileCompleted) {
        next('/complete-profile')
      } else {
        next()
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
      // 根据用户角色跳转到不同页面
      if (isAdmin(userStore.userInfo)) {
        next('/admin')
      } else {
        next('/')
      }
    }
  }
  // 如果访问资料完善页但已完善资料
  else if (to.path === '/complete-profile' && userStore.userInfo && userStore.userInfo.profileCompleted) {
    // 根据用户角色跳转到不同页面
    if (isAdmin(userStore.userInfo)) {
      next('/admin')
    } else {
      next('/')
    }
  }
  // 其他情况，正常放行
  else {
    next()
  }
})

export default router
