<template>
<!-- 公告管理页面组件 -->
<!-- 功能：管理系统公告，支持创建、编辑、删除和状态切换 -->
  <div class="announcement-manage-page">
    <PageHeader title="公告管理" subtitle="管理系统公告，支持精准投放和多种发送方式">
      <template #actions>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建公告
        </el-button>
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <el-card class="announcements-card">
        <!-- PC端表格 -->
        <el-table v-if="!isMobile" :data="announcements" v-loading="loading" stripe>
          <el-table-column label="ID" width="100">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.id }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
          <el-table-column label="首页顶部通告" width="120">
            <template #default="{ row }">
              <el-tag :type="row.is_marquee ? 'success' : 'info'">
                {{ row.is_marquee ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="100">
            <template #default="{ row }">
              <el-tag>{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="目标类型" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.target_type === 'all'" type="success">全部用户</el-tag>
              <el-tag v-else-if="row.target_type === 'group'" type="warning">用户组</el-tag>
              <el-tag v-else type="primary">指定用户</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发送方式" width="200">
            <template #default="{ row }">
              <el-tag v-for="method in parseDeliveryMethods(row.delivery_methods)" :key="method" size="small" style="margin-right: 4px;">
                {{ method === 'email' ? '邮箱' : method === 'popup' ? '弹窗' : '消息中心' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-switch v-model="row.is_active" @change="(val) => handleToggleActive(row, val)" />
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 移动端卡片列表 -->
        <div v-else class="mobile-card-list">
          <div
            v-for="announcement in announcements"
            :key="announcement.id"
            class="mobile-announcement-card"
          >
            <div class="card-header-row">
              <span class="card-title">{{ announcement.title }}</span>
              <el-tag size="small" type="info">#{{ announcement.id }}</el-tag>
            </div>
            <div class="card-tags-row">
              <el-tag v-if="announcement.is_marquee" type="success" size="small">首页通告</el-tag>
              <el-tag size="small">优先级: {{ announcement.priority }}</el-tag>
              <el-tag v-if="announcement.target_type === 'all'" type="success" size="small">全部用户</el-tag>
              <el-tag v-else-if="announcement.target_type === 'group'" type="warning" size="small">用户组</el-tag>
              <el-tag v-else type="primary" size="small">指定用户</el-tag>
            </div>
            <div class="card-methods-row">
              <span class="methods-label">发送方式:</span>
              <el-tag v-for="method in parseDeliveryMethods(announcement.delivery_methods)" :key="method" size="small">
                {{ method === 'email' ? '邮箱' : method === 'popup' ? '弹窗' : '消息中心' }}
              </el-tag>
            </div>
            <div class="card-meta-row">
              <span class="card-time">{{ formatDate(announcement.created_at) }}</span>
              <el-switch v-model="announcement.is_active" @change="(val) => handleToggleActive(announcement, val)" />
            </div>
            <div class="card-actions-row">
              <el-button size="small" @click="handleEdit(announcement)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(announcement)">删除</el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
// 公告管理页面组件
// 功能：管理系统公告，支持创建、编辑、删除和状态切换
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import {
  getAllAnnouncementsAdmin,
  updateAnnouncement,
  deleteAnnouncement
} from '@/api/announcements'

const router = useRouter()

// 判断是否为移动端
const isMobile = computed(() => window.innerWidth < 768)

const loading = ref(false)
const isInitializing = ref(false)
const announcements = ref([])

const loadAnnouncements = async () => {
  loading.value = true
  isInitializing.value = true
  try {
    const res = await getAllAnnouncementsAdmin()
    announcements.value = (res.announcements || []).map(item => ({
      ...item,
      is_active: !!item.is_active,
      is_marquee: !!item.is_marquee
    }))
  } catch {
    ElMessage.error('获取公告列表失败')
  } finally {
    loading.value = false
    setTimeout(() => {
      isInitializing.value = false
    }, 100)
  }
}

const handleCreate = () => {
  router.push('/announcement/create')
}

const handleEdit = (row) => {
  router.push(`/announcement/edit/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条公告吗？', '提示', {
      type: 'warning'
    })
    await deleteAnnouncement(row.id)
    ElMessage.success('删除成功')
    loadAnnouncements()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleToggleActive = async (row, val) => {
  if (isInitializing.value) {
    return
  }

  const originalValue = row.is_active

  try {
    await updateAnnouncement(row.id, { is_active: val })
    ElMessage.success('状态更新成功')
  } catch {
    row.is_active = originalValue
    ElMessage.error('状态更新失败')
  }
}

const parseDeliveryMethods = (methods) => {
  if (!methods) return []
  try {
    return JSON.parse(methods)
  } catch {
    return []
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped lang="scss">
.announcement-manage-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-wrapper {
  margin-top: 24px;
}

.announcements-card {
  .el-table {
    margin-top: 16px;
  }
}

/* 移动端卡片列表样式 */
.mobile-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.mobile-announcement-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f2f3f5;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
  flex: 1;
}

.card-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.card-methods-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .methods-label {
    font-size: 13px;
    color: #86909c;
  }
}

.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-time {
  font-size: 12px;
  color: #86909c;
}

.card-actions-row {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
}

@media (max-width: 768px) {
  .announcement-manage-page {
    padding: 16px;
  }

  .content-wrapper {
    margin-top: 16px;
  }

  .announcements-card {
    .el-card__body {
      padding: 0;
    }
  }
}
</style>
