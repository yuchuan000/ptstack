<script setup>
// 文章详情页面组件
// 功能：展示文章内容、评论、点赞、分享等互动功能
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  getArticleById,
  getComments,
  createComment,
  deleteComment,
  toggleLike,
  checkLike,
  toggleCommentLike,
  checkCommentLikes,
  shareArticle,
} from '@/api/articles'
import { checkSubscription } from '@/api/subscriptions'
import { useUserStore } from '@/stores/user'
import { ElLoading } from 'element-plus'
import {
  ArrowLeft,
  ArrowUp,
  Edit,
  View,
  Star,
  StarFilled,
  PriceTag,
  Share,
  Document,
  Picture,
  Calendar,
  ChatDotRound,
  Delete,
  ChatLineRound,
  Warning,
  More,
  Loading,
} from '@element-plus/icons-vue'
import { getFullUrl } from '@/utils/url'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { MdPreview } from 'md-editor-v3'
import MentionText from '@/components/MentionText/MentionText.vue'
import MentionInput from '@/components/MentionInput/MentionInput.vue'
import { decodeMarkdownCodeBlocks } from '@/utils/markdownCodeBlock'
import { computed } from 'vue'
import UserAvatar from '@/components/Common/UserAvatar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const decodedContent = computed(() => {
  if (!article.value?.content) return ''
  return decodeMarkdownCodeBlocks(article.value.content)
})

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
  pageSize: 10,
  total: 0,
})
const sortBy = ref('created_at')
const order = ref('desc')
const likedComments = ref([])
const likingComment = ref({})
const isSubscribed = ref(false)
const loadingMoreComments = ref(false)
const loadMoreError = ref(false)
const wechatShareDialogVisible = ref(false)
const wechatQrcodeUrl = ref('')
const posterRef = ref(null)
const expandedReplies = ref({})
const commentMentions = ref([])
const replyMentions = ref([])
const scrollTop = ref(0)

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

const fetchComments = async (isLoadMore = false) => {
  try {
    if (isLoadMore) {
      loadingMoreComments.value = true
    } else {
      commentsLoading.value = true
    }
    const res = await getComments(route.params.id, {
      page: commentsPagination.value.page,
      pageSize: commentsPagination.value.pageSize,
      sortBy: sortBy.value,
      order: order.value,
    })
    if (isLoadMore) {
      comments.value = [...comments.value, ...res.comments]
    } else {
      comments.value = res.comments
    }
    commentsPagination.value.total = res.total
    commentsPagination.value.topLevelTotal = res.topLevelTotal || res.total
    loadMoreError.value = false
    await fetchCommentLikes()
  } catch (error) {
    console.error('获取评论失败:', error)
    if (isLoadMore) {
      loadMoreError.value = true
    }
  } finally {
    commentsLoading.value = false
    loadingMoreComments.value = false
  }
}

const handleLoadMore = async () => {
  if (loadingMoreComments.value) return
  commentsPagination.value.page += 1
  await fetchComments(true)
}

const handleRetryLoadMore = () => {
  loadMoreError.value = false
  handleLoadMore()
}

const handleScroll = () => {
  if (loadingMoreComments.value || loadMoreError.value) return
  const topLevelTotal = commentsPagination.value.topLevelTotal || commentsPagination.value.total
  if (comments.value.length >= topLevelTotal) return

  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
  scrollTop.value = currentScrollTop

  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight

  if (currentScrollTop + clientHeight >= scrollHeight - 300) {
    handleLoadMore()
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
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
    if (res.liked) {
      ElMessage.success('点赞成功')
    } else {
      ElMessage.success('已取消点赞')
    }
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    liking.value = false
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
    await createComment(route.params.id, {
      content: commentInput.value,
      mentions: commentMentions.value,
    })
    ElMessage.success('评论成功')
    commentInput.value = ''
    commentMentions.value = []
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
      ElMessage.success('点赞成功')
    } else {
      const index = likedComments.value.indexOf(commentId)
      if (index > -1) {
        likedComments.value.splice(index, 1)
      }
      ElMessage.success('已取消点赞')
    }
    const targetComment = findCommentById(commentId)
    if (targetComment) {
      targetComment.like_count = res.like_count
    }
  } catch (error) {
    console.error('点赞评论失败:', error)
    ElMessage.error('操作失败，请稍后重试')
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

const handleReply = (comment) => {
  replyingTo.value = comment
  replyInput.value = ''
}

const handleCancelReply = () => {
  replyingTo.value = null
  replyInput.value = ''
}

const handleCommentAction = (command, comment) => {
  switch (command) {
    case 'reply':
      handleReply(comment)
      break
    case 'like':
      handleToggleCommentLike(comment.id)
      break
    case 'delete':
      handleDeleteComment(comment.id)
      break
  }
}

const findCommentById = (commentId) => {
  for (let comment of comments.value) {
    if (comment.id === commentId) {
      return comment
    }
    if (comment.replies) {
      for (let reply of comment.replies) {
        if (reply.id === commentId) {
          return reply
        }
      }
    }
  }
  return null
}

const getTopLevelCommentId = (comment) => {
  let topLevelId = comment.id
  let tempComment = comment
  while (tempComment.parent_id) {
    let parentComment = comments.value.find((c) => c.id === tempComment.parent_id)
    if (parentComment) {
      topLevelId = parentComment.id
      tempComment = parentComment
    } else {
      let foundInReplies = false
      for (let c of comments.value) {
        if (c.replies) {
          parentComment = c.replies.find((r) => r.id === tempComment.parent_id)
          if (parentComment) {
            topLevelId = c.id
            tempComment = c
            foundInReplies = true
            break
          }
        }
      }
      if (!foundInReplies) {
        break
      }
    }
  }
  return topLevelId
}

const getVisibleReplies = (comment) => {
  if (!comment.replies || comment.replies.length === 0) return []
  const expandedCount = expandedReplies.value[comment.id] || 0
  const showCount = 2 + expandedCount * 5
  return comment.replies.slice(0, showCount)
}

const hasMoreReplies = (comment) => {
  if (!comment.replies || comment.replies.length === 0) return false
  const expandedCount = expandedReplies.value[comment.id] || 0
  const showCount = 2 + expandedCount * 5
  return comment.replies.length > showCount
}

const handleExpandReplies = (commentId) => {
  expandedReplies.value[commentId] = (expandedReplies.value[commentId] || 0) + 1
}

const handleSubmitReply = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }
  if (!replyInput.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  try {
    submittingReply.value = true

    const targetParentId = getTopLevelCommentId(replyingTo.value)

    await createComment(route.params.id, {
      content: replyInput.value,
      parentId: targetParentId,
      replyToUserId: replyingTo.value.user_id,
      replyToCommentId: replyingTo.value.id,
      mentions: replyMentions.value,
    })
    ElMessage.success('回复成功')
    replyingTo.value = null
    replyInput.value = ''
    replyMentions.value = []
    commentsPagination.value.page = 1
    await fetchComments()
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败')
  } finally {
    submittingReply.value = false
  }
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

const getPosterDesc = () => {
  if (!article.value || !article.value.content) return '精彩内容，扫码查看全文'
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = article.value.content
  const plainText = tempDiv.textContent || tempDiv.innerText || ''
  return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText
}

const formatPosterTime = () => {
  if (!article.value || !article.value.created_at) return ''
  const date = new Date(article.value.created_at)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const savePoster = async () => {
  if (!posterRef.value) {
    ElMessage.error('生成海报失败')
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: '正在生成海报...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const canvas = await html2canvas(posterRef.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const link = document.createElement('a')
    link.download = `PTStack_${article.value?.id || Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    ElMessage.success('海报已保存到本地')
  } catch (error) {
    console.error('保存海报失败:', error)
    ElMessage.error('保存海报失败，请稍后再试')
  } finally {
    loading.close()
  }
}

const handleShare = async (platform) => {
  const url = window.location.href

  try {
    switch (platform) {
      case 'link':
        await navigator.clipboard.writeText(url)
        ElMessage.success('链接已复制到剪贴板')
        break
      case 'poster':
        wechatQrcodeUrl.value = await QRCode.toDataURL(url)
        await new Promise((resolve) => setTimeout(resolve, 300))
        await savePoster()
        break
    }

    const res = await shareArticle(article.value.id)
    if (article.value) {
      article.value.share_count = res.share_count
    }
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('分享失败，请稍后再试')
  }
}

onMounted(() => {
  fetchArticle()
  fetchComments()
  checkLikeStatus()
  checkSubscriptionStatus()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="article-detail-page" v-loading="loading">
    <div class="article-container" v-if="article">
      <div class="article-main">
        <div class="article-content">
          <div class="article-header-actions">
            <el-button @click="goBack" class="outline-btn back-outline-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <div class="header-right-actions">
              <template v-if="userStore.userInfo?.id === article.author_id">
                <el-button @click="goToEdit" class="outline-btn edit-outline-btn">
                  <el-icon><Edit /></el-icon>
                  编辑文章
                </el-button>
              </template>
              <template v-else>
                <el-button @click="goToReport" class="outline-btn report-outline-btn">
                  <el-icon><Warning /></el-icon>
                  举报
                </el-button>
              </template>
            </div>
          </div>

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
            <span
              ><el-icon><View /></el-icon> {{ article.view_count }} 阅读</span
            >
            <span
              ><el-icon><Star /></el-icon> {{ article.like_count }} 点赞</span
            >
            <span
              ><el-icon><ChatDotRound /></el-icon> {{ commentsPagination.total }} 评论</span
            >
            <span v-if="article.tags?.length"
              ><el-icon><PriceTag /></el-icon> {{ article.tags.join(', ') }}</span
            >
          </div>

          <div class="article-body">
            <p v-if="article.summary" class="article-summary">{{ article.summary }}</p>
            <div class="article-text">
              <MdPreview :modelValue="decodedContent" />
            </div>
          </div>
        </div>

        <!-- 附件展示卡片 -->
        <div
          v-if="article.attachments && article.attachments.length > 0"
          class="attachments-section"
        >
          <div class="attachments-header">
            <h3 class="attachments-title">
              <el-icon><Download /></el-icon>
              附件下载
            </h3>
          </div>
          <div class="attachments-list">
            <div
              v-for="attachment in article.attachments"
              :key="attachment.id"
              class="attachment-item"
            >
              <div class="attachment-info">
                <el-icon class="attachment-icon"><Download /></el-icon>
                <span class="attachment-name">{{ attachment.originalName }}</span>
                <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
              </div>
              <a :href="attachment.url" target="_blank" class="download-btn">
                <el-icon><Download /></el-icon>
                下载
              </a>
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
            <el-icon><StarFilled v-if="isLiked" /><Star v-else /></el-icon>
            <span class="action-text">{{ isLiked ? '已点赞' : '点赞' }}</span>
            <span class="action-count" v-if="article.like_count > 0">{{ article.like_count }}</span>
          </el-button>
          <el-popover placement="bottom" :width="200" trigger="click" popper-class="share-popover">
            <template #reference>
              <el-button size="large" class="action-btn share-btn">
                <el-icon><Share /></el-icon>
                <span class="action-text">分享</span>
                <span class="action-count" v-if="article?.share_count > 0">{{
                  article.share_count
                }}</span>
              </el-button>
            </template>
            <div class="share-options">
              <div class="share-option" @click="handleShare('link')">
                <el-icon><Document /></el-icon>
                <span>复制链接</span>
              </div>
              <div class="share-option" @click="handleShare('poster')">
                <el-icon><Picture /></el-icon>
                <span>保存海报</span>
              </div>
            </div>
          </el-popover>
        </div>

        <div class="author-info-section" @click="router.push(`/profile/${article.author_id}`)">
          <div class="author-avatar-wrapper">
            <UserAvatar
              :user="{
                id: article.author_id,
                nickname: article.author_nickname,
                username: article.author_name,
                avatar: article.author_avatar,
                show_avatar_badge:
                  article.author_show_avatar_badge === 1 &&
                  article.author_avatar_badge &&
                  article.author_avatar_badge_bg_color &&
                  article.author_avatar_badge_text_color,
                avatar_badge: article.author_avatar_badge,
                avatar_badge_bg_color: article.author_avatar_badge_bg_color,
                avatar_badge_text_color: article.author_avatar_badge_text_color,
              }"
              size="default"
            />
          </div>
          <div class="author-details">
            <div class="author-name">
              {{ article.author_nickname || article.author_name || '匿名用户' }}
            </div>
            <div class="author-meta">
              <span class="publish-time"
                >发布于 {{ new Date(article.created_at).toLocaleString('zh-CN') }}</span
              >
            </div>
          </div>
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

          <div class="comment-input-section" v-if="userStore.userInfo && article?.status === 1">
            <MentionInput
              v-model="commentInput"
              @mentions="commentMentions = $event"
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
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <div class="comment-author">
                  <div class="author-avatar-wrapper">
                    <UserAvatar
                      :user="{
                        id: comment.user_id,
                        nickname: comment.user_nickname,
                        username: comment.user_name,
                        avatar: comment.user_avatar,
                        show_avatar_badge:
                          comment.user_show_avatar_badge === 1 &&
                          comment.user_avatar_badge &&
                          comment.user_avatar_badge_bg_color &&
                          comment.user_avatar_badge_text_color,
                        avatar_badge: comment.user_avatar_badge,
                        avatar_badge_bg_color: comment.user_avatar_badge_bg_color,
                        avatar_badge_text_color: comment.user_avatar_badge_text_color,
                      }"
                      size="small"
                      @click.stop="router.push(`/profile/${comment.user_id}`)"
                    />
                  </div>
                  <div class="author-info">
                    <span
                      class="author-name"
                      @click.stop="router.push(`/profile/${comment.user_id}`)"
                    >
                      {{ comment.user_nickname || comment.user_name || '匿名用户' }}
                    </span>
                    <span class="comment-time">{{
                      new Date(comment.created_at).toLocaleString('zh-CN')
                    }}</span>
                  </div>
                </div>
                <div class="comment-actions">
                  <el-dropdown
                    trigger="click"
                    @command="(cmd) => handleCommentAction(cmd, comment)"
                  >
                    <el-button link class="more-btn">
                      <el-icon><More /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item v-if="userStore.userInfo" command="reply">
                          <el-icon><ChatLineRound /></el-icon>
                          回复
                        </el-dropdown-item>
                        <el-dropdown-item
                          command="like"
                          :type="likedComments.includes(comment.id) ? 'primary' : ''"
                        >
                          <el-icon
                            ><StarFilled v-if="likedComments.includes(comment.id)" /><Star v-else
                          /></el-icon>
                          {{ likedComments.includes(comment.id) ? '已点赞' : '点赞' }}
                          {{ comment.like_count }}
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="userStore.userInfo?.id === comment.user_id"
                          command="delete"
                          type="danger"
                        >
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
              <div class="comment-content">
                <MentionText :content="comment.content" />
              </div>

              <div v-if="replyingTo?.id === comment.id" class="reply-input-section">
                <div class="reply-info">
                  <span
                    >回复
                    {{ replyingTo.user_nickname || replyingTo.user_name || '匿名用户' }}：</span
                  >
                  <el-button link @click="handleCancelReply">取消</el-button>
                </div>
                <MentionInput
                  v-model="replyInput"
                  @mentions="replyMentions = $event"
                  :rows="2"
                  placeholder="写下你的回复..."
                  class="reply-textarea"
                />
                <el-button
                  type="primary"
                  size="large"
                  :loading="submittingReply"
                  @click="handleSubmitReply"
                  class="submit-reply-btn"
                >
                  发表回复
                </el-button>
              </div>

              <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                <div v-for="reply in getVisibleReplies(comment)" :key="reply.id" class="reply-item">
                  <div class="reply-header">
                    <div class="reply-author">
                      <div class="reply-avatar-wrapper">
                        <UserAvatar
                          :user="{
                            id: reply.user_id,
                            nickname: reply.user_nickname,
                            username: reply.user_name,
                            avatar: reply.user_avatar,
                            show_avatar_badge:
                              reply.user_show_avatar_badge === 1 &&
                              reply.user_avatar_badge &&
                              reply.user_avatar_badge_bg_color &&
                              reply.user_avatar_badge_text_color,
                            avatar_badge: reply.user_avatar_badge,
                            avatar_badge_bg_color: reply.user_avatar_badge_bg_color,
                            avatar_badge_text_color: reply.user_avatar_badge_text_color,
                          }"
                          size="tiny"
                          @click.stop="router.push(`/profile/${reply.user_id}`)"
                        />
                      </div>
                      <div class="reply-author-info">
                        <span
                          class="reply-author-name"
                          @click.stop="router.push(`/profile/${reply.user_id}`)"
                        >
                          {{ reply.user_nickname || reply.user_name || '匿名用户' }}
                        </span>
                        <span class="reply-time">{{
                          new Date(reply.created_at).toLocaleString('zh-CN')
                        }}</span>
                      </div>
                    </div>
                    <div class="reply-actions">
                      <el-dropdown
                        trigger="click"
                        @command="(cmd) => handleCommentAction(cmd, reply)"
                      >
                        <el-button link class="more-btn">
                          <el-icon><More /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item v-if="userStore.userInfo" command="reply">
                              <el-icon><ChatLineRound /></el-icon>
                              回复
                            </el-dropdown-item>
                            <el-dropdown-item
                              command="like"
                              :type="likedComments.includes(reply.id) ? 'primary' : ''"
                            >
                              <el-icon
                                ><StarFilled v-if="likedComments.includes(reply.id)" /><Star v-else
                              /></el-icon>
                              {{ likedComments.includes(reply.id) ? '已点赞' : '点赞' }}
                              {{ reply.like_count }}
                            </el-dropdown-item>
                            <el-dropdown-item
                              v-if="userStore.userInfo?.id === reply.user_id"
                              command="delete"
                              type="danger"
                            >
                              <el-icon><Delete /></el-icon>
                              删除
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                  <div class="reply-content">
                    <div
                      v-if="reply.reply_to_comment_id && reply.reply_to_comment_id !== comment.id"
                      class="reply-quote"
                    >
                      <span class="reply-to">
                        @{{
                          findCommentById(reply.reply_to_comment_id)?.user_nickname ||
                          findCommentById(reply.reply_to_comment_id)?.user_name ||
                          reply.reply_to_user_nickname ||
                          reply.reply_to_user_name ||
                          '匿名用户'
                        }}
                        于
                        {{
                          findCommentById(reply.reply_to_comment_id)
                            ? new Date(
                                findCommentById(reply.reply_to_comment_id).created_at,
                              ).toLocaleString('zh-CN')
                            : ''
                        }}
                      </span>
                      <div v-if="findCommentById(reply.reply_to_comment_id)" class="quote-content">
                        {{
                          findCommentById(reply.reply_to_comment_id).content.length > 50
                            ? findCommentById(reply.reply_to_comment_id).content.substring(0, 50) +
                              '...'
                            : findCommentById(reply.reply_to_comment_id).content
                        }}
                      </div>
                    </div>
                    <MentionText :content="reply.content" />
                  </div>

                  <div v-if="replyingTo?.id === reply.id" class="reply-input-section">
                    <div class="reply-info">
                      <span
                        >回复
                        {{ replyingTo.user_nickname || replyingTo.user_name || '匿名用户' }}：</span
                      >
                      <el-button link @click="handleCancelReply">取消</el-button>
                    </div>
                    <MentionInput
                      v-model="replyInput"
                      @mentions="replyMentions = $event"
                      :rows="2"
                      placeholder="写下你的回复..."
                      class="reply-textarea"
                    />
                    <el-button
                      type="primary"
                      size="large"
                      :loading="submittingReply"
                      @click="handleSubmitReply"
                      class="submit-reply-btn"
                    >
                      发表回复
                    </el-button>
                  </div>
                </div>
                <div v-if="hasMoreReplies(comment)" class="expand-replies-section">
                  <el-button link type="primary" @click="handleExpandReplies(comment.id)">
                    查看更多回复
                  </el-button>
                </div>
              </div>
            </div>

            <div
              v-if="
                comments.length < (commentsPagination.topLevelTotal || commentsPagination.total)
              "
              class="load-more-section"
            >
              <div v-if="loadingMoreComments" class="loading-more">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>加载中...</span>
              </div>
              <div v-else-if="loadMoreError" class="load-more-error">
                <span>加载失败</span>
                <el-button type="primary" size="small" @click="handleRetryLoadMore">
                  重试
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="wechatShareDialogVisible"
      title="微信分享"
      width="360px"
      :close-on-click-modal="true"
    >
      <div class="wechat-share-content">
        <div class="qrcode-wrapper">
          <img :src="wechatQrcodeUrl" alt="微信扫码" class="qrcode-image" />
        </div>
        <div class="share-tip">
          <p>使用微信扫描二维码</p>
          <p>分享给朋友或分享到朋友圈</p>
        </div>
      </div>
    </el-dialog>

    <div class="share-poster-container" style="position: fixed; left: -9999px; top: -9999px">
      <div class="share-poster" ref="posterRef">
        <div class="poster-header">
          <div class="poster-logo">
            <span class="poster-logo-dot"></span>
            <span class="poster-logo-text">PTStack</span>
          </div>
          <div class="poster-tag">发现优质内容</div>
        </div>
        <div class="poster-main">
          <h2 class="poster-title">{{ article?.title || '精彩文章' }}</h2>
          <p class="poster-desc">{{ getPosterDesc() }}</p>
        </div>
        <div class="poster-divider"></div>
        <div class="poster-footer">
          <div class="poster-author">
            <img
              :src="getFullUrl(article?.author_avatar || '')"
              :alt="article?.author_nickname || article?.author_name"
              class="poster-avatar"
            />
            <div class="poster-author-info">
              <div class="poster-author-name">
                {{ article?.author_nickname || article?.author_name || '匿名用户' }}
              </div>
              <div class="poster-meta">
                <span class="poster-time">{{ formatPosterTime() }}</span>
              </div>
            </div>
          </div>
          <div class="poster-qrcode">
            <img :src="wechatQrcodeUrl" alt="扫码阅读" class="poster-qrcode-img" />
            <div class="poster-qrcode-text">扫码阅读全文</div>
          </div>
        </div>
      </div>
    </div>

    <div class="back-to-top" :class="{ show: scrollTop > 300 }" @click="scrollToTop">
      <el-icon><ArrowUp /></el-icon>
    </div>
  </div>
</template>

<style scoped lang="scss">
.article-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f8fa 0%, #ffffff 100%);
  padding-bottom: 60px;
  padding-top: 32px;
}

.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
  z-index: 1000;

  &.show {
    opacity: 1;
    visibility: visible;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.4);
  }

  .el-icon {
    font-size: 24px;
  }
}

.article-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
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
  position: relative;
}

.article-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .outline-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .back-outline-btn {
    border: 1px solid #e5e6eb;
    color: #86909c;
    background: transparent;

    &:hover {
      border-color: #86909c;
      background: #f7f8fa;
    }
  }

  .edit-outline-btn {
    border: 1px solid #165dff;
    color: #165dff;
    background: transparent;

    &:hover {
      background: rgba(22, 93, 255, 0.05);
    }
  }

  .report-outline-btn {
    border: 1px solid #f53f3f;
    color: #f53f3f;
    background: transparent;

    &:hover {
      background: rgba(245, 63, 63, 0.05);
    }
  }

  .header-right-actions {
    display: flex;
    gap: 12px;
  }
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
  }
}

.attachments-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 32px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .attachments-header {
    margin-bottom: 16px;
  }

  .attachments-title {
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .attachments-list {
    border-radius: 12px;
    border: 1px solid #e5e6eb;
    overflow: hidden;
  }

  .attachment-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #f2f3f5;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #f7f8fa;
    }
  }

  .attachment-info {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }

  .attachment-icon {
    color: #165dff;
    font-size: 20px;
  }

  .attachment-name {
    flex: 1;
    font-size: 15px;
    color: #1d2129;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .attachment-size {
    font-size: 13px;
    color: #86909c;
    white-space: nowrap;
  }

  .download-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    text-decoration: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
      color: #ffffff;
    }

    .el-icon {
      font-size: 16px;
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
    gap: 6px;
    transition: all 0.3s ease;
    position: relative;
  }

  .action-btn .el-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .action-text {
    display: flex;
    align-items: center;
  }

  .action-count {
    background: #f0f3ff;
    color: #165dff;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    margin-left: 4px;
  }

  .like-btn {
    border: 1px solid #e5e6eb;

    &.liked {
      background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
      border: none;
      color: #ffffff;

      .el-icon {
        color: #ffffff;
      }

      .action-count {
        background: rgba(255, 255, 255, 0.2);
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

  .share-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .share-option {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #ffffff;
    border: 1px solid #e5e6eb;

    &:hover {
      background: linear-gradient(135deg, #f7f8fa 0%, #ffffff 100%);
      border-color: #165dff;
      transform: translateX(4px);

      .el-icon {
        color: #165dff;
      }

      span {
        color: #165dff;
      }
    }

    .el-icon {
      font-size: 24px;
      color: #4e5969;
      transition: all 0.2s ease;
    }

    span {
      font-size: 15px;
      font-weight: 500;
      color: #1d2129;
      transition: all 0.2s ease;
    }
  }
}

.author-info-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .author-avatar-wrapper {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;

    .author-avatar {
      background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }

      img {
        border-radius: 50%;
        object-fit: cover;
      }
    }

    .avatar-admin-badge {
      position: absolute;
      bottom: -7px;
      right: -7px;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: white;
      line-height: 1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
      z-index: 1;
    }
  }

  .author-details {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .author-name {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
    }

    .author-meta {
      .publish-time {
        font-size: 13px;
        color: #86909c;
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

        .author-avatar-wrapper {
          position: relative;
          display: inline-flex;

          .author-avatar {
            background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
            cursor: pointer;
            transition: transform 0.2s ease;

            &:hover {
              transform: scale(1.05);
            }

            img {
              border-radius: 50%;
              object-fit: cover;
            }
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

        .author-info {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .author-name {
            font-size: 15px;
            font-weight: 600;
            color: #1d2129;
            cursor: pointer;
            transition: color 0.2s ease;

            &:hover {
              color: #165dff;
            }
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

        .more-btn {
          padding: 4px 8px;
          font-size: 16px;
          border-radius: 6px;
          transition: all 0.2s ease;

          &:hover {
            background: #f2f3f5;
          }
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

    .reply-input-section {
      margin-top: 16px;
      padding: 16px;
      background: #f7f8fa;
      border-radius: 12px;
      margin-left: 52px;

      .reply-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;
        color: #86909c;
      }

      .reply-textarea {
        margin-bottom: 12px;

        :deep(.el-textarea__inner) {
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }
      }

      .submit-reply-btn {
        border-radius: 8px;
        background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
        border: none;
      }
    }

    .replies-list {
      margin-top: 16px;
      padding-left: 52px;
      border-left: 2px solid #e5e6eb;

      .reply-item {
        padding: 16px 0 16px 16px;
        border-bottom: 1px solid #f2f3f5;

        &:last-child {
          border-bottom: none;
        }

        .reply-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;

          .reply-author {
            display: flex;
            align-items: center;
            gap: 10px;

            .reply-avatar-wrapper {
              position: relative;
              display: inline-flex;

              .reply-avatar {
                background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
                cursor: pointer;
                transition: transform 0.2s ease;

                &:hover {
                  transform: scale(1.05);
                }

                img {
                  border-radius: 50%;
                  object-fit: cover;
                }
              }

              .avatar-admin-badge {
                position: absolute;
                bottom: -4px;
                right: -4px;
                width: 19px;
                height: 19px;
                background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
                border: 2px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 9px;
                font-weight: 700;
                color: white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                z-index: 1;
              }
            }

            .reply-author-info {
              display: flex;
              flex-direction: column;
              gap: 2px;

              .reply-author-name {
                font-size: 14px;
                font-weight: 600;
                color: #1d2129;
                cursor: pointer;
                transition: color 0.2s ease;

                &:hover {
                  color: #165dff;
                }
              }

              .reply-time {
                font-size: 12px;
                color: #86909c;
              }
            }
          }

          .reply-actions {
            display: flex;
            gap: 6px;

            .more-btn {
              padding: 2px 6px;
              font-size: 14px;
              border-radius: 4px;
              transition: all 0.2s ease;

              &:hover {
                background: #f2f3f5;
              }
            }
          }
        }

        .reply-content {
          font-size: 14px;
          color: #4e5969;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;

          .reply-quote {
            background: #f7f8fa;
            border-left: 3px solid #165dff;
            padding: 8px 12px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 8px;
            font-size: 13px;
            color: #86909c;

            .reply-to {
              color: #165dff;
              font-weight: 600;
              display: block;
              margin-bottom: 4px;
            }

            .quote-content {
              color: #86909c;
              font-style: italic;
              opacity: 0.8;
            }
          }
        }

        .reply-input-section {
          margin-top: 12px;
          padding: 12px;
          background: #f7f8fa;
          border-radius: 10px;
          margin-left: 0;
        }
      }
    }

    .expand-replies-section {
      padding: 8px 0 0 16px;
      text-align: center;
    }
  }

  .load-more-section {
    margin-top: 32px;
    display: flex;
    justify-content: center;
  }

  .loading-more {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 32px;
    color: #86909c;
    font-size: 14px;

    .el-icon {
      font-size: 20px;
    }
  }

  .load-more-error {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 32px;
    background: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 12px;
    color: #f53f3f;
    font-size: 14px;
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
}
</style>

<style lang="scss">
.share-popover {
  .share-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .share-option {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #ffffff;
    border: 1px solid #e5e6eb;

    &:hover {
      background: linear-gradient(135deg, #f7f8fa 0%, #ffffff 100%);
      border-color: #165dff;
      transform: translateX(4px);

      .el-icon {
        color: #165dff;
      }

      span {
        color: #165dff;
      }
    }

    .el-icon {
      font-size: 24px;
      color: #4e5969;
      transition: all 0.2s ease;
    }

    span {
      font-size: 15px;
      font-weight: 500;
      color: #1d2129;
      transition: all 0.2s ease;
    }
  }
}

.wechat-share-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 16px 0;

  .qrcode-wrapper {
    padding: 16px;
    background: #ffffff;
    border: 1px solid #e5e6eb;
    border-radius: 12px;

    .qrcode-image {
      width: 220px;
      height: 220px;
      display: block;
    }
  }

  .share-tip {
    text-align: center;
    color: #86909c;
    font-size: 14px;
    line-height: 1.8;

    p {
      margin: 0;
    }
  }
}

.share-poster {
  width: 480px;
  min-height: 680px;
  background: linear-gradient(180deg, #f7f8fa 0%, #ffffff 100%);
  padding: 48px;
  box-sizing: border-box;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
}

.poster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.poster-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.poster-logo-dot {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
}

.poster-logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #1d2129;
  letter-spacing: -0.5px;
}

.poster-tag {
  font-size: 13px;
  color: #86909c;
  background: #ffffff;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #e5e6eb;
}

.poster-main {
  flex: 1;
}

.poster-title {
  font-size: 26px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.4;
  margin: 0 0 24px 0;
}

.poster-desc {
  font-size: 15px;
  color: #4e5969;
  line-height: 1.8;
  margin: 0;
}

.poster-divider {
  height: 1px;
  background: #e5e6eb;
  margin: 32px 0;
}

.poster-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.poster-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.poster-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e6eb;
}

.poster-author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.poster-author-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.poster-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.poster-time {
  font-size: 13px;
  color: #86909c;
}

.poster-qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.poster-qrcode-img {
  width: 90px;
  height: 90px;
  display: block;
  border-radius: 12px;
  border: 2px solid #e5e6eb;
  padding: 4px;
  background: #ffffff;
}

.poster-qrcode-text {
  font-size: 12px;
  color: #86909c;
  text-align: center;
}
</style>
