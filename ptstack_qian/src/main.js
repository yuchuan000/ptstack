/**
 * 应用入口文件
 * 初始化Vue应用、Pinia状态管理和路由
 */

import { createApp } from 'vue' // 导入Vue的createApp函数
import { createPinia } from 'pinia' // 导入Pinia的createPinia函数

import App from './App.vue' // 导入应用根组件
import router from './router' // 导入路由配置

// 样式
import '@/style/main.scss' // 导入主样式文件
import 'element-plus/dist/index.css' // 导入Element Plus样式
import 'md-editor-v3/lib/style.css' // 导入Markdown编辑器样式

/**
 * 创建Vue应用实例
 */
const app = createApp(App)

// 使用Pinia状态管理
app.use(createPinia())

// 使用路由
app.use(router)

// 挂载应用到DOM
app.mount('#app')
