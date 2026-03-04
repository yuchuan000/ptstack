<script setup>
// 客户端文章中心页面
// 功能：左侧分类侧边栏，右侧文章列表
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  ArrowRight,
  View,
  Star,
  ChatDotRound,
  Calendar,
  Search,
  FolderOpened
} from '@element-plus/icons-vue'
import { getArticles, getCategories } from '@/api/articles'
import { getFullUrl } from '@/utils/url'

const router = useRouter()

const loading = ref(false)
const articles = ref([])
const categories = ref([])
const searchKeyword = ref('')

// 分页信息
const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0
})

// 当前选中的分类
const selectedCategory = ref('')

// 排序方式
const sortBy = ref('created_at')
const order = ref('desc')

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = Array.isArray(res) ? res : []
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 获取文章列表
const fetchArticles = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      sortBy: sortBy.value,
      order: order.value
    }

    if (selectedCategory.value) {
      params.category = selectedCategory.value
    }

    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }

    const res = await getArticles(params)
    articles.value = res.articles || []
    pagination.value.total = res.total || 0
  } catch (error) {
    console.error('获取文章失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理分类选择
const handleCategorySelect = (categoryId) => {
  selectedCategory.value = categoryId
  pagination.value.page = 1
  fetchArticles()
}

// 处理搜索
const handleSearch = () => {
  pagination.value.page = 1
  fetchArticles()
}

// 处理排序
const handleSortChange = (command) => {
  const [field, sortOrder] = command.split('-')
  sortBy.value = field
  order.value = sortOrder
  pagination.value.page = 1
  fetchArticles()
}

// 处理分页
const handlePageChange = (page) => {
  pagination.value.page = page
  fetchArticles()
}

// 跳转到文章详情
const goToArticleDetail = (id) => {
  router.push(`/article/${id}`)
}

// 截断文本
const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取当前分类名称
const getCurrentCategoryName = () => {
  if (!selectedCategory.value) return '全部文章'
  const category = categories.value.find(c => c.id === selectedCategory.value)
  return category?.name || '全部文章'
}

onMounted(() => {
  fetchCategories()
  fetchArticles()
})
</script>

<template>
  <div class="article-center-page">
    <div class="page-container">
      <!-- 左侧分类侧边栏 -->
      <aside class="category-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <div class="sidebar-title">
              <el-icon><FolderOpened /></el-icon>
              <span>文章分类</span>
            </div>
          </div>

          <div class="category-list">
            <div
              class="category-item"
              :class="{ active: selectedCategory === '' }"
              @click="handleCategorySelect('')"
            >
              <div class="category-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="category-info">
                <span class="category-name">全部文章</span>
                <span class="category-count">{{ pagination.total }}</span>
              </div>
            </div>

            <div
              v-for="category in categories"
              :key="category.id"
              class="category-item"
              :class="{ active: selectedCategory === category.id }"
              @click="handleCategorySelect(category.id)"
            >
              <div class="category-icon">
                <el-icon><FolderOpened /></el-icon>
              </div>
              <div class="category-info">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.article_count || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧文章列表 -->
      <main class="articles-main">
        <div class="main-card">
          <!-- 头部区域 -->
          <div class="main-header">
            <div class="header-title">
              <h2>{{ getCurrentCategoryName() }}</h2>
              <span class="article-count">共 {{ pagination.total }} 篇文章</span>
            </div>

            <div class="header-actions">
              <!-- 搜索框 -->
              <el-input
                v-model="searchKeyword"
                placeholder="搜索文章..."
                class="search-input"
                clearable
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <!-- 排序下拉 -->
              <el-dropdown @command="handleSortChange">
                <el-button>
                  <template v-if="sortBy === 'created_at' && order === 'desc'">最新发布</template>
                  <template v-else-if="sortBy === 'created_at' && order === 'asc'">最早发布</template>
                  <template v-else-if="sortBy === 'view_count'">最多阅读</template>
                  <template v-else-if="sortBy === 'like_count'">最多点赞</template>
                  <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="created_at-desc">最新发布</el-dropdown-item>
                    <el-dropdown-item command="created_at-asc">最早发布</el-dropdown-item>
                    <el-dropdown-item command="view_count-desc">最多阅读</el-dropdown-item>
                    <el-dropdown-item command="like_count-desc">最多点赞</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- 文章列表 -->
          <div class="articles-list" v-loading="loading">
            <div v-if="articles.length === 0" class="empty-state">
              <div class="empty-icon">
                <el-icon :size="64"><Document /></el-icon>
              </div>
              <div class="empty-text">暂无文章</div>
              <div class="empty-desc">该分类下还没有文章，去看看其他分类吧</div>
            </div>

            <div v-else class="articles-grid">
              <div
                v-for="article in articles"
                :key="article.id"
                class="article-card"
                @click="goToArticleDetail(article.id)"
              >
                <div class="article-cover" v-if="article.cover">
                  <img :src="getFullUrl(article.cover)" alt="cover">
                  <div class="article-category" v-if="article.category_name">
                    {{ article.category_name }}
                  </div>
                  <el-tag v-if="article.status === 2" size="small" type="info" class="private-tag">
                    私密
                  </el-tag>
                </div>
                <div class="article-content">
                  <div class="article-category top-category" v-if="!article.cover && article.category_name">
                    {{ article.category_name }}
                  </div>
                  <el-tag v-if="article.status === 2 && !article.cover" size="small" type="info" class="private-tag-inline">
                    私密
                  </el-tag>
                  <h3 class="article-title">{{ truncateText(article.title, 60) }}</h3>
                  <p v-if="article.summary" class="article-summary">{{ truncateText(article.summary, 100) }}</p>

                  <div class="article-author">
                    <img
                      v-if="article.author_avatar"
                      :src="getFullUrl(article.author_avatar)"
                      class="author-avatar"
                      alt="avatar"
                    >
                    <div v-else class="author-avatar">
                      {{ (article.author_nickname || article.author_name)?.charAt(0).toUpperCase() }}
                    </div>
                    <span class="author-name">{{ article.author_nickname || article.author_name }}</span>
                  </div>

                  <div class="article-meta">
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
                    <span class="meta-item">
                      <el-icon><ChatDotRound /></el-icon>
                      {{ article.comment_count || 0 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="pagination.total > pagination.pageSize">
            <el-pagination
              v-model:current-page="pagination.page"
              :page-size="pagination.pageSize"
              :total="pagination.total"
              layout="prev, pager, next"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-center-page {
  min-height: 100%;
  padding: 24px;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

/* 左侧分类侧边栏 */
.category-sidebar {
  position: sticky;
  top: 88px;
  height: fit-content;
}

.sidebar-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f2f3f5;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;

  .el-icon {
    font-size: 20px;
    color: #165dff;
  }
}

.category-list {
  padding: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #f7f8fa;

    .category-icon {
      background: #e8f0ff;
      color: #165dff;
    }
  }

  &.active {
    background: #e8f0ff;

    .category-icon {
      background: #165dff;
      color: #fff;
    }

    .category-name {
      color: #165dff;
      font-weight: 600;
    }

    .category-count {
      background: #165dff;
      color: #fff;
    }
  }
}

.category-icon {
  width: 36px;
  height: 36px;
  background: #f2f3f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  transition: all 0.2s;
}

.category-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #4e5969;
}

.category-count {
  font-size: 12px;
  color: #86909c;
  background: #f2f3f5;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 右侧文章列表 */
.articles-main {
  min-width: 0;
}

.main-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 24px;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-title {
  display: flex;
  align-items: baseline;
  gap: 12px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.article-count {
  font-size: 14px;
  color: #86909c;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 240px;
}

/* 文章列表 */
.articles-list {
  min-height: 400px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.article-card {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #165dff;
    box-shadow: 0 4px 16px rgba(22, 93, 255, 0.1);
    transform: translateY(-2px);

    .article-cover img {
      transform: scale(1.05);
    }
  }

  &:not(:has(.article-cover)) .article-content {
    min-height: 280px;
    display: flex;
    flex-direction: column;
  }

  &:not(:has(.article-cover)) .article-title {
    margin-top: 8px;
  }

  &:not(:has(.article-cover)) .article-author {
    margin-top: auto;
    padding-top: 12px;
  }

  &:not(:has(.article-cover)) .article-meta {
    padding-top: 8px;
  }
}

.article-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
  background: #f7f8fa;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
}

.article-category {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(22, 93, 255, 0.9);
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &.top-category {
    display: inline-block;
    margin-bottom: 8px;
    align-self: flex-start;
    position: relative;
    top: 0;
    left: 0;
  }
}

.private-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(134, 144, 156, 0.9);
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.private-tag-inline {
  display: inline-block;
  margin-bottom: 8px;
  align-self: flex-start;
}

.article-content {
  padding: 16px;
}

.article-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-summary {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 10px;
}

.author-name {
  font-size: 13px;
  color: #4e5969;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #86909c;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #86909c;
}

.empty-icon {
  margin-bottom: 20px;
  color: #c9cdd4;
}

.empty-text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #4e5969;
}

.empty-desc {
  font-size: 14px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f2f3f5;
}

/* 响应式适配 */
@media (max-width: 992px) {
  .page-container {
    grid-template-columns: 1fr;
  }

  .category-sidebar {
    position: static;
  }

  .category-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
  }

  .category-item {
    margin-bottom: 0;
    padding: 8px 12px;
    background: #f7f8fa;

    &.active {
      background: #e8f0ff;
    }
  }

  .category-icon {
    display: none;
  }

  .articles-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .article-center-page {
    padding: 16px;
  }

  .main-card {
    padding: 16px;
  }

  .main-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .search-input {
    flex: 1;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
