<script setup>
// 导入Vue的ref和onMounted函数
import { ref, onMounted } from 'vue'
// 导入Vue Router的useRouter函数
import { useRouter } from 'vue-router'
// 导入用户状态管理store
import { useUserStore } from '@/stores/user'
// 导入文章相关的API函数
import { getArticles, getCategories, getMyArticles } from '@/api/articles'
// 导入Element Plus图标组件
import {
  Plus,
  Tickets,
  User,
  Calendar,
  View,
  Star,
  Edit,
  Document,
  ChatDotRound,
  Warning
} from '@element-plus/icons-vue'
// 导入文章筛选组件
import ArticleFilter from '@/components/ArticleFilter/ArticleFilter.vue'
// 导入页面标题组件
import PageHeader from '@/components/PageHeader/PageHeader.vue'
// 导入URL处理工具函数
import { getFullUrl } from '@/utils/url'

// 创建用户状态管理实例，用于获取当前登录用户信息
const userStore = useUserStore()
// 创建路由实例，用于页面跳转
const router = useRouter()

// 当前激活的选项卡：all-全部文章，my-我的文章
const activeTab = ref('all')
// 我的文章的子选项卡：all-全部，published-已发布，draft-草稿
const myArticleTab = ref('all')
// 文章列表数据
const articles = ref([])
// 分类列表数据
const categories = ref([])
// 加载状态标识
const loading = ref(false)
// 分页信息
const pagination = ref({
  page: 1, // 当前页码
  pageSize: 15, // 每页显示数量
  total: 0 // 总数
})
// 筛选条件：分类和搜索关键词
const filters = ref({
  category: '', // 分类ID
  search: '' // 搜索关键词
})
// 排序字段
const sortBy = ref('created_at')
// 排序方式：desc-降序，asc-升序
const order = ref('desc')

// 获取文章列表的异步函数
const fetchArticles = async () => {
  try {
    // 设置加载状态为true
    loading.value = true
    // 构建请求参数
    const requestParams = {
      page: pagination.value.page, // 页码
      pageSize: pagination.value.pageSize, // 每页数量
      sortBy: sortBy.value, // 排序字段
      order: order.value // 排序方式
    }

    // 如果有分类筛选，添加到请求参数
    if (filters.value.category) requestParams.category = filters.value.category
    // 如果有搜索关键词，添加到请求参数
    if (filters.value.search) requestParams.search = filters.value.search

    // 声明响应结果变量
    let res
    // 如果是查看我的文章
    if (activeTab.value === 'my') {
      // 如果不是查看全部，添加状态筛选
      if (myArticleTab.value !== 'all') {
        // 设置状态：published对应1（已发布），draft对应0（草稿）
        requestParams.status = myArticleTab.value === 'published' ? 1 : 0
      }
      // 调用API获取我的文章
      res = await getMyArticles(requestParams)
    } else {
      // 调用API获取全部文章
      res = await getArticles(requestParams)
    }

    // 将获取到的文章列表赋值给articles变量
    articles.value = res.articles
    // 更新文章总数
    pagination.value.total = res.total
  } catch (error) {
    // 在控制台输出错误信息
    console.error('获取文章失败:', error)
  } finally {
    // 无论成功或失败，都设置加载状态为false
    loading.value = false
  }
}

// 处理表格排序变化的函数
const handleTableSortChange = ({ prop, order: tableOrder }) => {
  // 如果有排序字段和排序方式
  if (prop && tableOrder) {
    // 更新排序字段
    sortBy.value = prop
    // 更新排序方式，将descending转换为desc，ascending转换为asc
    order.value = tableOrder === 'descending' ? 'desc' : 'asc'
    // 重置页码为第一页
    pagination.value.page = 1
    // 重新获取文章列表
    fetchArticles()
  }
}

// 获取分类列表的异步函数
const fetchCategories = async () => {
  try {
    // 调用API获取分类列表
    const res = await getCategories()
    // 将获取到的分类列表赋值给categories变量
    categories.value = res
  } catch (error) {
    // 在控制台输出错误信息
    console.error('获取分类失败:', error)
  }
}

// 处理主选项卡切换的函数
const handleTabChange = (tab) => {
  // 更新当前激活的选项卡
  activeTab.value = tab
  // 清空分类筛选
  filters.value.category = ''
  // 重置页码为第一页
  pagination.value.page = 1
  // 重新获取文章列表
  fetchArticles()
}

// 处理我的文章子选项卡切换的函数
const handleMyArticleTabChange = (tab) => {
  // 更新我的文章子选项卡
  myArticleTab.value = tab
  // 重置页码为第一页
  pagination.value.page = 1
  // 重新获取文章列表
  fetchArticles()
}

// 搜索防抖定时器
let searchTimer = null

// 处理搜索的函数（带防抖）
const handleSearch = () => {
  // 如果存在定时器，先清除
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  // 设置新的定时器，300ms后执行搜索
  searchTimer = setTimeout(() => {
    // 重置页码为第一页
    pagination.value.page = 1
    // 重新获取文章列表
    fetchArticles()
  }, 300)
}

// 处理页码变化的函数
const handlePageChange = (page) => {
  // 更新当前页码
  pagination.value.page = page
  // 重新获取文章列表
  fetchArticles()
}

// 跳转到文章详情页的函数
const goToDetail = (id) => {
  // 使用路由实例跳转到文章详情页
  router.push(`/article/${id}`)
}

// 跳转到用户个人主页的函数
const goToUserProfile = (userId) => {
  // 使用路由实例跳转到用户个人主页
  router.push(`/profile/${userId}`)
}

// 跳转到文章编辑页的函数
const goToEdit = (id) => {
  // 使用路由实例跳转到文章编辑页
  router.push(`/article/edit/${id}`)
}

// 跳转到创建文章页的函数
const goToCreate = () => {
  // 使用路由实例跳转到创建文章页
  router.push('/article/create')
}

// 跳转到文章举报页的函数
const goToReport = (id) => {
  // 使用路由实例跳转到文章举报页
  router.push(`/report/article/${id}`)
}

// 组件挂载时的生命周期钩子
onMounted(() => {
  // 获取文章列表
  fetchArticles()
  // 获取分类列表
  fetchCategories()
})
</script>

<template>
  <div class="article-list-page">
    <PageHeader title="文章中心" subtitle="探索和分享技术知识">
      <template #actions>
        <el-button type="primary" size="large" @click="goToCreate">
          <el-icon><Plus /></el-icon>
          写文章
        </el-button>
      </template>
    </PageHeader>

    <div class="content-card">
      <div class="card-header">
        <div class="tabs-section">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'all' }"
            @click="handleTabChange('all')"
          >
            <el-icon><Tickets /></el-icon>
            全部文章
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'my' }"
            @click="handleTabChange('my')"
          >
            <el-icon><User /></el-icon>
            我的文章
          </div>
        </div>

        <div class="filter-section">
          <div class="filter-left">
            <div v-if="activeTab === 'my'" class="my-article-tabs">
              <div
                class="my-tab-item"
                :class="{ active: myArticleTab === 'all' }"
                @click="handleMyArticleTabChange('all')"
              >
                全部
              </div>
              <div
                class="my-tab-item"
                :class="{ active: myArticleTab === 'published' }"
                @click="handleMyArticleTabChange('published')"
              >
                已发布
              </div>
              <div
                class="my-tab-item"
                :class="{ active: myArticleTab === 'draft' }"
                @click="handleMyArticleTabChange('draft')"
              >
                草稿
              </div>
            </div>
          </div>
          <div class="filter-right">
            <ArticleFilter
              :show-category="true"
              :categories="categories"
              v-model="filters"
              :search-placeholder="activeTab === 'all' ? '搜索文章标题或内容...' : '搜索我的文章标题或内容...'"
              @search="handleSearch"
            />
          </div>
        </div>
      </div>

      <div class="table-container" v-loading="loading">
        <el-table
          :data="articles"
          style="width: 100%"
          :header-cell-style="{
            background: '#f7f8fa',
            color: '#4e5969',
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }"
          :cell-style="{ whiteSpace: 'nowrap' }"
          @sort-change="handleTableSortChange"
          :default-sort="{ prop: 'created_at', order: 'descending' }"
          border
        >
          <el-table-column prop="title" label="标题" min-width="200">
            <template #default="{ row }">
              <div class="title-cell">
                <el-tag v-if="row.status === 0" size="small" type="warning" class="status-tag">
                  草稿
                </el-tag>
                <span class="title-text" @click="goToDetail(row.id)">{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="category_name" label="分类" width="130">
            <template #default="{ row }">
              <el-tag v-if="row.category_name" size="small" type="info">
                {{ row.category_name }}
              </el-tag>
              <span v-else class="text-gray">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="author_name" label="作者" width="180" v-if="activeTab !== 'my'">
            <template #default="{ row }">
              <div class="author-cell" :class="{ 'is-mine': row.author_id === userStore.userInfo?.id }" @click.stop="goToUserProfile(row.author_id)">
                <div class="author-avatar-small">
                  <img v-if="row.author_avatar" :src="getFullUrl(row.author_avatar)" alt="avatar" class="author-avatar-img-small">
                  <span v-else>{{ (row.author_nickname || row.author_name)?.charAt(0)?.toUpperCase() || 'U' }}</span>
                  <span v-if="row.author_is_admin === 1" class="avatar-admin-badge">管</span>
                </div>
                <el-tooltip :content="row.author_nickname || row.author_name" placement="top" :show-after="300">
                  <span class="author-name clickable">{{ row.author_nickname || row.author_name }}</span>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="view_count" label="阅读" width="130" align="center" sortable="custom">
            <template #default="{ row }">
              <div class="stat-cell">
                <el-icon><View /></el-icon>
                {{ row.view_count }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="like_count" label="点赞" width="130" align="center" sortable="custom">
            <template #default="{ row }">
              <div class="stat-cell">
                <el-icon><Star /></el-icon>
                {{ row.like_count }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="comment_count" label="评论" width="130" align="center" sortable="custom">
            <template #default="{ row }">
              <div class="stat-cell">
                <el-icon><ChatDotRound /></el-icon>
                {{ row.comment_count || 0 }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="发布时间" width="180" sortable="custom">
            <template #default="{ row }">
              <div class="date-cell">
                <el-icon><Calendar /></el-icon>
                {{ new Date(row.created_at).toLocaleDateString('zh-CN') }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <div class="action-cell">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="goToDetail(row.id)"
                >
                  <el-icon><Document /></el-icon>
                  查看
                </el-button>
                <el-button
                  v-if="row.author_id === userStore.userInfo?.id"
                  link
                  type="primary"
                  size="small"
                  @click="goToEdit(row.id)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  v-else
                  link
                  type="danger"
                  size="small"
                  @click="goToReport(row.id)"
                >
                  <el-icon><Warning /></el-icon>
                  举报
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="articles.length === 0 && !loading" description="暂无文章" />
      </div>

      <div class="pagination-section" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
          background
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.article-list-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  :deep(.el-table__cell) {
    overflow: visible;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  gap: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

.create-btn {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

  &:hover {
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
  }
}

.content-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tabs-section {
  display: flex;
  gap: 8px;
}

.tab-item {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #4e5969;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(22, 93, 255, 0.05);
    color: #165dff;
  }

  &.active {
    background: #165dff;
    color: #ffffff;
  }
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-left {
  flex: 1;
}

.filter-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.my-article-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f7f8fa;
  border-radius: 10px;
  width: fit-content;
}

.my-tab-item {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(22, 93, 255, 0.05);
    color: #165dff;
  }

  &.active {
    background: #ffffff;
    color: #165dff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }
}

.search-box {
  width: 320px;
}

.search-input {
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    padding: 8px 16px;
  }
}

.category-select {
  width: 140px;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    padding: 8px 16px;
  }
}

.table-container {
  padding: 0;
}

:deep(.el-table) {
  border-radius: 0;

  tr {
    th, td {
      padding: 12px 20px;
    }

    th {
      background: #f7f8fa !important;
      color: #4e5969 !important;
      font-weight: 500 !important;
      font-size: 13px !important;
    }

    td {
      border-bottom: 1px solid #f2f3f5;
    }
  }
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f7f8fa !important;
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tag {
  margin-right: 0;
  flex-shrink: 0;
}

.title-text {
  cursor: pointer;
  color: #1d2129;
  font-weight: 500;
  transition: color 0.2s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: #165dff;
  }
}

.text-gray {
  color: #c9cdd4;
}

.author-cell,
.stat-cell,
.date-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4e5969;
  font-size: 14px;
}

.author-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 0;
  border-radius: 6px;
  margin: -4px 0;

  &:hover {
    background: rgba(22, 93, 255, 0.05);
    .author-name {
      color: #165dff;
    }
  }

  &.is-mine {
    .author-name {
      color: #165dff;
      font-weight: 500;
    }
  }

  .author-name.clickable {
    transition: color 0.2s;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.author-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  overflow: visible;
  position: relative;
  margin-right: 8px;

  .avatar-admin-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
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

.author-avatar-img-small {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
}

.action-cell {
  display: flex;
  gap: 8px;
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e5e6eb;

  :deep(.el-pagination.is-background .el-pager li.is-active) {
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  }
}

@media (max-width: 1200px) {
  .search-box {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-right {
    width: 100%;
    flex-direction: column;

    .category-select,
    .search-box {
      width: 100%;
    }
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .create-btn {
    width: 100%;
  }
}
</style>
