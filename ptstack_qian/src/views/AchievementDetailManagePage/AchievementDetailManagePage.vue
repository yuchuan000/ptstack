<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  Delete,
  Trophy,
  Document,
  ChatDotRound,
  Star,
  User,
  UserFilled,
  Search,
  Plus,
  Unlock
} from '@element-plus/icons-vue'
import {
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  grantAchievement,
  getAchievementUsers,
  removeAchievementFromUser
} from '@/api/achievements'
import { getFullUrl } from '@/utils/url'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const achievement = ref(null)
const achievementUsers = ref([])
const usersLoading = ref(false)
const searchKeyword = ref('')
const grantPublicId = ref('')
const grantDialogVisible = ref(false)
const selectedUsers = ref([])

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

const typeLabelMap = {
  article: '文章',
  comment: '评论',
  like: '点赞',
  follow: '关注',
  follower: '粉丝',
  event: '活动'
}

const isImageIcon = (icon) => {
  if (!icon) return false
  return icon.includes('.') || icon.startsWith('http://') || icon.startsWith('https://') || icon.includes('/')
}

const getTypeLabel = (type) => {
  return typeLabelMap[type] || type
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchAchievement = async () => {
  try {
    loading.value = true
    const res = await getAchievementById(route.params.id)
    achievement.value = res.achievement
    if (!achievement.value) {
      ElMessage.error('成就不存在')
      router.push('/achievements-manage')
    }
  } catch (error) {
    console.error('获取成就失败:', error)
    ElMessage.error('获取成就失败')
    if (error.response?.status === 404) {
      router.push('/achievements-manage')
    }
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    usersLoading.value = true
    const res = await getAchievementUsers(route.params.id)
    achievementUsers.value = res.users || []
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    usersLoading.value = false
  }
}

const handleEdit = () => {
  router.push(`/achievements-manage/edit/${achievement.value.id}`)
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除成就「${achievement.value.name}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteAchievement(achievement.value.id)
    ElMessage.success('删除成功')
    router.push('/achievements-manage')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleGrant = async () => {
  if (!grantPublicId.value.trim()) {
    ElMessage.warning('请输入用户ID')
    return
  }
  try {
    await grantAchievement({
      achievement_id: achievement.value.id,
      public_id: grantPublicId.value.trim()
    })
    ElMessage.success('颁发成功')
    grantDialogVisible.value = false
    grantPublicId.value = ''
    fetchUsers()
  } catch (error) {
    console.error('颁发失败:', error)
    if (error.response?.status === 404) {
      ElMessage.error('用户不存在')
    } else {
      ElMessage.error(error.response?.data?.message || '颁发失败')
    }
  }
}

const handleRemoveUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除用户「${user.nickname || user.username}」的该成就吗？`,
      '移除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await removeAchievementFromUser({
      achievement_id: achievement.value.id,
      user_id: user.id
    })
    ElMessage.success('移除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除失败:', error)
      ElMessage.error('移除失败')
    }
  }
}

const filteredUsers = computed(() => {
  if (!searchKeyword.value) return achievementUsers.value
  const keyword = searchKeyword.value.toLowerCase()
  return achievementUsers.value.filter(user =>
    user.username?.toLowerCase().includes(keyword) ||
    user.nickname?.toLowerCase().includes(keyword)
  )
})

const goBack = () => {
  router.push('/achievements-manage')
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleBatchRemove = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要移除的用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要移除${selectedUsers.value.length}个用户的该成就吗？`,
      '批量移除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const userIds = selectedUsers.value.map(user => user.id)
    await request({
      url: '/achievements/batch-remove',
      method: 'post',
      data: {
        achievement_id: achievement.value.id,
        userIds
      }
    })

    ElMessage.success('批量移除成功')
    selectedUsers.value = []
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量移除失败:', error)
      ElMessage.error(error.response?.data?.message || '批量移除失败')
    }
  }
}

onMounted(() => {
  fetchAchievement()
  fetchUsers()
})
</script>

<template>
  <div class="achievement-detail-manage-page">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="content-wrapper">
      <div class="achievement-card" v-if="achievement">
        <div class="card-header-section">
          <div class="achievement-main">
            <div class="achievement-icon-wrapper">
              <template v-if="achievement.icon">
                <template v-if="isImageIcon(achievement.icon)">
                  <img :src="getFullUrl(achievement.icon)" class="achievement-icon-image" />
                </template>
                <template v-else>
                  <el-icon class="achievement-icon-component">
                    <component :is="iconMap[achievement.icon]" />
                  </el-icon>
                </template>
              </template>
              <el-icon v-else class="achievement-icon-component">
                <Trophy />
              </el-icon>
            </div>
            <div class="achievement-info">
              <h2 class="achievement-name">
                {{ achievement.name }}
                <el-tag v-if="achievement.type" size="small" type="primary" style="margin-left: 12px;">
                  {{ getTypeLabel(achievement.type) }}
                </el-tag>
                <el-tag v-if="achievement.is_event" size="small" type="warning" style="margin-left: 8px;">
                  活动
                </el-tag>
                <el-tag v-if="achievement.is_limited" size="small" type="danger" style="margin-left: 8px;">
                  限定
                </el-tag>
                <el-tag v-if="achievement.is_unconditional" size="small" type="info" style="margin-left: 8px;">
                  无条件
                </el-tag>
                <el-tag v-if="achievement.custom_tag" size="small" type="success" style="margin-left: 8px;">
                  {{ achievement.custom_tag }}
                </el-tag>
              </h2>
              <div class="achievement-meta">
                <span v-if="achievement.start_time && achievement.end_time" class="event-time">
                  <el-icon class="time-icon"><Trophy /></el-icon>
                  {{ formatDate(achievement.start_time) }} 至 {{ formatDate(achievement.end_time) }}
                </span>
              </div>
              <div class="achievement-stats">
                <div class="stat-item">
                  <span class="stat-label">成就描述</span>
                  <span class="stat-value">{{ achievement.description || '-' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">获得人数</span>
                  <span class="stat-value">{{ achievementUsers.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">创建时间</span>
                  <span class="stat-value">{{ formatDate(achievement.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="handleEdit" plain>
              <el-icon><Edit /></el-icon>
              编辑成就
            </el-button>
            <el-button type="success" size="large" @click="grantDialogVisible = true" plain>
              <el-icon><Trophy /></el-icon>
              颁发成就
            </el-button>
            <el-button type="danger" size="large" @click="handleDelete" plain>
              <el-icon><Delete /></el-icon>
              删除成就
            </el-button>
          </div>
        </div>
      </div>

      <div class="users-card">
        <div class="card-header-section">
          <div class="section-actions">
            <el-button
              type="danger"
              @click="handleBatchRemove"
              :disabled="selectedUsers.length === 0"
            >
              <el-icon><Delete /></el-icon>
              批量移除 ({{ selectedUsers.length }})
            </el-button>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名或昵称..."
              class="search-input"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <div class="users-table-container" v-loading="usersLoading">
          <el-alert
            v-if="achievementUsers.length === 0 && !usersLoading"
            title="暂无用户获得此成就"
            type="info"
            show-icon
            :closable="false"
            class="empty-alert"
          />
          <el-table v-else :data="filteredUsers" stripe class="users-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="用户" min-width="200">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar :size="40" :src="getFullUrl(row.avatar)" class="user-avatar">
                    {{ (row.nickname || row.username)?.charAt(0)?.toUpperCase() }}
                  </el-avatar>
                  <div class="user-info">
                    <div class="user-name">{{ row.nickname || row.username }}</div>
                    <div class="user-username">@{{ row.username }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="获得时间" width="180">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="time-icon"><Star /></el-icon>
                  {{ formatDate(row.earned_at) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="{ row }">
                <el-button size="small" type="danger" link @click="handleRemoveUser(row)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="grantDialogVisible"
      title="颁发成就"
      width="500px"
      @close="grantPublicId = ''"
    >
      <el-form :model="{ publicId: grantPublicId }" label-width="80px">
        <el-form-item label="用户ID">
          <el-input
            v-model="grantPublicId"
            placeholder="请输入要颁发给的用户ID"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="grantDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleGrant">确定颁发</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.achievement-detail-manage-page {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #86909c;
  font-size: 14px;
  padding: 8px 12px;

  &:hover {
    color: #4080ff;
  }
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.achievement-card,
.users-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.achievement-card .card-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
}

.achievement-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
}

.stat-value {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.users-card .card-header-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.achievement-main {
  display: flex;
  gap: 24px;
  flex: 1;
  align-items: flex-start;
}

.achievement-icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ffd54f 0%, #ffb300 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 179, 0, 0.3);
  color: white;
}

.achievement-icon-component {
  font-size: 56px;
}

.unlock-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #00b42a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 180, 42, 0.3);

  .el-icon {
    font-size: 18px;
  }
}

.achievement-icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.achievement-icon-component {
  font-size: 56px;
  color: #ffffff;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 32px;
  font-weight: 700;
  color: #1d2129;
  margin: 0 0 16px 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
}

.achievement-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.event-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #86909c;
  padding: 6px 12px;
  background: #f7f8fa;
  border-radius: 6px;
}

.time-icon {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 20px;
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
  line-height: 1.2;
}

.title-sub {
  font-size: 13px;
  color: #86909c;
  line-height: 1.2;
}

.section-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 280px;
}

.empty-alert {
  margin-bottom: 0;
}

.users-table {
  .user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-avatar {
    flex-shrink: 0;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
  }

  .user-username {
    font-size: 12px;
    color: #86909c;
  }

  .time-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #86909c;
    font-size: 14px;
  }
}

@media (max-width: 1024px) {
  .achievement-detail-manage-page {
    padding: 16px;
  }

  .card-header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .achievement-main {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .achievement-meta {
    justify-content: center;
  }

  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .achievement-details-grid {
    grid-template-columns: 1fr;
  }

  .section-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }
}
</style>
