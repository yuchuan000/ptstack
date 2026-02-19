<script setup>
// 导入Vue的ref、computed、onMounted和watch函数
import { ref, computed, onMounted, watch } from 'vue'
// 导入Vue Router的useRouter和useRoute函数
import { useRouter, useRoute } from 'vue-router'
// 导入用户状态管理store
import { useUserStore } from '@/stores/user'
// 导入Element Plus的ElMessage组件
import { ElMessage } from 'element-plus'
// 导入Element Plus图标组件
import {
  Calendar,
  Link,
  ChatDotRound,
  Document,
  Star,
  Edit,
  ArrowRight,
  View,
  ArrowLeft,
  Search,
  Sort,
  SortUp,
  Check
} from '@element-plus/icons-vue'
// 导入用户相关的API函数
import { getUserPublicProfile, getUserArticles, getUserComments } from '@/api/users'
// 导入订阅相关的API函数
import { toggleSubscription, getUserFollowers, getUserFollowing } from '@/api/subscriptions'
// 导入URL处理工具函数
import { getFullUrl } from '@/utils/url'

// 创建路由实例，用于页面跳转
const router = useRouter()
// 创建路由对象实例，用于获取路由参数
const route = useRoute()
// 创建用户状态管理实例
const userStore = useUserStore()

// 加载状态标识
const loading = ref(false)
// 当前查看的用户信息
const user = ref(null)
// 当前激活的选项卡
const activeTab = ref('articles')
// 用户文章列表
const articles = ref([])
// 用户评论列表
const comments = ref([])
// 订阅者列表
const followers = ref([])
// 订阅列表
const following = ref([])
// 文章分页信息
const articlesPagination = ref({ page: 1, pageSize: 5, total: 0 })
// 评论分页信息
const commentsPagination = ref({ page: 1, pageSize: 5, total: 0 })
// 订阅者分页信息
const followersPagination = ref({ page: 1, pageSize: 10, total: 0 })
// 订阅分页信息
const followingPagination = ref({ page: 1, pageSize: 10, total: 0 })

// 文章搜索关键词
const articlesSearch = ref('')
// 评论搜索关键词
const commentsSearch = ref('')
// 订阅者搜索关键词
const followersSearch = ref('')
// 订阅搜索关键词
const followingSearch = ref('')
// 文章排序字段
const articlesSort = ref('created_at')
// 评论排序字段
const commentsSort = ref('created_at')
// 文章排序顺序
const articlesSortOrder = ref('desc')
// 评论排序顺序
const commentsSortOrder = ref('desc')

// 计算属性：判断是否是当前用户自己的主页
const isOwn = computed(() => user.value?.isOwn)
// 计算属性：获取路由参数中的用户ID
const userId = computed(() => route.params.userId)

// 获取用户主页信息的异步函数
const fetchUserProfile = async () => {
  try {
    // 设置加载状态为true
    loading.value = true
    // 调用API获取用户公开信息
    const res = await getUserPublicProfile(userId.value)
    // 保存用户信息
    user.value = res.user

    // 清空文章列表
    articles.value = []
    // 清空评论列表
    comments.value = []
    // 清空订阅者列表
    followers.value = []
    // 清空订阅列表
    following.value = []
    // 重置文章分页
    articlesPagination.value = { page: 1, pageSize: 5, total: 0 }
    // 重置评论分页
    commentsPagination.value = { page: 1, pageSize: 5, total: 0 }
    // 重置订阅者分页
    followersPagination.value = { page: 1, pageSize: 10, total: 0 }
    // 重置订阅分页
    followingPagination.value = { page: 1, pageSize: 10, total: 0 }
    // 清空文章搜索关键词
    articlesSearch.value = ''
    // 清空评论搜索关键词
    commentsSearch.value = ''
    // 清空订阅者搜索关键词
    followersSearch.value = ''
    // 清空订阅搜索关键词
    followingSearch.value = ''
  } catch (error) {
    // 在控制台输出错误信息
    console.error('获取用户信息失败:', error)
    // 显示错误提示
    ElMessage.error('获取用户信息失败')
  } finally {
    // 无论成功或失败，都设置加载状态为false
    loading.value = false
  }
}

// 获取用户文章列表的异步函数
const fetchArticles = async () => {
  try {
    // 调用API获取用户文章列表
    const res = await getUserArticles(userId.value, {
      page: articlesPagination.value.page, // 页码
      pageSize: articlesPagination.value.pageSize, // 每页数量
      search: articlesSearch.value, // 搜索关键词
      sort: articlesSort.value, // 排序字段
      sortOrder: articlesSortOrder.value // 排序顺序
    })
    // 保存文章列表
    articles.value = res.articles
    // 保存文章总数
    articlesPagination.value.total = res.total
  } catch (error) {
    // 在控制台输出错误信息
    console.error('获取用户文章失败:', error)
  }
}

// 获取用户评论列表的异步函数
const fetchComments = async () => {
  try {
    // 调用API获取用户评论列表
    const res = await getUserComments(userId.value, {
      page: commentsPagination.value.page, // 页码
      pageSize: commentsPagination.value.pageSize, // 每页数量
      search: commentsSearch.value, // 搜索关键词
      sort: commentsSort.value, // 排序字段
      sortOrder: commentsSortOrder.value // 排序顺序
    })
    // 保存评论列表
    comments.value = res.comments
    // 保存评论总数
    commentsPagination.value.total = res.total
  } catch (error) {
    // 在控制台输出错误信息
    console.error('获取用户评论失败:', error)
  }
}

// 获取订阅者列表的异步函数
const fetchFollowers = async () => {
  try {
    // 调用API获取订阅者列表
    const res = await getUserFollowers(userId.value, {
      page: followersPagination.value.page, // 页码
      pageSize: followersPagination.value.pageSize, // 每页数量
      search: followersSearch.value // 搜索关键词
    })
    // 保存订阅者列表
    followers.value = res.users || []
    // 保存订阅者总数
    followersPagination.value.total = res.total
  } catch (error) {
    // 在控制台输出错误信息
    console.error('获取订阅者列表失败:', error)
  }
}

// 获取订阅列表的异步函数
const fetchFollowing = async () => {
  try {
    // 调用API获取订阅列表
    const res = await getUserFollowing(userId.value, {
      page: followingPagination.value.page, // 页码
      pageSize: followingPagination.value.pageSize, // 每页数量
      search: followingSearch.value // 搜索关键词
    })
    // 保存订阅列表
    following.value = res.users || []
    // 保存订阅总数
    followingPagination.value.total = res.total
  } catch (error) {
    // 在控制台输出错误信息
    console.error('获取订阅列表失败:', error)
  }
}

// 切换订阅状态的异步函数
const handleToggleSubscription = async (targetUser = null) => {
  // 检查是否是事件对象
  let actualTargetUser = targetUser
  if (targetUser && typeof targetUser === 'object' && 'type' in targetUser) {
    // 是事件对象，忽略
    actualTargetUser = null
  }

  try {
    // 如果指定了目标用户
    if (actualTargetUser) {
      // 调用API切换订阅状态
      const res = await toggleSubscription(actualTargetUser.id)
      // 更新目标用户的订阅状态
      actualTargetUser.isSubscribed = res.isSubscribed
      // 显示成功提示
      ElMessage.success(res.isSubscribed ? '订阅成功' : '已取消订阅')
    } else {
      // 否则切换对当前查看用户的订阅状态
      const res = await toggleSubscription(userId.value)
      // 更新用户信息中的订阅状态
      user.value.isSubscribed = res.isSubscribed
      // 如果是订阅成功
      if (res.isSubscribed) {
        // 如果订阅者数量不为null
        if (user.value.follower_count !== null) {
          // 订阅者数量加1
          user.value.follower_count++
        }
        // 显示成功提示
        ElMessage.success('订阅成功')
      } else {
        // 如果是取消订阅
        if (user.value.follower_count !== null) {
          // 订阅者数量减1
          user.value.follower_count--
        }
        // 显示成功提示
        ElMessage.success('已取消订阅')
      }
    }
  } catch (error) {
    // 在控制台输出错误信息
    console.error('订阅操作失败:', error)
    // 显示错误提示
    ElMessage.error('操作失败')
  }
}

// 切换选项卡的函数
const handleTabChange = (tab) => {
  // 设置激活的选项卡
  activeTab.value = tab
  // 获取当前选项卡的数据
  fetchActiveTabData()
}

// 获取当前激活选项卡数据的函数
const fetchActiveTabData = () => {
  // 如果当前选项卡是文章
  if (activeTab.value === 'articles') {
    // 重置文章页码
    articlesPagination.value.page = 1
    // 获取文章列表
    fetchArticles()
  } else if (activeTab.value === 'comments') { // 如果当前选项卡是评论
    // 重置评论页码
    commentsPagination.value.page = 1
    // 获取评论列表
    fetchComments()
  } else if (activeTab.value === 'followers') { // 如果当前选项卡是订阅者
    // 重置订阅者页码
    followersPagination.value.page = 1
    // 获取订阅者列表
    fetchFollowers()
  } else if (activeTab.value === 'following') { // 如果当前选项卡是订阅
    // 重置订阅页码
    followingPagination.value.page = 1
    // 获取订阅列表
    fetchFollowing()
  }
}

// 跳转到文章详情页的函数
const goToArticleDetail = (id) => {
  // 使用路由实例跳转到文章详情页
  router.push(`/article/${id}`)
}

// 跳转到设置页的函数
const goToSettings = () => {
  // 使用路由实例跳转到设置页
  router.push('/settings')
}

// 返回上一页的函数
const goBack = () => {
  // 使用路由实例返回上一页
  router.back()
}

// 跳转到用户个人主页的函数
const goToProfile = (id) => {
  // 使用路由实例跳转到指定用户的个人主页
  router.push(`/profile/${id}`)
}

// 文章页码变化的处理函数
const handleArticlesPageChange = (page) => {
  // 设置文章页码
  articlesPagination.value.page = page
  // 获取文章列表
  fetchArticles()
}

// 评论页码变化的处理函数
const handleCommentsPageChange = (page) => {
  // 设置评论页码
  commentsPagination.value.page = page
  // 获取评论列表
  fetchComments()
}

// 文章每页数量变化的处理函数
const handleArticlesPageSizeChange = (size) => {
  // 设置文章每页数量
  articlesPagination.value.pageSize = size
  // 重置文章页码
  articlesPagination.value.page = 1
  // 获取文章列表
  fetchArticles()
}

// 评论每页数量变化的处理函数
const handleCommentsPageSizeChange = (size) => {
  // 设置评论每页数量
  commentsPagination.value.pageSize = size
  // 重置评论页码
  commentsPagination.value.page = 1
  // 获取评论列表
  fetchComments()
}

// 文章搜索防抖定时器
let articlesSearchTimer = null
// 评论搜索防抖定时器
let commentsSearchTimer = null
// 订阅者搜索防抖定时器
let followersSearchTimer = null
// 订阅搜索防抖定时器
let followingSearchTimer = null

// 文章搜索处理函数
const handleArticlesSearch = () => {
  // 如果定时器已存在，清除定时器
  if (articlesSearchTimer) {
    clearTimeout(articlesSearchTimer)
  }
  // 设置新的定时器，延迟300毫秒执行
  articlesSearchTimer = setTimeout(() => {
    // 重置文章页码
    articlesPagination.value.page = 1
    // 获取文章列表
    fetchArticles()
  }, 300)
}

// 评论搜索处理函数
const handleCommentsSearch = () => {
  // 如果定时器已存在，清除定时器
  if (commentsSearchTimer) {
    clearTimeout(commentsSearchTimer)
  }
  // 设置新的定时器，延迟300毫秒执行
  commentsSearchTimer = setTimeout(() => {
    // 重置评论页码
    commentsPagination.value.page = 1
    // 获取评论列表
    fetchComments()
  }, 300)
}

// 文章排序处理函数
const handleArticlesSort = (sort) => {
  // 如果当前排序字段与新字段相同
  if (articlesSort.value === sort) {
    // 切换排序顺序
    articlesSortOrder.value = articlesSortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    // 设置新的排序字段
    articlesSort.value = sort
    // 重置排序顺序为降序
    articlesSortOrder.value = 'desc'
  }
  // 重置文章页码
  articlesPagination.value.page = 1
  // 获取文章列表
  fetchArticles()
}

// 评论排序处理函数
const handleCommentsSort = (sort) => {
  // 如果当前排序字段与新字段相同
  if (commentsSort.value === sort) {
    // 切换排序顺序
    commentsSortOrder.value = commentsSortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    // 设置新的排序字段
    commentsSort.value = sort
    // 重置排序顺序为降序
    commentsSortOrder.value = 'desc'
  }
  // 重置评论页码
  commentsPagination.value.page = 1
  // 获取评论列表
  fetchComments()
}

// 订阅者页码变化的处理函数
const handleFollowersPageChange = (page) => {
  // 设置订阅者页码
  followersPagination.value.page = page
  // 获取订阅者列表
  fetchFollowers()
}

// 订阅页码变化的处理函数
const handleFollowingPageChange = (page) => {
  // 设置订阅页码
  followingPagination.value.page = page
  // 获取订阅列表
  fetchFollowing()
}

// 订阅者每页数量变化的处理函数
const handleFollowersPageSizeChange = (size) => {
  // 设置订阅者每页数量
  followersPagination.value.pageSize = size
  // 重置订阅者页码
  followersPagination.value.page = 1
  // 获取订阅者列表
  fetchFollowers()
}

// 订阅每页数量变化的处理函数
const handleFollowingPageSizeChange = (size) => {
  // 设置订阅每页数量
  followingPagination.value.pageSize = size
  // 重置订阅页码
  followingPagination.value.page = 1
  // 获取订阅列表
  fetchFollowing()
}

// 订阅者搜索处理函数
const handleFollowersSearch = () => {
  // 如果定时器已存在，清除定时器
  if (followersSearchTimer) clearTimeout(followersSearchTimer)
  // 设置新的定时器，延迟300毫秒执行
  followersSearchTimer = setTimeout(() => {
    // 重置订阅者页码
    followersPagination.value.page = 1
    // 获取订阅者列表
    fetchFollowers()
  }, 300)
}

// 初始化选项卡的函数
const initActiveTab = () => {
  const tabFromQuery = route.query.tab
  if (tabFromQuery && ['articles', 'followers', 'following', 'comments'].includes(tabFromQuery)) {
    activeTab.value = tabFromQuery
  }
}

// 订阅搜索处理函数
const handleFollowingSearch = () => {
  // 如果定时器已存在，清除定时器
  if (followingSearchTimer) clearTimeout(followingSearchTimer)
  // 设置新的定时器，延迟300毫秒执行
  followingSearchTimer = setTimeout(() => {
    // 重置订阅页码
    followingPagination.value.page = 1
    // 获取订阅列表
    fetchFollowing()
  }, 300)
}

// 监听路由查询参数tab的变化
watch(() => route.query.tab, () => {
  initActiveTab()
  fetchActiveTabData()
})

// 监听路由参数userId的变化
watch(() => route.params.userId, async () => {
  // 如果userId存在
  if (route.params.userId) {
    // 初始化选项卡
    initActiveTab()
    // 获取用户主页信息
    await fetchUserProfile()
    // 获取当前选项卡的数据
    fetchActiveTabData()
  }
})

// 组件挂载时的生命周期钩子
onMounted(async () => {
  // 初始化选项卡
  initActiveTab()
  // 获取用户主页信息
  await fetchUserProfile()
  // 获取当前选项卡的数据
  fetchActiveTabData()
})
</script>

<template>
  <div class="profile-page">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="skeleton-header">
          <el-skeleton-item variant="circle" style="width: 80px; height: 80px;" />
          <div class="skeleton-info">
            <el-skeleton-item variant="h3" style="width: 200px; margin-bottom: 8px;" />
            <el-skeleton-item variant="text" style="width: 300px; margin-bottom: 8px;" />
            <el-skeleton-item variant="text" style="width: 150px;" />
          </div>
        </div>
        <div class="skeleton-stats">
          <el-skeleton-item variant="text" style="width: 80px;" />
          <el-skeleton-item variant="text" style="width: 80px;" />
          <el-skeleton-item variant="text" style="width: 80px;" />
          <el-skeleton-item variant="text" style="width: 80px;" />
        </div>
      </template>

      <template #default>
        <div v-if="user" class="profile-container">
          <div class="back-section">
            <el-button text @click="goBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
          </div>
          <div class="header-section">
            <div class="header-left">
              <div class="avatar">
                <img v-if="user.avatar" :src="getFullUrl(user.avatar)" alt="avatar" class="avatar-img">
                <span v-else>{{ (user.nickname || user.username)?.charAt(0).toUpperCase() || 'U' }}</span>
                <span v-if="user.isAdmin" class="avatar-admin-badge">管</span>
              </div>
              <div class="user-info">
                <div class="user-name-row">
                  <h1 class="username">{{ user.nickname || user.username }}</h1>
                </div>
                <div class="user-meta">
                  <span class="meta-item">ID: {{ user.id }}</span>
                  <span class="meta-divider">|</span>
                  <span class="meta-item">已加入 {{ Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) }} 天</span>
                </div>
                <p v-if="user.bio" class="bio">{{ user.bio }}</p>
              </div>
            </div>
            <div class="header-right">
              <template v-if="!isOwn">
                <el-button
                  :type="user.isSubscribed ? 'default' : 'primary'"
                  @click="handleToggleSubscription"
                  size="large"
                >
                  {{ user.isSubscribed ? '已订阅' : '订阅' }}
                </el-button>
              </template>
              <template v-else>
                <el-button type="primary" @click="goToSettings" size="large">
                  <el-icon><Edit /></el-icon>
                  编辑资料
                </el-button>
              </template>
            </div>
          </div>

          <div class="stats-section">
            <div class="stats-list">
              <div class="stat-item" v-if="user.follower_count !== null">
                <div class="stat-value">{{ user.follower_count }}</div>
                <div class="stat-label">订阅者</div>
              </div>
              <div class="stat-divider" v-if="user.follower_count !== null"></div>
              <div class="stat-item" v-if="user.following_count !== null">
                <div class="stat-value">{{ user.following_count }}</div>
                <div class="stat-label">订阅</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ user.article_count || 0 }}</div>
                <div class="stat-label">文章</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ user.comment_count || 0 }}</div>
                <div class="stat-label">评论</div>
              </div>
            </div>
          </div>

          <div class="tabs-section">
            <div class="tabs-header">
              <div
                v-for="tab in [
                  { key: 'articles', label: '文章' },
                  { key: 'comments', label: '评论' },
                  { key: 'followers', label: '订阅者' },
                  { key: 'following', label: '订阅' }
                ]"
                :key="tab.key"
                class="tab-item"
                :class="{ active: activeTab === tab.key }"
                @click="handleTabChange(tab.key)"
              >
                {{ tab.label }}
              </div>
            </div>

            <div class="tabs-content">
              <div v-if="activeTab === 'articles'" class="tab-panel">
                <div class="articles-list">
                  <div v-if="articles.length === 0" class="empty-state">
                    <el-empty description="暂无文章" />
                  </div>
                  <div v-else>
                    <div class="list-toolbar">
                      <el-input
                        v-model="articlesSearch"
                        placeholder="搜索文章"
                        clearable
                        @input="handleArticlesSearch"
                        class="search-input"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                      <div class="sort-buttons">
                        <el-button
                          v-for="sort in [
                            { key: 'created_at', label: '时间' },
                            { key: 'view_count', label: '阅读' },
                            { key: 'like_count', label: '点赞' },
                            { key: 'comment_count', label: '评论' }
                          ]"
                          :key="sort.key"
                          :type="articlesSort === sort.key ? 'primary' : 'default'"
                          text
                          @click="handleArticlesSort(sort.key)"
                          class="sort-btn"
                        >
                          {{ sort.label }}
                          <el-icon v-if="articlesSort === sort.key">
                            <Sort v-if="articlesSortOrder === 'desc'" />
                            <SortUp v-else />
                          </el-icon>
                        </el-button>
                      </div>
                    </div>
                    <div class="article-items">
                      <div
                        v-for="article in articles"
                        :key="article.id"
                        class="article-card"
                        @click="goToArticleDetail(article.id)"
                      >
                        <div class="article-card-content">
                          <h3 class="article-card-title">{{ article.title }}</h3>
                          <p v-if="article.summary" class="article-card-summary">{{ article.summary }}</p>
                          <div class="article-card-meta">
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
                    <div class="pagination-bottom">
                      <el-pagination
                        v-if="articlesPagination.total > 0"
                        v-model:current-page="articlesPagination.page"
                        v-model:page-size="articlesPagination.pageSize"
                        :page-sizes="[5, 10, 20, 50]"
                        :total="articlesPagination.total"
                        layout="total, sizes, prev, pager, next, jumper"
                        @current-change="handleArticlesPageChange"
                        @size-change="handleArticlesPageSizeChange"
                        background
                        class="pagination"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'comments'" class="tab-panel">
                <div class="comments-list">
                  <div v-if="comments.length === 0" class="empty-state">
                    <el-empty description="暂无评论" />
                  </div>
                  <div v-else>
                    <div class="list-toolbar">
                      <el-input
                        v-model="commentsSearch"
                        placeholder="搜索评论"
                        clearable
                        @input="handleCommentsSearch"
                        class="search-input"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                      <div class="sort-buttons">
                        <el-button
                          v-for="sort in [
                            { key: 'created_at', label: '时间' },
                            { key: 'like_count', label: '点赞' }
                          ]"
                          :key="sort.key"
                          :type="commentsSort === sort.key ? 'primary' : 'default'"
                          text
                          @click="handleCommentsSort(sort.key)"
                          class="sort-btn"
                        >
                          {{ sort.label }}
                          <el-icon v-if="commentsSort === sort.key">
                            <Sort v-if="commentsSortOrder === 'desc'" />
                            <SortUp v-else />
                          </el-icon>
                        </el-button>
                      </div>
                    </div>
                    <div class="comment-items">
                      <div
                        v-for="comment in comments"
                        :key="comment.id"
                        class="comment-card"
                        @click="goToArticleDetail(comment.article_id)"
                      >
                        <div class="comment-header">
                          <span class="article-link">在《{{ comment.article_title }}》中评论</span>
                          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                        </div>
                        <div class="comment-content">{{ comment.content }}</div>
                        <div class="comment-footer">
                          <span class="comment-time">
                            <el-icon><Calendar /></el-icon>
                            {{ new Date(comment.created_at).toLocaleString('zh-CN') }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="pagination-bottom">
                      <el-pagination
                        v-if="commentsPagination.total > 0"
                        v-model:current-page="commentsPagination.page"
                        v-model:page-size="commentsPagination.pageSize"
                        :page-sizes="[5, 10, 20, 50]"
                        :total="commentsPagination.total"
                        layout="total, sizes, prev, pager, next, jumper"
                        @current-change="handleCommentsPageChange"
                        @size-change="handleCommentsPageSizeChange"
                        background
                        class="pagination"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'followers'" class="tab-panel">
                <div class="users-list">
                  <div v-if="followers.length === 0" class="empty-state">
                    <el-empty description="暂无订阅者" />
                  </div>
                  <div v-else>
                    <div class="list-toolbar">
                      <el-input
                        v-model="followersSearch"
                        placeholder="搜索订阅者"
                        clearable
                        @input="handleFollowersSearch"
                        class="search-input"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                    </div>
                    <div class="user-items">
                      <div
                        v-for="follower in followers"
                        :key="follower.id"
                        class="user-card"
                      >
                        <div class="user-avatar" @click="goToProfile(follower.id)">
                          <img v-if="follower.avatar" :src="getFullUrl(follower.avatar)" alt="avatar" class="user-avatar-img">
                          <span v-else>{{ (follower.nickname || follower.username)?.charAt(0).toUpperCase() || 'U' }}</span>
                          <span v-if="follower.is_admin === 1" class="avatar-admin-badge">管</span>
                        </div>
                        <div class="user-info" @click="goToProfile(follower.id)">
                          <div class="user-name">{{ follower.nickname || follower.username }}</div>
                          <div class="user-meta">
                            <span class="meta-item">
                              <el-icon><Calendar /></el-icon>
                              已加入 {{ Math.floor((new Date() - new Date(follower.created_at)) / (1000 * 60 * 60 * 24)) }} 天
                            </span>
                            <span class="meta-item">
                              <el-icon><Document /></el-icon>
                              {{ follower.article_count || 0 }} 篇文章
                            </span>
                          </div>
                          <p v-if="follower.bio" class="user-bio">{{ follower.bio }}</p>
                        </div>
                        <div class="user-action" v-if="follower.id !== userStore.userInfo?.id">
                          <el-button
                            :type="follower.isSubscribed ? 'default' : 'primary'"
                            @click.stop="handleToggleSubscription(follower)"
                          >
                            {{ follower.isSubscribed ? '已订阅' : '订阅' }}
                          </el-button>
                        </div>
                        <div class="user-action" v-else>
                          <el-button type="primary" disabled>
                            <el-icon><Check /></el-icon>
                            自己
                          </el-button>
                        </div>
                      </div>
                    </div>
                    <div class="pagination-bottom">
                      <el-pagination
                        v-if="followersPagination.total > 0"
                        v-model:current-page="followersPagination.page"
                        v-model:page-size="followersPagination.pageSize"
                        :page-sizes="[10, 20, 50]"
                        :total="followersPagination.total"
                        layout="total, sizes, prev, pager, next, jumper"
                        @current-change="handleFollowersPageChange"
                        @size-change="handleFollowersPageSizeChange"
                        background
                        class="pagination"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'following'" class="tab-panel">
                <div class="users-list">
                  <div v-if="following.length === 0" class="empty-state">
                    <el-empty description="暂无订阅" />
                  </div>
                  <div v-else>
                    <div class="list-toolbar">
                      <el-input
                        v-model="followingSearch"
                        placeholder="搜索订阅"
                        clearable
                        @input="handleFollowingSearch"
                        class="search-input"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                    </div>
                    <div class="user-items">
                      <div
                        v-for="followingUser in following"
                        :key="followingUser.id"
                        class="user-card"
                      >
                        <div class="user-avatar" @click="goToProfile(followingUser.id)">
                          <img v-if="followingUser.avatar" :src="getFullUrl(followingUser.avatar)" alt="avatar" class="user-avatar-img">
                          <span v-else>{{ (followingUser.nickname || followingUser.username)?.charAt(0).toUpperCase() || 'U' }}</span>
                          <span v-if="followingUser.is_admin === 1" class="avatar-admin-badge">管</span>
                        </div>
                        <div class="user-info" @click="goToProfile(followingUser.id)">
                          <div class="user-name">{{ followingUser.nickname || followingUser.username }}</div>
                          <div class="user-meta">
                            <span class="meta-item">
                              <el-icon><Calendar /></el-icon>
                              已加入 {{ Math.floor((new Date() - new Date(followingUser.created_at)) / (1000 * 60 * 60 * 24)) }} 天
                            </span>
                            <span class="meta-item">
                              <el-icon><Document /></el-icon>
                              {{ followingUser.article_count || 0 }} 篇文章
                            </span>
                          </div>
                          <p v-if="followingUser.bio" class="user-bio">{{ followingUser.bio }}</p>
                        </div>
                        <div class="user-action" v-if="followingUser.id !== userStore.userInfo?.id">
                          <el-button
                            :type="followingUser.isSubscribed ? 'default' : 'primary'"
                            @click.stop="handleToggleSubscription(followingUser)"
                          >
                            {{ followingUser.isSubscribed ? '已订阅' : '订阅' }}
                          </el-button>
                        </div>
                        <div class="user-action" v-else>
                          <el-button type="primary" disabled>
                            <el-icon><Check /></el-icon>
                            自己
                          </el-button>
                        </div>
                      </div>
                    </div>
                    <div class="pagination-bottom">
                      <el-pagination
                        v-if="followingPagination.total > 0"
                        v-model:current-page="followingPagination.page"
                        v-model:page-size="followingPagination.pageSize"
                        :page-sizes="[10, 20, 50]"
                        :total="followingPagination.total"
                        layout="total, sizes, prev, pager, next, jumper"
                        @current-change="handleFollowingPageChange"
                        @size-change="handleFollowingPageSizeChange"
                        background
                        class="pagination"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  min-height: 100%;
  background: #f7f8fa;
}

.back-section {
  margin-bottom: 16px;
  background: white;
  border-radius: 8px;
  padding: 16px 32px;
}

.back-btn {
  color: #4e5969;
  padding: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: #165dff;
  }
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.skeleton-header {
  display: flex;
  gap: 24px;
  padding: 32px;
  background: white;
  margin-bottom: 16px;
  border-radius: 8px;
}

.skeleton-info {
  flex: 1;
}

.skeleton-stats {
  display: flex;
  gap: 40px;
  padding: 20px 32px;
  background: white;
  margin-bottom: 16px;
  border-radius: 8px;
}

.header-section {
  background: white;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  gap: 24px;
  flex: 1;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  overflow: visible;
  position: relative;
}

.avatar-admin-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.username {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  line-height: 1.2;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #86909c;
  margin-bottom: 12px;
}

.meta-divider {
  color: #e5e6eb;
}

.bio {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.website-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #165dff;

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.header-right {
  flex-shrink: 0;
}

.stats-section {
  background: white;
  padding: 20px 32px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.stats-list {
  display: flex;
  align-items: center;
  gap: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 32px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    .stat-value {
      color: #165dff;
    }
  }
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1;
  transition: color 0.2s ease;
}

.stat-label {
  font-size: 14px;
  color: #86909c;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e6eb;
}

.tabs-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  gap: 0;
  padding: 0 32px;
  border-bottom: 1px solid #e5e6eb;
}

.tab-item {
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 500;
  color: #4e5969;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-bottom: 2px solid transparent;

  &:hover {
    color: #165dff;
  }

  &.active {
    color: #165dff;
    border-bottom-color: #165dff;
  }
}

.tabs-content {
  padding: 24px 32px;
}

.tab-panel {
  min-height: 300px;
}

.articles-list,
.comments-list {
  min-height: 200px;
}

.empty-state,
.hidden-state {
  padding: 60px 0;
}

.article-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #165dff;
    box-shadow: 0 2px 8px rgba(22, 93, 255, 0.08);
    transform: translateX(4px);
  }
}

.article-card-content {
  flex: 1;
  min-width: 0;
}

.article-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.article-card-summary {
  font-size: 14px;
  color: #86909c;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #86909c;
  flex-wrap: wrap;
}

.article-card-meta .meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-arrow {
  color: #c9cdd4;
  font-size: 18px;
  flex-shrink: 0;
  transition: all 0.2s ease;

  .article-card:hover & {
    transform: translateX(4px);
    color: #165dff;
  }
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-card {
  padding: 20px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #165dff;
    box-shadow: 0 2px 8px rgba(22, 93, 255, 0.08);
    transform: translateX(4px);
  }
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.article-link {
  color: #86909c;
  font-size: 13px;
}

.arrow-icon {
  color: #c9cdd4;
  font-size: 16px;
  transition: all 0.2s ease;

  .comment-card:hover & {
    transform: translateX(4px);
    color: #165dff;
  }
}

.comment-content {
  font-size: 16px;
  color: #1d2129;
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 12px;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: 16px;
}

.comment-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #86909c;
}

.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 280px;

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 8px 16px;
  }
}

.sort-buttons {
  display: flex;
  gap: 4px;
}

.sort-btn {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.pagination-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e6eb;

  :deep(.el-pagination.is-background .el-pager li.is-active) {
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.users-list {
  min-height: 200px;
}

.user-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #165dff;
    box-shadow: 0 2px 8px rgba(22, 93, 255, 0.08);
  }
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
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: visible;
  position: relative;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
  }
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
}

.user-avatar .avatar-admin-badge {
  position: absolute;
  bottom: -6px;
  right: -6px;
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

.user-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;

  &:hover {
    color: #165dff;
  }
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.user-meta .meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #86909c;
}

.user-bio {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-action {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    padding: 24px;
  }

  .header-left {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .header-right {
    width: 100%;

    .el-button {
      width: 100%;
    }
  }

  .user-name-row {
    justify-content: center;
  }

  .user-meta {
    justify-content: center;
    flex-wrap: wrap;
  }

  .stats-section {
    padding: 16px 20px;
  }

  .stats-list {
    flex-wrap: wrap;
    justify-content: center;
  }

  .stat-item {
    padding: 12px 20px;
  }

  .stat-divider {
    display: none;
  }

  .tabs-header {
    padding: 0 20px;
  }

  .tabs-content {
    padding: 20px;
  }

  .user-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-action {
    width: 100%;
  }

  .user-action .el-button {
    width: 100%;
  }
}
</style>
