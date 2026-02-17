<script setup>
import { ref, onMounted, onUnmounted, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { House, Setting, SwitchButton, Menu, CaretLeft, CaretRight, Document, DataLine } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isMobile = ref(window.innerWidth < 768)
const isTablet = ref(window.innerWidth >= 768 && window.innerWidth < 992)
const drawerVisible = ref(false)
const isCollapse = ref(false)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  isTablet.value = window.innerWidth >= 768 && window.innerWidth < 992
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const menuList = ref([
  {
    id: 'dashboard',
    name: '首页',
    icon: markRaw(House),
    path: '/',
  },
  {
    id: 'projects',
    name: '项目管理',
    icon: markRaw(Document),
    path: '/projects',
  },
  {
    id: 'analytics',
    name: '数据统计',
    icon: markRaw(DataLine),
    path: '/analytics',
  },
  {
    id: 'settings',
    name: '设置',
    icon: markRaw(Setting),
    path: '/settings',
  },
])

const handleMenuClick = (path) => {
  router.push(path)
  if (isMobile.value) {
    drawerVisible.value = false
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  }).catch(() => {})
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
                {{ userStore.userInfo?.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div v-if="!isCollapse" class="user-details">
                <div class="username">{{ userStore.userInfo?.username || '用户' }}</div>
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
                <el-icon><SwitchButton /></el-icon>
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
              <el-icon><SwitchButton /></el-icon>
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
              {{ userStore.userInfo?.username?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="user-details">
              <div class="username">{{ userStore.userInfo?.username || '用户' }}</div>
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
            <el-icon><SwitchButton /></el-icon>
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
