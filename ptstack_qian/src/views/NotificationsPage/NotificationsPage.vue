<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  BellFilled,
  ChatDotRound,
  Star,
  UserFilled,
  Delete,
  Clock,
  ArrowLeft,
  ChatLineRound,
  Document,
  Trophy,
  HomeFilled
} from '@element-plus/icons-vue'
import { getNotifications, markAsRead, deleteNotification } from '@/api/notifications'
import { getAnnouncements, markAnnouncementRead } from '@/api/announcements'

const router = useRouter()
const loading = ref(false)
const notifications = ref([])
const announcements = ref([])
const unreadCount = ref(0)
const typeUnreadCounts = ref({})
const currentType = ref('all')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const hasMore = ref(true)

const tabs = [
  { key: 'all', label: '全部', icon: BellFilled },
  { key: 'announcement', label: '公告', icon: Document },
  { key: 'mention', label: '@我', icon: ChatLineRound },
  { key: 'comment', label: '评论', icon: ChatDotRound },
  { key: 'like', label: '点赞', icon: Star },
  { key: 'follow', label: '关注', icon: UserFilled },
  { key: 'achievement', label: '成就', icon: Trophy }
]

const fetchNotifications = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }

    if (currentType.value !== 'all') {
      params.type = currentType.value
    }

    const response = await getNotifications(params)
    if (page.value === 1) {
      notifications.value = response.notifications
    } else {
      notifications.value = [...notifications.value, ...response.notifications]
    }
    unreadCount.value = response.unreadCount
    typeUnreadCounts.value = response.typeUnreadCounts || {}
    total.value = response.pagination.total
    hasMore.value = page.value < response.pagination.totalPages
  } catch (error) {
    console.error('获取消息失败:', error)
    ElMessage.error('获取消息失败')
  } finally {
    loading.value = false
  }
}

const fetchAnnouncements = async () => {
  try {
    const response = await getAnnouncements()
    announcements.value = response.announcements
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

const handleAnnouncementClick = async (announcement) => {
  if (!announcement.is_read) {
    try {
      await markAnnouncementRead(announcement.id)
      announcement.is_read = true
    } catch (error) {
      console.error('标记公告已读失败:', error)
    }
  }
}

const getUnreadAnnouncementCount = () => {
  return announcements.value.filter(a => !a.is_read).length
}

const handleTabChange = (type) => {
  currentType.value = type
  page.value = 1
  if (type === 'announcement') {
    fetchAnnouncements()
  } else {
    fetchNotifications()
  }
}

const handleNotificationClick = async (notification) => {
  if (!notification.is_read) {
    try {
      await markAsRead(notification.id)
      notification.is_read = 1
      unreadCount.value--
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  if (notification.related_id) {
    if (notification.type === 'comment' || notification.type === 'like') {
      router.push(`/article/${notification.related_id}`)
    } else if (notification.type === 'follow') {
      router.push(`/profile/${notification.related_id}`)
    }
  }
}

const handleDelete = async (notification) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteNotification(notification.id)
    notifications.value = notifications.value.filter(n => n.id !== notification.id)
    if (!notification.is_read) {
      unreadCount.value--
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const loadMore = () => {
  if (hasMore.value && !loading.value) {
    page.value++
    fetchNotifications()
  }
}

const getNotificationIcon = (type) => {
  switch (type) {
    case 'comment':
      return ChatDotRound
    case 'like':
      return Star
    case 'follow':
      return UserFilled
    case 'mention':
      return ChatLineRound
    case 'achievement':
      return Trophy
    default:
      return BellFilled
  }
}

const getNotificationIconBg = (type) => {
  switch (type) {
    case 'comment':
      return 'background: #e8f5e9; color: #00b42a;'
    case 'like':
      return 'background: #fff3e0; color: #ff7d00;'
    case 'follow':
      return 'background: #f3e5f5; color: #722ed1;'
    case 'mention':
      return 'background: #e3f2fd; color: #165dff;'
    case 'achievement':
      return 'background: #fff7e6; color: #faad14;'
    default:
      return 'background: #f7f8fa; color: #86909c;'
  }
}

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

const goBack = () => {
  router.back()
}

const goToHome = () => {
  router.push('/')
}

const getTabUnreadCount = (key) => {
  if (key === 'announcement') {
    return getUnreadAnnouncementCount()
  }
  if (key === 'all') {
    return (unreadCount.value || 0) + getUnreadAnnouncementCount()
  }
  return typeUnreadCounts.value[key] || 0
}

onMounted(() => {
  fetchAnnouncements()
  if (currentType.value !== 'announcement') {
    fetchNotifications()
  }
})
</script>

<template>
  <div class="notifications-page">
    <div class="top-nav-bar">
      <div class="nav-left">
        <el-button circle @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">消息通知</h1>
      </div>
    </div>

    <div class="tabs-container">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: currentType === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        <span class="tab-text">{{ tab.label }}</span>
        <span
          v-if="getTabUnreadCount(tab.key) > 0"
          class="tab-badge"
        >
          {{ getTabUnreadCount(tab.key) }}
        </span>
      </div>
    </div>

    <div class="content-card">
      <div v-loading="loading" class="content-inner">
        <div v-if="currentType === 'announcement'">
          <div
            v-for="announcement in announcements"
            :key="announcement.id"
            class="announcement-item"
            :class="{ unread: !announcement.is_read }"
            @click="handleAnnouncementClick(announcement)"
          >
            <div class="announcement-icon">
              <el-icon><Document /></el-icon>
            </div>

            <div class="announcement-content">
              <div class="announcement-title">{{ announcement.title }}</div>
              <div class="announcement-text">{{ announcement.content }}</div>
              <div class="announcement-time">
                <el-icon><Clock /></el-icon>
                {{ formatTime(announcement.created_at) }}
              </div>
            </div>
          </div>

          <div v-if="announcements.length === 0" class="empty-state">
            <div class="empty-illustration">
              <svg viewBox="0 0 200 160" class="breathing-svg">
                <g fill="none" stroke="#165dff" stroke-width="2">
                  <rect x="40" y="40" width="120" height="80" rx="8" fill="#f7f8fa"/>
                  <line x1="60" y1="65" x2="140" y2="65"/>
                  <line x1="60" y1="85" x2="110" y2="85"/>
                  <circle cx="90" cy="110" r="8" fill="#165dff" opacity="0.2"/>
                  <circle cx="90" cy="110" r="12" fill="#165dff" opacity="0.1"/>
                </g>
              </svg>
            </div>
            <div class="empty-text">暂无新公告</div>
            <div class="empty-desc">你可以去首页逛逛，看看最新动态</div>
            <el-button type="primary" @click="goToHome" class="home-btn">
              <el-icon><HomeFilled /></el-icon>
              去首页逛逛
            </el-button>
          </div>
        </div>

        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.is_read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon" :style="getNotificationIconBg(notification.type)">
              <el-icon><component :is="getNotificationIcon(notification.type)" /></el-icon>
            </div>

            <div class="notification-content">
              <div class="notification-text">{{ notification.content }}</div>
              <div class="notification-time">
                <el-icon><Clock /></el-icon>
                {{ formatTime(notification.created_at) }}
              </div>
            </div>

            <el-button
              text
              class="delete-btn"
              @click.stop="handleDelete(notification)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>

          <div v-if="notifications.length === 0 && !loading" class="empty-state">
            <div class="empty-illustration">
              <svg viewBox="0 0 200 160" class="breathing-svg">
                <g fill="none" stroke="#165dff" stroke-width="2">
                  <circle cx="100" cy="70" r="40" fill="#f7f8fa"/>
                  <path d="M80 60 L95 75 L120 55" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="100" cy="130" r="6" fill="#165dff" opacity="0.3"/>
                  <circle cx="100" cy="130" r="10" fill="#165dff" opacity="0.15"/>
                </g>
              </svg>
            </div>
            <div class="empty-text">暂无消息</div>
            <div class="empty-desc">暂无新的消息通知</div>
          </div>

          <div v-if="hasMore && !loading" class="load-more">
            <el-button text @click="loadMore">加载更多</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notifications-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #f0f2f5 100%);
  padding: 0;
}

.top-nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  width: 36px;
  height: 36px;
  background: #f7f8fa;
  border: none;
  color: #4e5969;
  transition: all 0.3s ease;

  &:hover {
    background: #e8f0ff;
    color: #165dff;
    transform: scale(1.05);
  }

  .el-icon {
    font-size: 18px;
  }
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: linear-gradient(135deg, #f53f3f 0%, #ff6b6b 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(245, 63, 63, 0.3);
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.tabs-container {
  display: flex;
  gap: 4px;
  background: white;
  padding: 8px 12px;
  margin: 12px 12px 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #86909c;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;

  &:hover {
    color: #165dff;
    background: #f7f8fa;
    transform: scale(1.02);
  }

  &.active {
    color: #165dff;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 3px;
      background: linear-gradient(90deg, #165dff 0%, #4080ff 100%);
      border-radius: 2px;
      animation: underline-expand 0.3s ease-out;
    }
  }
}

@keyframes underline-expand {
  from {
    width: 0;
  }
  to {
    width: 32px;
  }
}

.tab-text {
  font-size: 14px;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #f53f3f;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 8px;
  line-height: 1;
}

.content-card {
  margin: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  min-height: calc(100vh - 140px);
}

.content-inner {
  padding: 16px;
  min-height: calc(100vh - 140px);
}

.notification-item,
.announcement-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #f7f8fa;
    transform: translateX(4px);
  }
}

.notification-item.unread,
.announcement-item.unread {
  background: linear-gradient(90deg, rgba(22, 93, 255, 0.05) 0%, white 100%);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #165dff 0%, #4080ff 100%);
    border-radius: 0 2px 2px 0;
  }
}

.notification-icon,
.announcement-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #fff7e6;
  color: #faad14;

  .el-icon {
    font-size: 20px;
  }
}

.notification-content,
.announcement-content {
  flex: 1;
  min-width: 0;
}

.notification-text,
.announcement-text {
  font-size: 14px;
  color: #1d2129;
  line-height: 1.6;
  margin-bottom: 6px;
}

.announcement-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 6px;
}

.notification-time,
.announcement-time {
  font-size: 12px;
  color: #86909c;
  display: flex;
  align-items: center;
  gap: 4px;

  .el-icon {
    font-size: 12px;
  }
}

.delete-btn {
  color: #86909c;
  padding: 4px;
  flex-shrink: 0;
  transition: all 0.3s ease;

  &:hover {
    color: #f53f3f;
    transform: scale(1.1);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-illustration {
  margin-bottom: 20px;
}

.breathing-svg {
  width: 160px;
  height: 128px;
  animation: breathing 3s ease-in-out infinite;
}

@keyframes breathing {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 24px;
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
  }
}

.load-more {
  text-align: center;
  padding: 20px;
}

@media (min-width: 768px) {
  .top-nav-bar {
    padding: 16px 32px;
  }

  .tabs-container {
    margin: 20px auto 0;
    max-width: 900px;
    padding: 12px 16px;
  }

  .content-card {
    margin: 20px auto;
    max-width: 900px;
  }

  .content-inner {
    padding: 24px;
  }

  .notification-item,
  .announcement-item {
    padding: 20px;
  }
}

@media (min-width: 1200px) {
  .tabs-container {
    max-width: 1000px;
  }

  .content-card {
    max-width: 1000px;
  }
}

@media (max-width: 480px) {
  .tab-item {
    padding: 8px 12px;
    font-size: 13px;
  }

  .notification-item,
  .announcement-item {
    padding: 12px;
  }

  .notification-icon,
  .announcement-icon {
    width: 36px;
    height: 36px;

    .el-icon {
      font-size: 18px;
    }
  }
}
</style>
