<script setup>
import { useUserStore } from '@/stores/user'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  User,
  Calendar,
  Plus,
  ArrowRight,
  Clock,
  Star,
  ChatDotRound,
  View,
  UserFilled,
  Bell,
  Trophy
} from '@element-plus/icons-vue'
import { getArticles } from '@/api/articles'
import { getFullUrl } from '@/utils/url'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const recentArticles = ref([])
const hotArticles = ref([])
const currentTime = ref(new Date())

const stats = ref({
  articles: 0,
  followers: 0,
  following: 0,
  views: 0
})

const announcement = ref({
  show: true,
  title: '系统公告',
  content: '欢迎来到PTStack！这是一个分享技术文章的平台，欢迎大家发布优质内容！'
})

onMounted(() => {
  const timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
  fetchRecentArticles()
  fetchHotArticles()
  fetchUserStats()
  return () => clearInterval(timer)
})

const fetchRecentArticles = async () => {
  try {
    const res = await getArticles({ page: 1, pageSize: 6, sortBy: 'created_at', order: 'desc' })
    recentArticles.value = res.articles || []
  } catch (error) {
    console.error('获取文章失败:', error)
  }
}

const fetchHotArticles = async () => {
  try {
    const res = await getArticles({ page: 1, pageSize: 5, sortBy: 'view_count', order: 'desc' })
    hotArticles.value = res.articles || []
  } catch (error) {
    console.error('获取热门文章失败:', error)
  }
}

const fetchUserStats = async () => {
  try {
    const userInfo = userStore.userInfo || {}
    stats.value = {
      articles: userInfo.article_count || 0,
      followers: userInfo.follower_count || 0,
      following: userInfo.following_count || 0,
      views: userInfo.total_views || 0
    }
  } catch (error) {
    console.error('获取统计失败:', error)
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

const goToCreate = () => {
  router.push('/article/create')
}

const goToArticles = () => {
  router.push('/articles')
}

const goToArticleDetail = (id) => {
  router.push(`/article/${id}`)
}

const goToProfile = () => {
  router.push(`/profile/${userStore.userInfo?.id}`)
}

const closeAnnouncement = () => {
  announcement.value.show = false
}
</script>

<template>
  <div class="home-page">
    <div v-if="announcement.show" class="announcement-card">
      <div class="announcement-icon">
        <el-icon><Bell /></el-icon>
      </div>
      <div class="announcement-content">
        <div class="announcement-title">{{ announcement.title }}</div>
        <div class="announcement-text">{{ announcement.content }}</div>
      </div>
      <el-button text class="close-btn" @click="closeAnnouncement">
        <el-icon><ArrowRight style="transform: rotate(45deg)" /></el-icon>
      </el-button>
    </div>

    <div class="header-section">
      <div class="header-left">
        <div class="user-greeting">
          <div class="user-avatar" @click="goToProfile">
            <img v-if="userStore.userInfo?.avatar" :src="getFullUrl(userStore.userInfo.avatar)" alt="avatar" class="user-avatar-img">
            <span v-else>{{ (userStore.userInfo?.nickname || userStore.userInfo?.username)?.charAt(0).toUpperCase() || 'U' }}</span>
          </div>
          <div class="greeting-content">
            <div class="greeting-badge">
              <el-icon><Clock /></el-icon>
              <span>{{ formatDate() }}</span>
            </div>
            <h1 class="page-title">
              {{ getGreeting() }}，
              <span class="highlight">{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '开发者' }}</span>
              👋
            </h1>
            <p class="page-subtitle">欢迎回来，继续探索和创作</p>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" size="large" @click="goToCreate" class="create-btn">
          <el-icon><Plus /></el-icon>
          写文章
        </el-button>
      </div>
    </div>

    <div class="stats-section">
      <div class="stat-card" @click="goToProfile">
        <div class="stat-icon" style="background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.articles }}</div>
          <div class="stat-label">发布文章</div>
        </div>
      </div>

      <div class="stat-card" @click="goToProfile">
        <div class="stat-icon" style="background: linear-gradient(135deg, #00b42a 0%, #23c343 100%);">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.followers }}</div>
          <div class="stat-label">订阅者</div>
        </div>
      </div>

      <div class="stat-card" @click="goToProfile">
        <div class="stat-icon" style="background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.following }}</div>
          <div class="stat-label">订阅</div>
        </div>
      </div>

      <div class="stat-card" @click="goToProfile">
        <div class="stat-icon" style="background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);">
          <el-icon><View /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.views }}</div>
          <div class="stat-label">总阅读</div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="content-left">
        <div class="content-card">
          <div class="card-header">
            <div class="card-title">
              <div class="title-icon" style="background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);">
                <el-icon><Document /></el-icon>
              </div>
              <div class="title-text">
                <div class="title-main">最新文章</div>
                <div class="title-sub">探索社区最新发布的内容</div>
              </div>
            </div>
            <el-button text @click="goToArticles" class="view-all-btn">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>

          <div class="articles-list" v-loading="loading">
            <div v-if="recentArticles.length === 0" class="empty-state">
              <div class="empty-icon">
                <el-icon :size="48"><Document /></el-icon>
              </div>
              <div class="empty-text">暂无文章</div>
              <div class="empty-desc">快来发布你的第一篇文章吧</div>
            </div>
            <div v-else>
              <div
                v-for="article in recentArticles"
                :key="article.id"
                class="article-item"
                @click="goToArticleDetail(article.id)"
              >
                <div class="article-content">
                  <div class="article-title">{{ article.title }}</div>
                  <div v-if="article.summary" class="article-summary">{{ article.summary }}</div>
                  <div class="article-meta">
                    <span class="meta-item">
                      <el-icon><Calendar /></el-icon>
                      {{ new Date(article.created_at).toLocaleDateString('zh-CN') }}
                    </span>
                    <span class="meta-item" v-if="article.view_count !== undefined">
                      <el-icon><View /></el-icon>
                      {{ article.view_count || 0 }}
                    </span>
                    <span class="meta-item" v-if="article.like_count !== undefined">
                      <el-icon><Star /></el-icon>
                      {{ article.like_count || 0 }}
                    </span>
                    <span class="meta-item" v-if="article.comment_count !== undefined">
                      <el-icon><ChatDotRound /></el-icon>
                      {{ article.comment_count || 0 }}
                    </span>
                  </div>
                </div>
                <el-icon class="article-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-right">
        <div class="content-card">
          <div class="card-header">
            <div class="card-title">
              <div class="title-icon" style="background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);">
                <el-icon><Trophy /></el-icon>
              </div>
              <div class="title-text">
                <div class="title-main">热门文章</div>
                <div class="title-sub">阅读量最高的文章</div>
              </div>
            </div>
          </div>

          <div class="hot-articles-list">
            <div v-if="hotArticles.length === 0" class="empty-state-small">
              <div class="empty-text-small">暂无热门文章</div>
            </div>
            <div v-else>
              <div
                v-for="(article, index) in hotArticles"
                :key="article.id"
                class="hot-article-item"
                @click="goToArticleDetail(article.id)"
              >
                <div class="hot-rank" :class="'rank-' + (index + 1)">
                  {{ index + 1 }}
                </div>
                <div class="hot-article-content">
                  <div class="hot-article-title">{{ article.title }}</div>
                  <div class="hot-article-meta">
                    <span class="meta-item">
                      <el-icon><View /></el-icon>
                      {{ article.view_count || 0 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="content-card">
          <div class="card-header">
            <div class="card-title">
              <div class="title-icon" style="background: linear-gradient(135deg, #00b42a 0%, #23c343 100%);">
                <el-icon><Plus /></el-icon>
              </div>
              <div class="title-text">
                <div class="title-main">快捷操作</div>
                <div class="title-sub">快速访问常用功能</div>
              </div>
            </div>
          </div>

          <div class="quick-actions">
            <div class="action-item" @click="goToCreate">
              <div class="action-icon" style="background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);">
                <el-icon><Plus /></el-icon>
              </div>
              <div class="action-title">写文章</div>
            </div>

            <div class="action-item" @click="goToArticles">
              <div class="action-icon" style="background: linear-gradient(135deg, #00b42a 0%, #23c343 100%);">
                <el-icon><Document /></el-icon>
              </div>
              <div class="action-title">浏览文章</div>
            </div>

            <div class="action-item" @click="goToProfile">
              <div class="action-icon" style="background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);">
                <el-icon><User /></el-icon>
              </div>
              <div class="action-title">我的主页</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.announcement-card {
  background: linear-gradient(135deg, #fff7e6 0%, #fff1db 100%);
  border: 1px solid #ffd591;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.announcement-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  .el-icon {
    font-size: 20px;
  }
}

.announcement-content {
  flex: 1;
  min-width: 0;
}

.announcement-title {
  font-size: 14px;
  font-weight: 600;
  color: #ff7d00;
  margin-bottom: 2px;
}

.announcement-text {
  font-size: 13px;
  color: #86909c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  padding: 4px;
  color: #c9cdd4;

  &:hover {
    color: #86909c;
  }
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left {
  flex: 1;
}

.user-greeting {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
  }
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.greeting-content {
  flex: 1;
}

.greeting-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f7f8fa;
  border-radius: 100px;
  font-size: 14px;
  color: #4e5969;
  margin-bottom: 16px;

  .el-icon {
    color: #165dff;
  }
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.2;
  margin: 0 0 8px 0;

  .highlight {
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.page-subtitle {
  font-size: 15px;
  color: #86909c;
  margin: 0;
}

.create-btn {
  border-radius: 12px;
  height: 48px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

  &:hover {
    background: linear-gradient(135deg, #4080ff 0%, #165dff 100%);
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  .el-icon {
    font-size: 24px;
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #86909c;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  .el-icon {
    font-size: 18px;
  }
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-main {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.title-sub {
  font-size: 12px;
  color: #86909c;
}

.view-all-btn {
  color: #4e5969;
  font-size: 14px;
  padding: 0;
  height: auto;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: #165dff;
  }
}

.articles-list {
  padding: 16px 24px 24px;
}

.article-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f7f8fa;

    .article-arrow {
      color: #165dff;
      transform: translateX(4px);
    }
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f7f8fa;
  }
}

.article-content {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-summary {
  font-size: 13px;
  color: #86909c;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #86909c;

  .el-icon {
    font-size: 14px;
  }
}

.article-arrow {
  color: #c9cdd4;
  font-size: 18px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
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

.hot-articles-list {
  padding: 16px 24px 24px;
}

.hot-article-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    .hot-article-title {
      color: #165dff;
    }
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f7f8fa;
  }
}

.hot-rank {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #86909c;
  flex-shrink: 0;

  &.rank-1 {
    background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
    color: white;
  }

  &.rank-2 {
    background: linear-gradient(135deg, #ff9a2e 0%, #ffb84d 100%);
    color: white;
  }

  &.rank-3 {
    background: linear-gradient(135deg, #ffb84d 0%, #ffd591 100%);
    color: white;
  }
}

.hot-article-content {
  flex: 1;
  min-width: 0;
}

.hot-article-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.hot-article-meta {
  display: flex;
  align-items: center;
}

.empty-state-small {
  padding: 32px 20px;
  text-align: center;
}

.empty-text-small {
  font-size: 14px;
  color: #86909c;
}

.quick-actions {
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: #f7f8fa;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e8f3ff;
    transform: translateX(4px);
  }
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  .el-icon {
    font-size: 20px;
  }
}

.action-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .content-right {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-right {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .home-page {
    gap: 16px;
  }

  .header-section {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }

  .user-greeting {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-avatar {
    width: 56px;
    height: 56px;
    font-size: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 22px;
  }

  .main-content {
    gap: 16px;
  }

  .card-header {
    padding: 16px 20px 0;
  }

  .articles-list {
    padding: 12px 20px 20px;
  }

  .article-summary {
    display: none;
  }

  .hot-articles-list {
    padding: 12px 20px 20px;
  }

  .quick-actions {
    padding: 12px 20px 20px;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>
