<script setup>
// 客户端首页组件
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Document,
  ArrowRight,
  View,
  Star,
  ChatDotRound,
  Trophy,
  Calendar
} from '@element-plus/icons-vue'
import { getArticles } from '@/api/articles'
import { getFullUrl } from '@/utils/url'
import UserAvatar from '@/components/Common/UserAvatar.vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const recentArticles = ref([])
const hotArticles = ref([])
const currentIndex = ref(0)
const texts = ref(['无限可能', '知识海洋', '创作社区', '技术分享'])
const currentText = computed(() => texts.value[currentIndex.value])
const stats = ref({
  articles: 0,
  authors: 0,
  views: 0
})

// 文字轮播效果
const startTextAnimation = () => {
  setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % texts.value.length
  }, 2000)
}

// 启动数字动画
const startNumberAnimation = () => {
  let articleCount = 0
  const articleTimer = setInterval(() => {
    articleCount += 10
    if (articleCount >= 1000) {
      articleCount = 1000
      clearInterval(articleTimer)
    }
    stats.value.articles = articleCount
  }, 20)

  let authorCount = 0
  const authorTimer = setInterval(() => {
    authorCount += 5
    if (authorCount >= 500) {
      authorCount = 500
      clearInterval(authorTimer)
    }
    stats.value.authors = authorCount
  }, 20)

  let viewCount = 0
  const viewTimer = setInterval(() => {
    viewCount += 1000
    if (viewCount >= 100000) {
      viewCount = 100000
      clearInterval(viewTimer)
    }
    stats.value.views = viewCount
  }, 20)
}

// 获取最新文章
const fetchRecentArticles = async () => {
  try {
    loading.value = true
    const res = await getArticles({ page: 1, pageSize: 6, sortBy: 'created_at', order: 'desc' })
    recentArticles.value = res.articles || []
  } catch (error) {
    console.error('获取最新文章失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取热门文章
const fetchHotArticles = async () => {
  try {
    const res = await getArticles({ page: 1, pageSize: 5, sortBy: 'view_count', order: 'desc' })
    hotArticles.value = res.articles || []
  } catch (error) {
    console.error('获取热门文章失败:', error)
  }
}

// 跳转到文章详情
const goToArticleDetail = (id) => {
  router.push(`/article/${id}`)
}

// 跳转到文章中心
const goToArticles = () => {
  router.push('/articles')
}

// 滚动到内容区域
const scrollToContent = () => {
  const contentSection = document.querySelector('.content-section')
  if (contentSection) {
    contentSection.scrollIntoView({ behavior: 'smooth' })
  }
}

// 截断文本
const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

onMounted(() => {
  fetchRecentArticles()
  fetchHotArticles()
  startTextAnimation()
  startNumberAnimation()
})
</script>

<template>
  <div class="client-home-page">
    <!-- Hero 区域 - 全屏 -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="hero-grid"></div>
        <div class="hero-glow hero-glow-1"></div>
        <div class="hero-glow hero-glow-2"></div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            探索知识的无限可能
          </div>

          <h1 class="hero-title">
            <span class="title-line">连接创作者</span>
            <span class="title-line">
              发现
              <span class="highlight" v-text="currentText"></span>
            </span>
          </h1>

          <p class="hero-subtitle">
            PTStack 是一个现代化的内容分享平台，汇聚优质文章，连接志同道合的创作者
          </p>

          <div class="hero-actions">
            <el-button type="primary" size="large" class="action-btn primary" @click="goToArticles">
              <template #default>
                <el-icon class="btn-icon"><Document /></el-icon>
                <span class="btn-text">浏览文章</span>
                <el-icon class="btn-arrow"><ArrowRight /></el-icon>
              </template>
            </el-button>
            <el-button size="large" class="action-btn secondary" v-if="!userStore.isLoggedIn" @click="$router.push('/register')">
              <template #default>
                <span class="btn-text">立即注册</span>
              </template>
            </el-button>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-value">{{ stats.articles }}+</div>
              <div class="stat-label">优质文章</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.authors }}+</div>
              <div class="stat-label">活跃作者</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">{{ (stats.views / 10000).toFixed(1) }}万+</div>
              <div class="stat-label">累计阅读</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 滚动提示 -->
      <div class="scroll-indicator" @click="scrollToContent">
        <div class="scroll-text">向下滚动</div>
        <div class="scroll-arrow">↓</div>
      </div>
    </section>

    <!-- 内容区域 -->
    <section class="content-section">
      <div class="content-container">
        <div class="content-grid">
          <!-- 左侧：最新文章 -->
          <div class="content-main">
            <div class="section-card">
              <div class="section-header">
                <div class="section-title">
                  <div class="title-icon">
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
                  <div class="empty-desc">敬请期待精彩内容</div>
                </div>
                <div v-else>
                  <div
                    v-for="article in recentArticles"
                    :key="article.id"
                    class="article-item"
                    @click="goToArticleDetail(article.id)"
                  >
                    <div class="article-cover" v-if="article.cover">
                      <img :src="getFullUrl(article.cover)" alt="cover">
                    </div>
                    <div class="article-content">
                      <div class="article-title">{{ article.title }}</div>
                      <div v-if="article.summary" class="article-summary">{{ truncateText(article.summary, 100) }}</div>
                      <div class="article-meta">
                        <span class="meta-item author">
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
                          <span>{{ article.author_nickname || article.author_name }}</span>
                        </span>
                        <span class="meta-item">
                          <el-icon><Calendar /></el-icon>
                          {{ new Date(article.created_at).toLocaleDateString('zh-CN') }}
                        </span>
                        <span class="meta-item">
                          <el-icon><View /></el-icon>
                          {{ article.view_count || 0 }}
                        </span>
                        <span class="meta-item">
                          <el-icon><Star /></el-icon>
                          {{ article.like_count || 0 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：热门文章 -->
          <div class="content-sidebar">
            <div class="section-card">
              <div class="section-header">
                <div class="section-title">
                  <div class="title-icon hot">
                    <el-icon><Trophy /></el-icon>
                  </div>
                  <div class="title-text">
                    <div class="title-main">热门文章</div>
                    <div class="title-sub">最受欢迎的内容</div>
                  </div>
                </div>
              </div>

              <div class="hot-articles-list" v-loading="loading">
                <div v-if="hotArticles.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <el-icon :size="32"><Trophy /></el-icon>
                  </div>
                  <div class="empty-text">暂无热门文章</div>
                </div>
                <div v-else>
                  <div
                    v-for="(article, index) in hotArticles"
                    :key="article.id"
                    class="hot-article-item"
                    @click="goToArticleDetail(article.id)"
                  >
                    <div class="hot-rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                    <div class="hot-content">
                      <div class="hot-title">{{ truncateText(article.title, 50) }}</div>
                      <div class="hot-meta">
                        <span class="hot-meta-item">
                          <el-icon><View /></el-icon>
                          {{ article.view_count || 0 }}
                        </span>
                        <span class="hot-meta-item">
                          <el-icon><ChatDotRound /></el-icon>
                          {{ article.comment_count || 0 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
// 变量定义
$primary-color: #165dff;
$secondary-color: #722ed1;
$accent-color: #ff7d00;
$bg-dark: #0a0a0f;
$bg-light: #f7f8fa;
$text-light: rgba(255, 255, 255, 0.6);
$text-muted: #86909c;
$border-light: #f2f3f5;

.client-home-page {
  min-height: 100vh;

  // Hero 区域 - 全屏
  .hero-section {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: $bg-dark;

    // 动态背景
    .hero-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;

      .hero-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba($primary-color, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba($primary-color, 0.03) 1px, transparent 1px);
        background-size: 60px 60px;
        animation: gridMove 20s linear infinite;
      }

      .hero-glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.5;
        animation: pulse 4s ease-in-out infinite;

        &-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba($primary-color, 0.4) 0%, transparent 70%);
          top: -200px;
          right: -100px;
          animation-delay: 0s;
        }

        &-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba($secondary-color, 0.3) 0%, transparent 70%);
          bottom: -150px;
          left: -100px;
          animation-delay: 2s;
        }
      }
    }

    // Hero 内容
    .hero-container {
      position: relative;
      z-index: 1;
      max-width: 900px;
      margin: 0 auto;
      padding: 120px 24px 100px;
      text-align: center;

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        background: rgba($primary-color, 0.1);
        border: 1px solid rgba($primary-color, 0.2);
        border-radius: 100px;
        color: $primary-color;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 32px;
        animation: fadeInDown 0.8s ease-out;

        .badge-dot {
          width: 8px;
          height: 8px;
          background: $primary-color;
          border-radius: 50%;
          animation: blink 2s ease-in-out infinite;
        }
      }

      .hero-title {
        margin: 0 0 24px;

        .title-line {
          display: block;
          font-size: 64px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -2px;

          &:first-child {
            animation: fadeInUp 0.8s ease-out 0.2s both;
          }

          &:last-child {
            animation: fadeInUp 0.8s ease-out 0.4s both;
          }
        }

        .highlight {
          background: linear-gradient(135deg, $primary-color 0%, $secondary-color 50%, $primary-color 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease infinite, fadeIn 0.5s ease-in-out;
        }
      }

      .hero-subtitle {
        font-size: 18px;
        color: $text-light;
        line-height: 1.8;
        max-width: 560px;
        margin: 0 auto 40px;
        animation: fadeInUp 0.8s ease-out 0.6s both;
      }

      // 按钮
      .hero-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        align-items: center;
        margin-bottom: 60px;
        animation: fadeInUp 0.8s ease-out 0.8s both;

        // 修复Element Plus默认的按钮间距问题
        .el-button + .el-button {
          margin-left: 0 !important;
        }

        .action-btn {
          min-width: 160px;
          height: 48px;
          font-size: 16px;
          font-weight: 500;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          &.primary {
            background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
            border: none;
            box-shadow: 0 4px 20px rgba($primary-color, 0.3);

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 30px rgba($primary-color, 0.4);
            }
          }

          &.secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;

            &:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: rgba(255, 255, 255, 0.2);
            }
          }
        }
      }

      // 统计数据
      .hero-stats {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 48px;
        animation: fadeInUp 0.8s ease-out 1s both;

        .stat-item {
          text-align: center;

          .stat-value {
            font-size: 36px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 4px;
            background: linear-gradient(135deg, #fff 0%, #a8c5ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .stat-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5);
          }
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    // 滚动提示
    .scroll-indicator {
      position: absolute;
      bottom: 40px;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.4);
      animation: fadeInUp 0.8s ease-out 1.2s both;
      transition: color 0.3s;
      text-align: center;
      width: 100%;
      max-width: 100px;
      margin: 0 auto;

      &:hover {
        color: rgba(255, 255, 255, 0.8);
      }

      .scroll-text {
        font-size: 12px;
        letter-spacing: 2px;
        text-transform: uppercase;
        white-space: nowrap;
        text-align: center;
        width: 100%;
      }

      .scroll-arrow {
        font-size: 20px;
        animation: bounce 2s infinite;
        text-align: center;
        width: 100%;
        line-height: 1;
        display: block;
        margin: 0 auto;
      }
    }
  }

  // 内容区域
  .content-section {
    background: $bg-light;
    padding: 80px 0;

    .content-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;

      .content-grid {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 24px;

        .content-main,
        .content-sidebar {
          min-height: 400px;
        }
      }
    }
  }

  // 卡片样式
  .section-card {
    background: #fff;
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      .section-title {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .title-icon {
          width: 44px;
          height: 44px;
          background: rgba($primary-color, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: $primary-color;
          font-size: 22px;

          &.hot {
            background: rgba($accent-color, 0.1);
            color: $accent-color;
          }
        }

        .title-text {
          .title-main {
            font-size: 20px;
            font-weight: 600;
            color: #1d2129;
            margin-bottom: 4px;
          }

          .title-sub {
            font-size: 13px;
            color: $text-muted;
          }
        }
      }

      .view-all-btn {
        color: $primary-color;
      }
    }
  }

  // 文章列表
  .articles-list {
    min-height: 200px;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: $text-muted;

      .empty-icon {
        margin-bottom: 16px;
        color: #c9cdd4;
      }

      .empty-text {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .empty-desc {
        font-size: 14px;
      }
    }

    .article-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      border-bottom: 1px solid $border-light;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: $bg-light;
        transform: translateX(4px);
      }

      .article-cover {
        width: 160px;
        height: 100px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .article-content {
        flex: 1;
        min-width: 0;

        .article-title {
          font-size: 16px;
          font-weight: 600;
          color: #1d2129;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .article-summary {
          font-size: 14px;
          color: #4e5969;
          line-height: 1.6;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .article-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            color: $text-muted;

            &.author {
              color: #4e5969;
              font-weight: 500;

              .author-avatar {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                object-fit: cover;
                background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 10px;
              }
            }
          }
        }
      }
    }
  }

  // 热门文章列表
  .hot-articles-list {
    min-height: 200px;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: $text-muted;

      .empty-icon {
        margin-bottom: 16px;
        color: #c9cdd4;
      }

      .empty-text {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
      }
    }

    .hot-article-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 0;
      cursor: pointer;
      transition: all 0.3s;
      border-bottom: 1px solid $border-light;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: $bg-light;
        margin: 0 -12px;
        padding-left: 12px;
        padding-right: 12px;
        border-radius: 8px;
      }

      .hot-rank {
        width: 28px;
        height: 28px;
        background: $border-light;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        color: $text-muted;
        flex-shrink: 0;

        &.top {
          background: linear-gradient(135deg, $accent-color 0%, #ff9a2e 100%);
          color: #fff;
        }
      }

      .hot-content {
        flex: 1;
        min-width: 0;

        .hot-title {
          font-size: 14px;
          font-weight: 500;
          color: #1d2129;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .hot-meta {
          display: flex;
          gap: 12px;

          .hot-meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: $text-muted;
          }
        }
      }
    }
  }

  // 按钮内容样式
  :deep(.action-btn) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;

    .btn-icon {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin-right: 1px !important;
      font-size: 16px !important;
      line-height: 1 !important;
    }

    .btn-text {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 16px !important;
      line-height: 1 !important;
    }

    .btn-arrow {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin-left: 4px !important;
      font-size: 14px !important;
      line-height: 1 !important;
      transition: transform 0.3s;
    }

    .el-icon {
      vertical-align: middle !important;
      line-height: 1 !important;
      font-size: inherit !important;
    }

    &:hover .btn-arrow {
      transform: translateX(4px);
    }
  }

  // 动画定义
  @keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(60px, 60px); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.7; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes gradientShift {
    0% { background-position: 0% center; }
    50% { background-position: 100% center; }
    100% { background-position: 0% center; }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }

  // 响应式适配
  @media (max-width: 992px) {
    .content-section .content-container .content-grid {
      grid-template-columns: 1fr;
    }

    .hero-section .hero-container .hero-title .title-line {
      font-size: 48px;
    }

    .hero-section .hero-container .hero-stats {
      gap: 32px;

      .stat-divider {
        display: none;
      }
    }
  }

  @media (max-width: 768px) {
    .hero-section .hero-container {
      padding: 100px 16px 80px;
    }

    .hero-section .hero-container .hero-title .title-line {
      font-size: 36px;
      letter-spacing: -1px;
    }

    .hero-section .hero-container .hero-subtitle {
      font-size: 16px;
    }

    .hero-section .hero-container .hero-actions {
      flex-direction: column;
      align-items: center;

      .action-btn {
        width: 100%;
        max-width: 280px;
      }
    }

    .hero-section .hero-container .hero-stats {
      flex-direction: column;
      gap: 24px;

      .stat-value {
        font-size: 28px;
      }
    }

    .hero-section .scroll-indicator {
      bottom: 20px;
    }

    .content-section {
      padding: 60px 0;
    }

    .content-section .content-container {
      padding: 0 16px;
    }

    .section-card {
      padding: 20px;
    }

    .articles-list .article-item {
      flex-direction: column;

      .article-cover {
        width: 100%;
        height: 160px;
      }
    }
  }

  @media (max-width: 480px) {
    .hero-section .hero-container .hero-stats {
      gap: 16px;

      .stat-value {
        font-size: 20px;
      }

      .stat-label {
        font-size: 11px;
      }
    }

    .hero-section .scroll-indicator {
      bottom: 16px;

      .scroll-text {
        font-size: 10px;
      }

      .scroll-arrow {
        font-size: 16px;
      }
    }
  }
}
</style>
