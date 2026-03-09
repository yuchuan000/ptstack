<script setup>
/**
 * 首页组件
 * 功能：展示用户信息、统计数据、最新文章、热门文章、推荐用户和关注动态
 */

import { useUserStore } from '@/stores/user' // 导入用户状态管理
import { ref, onMounted, watch } from 'vue' // 导入Vue的响应式API
import { useRouter, useRoute } from 'vue-router' // 导入路由相关
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
} from '@element-plus/icons-vue' // 导入Element Plus图标
import * as echarts from 'echarts' // 导入ECharts库
import { getArticles } from '@/api/articles' // 导入文章API
import { getProfile } from '@/api/auth' // 导入认证API
import { getRecommendedUsers, getFeed } from '@/api/users' // 导入用户API
import { getUnreadCount } from '@/api/notifications' // 导入通知API
import { toggleSubscription } from '@/api/subscriptions' // 导入订阅API
import { getMarqueeAnnouncements, getAnnouncements } from '@/api/announcements' // 导入公告API
import { getHomeStats, getUserStats, getArticleStats, getCommentStats, getOnlineStats } from '@/api/stats' // 导入数据统计API
import UserAvatar from '@/components/Common/UserAvatar.vue' // 导入用户头像组件

// 路由实例
const router = useRouter()
// 路由对象
const route = useRoute()
// 用户状态仓库
const userStore = useUserStore()
// 加载状态
const loading = ref(false)
// 最新文章列表
const recentArticles = ref([])
// 热门文章列表
const hotArticles = ref([])
// 推荐用户列表
const recommendedUsers = ref([])
// 关注动态文章列表
const feedArticles = ref([])
// 未读消息数
const unreadCount = ref({ total: 0 })
// 公告列表
const announcements = ref([])
// 当前时间
const currentTime = ref(new Date())

// 数据统计相关
const homeStats = ref({})
const userStats = ref({})
const articleStats = ref({})
const commentStats = ref({})
const onlineStats = ref({})

// ECharts实例
const userChartRef = ref(null)
const articleChartRef = ref(null)
const commentChartRef = ref(null)
const onlineChartRef = ref(null)
const userChart = ref(null)
const articleChart = ref(null)
const commentChart = ref(null)
const onlineChart = ref(null)

/**
 * 用户统计数据
 */
const stats = ref({
  articles: 0, // 发布文章数
  followers: 0, // 订阅者数
  following: 0, // 订阅数
  views: 0, // 总阅读数
  comments: 0 // 评论数
})

// 滚动公告列表
const marqueeAnnouncements = ref([])
// 当前滚动公告索引
const currentMarqueeIndex = ref(0)
// 滚动计时器
const marqueeTimer = ref(null)

/**
 * 获取首页顶部滚动公告
 */
const fetchMarqueeAnnouncements = async () => {
  try {
    const res = await getMarqueeAnnouncements()
    marqueeAnnouncements.value = res.announcements || []
  } catch (error) {
    console.error('获取首页顶部通告失败:', error)
  }
}

/**
 * 启动公告滚动循环
 */
const startMarqueeLoop = () => {
  if (marqueeAnnouncements.value.length <= 1) return

  marqueeTimer.value = setInterval(() => {
    currentMarqueeIndex.value = (currentMarqueeIndex.value + 1) % marqueeAnnouncements.value.length
  }, 5000)
}

/**
 * 获取当前用户信息
 */
const fetchCurrentUserProfile = async () => {
  try {
    const res = await getProfile()
    userStore.setUserInfo(res.user)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

/**
 * 获取最新文章
 */
const fetchRecentArticles = async () => {
  try {
    const res = await getArticles({ page: 1, pageSize: 6, sortBy: 'created_at', order: 'desc' })
    recentArticles.value = res.articles || []
  } catch (error) {
    console.error('获取文章失败:', error)
  }
}

/**
 * 获取热门文章
 */
const fetchHotArticles = async () => {
  try {
    const res = await getArticles({ page: 1, pageSize: 5, sortBy: 'view_count', order: 'desc' })
    hotArticles.value = res.articles || []
  } catch (error) {
    console.error('获取热门文章失败:', error)
  }
}

/**
 * 获取推荐用户
 */
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

/**
 * 获取关注动态
 */
const fetchFeed = async () => {
  try {
    const res = await getFeed({ page: 1, pageSize: 10 })
    feedArticles.value = res.articles || []
  } catch (error) {
    console.error('获取Feed失败:', error)
  }
}

/**
 * 获取公告用于计算未读数
 */
const fetchAnnouncementsForUnread = async () => {
  try {
    const res = await getAnnouncements()
    announcements.value = res.announcements || []
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

/**
 * 获取未读公告数量
 * @returns {number} 未读公告数量
 */
const getUnreadAnnouncementCount = () => {
  return announcements.value.filter(a => !a.is_read).length
}

/**
 * 获取未读消息总数
 */
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

/**
 * 获取用户统计数据
 */
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

/**
 * 获取首页统计数据
 */
const fetchHomeStats = async () => {
  try {
    const res = await getHomeStats()
    homeStats.value = res || {}
  } catch (error) {
    console.error('获取首页统计数据失败:', error)
  }
}

/**
 * 获取用户统计数据
 */
const fetchUserStatsData = async () => {
  try {
    const res = await getUserStats()
    userStats.value = res || {}
    initUserChart()
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
  }
}

/**
 * 获取文章统计数据
 */
const fetchArticleStats = async () => {
  try {
    const res = await getArticleStats()
    articleStats.value = res || {}
    initArticleChart()
  } catch (error) {
    console.error('获取文章统计数据失败:', error)
  }
}

/**
 * 获取评论统计数据
 */
const fetchCommentStats = async () => {
  try {
    const res = await getCommentStats()
    commentStats.value = res || {}
    initCommentChart()
  } catch (error) {
    console.error('获取评论统计数据失败:', error)
  }
}

/**
 * 获取在线用户统计数据
 */
const fetchOnlineStats = async () => {
  try {
    const res = await getOnlineStats()
    onlineStats.value = res || {}
    initOnlineChart()
  } catch (error) {
    console.error('获取在线用户统计数据失败:', error)
  }
}

/**
 * 初始化在线用户统计图表
 */
const initOnlineChart = () => {
  if (!onlineChartRef.value) return

  if (onlineChart.value) {
    onlineChart.value.dispose()
  }

  onlineChart.value = echarts.init(onlineChartRef.value)

  // 检查数据是否存在
  if (!onlineStats.value || !onlineStats.value.onlineTrend || onlineStats.value.onlineTrend.length === 0) {
    const emptyOption = {
      title: {
        text: '在线用户趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [],
          type: 'line',
          smooth: true
        }
      ],
      graphic: {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: '暂无数据',
              fontSize: 16,
              fill: '#999'
            }
          }
        ]
      }
    }
    onlineChart.value.setOption(emptyOption)
  } else {
    const option = {
      title: {
        text: '在线用户趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: onlineStats.value.onlineTrend.map(item => item.time),
        axisLabel: {
          rotate: 45,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}'
        },
        minInterval: 1
      },
      series: [
        {
          data: onlineStats.value.onlineTrend.map(item => parseInt(item.count)),
          type: 'line',
          smooth: false,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(0, 180, 42, 0.3)'
              }, {
                offset: 1, color: 'rgba(0, 180, 42, 0.1)'
              }]
            }
          },
          lineStyle: {
            color: '#00b42a'
          },
          itemStyle: {
            color: '#00b42a'
          },
          emphasis: {
            itemStyle: {
              color: '#00b42a',
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 180, 42, 0.5)'
            },
            label: {
              show: true,
              position: 'top',
              color: '#00b42a',
              fontWeight: 'bold'
            }
          }
        }
      ]
    }

    onlineChart.value.setOption(option)
  }

  // 移除之前的事件监听器，避免重复添加
  window.removeEventListener('resize', handleOnlineChartResize)
  window.addEventListener('resize', handleOnlineChartResize)
}

// 处理在线用户图表 resize
const handleOnlineChartResize = () => {
  onlineChart.value?.resize()
}

/**
 * 初始化用户统计图表
 */
const initUserChart = () => {
  if (!userChartRef.value) return

  if (userChart.value) {
    userChart.value.dispose()
  }

  userChart.value = echarts.init(userChartRef.value)

  // 检查数据是否存在
  if (!userStats.value || !userStats.value.registerTrend || userStats.value.registerTrend.length === 0) {
    const emptyOption = {
      title: {
        text: '用户增长趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [],
          type: 'line',
          smooth: true
        }
      ],
      graphic: {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: '暂无数据',
              fontSize: 16,
              fill: '#999'
            }
          }
        ]
      }
    }
    userChart.value.setOption(emptyOption)
  } else {
    const option = {
      title: {
        text: '用户增长趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: userStats.value.registerTrend.map(item => formatChartDate(item.date))
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: userStats.value.registerTrend.map(item => item.count),
          type: 'line',
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(22, 93, 255, 0.3)'
              }, {
                offset: 1, color: 'rgba(22, 93, 255, 0.1)'
              }]
            }
          },
          lineStyle: {
            color: '#165dff'
          },
          itemStyle: {
            color: '#165dff'
          },
          emphasis: {
            itemStyle: {
              color: '#165dff',
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(22, 93, 255, 0.5)'
            },
            label: {
              show: true,
              position: 'top',
              color: '#165dff',
              fontWeight: 'bold'
            }
          }
        }
      ]
    }

    userChart.value.setOption(option)
  }

  // 移除之前的事件监听器，避免重复添加
  window.removeEventListener('resize', handleUserChartResize)
  window.addEventListener('resize', handleUserChartResize)
}

// 处理用户图表 resize
const handleUserChartResize = () => {
  userChart.value?.resize()
}

/**
 * 初始化文章统计图表
 */
const initArticleChart = () => {
  if (!articleChartRef.value) return

  if (articleChart.value) {
    articleChart.value.dispose()
  }

  articleChart.value = echarts.init(articleChartRef.value)

  // 检查数据是否存在
  if (!articleStats.value || !articleStats.value.publishTrend || articleStats.value.publishTrend.length === 0) {
    const emptyOption = {
      title: {
        text: '文章发布趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [],
          type: 'line',
          smooth: true
        }
      ],
      graphic: {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: '暂无数据',
              fontSize: 16,
              fill: '#999'
            }
          }
        ]
      }
    }
    articleChart.value.setOption(emptyOption)
  } else {
    const option = {
      title: {
        text: '文章发布趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: articleStats.value.publishTrend.map(item => formatChartDate(item.date))
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: articleStats.value.publishTrend.map(item => item.count),
          type: 'line',
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(22, 93, 255, 0.3)'
              }, {
                offset: 1, color: 'rgba(22, 93, 255, 0.1)'
              }]
            }
          },
          lineStyle: {
            color: '#165dff'
          },
          itemStyle: {
            color: '#165dff'
          },
          emphasis: {
            itemStyle: {
              color: '#165dff',
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(22, 93, 255, 0.5)'
            },
            label: {
              show: true,
              position: 'top',
              color: '#165dff',
              fontWeight: 'bold'
            }
          }
        }
      ]
    }

    articleChart.value.setOption(option)
  }

  // 移除之前的事件监听器，避免重复添加
  window.removeEventListener('resize', handleArticleChartResize)
  window.addEventListener('resize', handleArticleChartResize)
}

// 处理文章图表 resize
const handleArticleChartResize = () => {
  articleChart.value?.resize()
}

/**
 * 初始化评论统计图表
 */
const initCommentChart = () => {
  if (!commentChartRef.value) return

  if (commentChart.value) {
    commentChart.value.dispose()
  }

  commentChart.value = echarts.init(commentChartRef.value)

  // 检查数据是否存在
  if (!commentStats.value || !commentStats.value.commentTrend || commentStats.value.commentTrend.length === 0) {
    const emptyOption = {
      title: {
        text: '评论趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [],
          type: 'line',
          smooth: true
        }
      ],
      graphic: {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: '暂无数据',
              fontSize: 16,
              fill: '#999'
            }
          }
        ]
      }
    }
    commentChart.value.setOption(emptyOption)
  } else {
    const option = {
      title: {
        text: '评论趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: commentStats.value.commentTrend.map(item => formatChartDate(item.date))
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: commentStats.value.commentTrend.map(item => item.count),
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#165dff'
          },
          itemStyle: {
            color: '#165dff'
          },
          emphasis: {
            itemStyle: {
              color: '#165dff',
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(22, 93, 255, 0.5)'
            },
            label: {
              show: true,
              position: 'top',
              color: '#165dff',
              fontWeight: 'bold'
            }
          }
        }
      ]
    }

    commentChart.value.setOption(option)
  }

  // 移除之前的事件监听器，避免重复添加
  window.removeEventListener('resize', handleCommentChartResize)
  window.addEventListener('resize', handleCommentChartResize)
}

// 处理评论图表 resize
const handleCommentChartResize = () => {
  commentChart.value?.resize()
}

/**
 * 处理订阅/取消订阅用户
 * @param {Object} user - 用户对象
 */
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

/**
 * 跳转到通知页面
 */
const goToNotifications = () => {
  router.push('/notifications')
}

// 监听用户信息变化，更新统计数据
watch(() => userStore.userInfo, () => {
  fetchUserStats()
}, { deep: true, immediate: true })

/**
 * 组件挂载时执行的初始化操作
 */
onMounted(async () => {
  // 更新当前时间的定时器
  const timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)

  // 获取滚动公告
  await fetchMarqueeAnnouncements()
  startMarqueeLoop()

  // 获取用户信息
  fetchCurrentUserProfile()

  // 获取文章数据
  fetchRecentArticles()
  fetchHotArticles()

  // 获取用户数据
  fetchRecommendedUsers()
  fetchFeed()

  // 获取公告和未读消息
  await fetchAnnouncementsForUnread()
  fetchUnreadCount()

  // 获取用户统计数据
  fetchUserStats()

  // 获取首页统计数据（一级用户）
  if (userStore.userInfo?.level === 1) {
    fetchHomeStats()
    fetchUserStatsData()
    fetchArticleStats()
    fetchCommentStats()
    fetchOnlineStats()
  }

  // 清理函数
  return () => {
    clearInterval(timer)
    if (marqueeTimer.value) {
      clearInterval(marqueeTimer.value)
    }
    // 销毁ECharts实例
    userChart.value?.dispose()
    articleChart.value?.dispose()
    commentChart.value?.dispose()
    onlineChart.value?.dispose()
  }
})

// 监听路由变化，更新未读消息
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

/**
 * 根据当前时间获取问候语
 * @returns {string} 问候语
 */
const getGreeting = () => {
  const hour = currentTime.value.getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

/**
 * 格式化当前日期
 * @returns {string} 格式化后的日期字符串
 */
const formatDate = () => {
  return currentTime.value.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

/**
 * 格式化图表日期
 * @param {string} dateStr - 日期字符串
 * @returns {string} 格式化后的日期字符串
 */
const formatChartDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * 跳转到文章列表页
 */
const goToArticles = () => {
  router.push('/articles')
}

/**
 * 跳转到文章详情页
 * @param {number} id - 文章ID
 */
const goToArticleDetail = (id) => {
  router.push(`/article/${id}`)
}

/**
 * 跳转到用户个人资料页
 * @param {string} [tab='articles'] - 标签页
 */
const goToProfile = (tab = 'articles') => {
  router.push({
    path: `/profile/${userStore.userInfo?.id}`,
    query: { tab }
  })
}

/**
 * 跳转到公告详情页
 * @param {number} id - 公告ID
 */
const goToAnnouncementDetail = (id) => {
  router.push(`/announcement/${id}`)
}

/**
 * 截断文本
 * @param {string} text - 要截断的文本
 * @param {number} [maxLength=100] - 最大长度
 * @returns {string} 截断后的文本
 */
const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<template>
  <div class="home-page">
    <div v-if="marqueeAnnouncements.length > 0" class="announcement-card">
      <div class="announcement-icon">
        <el-icon><Bell /></el-icon>
      </div>
      <div class="marquee-wrapper">
        <div
          class="marquee-text"
          :key="currentMarqueeIndex"
          @click="goToAnnouncementDetail(marqueeAnnouncements[currentMarqueeIndex]?.id)"
        >
          {{ marqueeAnnouncements[currentMarqueeIndex]?.summary || marqueeAnnouncements[currentMarqueeIndex]?.content }}
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
            <div class="user-avatar-wrapper" @click="goToProfile">
              <UserAvatar :user="{
                id: userStore.userInfo?.id,
                nickname: userStore.userInfo?.nickname,
                username: userStore.userInfo?.username,
                avatar: userStore.userInfo?.avatar,
                showAvatarBadge: userStore.userInfo?.showAvatarBadge && userStore.userInfo?.avatarBadge && userStore.userInfo?.avatarBadgeBgColor && userStore.userInfo?.avatarBadgeTextColor,
                avatarBadge: userStore.userInfo?.avatarBadge,
                avatarBadgeBgColor: userStore.userInfo?.avatarBadgeBgColor,
                avatarBadgeTextColor: userStore.userInfo?.avatarBadgeTextColor
              }" size="default" />
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

    <!-- 一级用户（站长）首页 -->
    <div v-if="userStore.userInfo?.level === 1" class="admin-stats-section">
      <div class="admin-stats-grid">
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background: #e3f2fd; color: #165dff;">
            <el-icon><User /></el-icon>
          </div>
          <div class="admin-stat-content">
            <div class="admin-stat-value">{{ homeStats.totalUsers || 0 }}</div>
            <div class="admin-stat-label">总用户数</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background: #e8f5e9; color: #00b42a;">
            <el-icon><View /></el-icon>
          </div>
          <div class="admin-stat-content">
            <div class="admin-stat-value">{{ homeStats.onlineUsers || 0 }}</div>
            <div class="admin-stat-label">在线用户数</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background: #fff3e0; color: #ff7d00;">
            <el-icon><Document /></el-icon>
          </div>
          <div class="admin-stat-content">
            <div class="admin-stat-value">{{ homeStats.totalArticles || 0 }}</div>
            <div class="admin-stat-label">总文章数</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background: #f3e5f5; color: #722ed1;">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="admin-stat-content">
            <div class="admin-stat-value">{{ homeStats.totalComments || 0 }}</div>
            <div class="admin-stat-label">总评论数</div>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card">
          <div ref="userChartRef" class="chart-container"></div>
        </div>
        <div class="chart-card">
          <div ref="articleChartRef" class="chart-container"></div>
        </div>
        <div class="chart-card">
          <div ref="commentChartRef" class="chart-container"></div>
        </div>
        <div class="chart-card">
          <div ref="onlineChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 二级用户（管理员）首页 -->
    <div v-else-if="userStore.userInfo?.level === 2" class="moderator-section">
      <div class="content-card">
        <div class="card-header">
          <div class="card-title">
            <div class="title-icon" style="background: #e3f2fd; color: #165dff;">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="title-text">
              <div class="title-main">审核列表</div>
              <div class="title-sub">需要审核的内容</div>
            </div>
          </div>
        </div>
        <div class="moderator-content">
          <div class="empty-state">
            <div class="empty-icon">
              <el-icon :size="48"><TrendCharts /></el-icon>
            </div>
            <div class="empty-text">暂无审核内容</div>
            <div class="empty-desc">所有内容已审核</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 三级用户（普通用户）首页 -->
    <div v-else>
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
                    <div v-if="article.summary" class="article-summary">{{ truncateText(article.summary, 80) }}</div>
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
                        <UserAvatar :user="{
                          id: article.author_id,
                          nickname: article.author_nickname,
                          username: article.author_name,
                          avatar: article.author_avatar,
                          show_avatar_badge: article.author_show_avatar_badge === 1 && article.author_avatar_badge && article.author_avatar_badge_bg_color && article.author_avatar_badge_text_color,
                          avatar_badge: article.author_avatar_badge,
                          avatar_badge_bg_color: article.author_avatar_badge_bg_color,
                          avatar_badge_text_color: article.author_avatar_badge_text_color
                        }" size="tiny" />
                      </div>
                      <span class="article-user-name">{{ article.nickname || article.username }}</span>
                    </div>
                    <div class="article-title">{{ article.title }}</div>
                    <div v-if="article.summary" class="article-summary">{{ truncateText(article.summary, 80) }}</div>
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
                      <UserAvatar :user="{
                        id: user.id,
                        nickname: user.nickname,
                        username: user.username,
                        avatar: user.avatar,
                        show_avatar_badge: user.show_avatar_badge === 1 && user.avatar_badge && user.avatar_badge_bg_color && user.avatar_badge_text_color,
                        avatar_badge: user.avatar_badge,
                        avatar_badge_bg_color: user.avatar_badge_bg_color,
                        avatar_badge_text_color: user.avatar_badge_text_color
                      }" size="small" />
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
  cursor: pointer;

  &:hover {
    color: #165dff;
    text-decoration: underline;
  }
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

.user-avatar-wrapper {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
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
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.content-right {
  flex: 0.8;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
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
    display: grid;
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
  display: inline-flex;
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
    bottom: -5px;
    right: -5px;
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

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
}

/* 一级用户（站长）首页样式 */
.admin-stats-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.admin-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.admin-stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
}

.admin-stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  .el-icon {
    font-size: 28px;
  }
}

.admin-stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1;
}

.admin-stat-label {
  font-size: 14px;
  color: #86909c;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chart-container {
  width: 100%;
  height: 300px;
}

/* 二级用户（管理员）首页样式 */
.moderator-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.moderator-content {
  padding: 48px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .admin-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-stats-grid {
    grid-template-columns: 1fr;
  }

  .admin-stat-card {
    padding: 20px;
  }

  .admin-stat-value {
    font-size: 28px;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
