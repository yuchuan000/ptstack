import { fileURLToPath, URL } from 'node:url'
import { dirname } from 'node:path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname)
  return {
    plugins: [
      vue(),
      vueDevTools(),
      AutoImport({
        resolvers: [ElementPlusResolver({
          importStyle: false,
        })],
      }),
      Components({
        resolvers: [ElementPlusResolver({
          importStyle: false,
        })],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    optimizeDeps: {
      include: ['element-plus'],
    },
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
    },
    build: {
      rollupOptions: {
        output: {
          // 静态资源哈希命名（支持长期缓存）
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          manualChunks: (id) => {
            // 第三方库拆分（优先级最高）
            if (id.includes('node_modules')) {
              // Element Plus 相关（包括自动导入的组件）
              if (id.includes('element-plus')) {
                return 'vendor-element-plus'
              }
              // Vue 核心、Vue Router、Pinia 等
              if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
                return 'vendor-vue'
              }
              // 其他第三方库
              return 'vendor'
            }

            // 按业务模块手动拆分（使用@别名，匹配导入路径）
            if (id.includes('@/views/PannelPage') || id.includes('@/views/HomePage') ||
                id.includes('@/views/ArticleListPage') || id.includes('@/views/CategoryManagePage') ||
                id.includes('@/views/AnnouncementManagePage') || id.includes('@/views/UserManagePage') ||
                id.includes('@/views/SettingsPage')) {
              return 'admin'
            }

            if (id.includes('@/views/ClientLayout') || id.includes('@/views/ClientHomePage') ||
                id.includes('@/views/ClientArticleCenterPage') || id.includes('@/views/ClientAboutPage') ||
                id.includes('@/views/ClientProfilePage')) {
              return 'client'
            }

            if (id.includes('@/views/AuthPage')) {
              return 'auth'
            }

            // 合并文章/公告相关模块，减少Chunk数量
            if (id.includes('@/views/ArticleDetailPage') || id.includes('@/views/ArticleEditPage') ||
                id.includes('@/views/AnnouncementDetailPage') || id.includes('@/views/AnnouncementEditPage')) {
              return 'content'
            }

            // 合并用户/个人中心相关模块
            if (id.includes('@/views/ProfilePage') || id.includes('@/views/CompleteProfilePage') ||
                id.includes('@/views/NotificationsPage')) {
              return 'user-center'
            }

            // 合并法律/报表等低频模块
            if (id.includes('@/views/TermsPage') || id.includes('@/views/PrivacyPage') ||
                id.includes('@/views/ReportPage')) {
              return 'other'
            }
          },
        },
      },
    },
  }
})
