<script setup>
// 客户端布局组件
// 功能：顶部导航栏布局，包含首页、文章中心、关于我们导航，右上角用户信息
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox, ElMessage } from 'element-plus'
import { House, Document, InfoFilled, Switch, User, ArrowDown, ArrowUp, Setting } from '@element-plus/icons-vue'

import { getFooterItems } from '@/api/about'
import UserAvatar from '@/components/Common/UserAvatar.vue'



const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isMobile = ref(window.innerWidth < 768)
const userDropdownVisible = ref(false)
const scrollTop = ref(0)
const lastScrollTop = ref(0)
const isHeaderVisible = ref(true)

// 底部信息
const footerItems = ref([])
const footerLoading = ref(false)

// 窗口大小改变时的处理函数
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

// 滚动事件处理
const handleScroll = () => {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
  scrollTop.value = currentScrollTop

  // 判断滚动方向，向下滚动隐藏导航栏，向上滚动显示
  // 在首页且滚动超过 100px 时才开始隐藏
  const shouldHide = currentScrollTop > lastScrollTop.value && currentScrollTop > 100

  if (shouldHide !== !isHeaderVisible.value) {
    isHeaderVisible.value = !shouldHide
  }

  lastScrollTop.value = currentScrollTop
}

// 组件挂载时添加窗口大小监听和滚动监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
  fetchFooterItems()
})

// 组件卸载时移除窗口大小监听和滚动监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})

// 导航菜单列表
const navList = ref([
  {
    id: 'home',
    name: '首页',
    icon: markRaw(House),
    path: '/',
  },
  {
    id: 'articles',
    name: '文章中心',
    icon: markRaw(Document),
    path: '/articles',
  },
  {
    id: 'about',
    name: '关于我们',
    icon: markRaw(InfoFilled),
    path: '/about',
  },
])

// 当前激活的导航
const activeNav = computed(() => {
  const currentPath = route.path
  const activeItem = navList.value.find(item => item.path === currentPath)
  return activeItem?.id || 'home'
})

// 判断是否应该应用透明样式（只在首页使用透明样式）
const shouldApplyTransparent = computed(() => {
  return route.path === '/'
})

// 判断是否已登录
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 判断是否可以访问管理后台（一级和二级用户）
const canAccessAdmin = computed(() => {
  const level = userStore.userInfo?.level
  return level === 1 || level === 2
})

// 处理导航点击
const handleNavClick = (path) => {
  router.push(path)
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}

// 跳转到注册页
const goToRegister = () => {
  router.push('/register')
}

// 回到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 跳转到个人资料页
const goToProfile = () => {
  if (userStore.userInfo?.id) {
    router.push(`/profile`)
  }
  userDropdownVisible.value = false
}

// 跳转到管理后台
const goToAdmin = () => {
  router.push('/admin')
  userDropdownVisible.value = false
}

// 处理退出登录
const handleLogout = () => {
  userDropdownVisible.value = false
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/')
  }).catch(() => {})
}

// 获取底部信息
const fetchFooterItems = async () => {
  footerLoading.value = true
  try {
    const res = await getFooterItems()
    footerItems.value = res.items || []
  } catch (error) {
    console.error('获取底部信息失败:', error)
  } finally {
    footerLoading.value = false
  }
}

// 按行数ID分组的底部信息
const groupedFooterItems = computed(() => {
  const groups = {}
  footerItems.value.forEach(item => {
    // 根据当前设备类型过滤显示项
    const shouldShow = isMobile.value ? item.showOnMobile : item.showOnPc
    if (shouldShow) {
      // 根据当前设备类型选择对应的行数ID
      const rowId = isMobile.value ? item.mobileRowId : item.pcRowId
      if (!groups[rowId]) {
        groups[rowId] = []
      }
      groups[rowId].push(item)
    }
  })
  // 按行数ID排序
  return Object.entries(groups).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
})
</script>

<template>
  <div class="client-layout">
    <!-- 顶部导航栏 -->
    <header class="client-header" :class="{ 'transparent-header': shouldApplyTransparent, 'header-hidden': !isHeaderVisible, 'article-center-header': route.path === '/articles' || route.path === '/about' }">
      <div class="header-container">
        <!-- Logo -->
        <div class="header-logo" @click="handleNavClick('/')">
          <span class="logo-text">PTStack</span>
        </div>

        <!-- 导航菜单 -->
        <nav class="header-nav">
          <div
            v-for="item in navList"
            :key="item.id"
            class="nav-item"
            :class="{ active: activeNav === item.id }"
            @click="handleNavClick(item.path)"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.name }}</span>
          </div>
        </nav>

        <!-- 用户信息区域 -->
        <div class="header-user">
          <template v-if="isLoggedIn">
            <el-dropdown
              v-model:visible="userDropdownVisible"
              trigger="hover"
              placement="bottom-end"
            >
              <div class="user-info">
                <UserAvatar :user="{
                  id: userStore.userInfo?.id,
                  nickname: userStore.userInfo?.nickname,
                  username: userStore.userInfo?.username,
                  avatar: userStore.userInfo?.avatar,
                  showAvatarBadge: userStore.userInfo?.showAvatarBadge && userStore.userInfo?.avatarBadge && userStore.userInfo?.avatarBadgeBgColor && userStore.userInfo?.avatarBadgeTextColor,
                  avatarBadge: userStore.userInfo?.avatarBadge,
                  avatarBadgeBgColor: userStore.userInfo?.avatarBadgeBgColor,
                  avatarBadgeTextColor: userStore.userInfo?.avatarBadgeTextColor
                }" size="small" />
                <span class="user-name" v-if="!isMobile">
                  {{ userStore.userInfo?.nickname || userStore.userInfo?.username || '用户' }}
                </span>
                <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToProfile">
                    <el-icon><User /></el-icon>
                    个人信息
                  </el-dropdown-item>
                  <el-dropdown-item v-if="canAccessAdmin" @click="goToAdmin">
                    <el-icon><Setting /></el-icon>
                    管理后台
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><Switch /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <div class="auth-buttons">
              <el-button type="primary" size="small" @click="goToLogin">登录</el-button>
              <el-button size="small" @click="goToRegister">注册</el-button>
            </div>
          </template>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="client-main" :class="{ 'home-page': route.path === '/' }">
      <router-view />
    </main>

    <!-- 回到顶部按钮 -->
    <div class="back-to-top" :class="{ 'show': scrollTop > 300 }" @click="scrollToTop">
      <el-icon><ArrowUp /></el-icon>
    </div>

    <!-- 底部版权 -->
    <footer class="client-footer">
      <div class="footer-container">
        <!-- 动态底部信息 -->
        <div v-if="groupedFooterItems.length > 0" class="footer-content">
          <div v-for="[rowId, items] in groupedFooterItems" :key="rowId" class="footer-row">
            <template v-for="(item, index) in items" :key="item.id">
              <span v-if="index > 0" class="footer-separator">|</span>
              <a v-if="item.link" :href="item.link" target="_blank" rel="noopener noreferrer" class="footer-link">
                {{ item.display }}
              </a>
              <span v-else class="footer-text">{{ item.display }}</span>
            </template>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.client-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 顶部导航栏 */
.client-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* 隐藏导航栏 - 优先级最高 */
  &.header-hidden {
    transform: translateY(-100%) !important;
  }

  /* 首页透明头部 */
  &.transparent-header {
    background: transparent;
    box-shadow: none;

    .logo-text,
    .nav-item,
    .user-name,
    .dropdown-arrow {
      color: #fff;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .user-info:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    :deep(.auth-buttons .el-button) {
      color: #fff;
      border-color: #fff;
      background: transparent;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border-color: #fff;
      }
    }

    :deep(.auth-buttons .el-button--primary) {
      background: #fff;
      color: #1d2129;
      border-color: #fff;

      &:hover {
        background: #f2f3f5;
        color: #1d2129;
        border-color: #fff;
      }
    }
  }

  /* 文章中心页面的登录按钮样式 */
  &.article-center-header {
    :deep(.auth-buttons .el-button--primary) {
      background: #165dff;
      color: #fff;
      border-color: #165dff;

      &:hover {
        background: #4080ff;
        border-color: #4080ff;
      }
    }
  }
}

.header-container {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.header-logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #1d2129;
  letter-spacing: -0.5px;
}

/* 导航菜单 */
.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #4e5969;
  font-size: 15px;
  font-weight: 500;

  &:hover {
    background: #f2f3f5;
    color: #165dff;
  }

  &.active {
    background: #e8f0ff;
    color: #165dff;
  }
}

/* 用户信息区域 */
.header-user {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f2f3f5;
  }
}

.user-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: visible;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-text {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.avatar-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #ff7d00;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  color: #86909c;
  font-size: 12px;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 主内容区域 */
.client-main {
  flex: 1;
  margin-top: 64px;
  min-height: calc(100vh - 64px - 60px);

  /* 首页内容区域 - 始终无上边距，因为导航栏是透明的 */
  &.home-page {
    margin-top: 0;
  }
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 44px;
  height: 44px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;
  z-index: 999;

  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  &:hover {
    background: #165dff;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.3);
  }

  .el-icon {
    font-size: 20px;
  }
}

/* 底部版权 */
.client-footer {
  background: #fff;
  border-top: 1px solid #e5e6eb;
  padding: 20px 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
}

.footer-content {
  margin-bottom: 16px;
}

.footer-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.footer-item {
  font-size: 13px;
}

.footer-link {
  color: #86909c;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #165dff;
    text-decoration: underline;
  }
}

.footer-text {
  color: #86909c;
}

.footer-separator {
  color: #86909c;
}

.copyright {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

.beian-link {
  color: #86909c;
  text-decoration: none;
  transition: color 0.2s;
  margin-left: 4px;

  &:hover {
    color: #165dff;
    text-decoration: underline;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }

  .logo-text {
    font-size: 18px;
  }

  .header-nav {
    gap: 4px;
  }

  .nav-item {
    padding: 8px 12px;
    font-size: 13px;

    span {
      display: none;
    }
  }

  .user-info {
    padding: 4px;
  }
}
</style>
