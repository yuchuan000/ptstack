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

    <el-dialog
      v-model="dialogVisible"
      :title="editingAnnouncement ? '编辑公告' : '新建公告'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-input-number v-model="form.priority" :min="0" :max="999" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="首页跑马灯">
              <el-switch v-model="form.is_marquee" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="form.start_time"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="form.end_time"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="目标类型">
          <el-radio-group v-model="form.target_type">
            <el-radio value="all">全部用户</el-radio>
            <el-radio value="specific">指定用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.target_type === 'specific'" label="用户ID">
          <el-input
            v-model="targetUserIdsInput"
            type="textarea"
            :rows="3"
            placeholder="请输入用户ID，多个用逗号分隔，例如：1,2,3"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            提示：请输入有效的用户ID，多个ID用英文逗号分隔
          </div>
        </el-form-item>
        <el-form-item label="发送方式">
          <el-checkbox-group v-model="form.delivery_methods">
            <el-checkbox value="email">邮箱发送</el-checkbox>
            <el-checkbox value="popup">首次登录弹窗</el-checkbox>
            <el-checkbox value="notification">消息中心提示</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import {
  getAllAnnouncementsAdmin,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '@/api/announcements'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingAnnouncement = ref(null)
const formRef = ref(null)
const targetUserIdsInput = ref('')
const isInitializing = ref(false)

const announcements = ref([])

const form = ref({
  title: '',
  content: '',
  priority: 0,
  is_marquee: false,
  target_type: 'all',
  target_user_ids: [],
  delivery_methods: [],
  start_time: null,
  end_time: null
})

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
}

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
  editingAnnouncement.value = null
  targetUserIdsInput.value = ''
  form.value = {
    title: '',
    content: '',
    priority: 0,
    is_marquee: false,
    target_type: 'all',
    target_user_ids: [],
    delivery_methods: [],
    start_time: null,
    end_time: null
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  editingAnnouncement.value = row
  const targetUserIds = row.target_user_ids ? JSON.parse(row.target_user_ids) : []
  targetUserIdsInput.value = targetUserIds.join(',')
  form.value = {
    title: row.title,
    content: row.content,
    priority: row.priority || 0,
    is_marquee: !!row.is_marquee,
    target_type: row.target_type || 'all',
    target_user_ids: targetUserIds,
    delivery_methods: row.delivery_methods ? JSON.parse(row.delivery_methods) : [],
    start_time: row.start_time,
    end_time: row.end_time
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (form.value.target_type === 'specific' && targetUserIdsInput.value) {
      const ids = targetUserIdsInput.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      if (ids.length === 0) {
        ElMessage.warning('请输入有效的用户ID')
        return
      }
      form.value.target_user_ids = ids
    } else {
      form.value.target_user_ids = []
    }

    saving.value = true
    try {
      if (editingAnnouncement.value) {
        await updateAnnouncement(editingAnnouncement.value.id, form.value)
        ElMessage.success('更新成功')
      } else {
        await createAnnouncement(form.value)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadAnnouncements()
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '操作失败')
    } finally {
      saving.value = false
    }
  })
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
