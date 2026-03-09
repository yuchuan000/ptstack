<script setup>
// 分类管理页面组件
// 功能：创建、编辑、删除分类和审核分类申请
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategories, createCategory, updateCategory, deleteCategory, getCategoryApplications, reviewCategoryApplication, updateCategoryOrder } from '@/api/articles'
import { Plus, Edit, Delete, Tickets, FolderAdd, ArrowUp, ArrowDown, View, Hide } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import UserAvatar from '@/components/Common/UserAvatar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToUserProfile = (userId) => {
  router.push(`/profile/${userId}`)
}

// 判断是否为移动端
const isMobile = computed(() => window.innerWidth < 768)

const loading = ref(false)
const categories = ref([])
const applications = ref([])
const applicationsLoading = ref(false)

const activeTab = ref('categories')
const applicationTab = ref('all')
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentCategory = ref(null)
const formData = ref({
  name: '',
  description: ''
})

const filteredApplications = computed(() => {
  if (applicationTab.value === 'all') {
    return applications.value
  } else if (applicationTab.value === 'pending') {
    return applications.value.filter(app => app.status === 0)
  } else if (applicationTab.value === 'approved') {
    return applications.value.filter(app => app.status === 1)
  } else if (applicationTab.value === 'rejected') {
    return applications.value.filter(app => app.status === 2)
  }
  return applications.value
})

const handleApplicationTabChange = (tab) => {
  applicationTab.value = tab
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const reviewDialogVisible = ref(false)
const currentApplication = ref(null)
const reviewData = ref({
  action: 'approve',
  review_comment: ''
})

const fetchCategories = async () => {
  try {
    loading.value = true
    categories.value = await getCategories()
  } catch (error) {
    console.error('获取分类失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchApplications = async () => {
  try {
    applicationsLoading.value = true
    applications.value = await getCategoryApplications()
  } catch (error) {
    console.error('获取分类申请失败:', error)
  } finally {
    applicationsLoading.value = false
  }
}

const openCreateDialog = () => {
  isEdit.value = false
  currentCategory.value = null
  formData.value = {
    name: '',
    description: ''
  }
  dialogVisible.value = true
}

const openEditDialog = (category) => {
  isEdit.value = true
  currentCategory.value = category
  formData.value = {
    name: category.name,
    description: category.description || ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  try {
    if (isEdit.value) {
      await updateCategory(currentCategory.value.id, formData.value)
      ElMessage.success('分类更新成功')
    } else {
      await createCategory(formData.value)
      ElMessage.success('分类创建成功')
    }
    dialogVisible.value = false
    fetchCategories()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败，请稍后重试')
  }
}

const handleDelete = (category) => {
  ElMessageBox.confirm(
    `确定要删除分类「${category.name}」吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteCategory(category.id)
      ElMessage.success('分类删除成功')
      fetchCategories()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败，请稍后重试')
    }
  }).catch(() => {})
}

const moveCategoryUp = async (index) => {
  if (index > 0) {
    const temp = categories.value[index]
    categories.value[index] = categories.value[index - 1]
    categories.value[index - 1] = temp
    // 保存排序到后端
    try {
      const categoryIds = categories.value.map(cat => cat.id)
      await updateCategoryOrder(categoryIds)
      ElMessage.success('分类已上移')
    } catch (error) {
      console.error('保存排序失败:', error)
      ElMessage.error('保存排序失败，请稍后重试')
      // 恢复原排序
      categories.value[index - 1] = categories.value[index]
      categories.value[index] = temp
    }
  }
}

const moveCategoryDown = async (index) => {
  if (index < categories.value.length - 1) {
    const temp = categories.value[index]
    categories.value[index] = categories.value[index + 1]
    categories.value[index + 1] = temp
    // 保存排序到后端
    try {
      const categoryIds = categories.value.map(cat => cat.id)
      await updateCategoryOrder(categoryIds)
      ElMessage.success('分类已下移')
    } catch (error) {
      console.error('保存排序失败:', error)
      ElMessage.error('保存排序失败，请稍后重试')
      // 恢复原排序
      categories.value[index + 1] = categories.value[index]
      categories.value[index] = temp
    }
  }
}

const toggleCategoryHidden = (category) => {
  category.is_hidden = !category.is_hidden
  ElMessage.success(category.is_hidden ? '分类已隐藏' : '分类已显示')
}

const openReviewDialog = (application) => {
  currentApplication.value = application
  reviewData.value = {
    action: 'approve',
    review_comment: ''
  }
  reviewDialogVisible.value = true
}

const handleReview = async () => {
  try {
    await reviewCategoryApplication(currentApplication.value.id, reviewData.value)
    ElMessage.success(reviewData.value.action === 'approve' ? '审核通过，分类已创建' : '审核拒绝')
    reviewDialogVisible.value = false
    fetchApplications()
    if (reviewData.value.action === 'approve') {
      fetchCategories()
    }
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error(error.response?.data?.message || '审核失败，请稍后重试')
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 0:
      return '待审核'
    case 1:
      return '已通过'
    case 2:
      return '已拒绝'
    default:
      return '未知'
  }
}

const getStatusType = (status) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'info'
  }
}

onMounted(() => {
  fetchCategories()
  fetchApplications()
})
</script>

<template>
  <div class="category-manage-page">
    <PageHeader title="分类管理" subtitle="管理文章分类和描述">
    </PageHeader>

    <div class="content-card">
      <div class="card-header">
        <div class="tabs-section">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'categories' }"
            @click="handleTabChange('categories')"
          >
            <el-icon><Tickets /></el-icon>
            分类列表
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'applications' }"
            @click="handleTabChange('applications')"
          >
            <el-icon><FolderAdd /></el-icon>
            分类申请
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'categories'" class="categories-container" v-loading="loading">
        <div class="section-header">
          <h3 class="section-title">分类列表</h3>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>

        <div class="category-list">
          <div v-for="(category, index) in categories" :key="category.id" class="category-card" :class="{ 'is-hidden': category.is_hidden }">
            <div class="category-icon-wrapper">
              <span>{{ category.name.charAt(0) }}</span>
            </div>
            <div class="category-info">
              <h4 class="category-name">{{ category.name }}</h4>
              <p class="category-desc">{{ category.description || '暂无描述' }}</p>
              <el-tag v-if="category.is_hidden" size="small" type="info" class="hidden-tag">已隐藏</el-tag>
            </div>
            <div class="category-actions">
              <el-button link @click="moveCategoryUp(index)" :disabled="index === 0">
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button link @click="moveCategoryDown(index)" :disabled="index === categories.length - 1">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <el-button :type="category.is_hidden ? 'success' : 'warning'" link @click="toggleCategoryHidden(category)">
                <el-icon><View v-if="category.is_hidden" /><Hide v-else /></el-icon>
              </el-button>
              <el-button type="primary" link @click="openEditDialog(category)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" link @click="handleDelete(category)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <el-empty v-if="categories.length === 0 && !loading" description="暂无分类" />
        </div>
      </div>

      <div v-if="activeTab === 'applications'" class="applications-container" v-loading="applicationsLoading">
        <div class="filter-section">
          <div class="filter-left">
            <div class="my-article-tabs">
              <div
                class="my-tab-item"
                :class="{ active: applicationTab === 'all' }"
                @click="handleApplicationTabChange('all')"
              >
                全部
              </div>
              <div
                class="my-tab-item"
                :class="{ active: applicationTab === 'pending' }"
                @click="handleApplicationTabChange('pending')"
              >
                待审核
              </div>
              <div
                class="my-tab-item"
                :class="{ active: applicationTab === 'approved' }"
                @click="handleApplicationTabChange('approved')"
              >
                通过
              </div>
              <div
                class="my-tab-item"
                :class="{ active: applicationTab === 'rejected' }"
                @click="handleApplicationTabChange('rejected')"
              >
                未通过
              </div>
            </div>
          </div>
        </div>

        <!-- PC端表格 -->
        <el-table v-if="!isMobile" :data="filteredApplications" style="width: 100%">
          <el-table-column prop="name" label="分类名称" width="150" />
          <el-table-column prop="description" label="分类描述" min-width="200" />
          <el-table-column label="申请人" width="150">
            <template #default="{ row }">
              <div class="applicant-info" @click.stop="goToUserProfile(row.user_id)">
                <div class="applicant-avatar-wrapper">
                  <UserAvatar :user="{
                    id: row.user_id,
                    nickname: row.nickname,
                    username: row.username,
                    avatar: row.avatar,
                    show_avatar_badge: row.show_avatar_badge === 1 && row.avatar_badge && row.avatar_badge_bg_color && row.avatar_badge_text_color,
                    avatar_badge: row.avatar_badge,
                    avatar_badge_bg_color: row.avatar_badge_bg_color,
                    avatar_badge_text_color: row.avatar_badge_text_color
                  }" size="small" />
                </div>
                <span>{{ row.nickname || row.username }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="申请时间" width="180">
            <template #default="{ row }">
              {{ row.created_at }}
            </template>
          </el-table-column>
          <el-table-column label="审核意见" min-width="150">
            <template #default="{ row }">
              {{ row.review_comment || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 0"
                type="primary"
                size="small"
                @click="openReviewDialog(row)"
              >
                审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 移动端卡片列表 -->
        <div v-else class="mobile-card-list">
          <div
            v-for="app in filteredApplications"
            :key="app.id"
            class="mobile-application-card"
          >
            <div class="card-header-row">
              <span class="card-title">{{ app.name }}</span>
              <el-tag :type="getStatusType(app.status)" size="small">{{ getStatusText(app.status) }}</el-tag>
            </div>
            <div class="card-desc">{{ app.description || '暂无描述' }}</div>
            <div class="card-meta-row">
              <div class="card-applicant" @click="goToUserProfile(app.user_id)">
                <div class="applicant-avatar-tiny">
                  <UserAvatar :user="{
                    id: app.user_id,
                    nickname: app.nickname,
                    username: app.username,
                    avatar: app.avatar,
                    show_avatar_badge: app.show_avatar_badge === 1 && app.avatar_badge && app.avatar_badge_bg_color && app.avatar_badge_text_color,
                    avatar_badge: app.avatar_badge,
                    avatar_badge_bg_color: app.avatar_badge_bg_color,
                    avatar_badge_text_color: app.avatar_badge_text_color
                  }" size="tiny" />
                </div>
                <span class="applicant-name">{{ app.nickname || app.username }}</span>
              </div>
              <span class="card-time">{{ app.created_at }}</span>
            </div>
            <div v-if="app.review_comment" class="card-review-comment">
              审核意见: {{ app.review_comment }}
            </div>
            <div v-if="app.status === 0" class="card-actions-row">
              <el-button type="primary" size="small" @click="openReviewDialog(app)">审核</el-button>
            </div>
          </div>
        </div>

        <el-empty v-if="filteredApplications.length === 0 && !applicationsLoading" description="暂无分类申请" />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新建分类'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="分类名称">
          <el-input
            v-model="formData.name"
            placeholder="请输入分类名称"
            size="large"
          />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分类描述（可选）"
            size="large"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit()">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="reviewDialogVisible"
      title="审核分类申请"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="application-preview">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="分类名称">
            {{ currentApplication?.name }}
          </el-descriptions-item>
          <el-descriptions-item label="分类描述">
            {{ currentApplication?.description || '暂无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            {{ currentApplication?.nickname || currentApplication?.username }}
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ currentApplication?.created_at }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form :model="reviewData" label-width="80px" class="review-form">
        <el-form-item label="审核结果">
          <el-radio-group v-model="reviewData.action">
            <el-radio value="approve">通过</el-radio>
            <el-radio value="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="reviewData.review_comment"
            type="textarea"
            :rows="3"
            placeholder="请输入审核意见（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReview">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.category-manage-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
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
    background: #eaf2ff;
    color: #165dff;
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

.categories-container,
.applications-container {
  min-height: 400px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #165dff;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
  }

  &.is-hidden {
    opacity: 0.6;
    background: #f0f0f0;
  }
}

.hidden-tag {
  margin-top: 4px;
}

.category-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;

  span {
    font-size: 20px;
    font-weight: 700;
  }
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px;
}

.category-desc {
  font-size: 14px;
  color: #4e5969;
  margin: 0 0 2px;
}

.category-actions {
  display: flex;
  gap: 4px;
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
}

.applicant-avatar-wrapper {
  position: relative;
  display: inline-flex;

  .el-avatar {
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

.application-preview {
  margin-bottom: 24px;
}

.review-form {
  margin-top: 24px;
}

/* 移动端卡片列表样式 */
.mobile-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-application-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f2f3f5;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.card-desc {
  font-size: 13px;
  color: #86909c;
  margin-bottom: 12px;
  line-height: 1.5;
}

.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-applicant {
  display: flex;
  align-items: center;
  gap: 8px;
}

.applicant-avatar-tiny {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.applicant-name {
  font-size: 13px;
  color: #4e5969;
}

.card-time {
  font-size: 12px;
  color: #86909c;
}

.card-review-comment {
  font-size: 12px;
  color: #86909c;
  background: #f7f8fa;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.card-actions-row {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
}

@media (max-width: 768px) {
  .category-manage-page {
    padding: 16px;
  }

  .card-header {
    padding: 16px;
  }

  .tabs-section {
    flex-wrap: wrap;
  }

  .tab-item {
    padding: 8px 16px;
    font-size: 13px;
  }

  .categories-container,
  .applications-container {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .category-card {
    flex-wrap: wrap;
  }

  .category-actions {
    width: 100%;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid #e5e6eb;
  }
}
</style>
