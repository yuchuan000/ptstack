import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/layout/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: Layout,
      meta: { title: '首页', breadClick: false },
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          name: 'welcome',
          component: () => import('../views/layout/Welcome.vue'),
          meta: { title: '欢迎页', breadClick: false },
        },
        {
          path: '/dashboard',
          name: 'dashboard',
          redirect: '/dashboard/console',
          meta: { title: '控制面板', breadClick: false },
          children: [
            {
              path: 'console',
              name: 'console',
              meta: { title: '主控台', breadClick: false },
              component: () => import('../views/dashboard/Console.vue'),
            },
            {
              path: 'workplace',
              name: 'workplace',
              meta: { title: '工作台', breadClick: false },
              component: () => import('../views/dashboard/Workplace.vue'),
            },
          ],
        },
        {
          path: '/data',
          name: 'data',
          redirect: '/data/articles',
          meta: { title: '数据管理', breadClick: false },
          children: [
            {
              path: 'articles',
              name: 'articles',
              meta: { title: '文章管理', breadClick: true },
              component: () => import('@/views/data/article/List.vue'),
            },
            {
              path: 'categories',
              name: 'categories',
              meta: { title: '分类管理', breadClick: true },
              component: () => import('@/views/data/category/List.vue'),
            },
            {
              path: 'attachments',
              name: 'attachments',
              meta: { title: '附件管理', breadClick: true },
              component: () => import('@/views/data/attachment/List.vue'),
            },
          ],
        },
        {
          path: '/setting',
          name: 'setting',
          redirect: '/setting/password',
          meta: { title: '设置', breadClick: false },
          children: [
            {
              path: 'password',
              name: 'password',
              meta: { title: '修改密码', breadClick: false },
              component: () => import('../views/setting/Password.vue'),
            },
          ],
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
    },
  ],
})

export default router
