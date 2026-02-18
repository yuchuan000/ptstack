<script setup>
import { ref, onMounted, onUnmounted, markRaw } from 'vue' // 导入Vue响应式API和生命周期钩子
import { useRouter, useRoute } from 'vue-router' // 导入Vue Router
import { useUserStore } from '@/stores/user' // 导入用户状态管理
import { ElMessageBox, ElMessage } from 'element-plus' // 导入Element Plus的消息提示组件
import { House, Setting, Menu, CaretLeft, CaretRight, Tickets, Plus, Collection, Switch } from '@element-plus/icons-vue' // 导入Element Plus图标
import { getFullUrl } from '@/utils/url' // 导入URL处理工具函数

const router = useRouter() // 获取路由实例
const route = useRoute() // 获取当前路由信息
const userStore = useUserStore() // 获取用户状态仓库

const isMobile = ref(window.innerWidth < 768) // 判断是否为移动端
const isTablet = ref(window.innerWidth >= 768 && window.innerWidth < 992) // 判断是否为平板端
const drawerVisible = ref(false) // 移动端抽屉是否可见
const isCollapse = ref(false) // 侧边栏是否折叠

// 窗口大小改变时的处理函数
const handleResize = () => {
  isMobile.value = window.innerWidth < 768 // 更新移动端判断
  isTablet.value = window.innerWidth >= 768 && window.innerWidth < 992 // 更新平板端判断
}

// 组件挂载时添加窗口大小监听
onMounted(() => {
  window.addEventListener('resize', handleResize) // 添加resize事件监听
})

// 组件卸载时移除窗口大小监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize) // 移除resize事件监听
})

// 菜单列表数据
const menuList = ref([
  {
    id: 'dashboard', // 菜单项ID
    name: '首页', // 菜单项名称
    icon: markRaw(House), // 菜单项图标，使用markRaw避免响应式
    path: '/', // 菜单项路径
  },
  {
    id: 'articles', // 菜单项ID
    name: '文章列表', // 菜单项名称
    icon: markRaw(Tickets), // 菜单项图标
    path: '/articles', // 菜单项路径
  },
  {
    id: 'create-article', // 菜单项ID
    name: '写文章', // 菜单项名称
    icon: markRaw(Plus), // 菜单项图标
    path: '/article/create', // 菜单项路径
  },
  {
    id: 'categories', // 菜单项ID
    name: '分类管理', // 菜单项名称
    icon: markRaw(Collection), // 菜单项图标
    path: '/categories', // 菜单项路径
  },
  {
    id: 'settings', // 菜单项ID
    name: '设置', // 菜单项名称
    icon: markRaw(Setting), // 菜单项图标
    path: '/settings', // 菜单项路径
  },
])

// 处理菜单点击
const handleMenuClick = (path) => {
  router.push(path) // 跳转到对应路径
  if (isMobile.value) {
    drawerVisible.value = false // 移动端关闭抽屉
  }
}

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', { // 弹出确认对话框
    confirmButtonText: '确定', // 确认按钮文本
    cancelButtonText: '取消', // 取消按钮文本
    type: 'warning', // 对话框类型
  }).then(() => {
    userStore.logout() // 调用登出方法
    ElMessage.success('退出登录成功') // 显示成功提示
    router.push('/login') // 跳转到登录页
  }).catch(() => {}) // 取消时不做任何操作
}
</script>

<template>
  <el-container class="panel-layout">
    <el-header v-if="isMobile" class="mobile-header">
      <div class="header-left">
        <el-button @click="drawerVisible = true" circle class="menu-btn">
          <el-icon><Menu /></el-icon>
        </el-button>
        <div class="mobile-logo">
          <span class="logo-dot"></span>
          <span class="header-title">PTStack</span>
        </div>
      </div>
    </el-header>

    <el-container>
      <el-aside
        v-if="!isMobile"
        :width="isCollapse ? '72px' : '260px'"
        :collapse="isCollapse"
        class="sidebar"
      >
        <div class="sidebar-inner">
          <div class="logo-section">
            <div class="logo-wrapper">
              <span class="logo-dot"></span>
              <span v-if="!isCollapse" class="logo-text">PTStack</span>
            </div>
          </div>

          <el-menu
            :default-active="route.path"
            :collapse="isCollapse"
            :collapse-transition="false"
            class="menu-section"
            @select="handleMenuClick"
          >
            <el-menu-item
              v-for="item in menuList"
              :key="item.id"
              :index="item.path"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <template #title>{{ item.name }}</template>
            </el-menu-item>
          </el-menu>

          <div class="user-section">
            <div class="user-info">
              <div class="avatar">
                <img v-if="userStore.userInfo?.avatar" :src="getFullUrl(userStore.userInfo.avatar)" alt="avatar" class="avatar-img">
                <span v-else>{{ (userStore.userInfo?.nickname || userStore.userInfo?.username)?.charAt(0).toUpperCase() || 'U' }}</span>
              </div>
              <div v-if="!isCollapse" class="user-details">
                <div class="username">{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '用户' }}</div>
                <div class="email">{{ userStore.userInfo?.email || 'user@example.com' }}</div>
              </div>
            </div>
            <div v-if="!isCollapse" class="logout-section">
              <el-button
                type="primary"
                size="small"
                @click="handleLogout"
                class="logout-btn"
                plain
              >
                <el-icon><Switch /></el-icon>
                退出登录
              </el-button>
            </div>
            <el-button
              v-else
              type="primary"
              circle
              size="small"
              @click="handleLogout"
              class="logout-icon-btn"
              plain
            >
              <el-icon><Switch /></el-icon>
            </el-button>
          </div>
        </div>

        <el-button
          v-if="!isMobile"
          circle
          class="collapse-btn"
          @click="isCollapse = !isCollapse"
        >
          <el-icon>
            <CaretLeft v-if="!isCollapse" />
            <CaretRight v-else />
          </el-icon>
        </el-button>
      </el-aside>

      <el-main class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </el-main>
    </el-container>

    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="280px"
      :with-header="false"
      class="mobile-drawer"
    >
      <div class="drawer-sidebar">
        <div class="logo-section">
          <div class="logo-wrapper">
            <span class="logo-dot"></span>
            <span class="logo-text">PTStack</span>
          </div>
        </div>

        <el-menu
          :default-active="route.path"
          class="menu-section"
          @select="handleMenuClick"
        >
          <el-menu-item
            v-for="item in menuList"
            :key="item.id"
            :index="item.path"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.name }}</span>
          </el-menu-item>
        </el-menu>

        <div class="user-section">
          <div class="user-info">
            <div class="avatar">
              <img v-if="userStore.userInfo?.avatar" :src="getFullUrl(userStore.userInfo.avatar)" alt="avatar" class="avatar-img">
              <span v-else>{{ (userStore.userInfo?.nickname || userStore.userInfo?.username)?.charAt(0).toUpperCase() || 'U' }}</span>
            </div>
            <div class="user-details">
              <div class="username">{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '用户' }}</div>
              <div class="email">{{ userStore.userInfo?.email || 'user@example.com' }}</div>
            </div>
          </div>
          <el-button
            type="primary"
            size="small"
            @click="handleLogout"
            class="logout-btn"
            plain
          >
            <el-icon><Switch /></el-icon>
            退出登录
          </el-button>
        </div>
      </div>
    </el-drawer>
  </el-container>
</template>

<style lang="scss" scoped>
.panel-layout {
  height: 100vh;
  width: 100vw;
  background-color: #f7f8fa;
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 0 20px;
  height: 64px;
  border-bottom: 1px solid #f2f3f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .menu-btn {
    background: #f7f8fa;
    border: none;
    color: #1d2129;

    &:hover {
      background: #f2f3f5;
    }
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-dot {
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .header-title {
    font-size: 18px;
    font-weight: 700;
    color: #1d2129;
    letter-spacing: -0.3px;
  }
}

.sidebar {
  background: white;
  border-right: 1px solid #f2f3f5;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  transition: width 0.3s ease;
}

.sidebar-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.logo-section {
  padding: 24px 20px;
  border-bottom: 1px solid #f7f8fa;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-dot {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #1d2129;
  letter-spacing: -0.5px;
}

.menu-section {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 12px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e5e6eb;
    border-radius: 2px;
  }

  :deep(.el-menu-item) {
    color: #4e5969;
    margin: 4px 0;
    border-radius: 10px;
    height: 48px;
    line-height: 48px;
    padding: 0 12px;
    transition: all 0.2s ease;

    .el-icon {
      font-size: 18px;
    }

    &:hover {
      background-color: #f7f8fa;
      color: #1d2129;
    }

    &.is-active {
      background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

      &:hover {
        background: linear-gradient(135deg, #4080ff 0%, #165dff 100%);
      }
    }
  }
}

.user-section {
  padding: 16px;
  border-top: 1px solid #f7f8fa;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.email {
  font-size: 13px;
  color: #86909c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-section {
  width: 100%;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 10px;
  height: 40px;
  font-weight: 500;
}

.logout-icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 10px;
}

.collapse-btn {
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #f2f3f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
  color: #86909c;

  &:hover {
    background: #f7f8fa;
    color: #165dff;
    border-color: #165dff;
  }
}

.main-content {
  padding: 0;
  overflow: auto;
  background: #f7f8fa;
}

.content-wrapper {
  padding: 24px 32px;
  min-height: 100%;
}

.drawer-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 16px;
}

.mobile-drawer {
  :deep(.el-drawer__body) {
    padding: 0;
  }
}

@media (max-width: 1024px) {
  .content-wrapper {
    padding: 20px;
  }
}

@media (max-width: 640px) {
  .content-wrapper {
    padding: 16px;
  }
}
</style>
