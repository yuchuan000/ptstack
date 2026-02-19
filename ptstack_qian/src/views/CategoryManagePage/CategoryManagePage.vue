<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategories, createCategory, updateCategory, deleteCategory, applyCategory, getCategoryApplications, reviewCategoryApplication } from '@/api/articles'
import { Plus, Edit, Delete, DocumentAdd } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { getFullUrl } from '@/utils/url'

const userStore = useUserStore()
const router = useRouter()

const isAdmin = computed(() => userStore.userInfo?.isAdmin || false)

const goToUserProfile = (userId) => {
  router.push(`/profile/${userId}`)
}

const loading = ref(false)
const categories = ref([])
const applications = ref([])
const applicationsLoading = ref(false)

const activeTab = ref('categories')
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentCategory = ref(null)
const formData = ref({
  name: '',
  description: ''
})

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

const openApplyDialog = () => {
  isEdit.value = false
  currentCategory.value = null
  formData.value = {
    name: '',
    description: ''
  }
  dialogVisible.value = true
}

const handleApply = async () => {
  if (!formData.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  try {
    await applyCategory(formData.value)
    ElMessage.success('分类申请提交成功，请等待审核')
    dialogVisible.value = false
    if (isAdmin.value) {
      fetchApplications()
    }
  } catch (error) {
    console.error('申请失败:', error)
    ElMessage.error(error.response?.data?.message || '申请失败，请稍后重试')
  }
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
  if (isAdmin.value) {
    fetchApplications()
  }
})

watch(() => userStore.userInfo, () => {
  if (isAdmin.value) {
    fetchApplications()
  }
}, { immediate: true })
</script>

<template>
  <div class="category-manage-page">
    <PageHeader title="分类管理" subtitle="管理文章分类和描述">
      <template #actions>
        <el-button
          v-if="isAdmin"
          type="primary"
          size="large"
          @click="openCreateDialog"
        >
          <el-icon><Plus /></el-icon>
          新建分类
        </el-button>
        <el-button
          v-else
          type="primary"
          size="large"
          @click="openApplyDialog"
        >
          <el-icon><DocumentAdd /></el-icon>
          申请创建分类
        </el-button>
      </template>
    </PageHeader>

    <div class="content-card">
      <el-tabs v-model="activeTab" class="category-tabs">
        <el-tab-pane label="分类列表" name="categories">
          <div class="categories-container" v-loading="loading">
            <div class="category-grid">
              <div class="category-card" v-for="category in categories" :key="category.id">
                <div class="category-icon">
                  <span>{{ category.name.charAt(0) }}</span>
                </div>
                <div class="category-info">
                  <h3 class="category-name">{{ category.name }}</h3>
                  <p class="category-desc" v-if="category.description">{{ category.description }}</p>
                  <p class="category-desc empty" v-else>暂无描述</p>
                </div>
                <div class="category-actions" v-if="isAdmin">
                  <el-button circle size="small" @click="openEditDialog(category)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button circle size="small" type="danger" @click="handleDelete(category)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <el-empty v-if="categories.length === 0 && !loading" description="暂无分类" />
          </div>
        </el-tab-pane>

        <el-tab-pane v-if="isAdmin" label="分类申请" name="applications">
          <div class="applications-container" v-loading="applicationsLoading">
            <el-table :data="applications" style="width: 100%">
              <el-table-column prop="name" label="分类名称" width="150" />
              <el-table-column prop="description" label="分类描述" min-width="200" />
              <el-table-column label="申请人" width="150">
                <template #default="{ row }">
                  <div class="applicant-info" @click.stop="goToUserProfile(row.user_id)">
                    <div class="applicant-avatar-wrapper">
                      <el-avatar v-if="row.avatar" :size="32" :src="getFullUrl(row.avatar)" />
                      <el-avatar v-else :size="32">{{ (row.nickname || row.username || '').charAt(0) }}</el-avatar>
                      <span v-if="row.is_admin === 1" class="avatar-admin-badge">管</span>
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
              <el-table-column v-if="isAdmin" label="审核意见" min-width="150">
                <template #default="{ row }">
                  {{ row.review_comment || '-' }}
                </template>
              </el-table-column>
              <el-table-column v-if="isAdmin" label="操作" width="150" fixed="right">
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

            <el-empty v-if="applications.length === 0 && !applicationsLoading" description="暂无分类申请" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isAdmin ? (isEdit ? '编辑分类' : '新建分类') : '申请创建分类'"
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
        <el-button type="primary" @click="isAdmin ? handleSubmit() : handleApply()">
          {{ isAdmin ? (isEdit ? '更新' : '创建') : '提交申请' }}
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
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.category-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }
}

.categories-container,
.applications-container {
  min-height: 400px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.category-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
}

.category-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  span {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
  }
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 17px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 6px 0;
}

.category-desc {
  font-size: 14px;
  color: #86909c;
  line-height: 1.6;
  margin: 0;

  &.empty {
    color: #c9cdd4;
    font-style: italic;
  }
}

.category-actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;

  .category-card:hover & {
    opacity: 1;
  }
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
    width: 18px;
    height: 18px;
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

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>
