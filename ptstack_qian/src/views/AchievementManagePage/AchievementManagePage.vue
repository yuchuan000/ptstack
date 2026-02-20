<template>
  <div class="achievement-manage-page">
    <PageHeader title="成就管理" subtitle="管理系统成就，创建和编辑成就规则">
      <template #actions>
        <el-button type="success" @click="handleBatchGrant" :disabled="selectedAchievements.length === 0">
          <el-icon><Trophy /></el-icon>
          批量颁发
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建成就
        </el-button>
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <el-card class="achievements-card">
        <div class="card-header">
          <div class="tabs-section">
            <div
              class="tab-item"
              :class="{ active: activeTab === 'all' }"
              @click="handleTabChange('all')"
            >
              全部成就
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'unconditional' }"
              @click="handleTabChange('unconditional')"
            >
              无条件成就
            </div>
          </div>
        </div>

        <el-table :data="filteredAchievements" v-loading="loading" stripe @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="成就名称" show-overflow-tooltip />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="handleViewDetail(row)">管理</el-button>
              <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑成就' : '新建成就'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="成就名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入成就名称" />
        </el-form-item>
        <el-form-item label="成就描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入成就描述"
          />
        </el-form-item>
        <el-form-item label="成就类型" prop="type" v-if="!form.is_unconditional">
          <el-select v-model="form.type" placeholder="请选择成就类型" style="width: 100%;" clearable>
            <el-option label="文章" value="article" />
            <el-option label="评论" value="comment" />
            <el-option label="点赞" value="like" />
            <el-option label="关注" value="follow" />
            <el-option label="粉丝" value="follower" />
          </el-select>
        </el-form-item>
        <el-form-item label="达成条件" prop="condition_value" v-if="!form.is_unconditional">
          <el-input
            v-model="form.condition_value"
            placeholder="请输入达成条件"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <div class="icon-selector">
            <div class="icon-preview-wrapper">
              <el-upload
                class="icon-uploader"
                :show-file-list="false"
                :auto-upload="false"
                :before-upload="beforeIconUpload"
                :on-change="handleIconChange"
                accept="image/*"
              >
                <div v-if="form.icon && isImageIcon(form.icon)" class="icon-preview-container">
                  <img :src="getFullUrl(form.icon)" class="icon-preview-image" />
                  <div class="icon-preview-overlay">
                    <el-icon><Plus /></el-icon>
                  </div>
                </div>
                <div v-else-if="form.icon && !isImageIcon(form.icon)" class="icon-preview-container">
                  <component :is="iconMap[form.icon]" class="icon-preview-component" />
                  <div class="icon-preview-overlay">
                    <el-icon><Plus /></el-icon>
                  </div>
                </div>
                <div v-else class="icon-placeholder">
                  <el-icon><Plus /></el-icon>
                  <div class="icon-placeholder-text">点击上传</div>
                </div>
              </el-upload>
            </div>
            <div class="icon-select">
              <el-select v-model="form.icon" placeholder="或选择预设图标" style="width: 100%;" clearable>
                <el-option label="文档" value="Document" />
                <el-option label="评论" value="ChatDotRound" />
                <el-option label="星星" value="Star" />
                <el-option label="用户" value="User" />
                <el-option label="用户(填充)" value="UserFilled" />
                <el-option label="奖杯" value="Trophy" />
              </el-select>
            </div>
            <div v-if="form.icon" class="clear-icon-btn">
              <el-button type="danger" link @click="clearIcon">清除</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="活动成就">
          <el-switch v-model="form.is_event" />
        </el-form-item>
        <el-form-item label="限定成就">
          <el-switch v-model="form.is_limited" />
        </el-form-item>
        <el-form-item label="无条件成就">
          <el-switch v-model="form.is_unconditional" />
        </el-form-item>
        <el-form-item label="自定义标签" prop="custom_tag">
          <el-input v-model="form.custom_tag" placeholder="请输入自定义标签" clearable />
        </el-form-item>
        <el-form-item v-if="form.is_event" label="活动时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="batchGrantDialogVisible"
      title="批量颁发成就"
      width="800px"
      @close="resetBatchGrantForm"
    >
      <div class="batch-grant-content">
        <div class="section">
          <h4 class="section-title">已选择的成就：</h4>
          <el-tag
            v-for="achievement in selectedAchievements"
            :key="achievement.id"
            closable
            @close="removeAchievementFromSelection(achievement)"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ achievement.name }}
          </el-tag>
        </div>

        <div class="section">
          <h4 class="section-title">选择用户：</h4>
          <el-select
            v-model="selectedUserIds"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请搜索并选择用户"
            :remote-method="remoteSearchUsers"
            :loading="usersLoading"
            style="width: 100%;"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            />
          </el-select>
        </div>
      </div>

      <template #footer>
        <el-button @click="batchGrantDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleBatchGrantSubmit"
          :loading="batchGrantLoading"
          :disabled="selectedAchievements.length === 0 || selectedUserIds.length === 0"
        >
          颁发
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Document, ChatDotRound, Star, User, UserFilled, Trophy } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import { getFullUrl } from '@/utils/url'
import { uploadAvatar } from '@/api/auth'
import {
  getAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement
} from '@/api/achievements'
import { getAllUsersAdmin } from '@/api/users'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const achievements = ref([])
const formRef = ref(null)
const editingId = ref(null)
const dateRange = ref(null)
const activeTab = ref('all')

const selectedAchievements = ref([])
const batchGrantDialogVisible = ref(false)
const batchGrantLoading = ref(false)
const selectedUserIds = ref([])
const userOptions = ref([])
const usersLoading = ref(false)

const form = ref({
  name: '',
  description: '',
  type: '',
  condition_value: '',
  icon: '',
  is_event: false,
  is_limited: false,
  is_unconditional: false,
  custom_tag: ''
})

const rules = {
  name: [{ required: true, message: '请输入成就名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入成就描述', trigger: 'blur' }]
}

const achievementTypes = [
  { key: 'article', label: '文章' },
  { key: 'comment', label: '评论' },
  { key: 'like', label: '点赞' },
  { key: 'follow', label: '关注' },
  { key: 'follower', label: '粉丝' },
  { key: 'event', label: '活动' }
]

const iconMap = {
  Document,
  ChatDotRound,
  Star,
  User,
  UserFilled,
  Trophy
}

const iconNameMap = {
  Document: '文档',
  ChatDotRound: '评论',
  Star: '星星',
  User: '用户',
  UserFilled: '用户(填充)',
  Trophy: '奖杯'
}

const filteredAchievements = computed(() => {
  if (activeTab.value === 'all') {
    return achievements.value
  } else {
    return achievements.value.filter(a => a.is_unconditional === 1 || a.is_unconditional === true)
  }
})

const isImageIcon = (icon) => {
  if (!icon) return false
  return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.')
}

const getTypeLabel = (type) => {
  const typeItem = achievementTypes.find(t => t.key === type)
  return typeItem?.label || type
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const beforeIconUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleIconChange = async (file) => {
  if (file.raw) {
    try {
      submitLoading.value = true
      const uploadResponse = await uploadAvatar(file.raw)
      form.value.icon = uploadResponse.url
      ElMessage.success('图标上传成功')
    } catch (error) {
      console.error('上传失败:', error)
      ElMessage.error('图标上传失败')
    } finally {
      submitLoading.value = false
    }
  }
}

const clearIcon = () => {
  form.value.icon = ''
}

const loadAchievements = async () => {
  loading.value = true
  try {
    const response = await getAchievements()
    achievements.value = response.achievements || []
  } catch (error) {
    console.error('获取成就列表失败:', error)
    ElMessage.error('获取成就列表失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const handleCreate = () => {
  isEdit.value = false
  editingId.value = null
  dateRange.value = null
  form.value = {
    name: '',
    description: '',
    type: '',
    condition_value: '',
    icon: '',
    is_event: false,
    is_limited: false,
    is_unconditional: activeTab.value === 'unconditional',
    custom_tag: ''
  }
  dialogVisible.value = true
}

const handleViewDetail = (row) => {
  router.push(`/achievements-manage/${row.id}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除成就「${row.name}」吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteAchievement(row.id)
      ElMessage.success('删除成功')
      loadAchievements()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const data = {
          ...form.value,
          start_time: dateRange.value?.[0] || null,
          end_time: dateRange.value?.[1] || null
        }
        
        console.log('准备提交的数据:', data)

        if (isEdit.value) {
          await updateAchievement(editingId.value, data)
          ElMessage.success('更新成功')
        } else {
          await createAchievement(data)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadAchievements()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    type: '',
    condition_value: '',
    icon: '',
    is_event: false,
    is_limited: false,
    is_unconditional: false,
    custom_tag: ''
  }
  dateRange.value = null
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

onMounted(() => {
  loadAchievements()

  if (route.params.id) {
    initEdit(route.params.id)
  }
})

const initEdit = async (id) => {
  try {
    loading.value = true
    const res = await getAchievementById(id)
    const achievement = res.achievement

    if (achievement) {
      isEdit.value = true
      editingId.value = achievement.id
      activeTab.value = achievement.is_unconditional ? 'unconditional' : 'all'
      dateRange.value = achievement.start_time && achievement.end_time
        ? [new Date(achievement.start_time), new Date(achievement.end_time)]
        : null
      form.value = {
        name: achievement.name,
        description: achievement.description,
        type: achievement.type || '',
        condition_value: achievement.condition_value || '',
        icon: achievement.icon || '',
        is_event: !!achievement.is_event,
        is_limited: !!achievement.is_limited,
        is_unconditional: !!achievement.is_unconditional,
        custom_tag: achievement.custom_tag || ''
      }
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取成就失败:', error)
    ElMessage.error('获取成就失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedAchievements.value = selection
}

const handleBatchGrant = () => {
  batchGrantDialogVisible.value = true
}

const removeAchievementFromSelection = (achievement) => {
  const index = selectedAchievements.value.findIndex(a => a.id === achievement.id)
  if (index > -1) {
    selectedAchievements.value.splice(index, 1)
  }
}

const remoteSearchUsers = async (query) => {
  if (query) {
    usersLoading.value = true
    try {
      const response = await getAllUsersAdmin({ search: query, pageSize: 100 })
      userOptions.value = response.users || []
    } catch (error) {
      console.error('搜索用户失败:', error)
    } finally {
      usersLoading.value = false
    }
  } else {
    userOptions.value = []
  }
}

const resetBatchGrantForm = () => {
  selectedUserIds.value = []
  userOptions.value = []
}

const handleBatchGrantSubmit = async () => {
  try {
    batchGrantLoading.value = true
    const achievementIds = selectedAchievements.value.map(a => a.id)
    const userIds = selectedUserIds.value

    await request({
      url: '/achievements/batch-grant',
      method: 'post',
      data: {
        achievementIds,
        userIds
      }
    })

    ElMessage.success('批量颁发成功')
    batchGrantDialogVisible.value = false
    resetBatchGrantForm()
  } catch (error) {
    console.error('批量颁发失败:', error)
    ElMessage.error(error.response?.data?.message || '批量颁发失败')
  } finally {
    batchGrantLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.achievement-manage-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-wrapper {
  margin-top: 24px;
}

.achievements-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  :deep(.el-card__body) {
    padding: 0;
  }
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e6eb;
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

.icon-display {
  font-size: 20px;
  color: #165dff;
}

.icon-image {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
}

.icon-selector {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.icon-preview-wrapper {
  flex-shrink: 0;
}

.icon-uploader {
  :deep(.el-upload) {
    border: 2px dashed #e5e6eb;
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
    width: 80px;
    height: 80px;

    &:hover {
      border-color: #165dff;
      background: #eaf2ff;
    }
  }
}

.icon-preview-container {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover .icon-preview-overlay {
    opacity: 1;
  }
}

.icon-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.icon-preview-component {
  font-size: 40px;
  color: #165dff;
}

.icon-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;

  .el-icon {
    font-size: 24px;
    color: white;
  }
}

.icon-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.icon-placeholder-text {
  font-size: 12px;
  color: #86909c;
}

.icon-select {
  flex: 1;
}

.clear-icon-btn {
  flex-shrink: 0;
  padding-top: 8px;
}

.event-time-text {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .achievement-manage-page {
    padding: 16px;
  }
}

.batch-grant-content {
  .section {
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 12px;
  }
}
</style>
