<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getArticleById, getComments, createComment, deleteComment, toggleLike, checkLike, toggleCommentLike, checkCommentLikes } from '@/api/articles'
import { toggleSubscription, checkSubscription } from '@/api/subscriptions'
import { useUserStore } from '@/stores/user'
import {
  ArrowLeft,
  Edit,
  View,
  Star,
  PriceTag,
  Share,
  Document,
  TrendCharts,
  Calendar,
  ChatDotRound,
  Delete,
  ChatLineRound,
  Warning
} from '@element-plus/icons-vue'
import { getFullUrl } from '@/utils/url'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const article = ref(null)
const comments = ref([])
const commentsLoading = ref(false)
const commentInput = ref('')
const submittingComment = ref(false)
const isLiked = ref(false)
const liking = ref(false)
const replyingTo = ref(null)
const replyInput = ref('')
const submittingReply = ref(false)
const commentsPagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})
const sortBy = ref('created_at')
const order = ref('desc')
const likedComments = ref([])
const likingComment = ref({})
const isSubscribed = ref(false)
const subscribing = ref(false)

const fetchArticle = async () => {
  try {
    loading.value = true
    const res = await getArticleById(route.params.id)
    article.value = res
    await checkSubscriptionStatus()
  } catch (error) {
    console.error('获取文章失败:', error)
    ElMessage.error('获取文章失败')
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    commentsLoading.value = true
    const res = await getComments(route.params.id, {
      page: commentsPagination.value.page,
      pageSize: commentsPagination.value.pageSize,
      sortBy: sortBy.value,
      order: order.value
    })
    comments.value = res.comments
    commentsPagination.value.total = res.total
    await fetchCommentLikes()
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    commentsLoading.value = false
  }
}

const fetchCommentLikes = async () => {
  try {
    const res = await checkCommentLikes(route.params.id)
    likedComments.value = res.likedComments || []
  } catch (error) {
    console.error('获取评论点赞失败:', error)
  }
}

const checkLikeStatus = async () => {
  if (!userStore.userInfo) return
  try {
    const res = await checkLike(route.params.id)
    isLiked.value = res.liked
  } catch (error) {
    console.error('检查点赞状态失败:', error)
  }
}

const checkSubscriptionStatus = async () => {
  if (!userStore.userInfo || !article.value) return
  if (userStore.userInfo.id === article.value.author_id) return
  try {
    const res = await checkSubscription(article.value.author_id)
    isSubscribed.value = res.isSubscribed
  } catch (error) {
    console.error('检查订阅状态失败:', error)
  }
}

const handleToggleLike = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    liking.value = true
    const res = await toggleLike(route.params.id)
    isLiked.value = res.liked
    if (article.value) {
      article.value.like_count = res.like_count
    }
  } catch (error) {
    console.error('点赞失败:', error)
  } finally {
    liking.value = false
  }
}

const handleToggleSubscribe = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    subscribing.value = true
    const res = await toggleSubscription(article.value.author_id)
    isSubscribed.value = res.isSubscribed
  } catch (error) {
    console.error('订阅失败:', error)
  } finally {
    subscribing.value = false
  }
}

const handleSubmitComment = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  if (!commentInput.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  try {
    submittingComment.value = true
    await createComment(route.params.id, { content: commentInput.value })
    ElMessage.success('评论成功')
    commentInput.value = ''
    commentsPagination.value.page = 1
    await fetchComments()
  } catch (error) {
    console.error('评论失败:', error)
    ElMessage.error('评论失败')
  } finally {
    submittingComment.value = false
  }
}

const handleDeleteComment = async (commentId) => {
  try {
    await deleteComment(commentId)
    ElMessage.success('删除成功')
    await fetchComments()
  } catch (error) {
    console.error('删除评论失败:', error)
    ElMessage.error('删除失败')
  }
}

const handleToggleCommentLike = async (commentId) => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    likingComment.value[commentId] = true
    const res = await toggleCommentLike(commentId)
    if (res.liked) {
      likedComments.value.push(commentId)
    } else {
      const index = likedComments.value.indexOf(commentId)
      if (index > -1) {
        likedComments.value.splice(index, 1)
      }
    }
    const comment = comments.value.find(c => c.id === commentId)
    if (comment) {
      comment.like_count = res.like_count
    }
  } catch (error) {
    console.error('点赞评论失败:', error)
  } finally {
    likingComment.value[commentId] = false
  }
}

const handleSortChange = (field) => {
  if (sortBy.value === field) {
    order.value = order.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortBy.value = field
    order.value = 'desc'
  }
  commentsPagination.value.page = 1
  fetchComments()
}

const goBack = () => {
  router.back()
}

const goToEdit = () => {
  router.push(`/article/edit/${route.params.id}`)
}

const goToReport = () => {
  router.push(`/report/article/${route.params.id}`)
}

onMounted(() => {
  fetchArticle()
  fetchComments()
  checkLikeStatus()
  checkSubscriptionStatus()
})
</script>

<template>
  <div class="article-detail-page" v-loading="loading">
    <div class="detail-header" v-if="article">
      <div class="header-inner">
        <el-button @click="goBack" circle class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="header-actions">
          <template v-if="userStore.userInfo?.id === article.author_id">
            <el-button @click="goToEdit" type="primary" size="large" class="edit-btn">
              <el-icon><Edit /></el-icon>
              编辑文章
            </el-button>
          </template>
          <template v-else>
            <el-button @click="goToReport" type="danger" size="large" class="report-btn">
              <el-icon><Warning /></el-icon>
              举报
            </el-button>
          </template>
        </div>
      </div>
    </div>

    <div class="article-container" v-if="article">
      <div class="article-main">
        <div class="article-content">
          <div class="article-meta-top">
            <el-tag v-if="article.category_name" size="large" type="info" class="category-tag">
              {{ article.category_name }}
            </el-tag>
            <div class="meta-info">
              <span class="publish-date">
                <el-icon><Calendar /></el-icon>
                {{ new Date(article.created_at).toLocaleDateString('zh-CN') }}
              </span>
            </div>
          </div>

          <h1 class="article-title">{{ article.title }}</h1>

          <div class="article-stats">
            <span><el-icon><View /></el-icon> {{ article.view_count }} 阅读</span>
            <span><el-icon><Star /></el-icon> {{ article.like_count }} 点赞</span>
            <span><el-icon><ChatDotRound /></el-icon> {{ commentsPagination.total }} 评论</span>
            <span v-if="article.tags?.length"><el-icon><PriceTag /></el-icon> {{ article.tags.join(', ') }}</span>
          </div>

          <div class="article-body">
            <p v-if="article.summary" class="article-summary">{{ article.summary }}</p>
            <div class="article-text">
              <pre class="content-display">{{ article.content }}</pre>
            </div>
          </div>
        </div>

        <div class="article-actions">
          <el-button
            size="large"
            :class="['action-btn', 'like-btn', { liked: isLiked }]"
            :loading="liking"
            @click="handleToggleLike"
          >
            <el-icon><Star /></el-icon>
            {{ isLiked ? '已点赞' : '点赞' }}
          </el-button>
          <el-button size="large" class="action-btn share-btn">
            <el-icon><Share /></el-icon>
            分享
          </el-button>
        </div>

        <div class="comments-section">
          <div class="section-header">
            <h3 class="section-title">
              <el-icon><ChatDotRound /></el-icon>
              评论 ({{ commentsPagination.total }})
            </h3>
            <div class="sort-buttons">
              <el-button
                link
                :type="sortBy === 'created_at' ? 'primary' : 'info'"
                @click="handleSortChange('created_at')"
              >
                时间{{ sortBy === 'created_at' ? (order === 'desc' ? ' ↓' : ' ↑') : '' }}
              </el-button>
              <el-button
                link
                :type="sortBy === 'like_count' ? 'primary' : 'info'"
                @click="handleSortChange('like_count')"
              >
                热度{{ sortBy === 'like_count' ? (order === 'desc' ? ' ↓' : ' ↑') : '' }}
              </el-button>
            </div>
          </div>

          <div class="comment-input-section" v-if="userStore.userInfo">
            <el-input
              v-model="commentInput"
              type="textarea"
              :rows="3"
              placeholder="写下你的评论..."
              class="comment-textarea"
            />
            <el-button
              type="primary"
              size="large"
              :loading="submittingComment"
              @click="handleSubmitComment"
              class="submit-comment-btn"
            >
              发表评论
            </el-button>
          </div>

          <div class="comments-list" v-loading="commentsLoading">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <div class="comment-author">
                  <el-avatar :size="40" class="author-avatar">
                    {{ comment.author?.username?.charAt(0)?.toUpperCase() || 'U' }}
                  </el-avatar>
                  <div class="author-info">
                    <span class="author-name">{{ comment.author?.username || '匿名用户' }}</span>
                    <span class="comment-time">{{ new Date(comment.created_at).toLocaleString('zh-CN') }}</span>
                  </div>
                </div>
                <div class="comment-actions">
                  <el-button
                    link
                    :type="likedComments.includes(comment.id) ? 'primary' : 'info'"
                    :loading="likingComment[comment.id]"
                    @click="handleToggleCommentLike(comment.id)"
                    class="like-comment-btn"
                  >
                    <el-icon><Star /></el-icon>
                    {{ comment.like_count }}
                  </el-button>
                  <template v-if="userStore.userInfo?.id === comment.author_id">
                    <el-button
                      link
                      type="danger"
                      @click="handleDeleteComment(comment.id)"
                      class="delete-comment-btn"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </div>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
            </div>

            <el-pagination
              v-if="commentsPagination.total > commentsPagination.pageSize"
              v-model:current-page="commentsPagination.page"
              v-model:page-size="commentsPagination.pageSize"
              :total="commentsPagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="fetchComments"
              @current-change="fetchComments"
              class="comments-pagination"
            />
          </div>
        </div>
      </div>

      <div class="article-sidebar">
        <div class="author-card">
          <div class="author-avatar-large">
            <el-avatar :size="80">
              {{ article.author?.username?.charAt(0)?.toUpperCase() || 'U' }}
            </el-avatar>
          </div>
          <div class="author-name-large">{{ article.author?.username || '匿名用户' }}</div>
          <p class="author-bio">探索技术的无限可能</p>
          <template v-if="userStore.userInfo && userStore.userInfo.id !== article.author_id">
            <el-button
              :type="isSubscribed ? 'info' : 'primary'"
              size="large"
              :loading="subscribing"
              @click="handleToggleSubscribe"
              class="subscribe-btn"
            >
              {{ isSubscribed ? '已订阅' : '订阅作者' }}
            </el-button>
          </template>
        </div>

        <div class="article-info-card">
          <div class="card-title">
            <el-icon><Document /></el-icon>
            文章数据
          </div>
          <div class="info-stats">
            <div class="stat-item">
              <div class="stat-value">{{ article.view_count }}</div>
              <div class="stat-label">阅读量</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ article.like_count }}</div>
              <div class="stat-label">点赞数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.article-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f8fa 0%, #ffffff 100%);
  padding-bottom: 60px;
}

.detail-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e6eb;
  padding: 24px 0;
  margin-bottom: 32px;

  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .back-btn {
    border: 1px solid #e5e6eb;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .edit-btn,
  .report-btn {
    border-radius: 10px;
  }
}

.article-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
}

.article-main {
  min-width: 0;
}

.article-content {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.article-meta-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  .category-tag {
    border-radius: 8px;
    font-weight: 500;
  }

  .meta-info {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #86909c;
    font-size: 14px;

    span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}

.article-title {
  font-size: 36px;
  font-weight: 700;
  color: #1d2129;
  margin: 0 0 20px 0;
  line-height: 1.3;
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid #e5e6eb;
  flex-wrap: wrap;

  span {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4e5969;
    font-size: 15px;

    .el-icon {
      color: #86909c;
    }
  }
}

.article-body {
  .article-summary {
    background: linear-gradient(135deg, #f7f8fa 0%, #f0f3ff 100%);
    border-left: 4px solid #165dff;
    padding: 20px 24px;
    border-radius: 0 12px 12px 0;
    color: #4e5969;
    font-size: 15px;
    line-height: 1.8;
    margin-bottom: 32px;
  }

  .article-text {
    font-size: 16px;
    color: #1d2129;
    line-height: 1.9;

    .content-display {
      background: #f7f8fa;
      padding: 20px;
      border-radius: 12px;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: 'Fira Code', 'Consolas', monospace;
      margin: 0;
    }
  }
}

.article-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;

  .action-btn {
    flex: 1;
    border-radius: 12px;
    height: 52px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
  }

  .like-btn {
    border: 1px solid #e5e6eb;

    &.liked {
      background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
      border: none;
      color: #ffffff;

      .el-icon {
        color: #ffffff;
      }
    }

    &:hover:not(.liked) {
      border-color: #165dff;
      color: #165dff;

      .el-icon {
        color: #165dff;
      }
    }
  }

  .share-btn {
    border: 1px solid #e5e6eb;

    &:hover {
      border-color: #165dff;
      color: #165dff;

      .el-icon {
        color: #165dff;
      }
    }
  }
}

.comments-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #1d2129;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sort-buttons {
    display: flex;
    gap: 8px;
  }
}

.comment-input-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e6eb;

  .comment-textarea {
    margin-bottom: 16px;

    :deep(.el-textarea__inner) {
      border-radius: 12px;
      padding: 16px;
      font-size: 15px;
      line-height: 1.7;
      resize: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
  }

  .submit-comment-btn {
    border-radius: 10px;
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);
  }
}

.comments-list {
  .comment-item {
    padding: 20px 0;
    border-bottom: 1px solid #f2f3f5;

    &:last-child {
      border-bottom: none;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      .comment-author {
        display: flex;
        align-items: center;
        gap: 12px;

        .author-avatar {
          background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
        }

        .author-info {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .author-name {
            font-size: 15px;
            font-weight: 600;
            color: #1d2129;
          }

          .comment-time {
            font-size: 13px;
            color: #86909c;
          }
        }
      }

      .comment-actions {
        display: flex;
        gap: 8px;

        .like-comment-btn,
        .delete-comment-btn {
          padding: 4px 8px;
          font-size: 13px;
        }
      }
    }

    .comment-content {
      font-size: 15px;
      color: #4e5969;
      line-height: 1.8;
      padding-left: 52px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  .comments-pagination {
    margin-top: 32px;
    display: flex;
    justify-content: center;
  }
}

.article-sidebar {
  min-width: 0;
  position: sticky;
  top: 24px;
  height: fit-content;
}

.author-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  text-align: center;

  .author-avatar-large {
    margin-bottom: 16px;

    .el-avatar {
      background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
      font-weight: 600;
      font-size: 32px;
    }
  }

  .author-name-large {
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
    margin: 0 0 8px 0;
  }

  .author-bio {
    color: #86909c;
    font-size: 14px;
    margin: 0 0 20px 0;
  }

  .subscribe-btn {
    width: 100%;
    border-radius: 10px;

    &:not(.el-button--info) {
      background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);
    }
  }
}

.article-info-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e6eb;
  }

  .info-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    .stat-item {
      text-align: center;
      padding: 16px;
      background: #f7f8fa;
      border-radius: 12px;

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #165dff;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 13px;
        color: #86909c;
      }
    }
  }
}

@media (max-width: 992px) {
  .article-container {
    grid-template-columns: 1fr;
  }

  .article-sidebar {
    order: -1;
    position: static;
  }
}

@media (max-width: 768px) {
  .article-detail-page {
    padding-bottom: 40px;
  }

  .detail-header {
    padding: 16px 0;
    margin-bottom: 20px;

    .header-inner {
      padding: 0 16px;
    }
  }

  .article-container {
    padding: 0 16px;
    gap: 20px;
  }

  .article-content {
    padding: 24px;
  }

  .article-title {
    font-size: 26px;
  }

  .comments-section {
    padding: 24px;
  }

  .author-card,
  .article-info-card {
    padding: 20px;
  }
}
</style>
