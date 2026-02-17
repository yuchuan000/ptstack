<script setup>
import { useUserStore } from '@/stores/user'
import { getProfile } from '@/api/auth'
import { ref, onMounted } from 'vue'
import { 
  Trophy, 
  Document, 
  User, 
  Calendar,
  Plus,
  ArrowRight,
  Clock,
  Star,
  Setting
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const loading = ref(false)
const profileData = ref(null)
const currentTime = ref(new Date())

onMounted(() => {
  const timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
  return () => clearInterval(timer)
})

const handleGetProfile = async () => {
  if (!userStore.accessToken) {
    ElMessage.warning('请先登录')
    return
  }

  loading.value = true
  try {
    const data = await getProfile()
    profileData.value = data
    ElMessage.success('获取用户信息成功')
  } catch {
    profileData.value = null
  } finally {
    loading.value = false
  }
}

const getGreeting = () => {
  const hour = currentTime.value.getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

const formatDate = () => {
  return currentTime.value.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}
</script>

<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-left">
          <div class="greeting-badge">
            <el-icon><Clock /></el-icon>
            <span>{{ formatDate() }}</span>
          </div>
          <h1 class="hero-title">
            {{ getGreeting() }}，
            <span class="highlight">{{ userStore.userInfo?.username || '开发者' }}</span>
            👋
          </h1>
          <p class="hero-subtitle">开始您的高效开发之旅，探索无限可能</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" class="action-btn primary">
              <el-icon><Plus /></el-icon>
              快速开始
            </el-button>
            <el-button size="large" class="action-btn secondary">
              了解更多
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-illustration">
            <div class="floating-card card-1">
              <el-icon :size="28"><Document /></el-icon>
              <span>项目管理</span>
            </div>
            <div class="floating-card card-2">
              <el-icon :size="28"><Calendar /></el-icon>
              <span>日程安排</span>
            </div>
            <div class="floating-card card-3">
              <el-icon :size="28"><Trophy /></el-icon>
              <span>成就达成</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-header">
        <h2 class="section-title">数据概览</h2>
        <el-button text class="view-all-btn">
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon" style="background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);">
              <el-icon :size="28"><Document /></el-icon>
            </div>
          </div>
          <div class="stat-info">
            <div class="stat-value">0</div>
            <div class="stat-label">项目数量</div>
            <div class="stat-trend up">
              <el-icon><ArrowRight /></el-icon>
              <span>今日 +0</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon" style="background: linear-gradient(135deg, #00b42a 0%, #23c343 100%);">
              <el-icon :size="28"><User /></el-icon>
            </div>
          </div>
          <div class="stat-info">
            <div class="stat-value">1</div>
            <div class="stat-label">活跃用户</div>
            <div class="stat-trend up">
              <el-icon><ArrowRight /></el-icon>
              <span>在线</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon" style="background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);">
              <el-icon :size="28"><Calendar /></el-icon>
            </div>
          </div>
          <div class="stat-info">
            <div class="stat-value">0</div>
            <div class="stat-label">今日任务</div>
            <div class="stat-trend">
              <span>暂无安排</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f53f3f 0%, #f76560 100%);">
              <el-icon :size="28"><Star /></el-icon>
            </div>
          </div>
          <div class="stat-info">
            <div class="stat-value">0</div>
            <div class="stat-label">收藏项目</div>
            <div class="stat-trend">
              <span>等待收藏</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="panel quick-start-panel">
        <div class="panel-header">
          <h3 class="panel-title">快速开始</h3>
        </div>
        <div class="quick-actions">
          <div class="quick-action-item">
            <div class="action-icon" style="background: #f2f3f5; color: #165dff;">
              <el-icon :size="24"><Plus /></el-icon>
            </div>
            <div class="action-info">
              <div class="action-name">创建项目</div>
              <div class="action-desc">开始一个新项目</div>
            </div>
            <el-icon class="action-arrow"><ArrowRight /></el-icon>
          </div>
          <div class="quick-action-item">
            <div class="action-icon" style="background: #f2f3f5; color: #00b42a;">
              <el-icon :size="24"><Setting /></el-icon>
            </div>
            <div class="action-info">
              <div class="action-name">系统设置</div>
              <div class="action-desc">配置您的偏好</div>
            </div>
            <el-icon class="action-arrow"><ArrowRight /></el-icon>
          </div>
          <div class="quick-action-item" @click="handleGetProfile">
            <div class="action-icon" style="background: #f2f3f5; color: #ff7d00;">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="action-info">
              <div class="action-name">用户信息</div>
              <div class="action-desc">查看您的资料</div>
            </div>
            <el-icon class="action-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <div class="panel activity-panel">
        <div class="panel-header">
          <h3 class="panel-title">最近活动</h3>
          <el-button text class="view-all-btn">
            全部
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="activity-list">
          <div class="empty-state">
            <div class="empty-icon">
              <el-icon :size="48"><Document /></el-icon>
            </div>
            <div class="empty-text">暂无活动记录</div>
            <div class="empty-desc">开始使用 PTStack，记录您的每一步</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="profileData" class="profile-modal">
      <div class="profile-content">
        <div class="profile-header">
          <h3>用户信息</h3>
          <el-button text @click="profileData = null" class="close-btn">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <pre>{{ JSON.stringify(profileData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 8px 0 40px 0;
}

.hero-section {
  background: linear-gradient(135deg, #f7f8fa 0%, #ffffff 100%);
  border-radius: 20px;
  padding: 48px 64px;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(22, 93, 255, 0.08) 0%, transparent 70%);
    border-radius: 50%;
  }
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 60px;
  position: relative;
  z-index: 1;
}

.hero-left {
  flex: 1;
  max-width: 600px;
}

.greeting-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-radius: 100px;
  font-size: 14px;
  color: #4e5969;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;

  .el-icon {
    color: #165dff;
  }
}

.hero-title {
  font-size: 44px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.2;
  margin-bottom: 16px;

  .highlight {
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.hero-subtitle {
  font-size: 18px;
  color: #86909c;
  line-height: 1.6;
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &.primary {
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(22, 93, 255, 0.4);
    }
  }

  &.secondary {
    border-color: #e5e6eb;
    color: #1d2129;

    &:hover {
      border-color: #165dff;
      color: #165dff;
    }
  }
}

.hero-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-illustration {
  position: relative;
  width: 360px;
  height: 300px;
}

.floating-card {
  position: absolute;
  background: white;
  padding: 20px 24px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #1d2129;
  border: 1px solid #f2f3f5;
  animation: float 3s ease-in-out infinite;

  .el-icon {
    color: #165dff;
  }

  &.card-1 {
    top: 20px;
    left: 0;
    animation-delay: 0s;
  }

  &.card-2 {
    top: 120px;
    right: 0;
    animation-delay: 0.5s;
  }

  &.card-3 {
    bottom: 20px;
    left: 40px;
    animation-delay: 1s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

.stats-section {
  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.view-all-btn {
  color: #86909c;
  font-size: 14px;
  padding: 0;
  height: auto;

  &:hover {
    color: #165dff;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #f2f3f5;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #165dff;
    box-shadow: 0 8px 24px rgba(22, 93, 255, 0.08);
    transform: translateY(-4px);
  }
}

.stat-icon-wrapper {
  flex-shrink: 0;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #86909c;
}

.stat-trend {
  font-size: 13px;
  color: #86909c;
  display: flex;
  align-items: center;
  gap: 4px;

  &.up {
    color: #00b42a;
  }

  .el-icon {
    font-size: 12px;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 28px;
  border: 1px solid #f2f3f5;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #f7f8fa;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f2f3f5;
    transform: translateX(4px);
  }
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-info {
  flex: 1;
}

.action-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  color: #86909c;
}

.action-arrow {
  color: #c9cdd4;
  font-size: 16px;
  transition: transform 0.2s ease;

  .quick-action-item:hover & {
    transform: translateX(4px);
    color: #165dff;
  }
}

.activity-list {
  min-height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  color: #c9cdd4;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #86909c;
}

.profile-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.profile-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1d2129;
  }

  .close-btn {
    padding: 8px;
    color: #86909c;

    &:hover {
      color: #1d2129;
    }
  }
}

pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 12px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .hero-section {
    padding: 32px;
  }

  .hero-content {
    flex-direction: column;
  }

  .hero-illustration {
    display: none;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
