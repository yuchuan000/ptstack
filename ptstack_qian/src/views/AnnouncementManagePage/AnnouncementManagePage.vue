<template>
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
        <el-table :data="announcements" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
          <el-table-column label="跑马灯" width="100">
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
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
  } catch (error) {
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
  } catch (error) {
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
</style>
