<script setup>
import { useUserStore } from '@/stores/user'
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Document,
  User,
  Calendar,
  ArrowRight,
  Clock,
  Star,
  ChatDotRound,
  View,
  UserFilled,
  Bell,
  Trophy,
  Connection,
  TrendCharts,
  BellFilled
} from '@element-plus/icons-vue'
import { getArticles } from '@/api/articles'
import { getProfile } from '@/api/auth'
import { getFullUrl } from '@/utils/url'
import { getRecommendedUsers, getFeed } from '@/api/users'
import { getUnreadCount } from '@/api/notifications'
import { toggleSubscription } from '@/api/subscriptions'
import { getMarqueeAnnouncements, getAnnouncements } from '@/api/announcements'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const recentArticles = ref([])
const hotArticles = ref([])
const recommendedUsers = ref([])
const feedArticles = ref([])
const unreadCount = ref({ total: 0 })
const announcements = ref([])
const currentTime = ref(new Date())

const stats = ref({
  articles: 0,
  followers: 0,
  following: 0,
  views: 0,
  comments: 0
})

const marqueeAnnouncements = ref([])
const currentMarqueeIndex = ref(0)
const marqueeTimer = ref(null)

const fetchMarqueeAnnouncements = async () => {
  try {
    const res = await getMarqueeAnnouncements()
    marqueeAnnouncements.value = res.announcements || []
  } catch (error) {
    console.error('获取跑马灯公告失败:', error)
  }
}

const startMarqueeLoop = () => {
  if (marqueeAnnouncements.value.length <= 1) return

  marqueeTimer.value = setInterval(() => {
    currentMarqueeIndex.value = (currentMarqueeIndex.value + 1) % marqueeAnnouncements.value.length
  }, 5000)
}

const fetchCurrentUserProfile = async () => {
  try {
    const res = await getProfile()
    userStore.setUserInfo(res.user)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

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

const fetchRecommendedUsers = async () => {
  try {
    const res = await getRecommendedUsers({ limit: 5 })
    const users = res.users || []
    if (userStore.userInfo) {
      users.forEach(user => {
        user.isSubscribed = false
      })
    }
    recommendedUsers.value = users
  } catch (error) {
    console.error('获取推荐用户失败:', error)
  }
}

const fetchFeed = async () => {
  try {
    const res = await getFeed({ page: 1, pageSize: 10 })
    feedArticles.value = res.articles || []
  } catch (error) {
    console.error('获取Feed失败:', error)
  }
}

const fetchAnnouncementsForUnread = async () => {
  try {
    const res = await getAnnouncements()
    announcements.value = res.announcements || []
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

const getUnreadAnnouncementCount = () => {
  return announcements.value.filter(a => !a.is_read).length
}

const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    const notificationUnread = res.count || 0
    const announcementUnread = getUnreadAnnouncementCount()
    unreadCount.value = { total: notificationUnread + announcementUnread }
  } catch (error) {
    console.error('获取未读消息失败:', error)
  }
}

const fetchUserStats = async () => {
  try {
    const userInfo = userStore.userInfo || {}
    stats.value = {
      articles: userInfo.article_count || 0,
      followers: userInfo.follower_count || 0,
      following: userInfo.following_count || 0,
      views: userInfo.total_views || 0,
      comments: userInfo.comment_count || 0
    }
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

const handleToggleSubscription = async (user) => {
  try {
    await toggleSubscription(user.id)
    user.isSubscribed = !user.isSubscribed
    if (user.isSubscribed) {
      user.follower_count = (user.follower_count || 0) + 1
    } else {
      user.follower_count = Math.max(0, (user.follower_count || 0) - 1)
    }
  } catch (error) {
    console.error('订阅失败:', error)
  }
}

const goToNotifications = () => {
  router.push('/notifications')
}

watch(() => userStore.userInfo, () => {
  fetchUserStats()
}, { deep: true, immediate: true })

onMounted(async () => {
  const timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
  await fetchMarqueeAnnouncements()
  startMarqueeLoop()
  fetchCurrentUserProfile()
  fetchRecentArticles()
  fetchHotArticles()
  fetchRecommendedUsers()
  fetchFeed()
  await fetchAnnouncementsForUnread()
  fetchUnreadCount()
  fetchUserStats()
  return () => {
    clearInterval(timer)
    if (marqueeTimer.value) {
      clearInterval(marqueeTimer.value)
    }
  }
})

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (oldPath?.includes('/notifications') || newPath === '/') {
      fetchAnnouncementsForUnread().then(() => {
        fetchUnreadCount()
      })
    }
  }
)

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

const goToArticles = () => {
  router.push('/articles')
}

const goToArticleDetail = (id) => {
  router.push(`/article/${id}`)
}

const goToProfile = (tab = 'articles') => {
  router.push({
    path: `/profile/${userStore.userInfo?.id}`,
    query: { tab }
  })
}
</script>

<template>
  <div class="home-page">
    <div v-if="marqueeAnnouncements.length > 0" class="announcement-card">
      <div class="announcement-icon">
        <el-icon><Bell /></el-icon>
      </div>
      <div class="marquee-wrapper">
        <div class="marquee-text" :key="currentMarqueeIndex">
          {{ marqueeAnnouncements[currentMarqueeIndex]?.content }}
        </div>
      </div>
      <div class="marquee-dots" v-if="marqueeAnnouncements.length > 1">
        <span
          v-for="(announcement, index) in marqueeAnnouncements"
          :key="index"
          class="marquee-dot"
          :class="{ active: index === currentMarqueeIndex }"
          @click="currentMarqueeIndex = index"
        ></span>
      </div>
    </div>

    <div class="header-section">
      <div class="header-left">
        <div class="user-greeting">
            <div class="user-avatar" @click="goToProfile">
              <img v-if="userStore.userInfo?.avatar" :src="getFullUrl(userStore.userInfo.avatar)" alt="avatar" class="user-avatar-img">
              <span v-else>{{ (userStore.userInfo?.nickname || userStore.userInfo?.username)?.charAt(0).toUpperCase() || 'U' }}</span>
              <span v-if="userStore.userInfo?.isAdmin" class="avatar-admin-badge">管</span>
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
            <div class="total-views" v-if="userStore.userInfo">
              <el-icon><View /></el-icon>
              <span>总阅读 {{ stats.views }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-button
          circle
          @click="goToNotifications"
          class="notification-btn"
          :class="{ 'has-unread': unreadCount.total > 0 }"
        >
          <el-badge :value="unreadCount.total" :hidden="unreadCount.total === 0" class="notification-badge">
            <el-icon><BellFilled /></el-icon>
          </el-badge>
        </el-button>
      </div>
    </div>

    <div class="stats-section">
      <div class="stat-card" @click="goToProfile('articles')">
        <div class="stat-icon" style="background: #e3f2fd; color: #165dff;">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value" style="color: #1d2129;">{{ stats.articles }}</div>
          <div class="stat-label">发布文章</div>
        </div>
      </div>

      <div class="stat-card" @click="goToProfile('comments')">
        <div class="stat-icon" style="background: #e8f5e9; color: #00b42a;">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value" style="color: #1d2129;">{{ stats.comments }}</div>
          <div class="stat-label">评论</div>
        </div>
      </div>

      <div class="stat-card" @click="goToProfile('followers')">
        <div class="stat-icon" style="background: #fff3e0; color: #ff7d00;">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value" style="color: #1d2129;">{{ stats.followers }}</div>
          <div class="stat-label">订阅者</div>
        </div>
      </div>

      <div class="stat-card" @click="goToProfile('following')">
        <div class="stat-icon" style="background: #f3e5f5; color: #722ed1;">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value" style="color: #1d2129;">{{ stats.following }}</div>
          <div class="stat-label">订阅</div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="content-left">
        <div class="content-card">
          <div class="card-header">
            <div class="card-title">
              <div class="title-icon" style="background: #e3f2fd; color: #165dff;">
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

        <div class="content-card">
          <div class="card-header">
            <div class="card-title">
              <div class="title-icon" style="background: #e3f2fd; color: #165dff;">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="title-text">
                <div class="title-main">关注动态</div>
                <div class="title-sub">关注用户的最新文章</div>
              </div>
            </div>
          </div>

          <div class="articles-list" v-loading="loading">
            <div v-if="feedArticles.length === 0" class="empty-state">
              <div class="empty-icon">
                <el-icon :size="48"><TrendCharts /></el-icon>
              </div>
              <div class="empty-text">暂无动态</div>
              <div class="empty-desc">关注更多用户来获取动态</div>
            </div>
            <div v-else>
              <div
                v-for="article in feedArticles"
                :key="article.id"
                class="article-item"
                @click="goToArticleDetail(article.id)"
              >
                <div class="article-content">
                  <div class="article-user-info">
                    <div class="article-user-avatar-wrapper">
                      <img v-if="article.avatar" :src="getFullUrl(article.avatar)" class="article-user-avatar">
                      <div v-else class="article-user-avatar">{{ (article.nickname || article.username)?.charAt(0).toUpperCase() }}</div>
                      <span v-if="article.is_admin === 1" class="avatar-admin-badge">管</span>
                    </div>
                    <span class="article-user-name">{{ article.nickname || article.username }}</span>
                  </div>
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
              <div class="title-icon" style="background: #fff3e0; color: #ff7d00;">
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
              <div class="title-icon" style="background: #e8f5e9; color: #00b42a;">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="title-text">
                <div class="title-main">推荐关注</div>
                <div class="title-sub">发现有趣的用户</div>
              </div>
            </div>
          </div>

          <div class="recommended-users-list">
            <div v-if="recommendedUsers.length === 0" class="empty-state-small">
              <div class="empty-text-small">暂无推荐用户</div>
            </div>
            <div v-else>
              <div
                v-for="user in recommendedUsers"
                :key="user.id"
                class="recommended-user-item"
              >
                <div class="user-info" @click="router.push(`/profile/${user.id}`)">
                  <div class="user-avatar-small-wrapper">
                    <img v-if="user.avatar" :src="getFullUrl(user.avatar)" class="user-avatar-small">
                    <div v-else class="user-avatar-small">{{ (user.nickname || user.username)?.charAt(0).toUpperCase() }}</div>
                    <span v-if="user.is_admin === 1" class="avatar-admin-badge">管</span>
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.nickname || user.username }}</div>
                    <div class="user-stats">{{ user.follower_count }} 订阅者</div>
                  </div>
                </div>
                <el-button
                  :type="user.isSubscribed ? 'info' : 'primary'"
                  size="small"
                  @click.stop="handleToggleSubscription(user)"
                >
                  {{ user.isSubscribed ? '已订阅' : '订阅' }}
                </el-button>
              </div>
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
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.announcement-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  .el-icon {
    font-size: 16px;
  }
}

.marquee-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.marquee-text {
  white-space: nowrap;
  font-size: 14px;
  color: #86909c;
  display: inline-block;
  transition: opacity 0.3s ease;
}

.marquee-dots {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.marquee-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffd591;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    width: 20px;
    border-radius: 3px;
    background: #ff7d00;
  }

  &:hover {
    transform: scale(1.2);
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
  overflow: visible;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);
  position: relative;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
  }

  .avatar-admin-badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    z-index: 1;
  }
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
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
  margin: 0 0 12px 0;
}

.total-views {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f0f3ff 0%, #e6ebff 100%);
  border-radius: 100px;
  font-size: 14px;
  color: #165dff;
  font-weight: 500;

  .el-icon {
    font-size: 16px;
  }
}

.notification-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f7f8fa;
  border: none;
  color: #4e5969;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f3ff;
    color: #165dff;
  }

  &.has-unread {
    background: linear-gradient(135deg, #fff1f0 0%, #fff5f5 100%);
    color: #f53f3f;

    &:hover {
      background: linear-gradient(135deg, #fff5f5 0%, #fff1f0 100%);
    }
  }

  .el-icon {
    font-size: 22px;
  }
}

.notification-badge {
  :deep(.el-badge__content) {
    background: #f53f3f;
    border: 2px solid white;
  }
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
  display: flex;
  gap: 20px;
}

.content-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-left .content-card:last-child,
.content-right .content-card:last-child {
  flex: 1;
}

.articles-list,
.notifications-list,
.hot-articles-list,
.recommended-users-list {
  flex: 1;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
}

.card-arrow {
  color: #c9cdd4;
  font-size: 18px;
  flex-shrink: 0;
}

.todo-card {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);

    .card-arrow {
      color: #165dff;
      transform: translateX(4px);
    }
  }
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

.article-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.article-user-avatar-wrapper {
  position: relative;
  display: inline-flex;

  .article-user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
    object-fit: cover;
  }

  .avatar-admin-badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    font-weight: 700;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    z-index: 1;
  }
}

.article-user-name {
  font-size: 13px;
  color: #4e5969;
  font-weight: 500;
}

.notifications-list {
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff1f0 0%, #fff5f5 100%);
}

.notification-summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f53f3f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 22px;
  }
}

.notification-summary-text {
  font-size: 15px;
  color: #1d2129;
  font-weight: 500;
}

.unread-number {
  font-size: 20px;
  font-weight: 700;
  color: #f53f3f;
  margin: 0 4px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #f7f8fa;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e8f3ff;
  }
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 18px;
  }
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 2px;
}

.notification-desc {
  font-size: 12px;
  color: #86909c;
}

.recommended-users-list {
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommended-user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: #f7f8fa;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.user-avatar-small-wrapper {
  position: relative;
  display: inline-flex;

  .user-avatar-small {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    font-weight: 600;
    flex-shrink: 0;
    object-fit: cover;
  }

  .avatar-admin-badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    z-index: 1;
  }
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-stats {
  font-size: 12px;
  color: #86909c;
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

  .notifications-list,
  .recommended-users-list {
    padding: 12px 20px 20px;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>
