<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Check, Setting } from '@element-plus/icons-vue'
import {
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement
} from '@/api/announcements'
import { MdEditor, NormalToolbar } from 'md-editor-v3'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const saving = ref(false)
const isEdit = ref(!!route.params.id)
const targetUserIdsInput = ref('')
const editorRef = ref(null)
const toolbars = ['bold', 'underline', 'italic', '-', 'title', 'strikeThrough', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task', '-', 'codeRow', 'code', 'link', 'image', 'table', '-', 0, '-', 'revoke', 'next', '=', 'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview', 'catalog']

const insertIndent = () => {
  form.value.content += '&emsp;'
}

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

const fetchAnnouncement = async () => {
  if (!isEdit.value) return
  try {
    loading.value = true
    const res = await getAnnouncementById(route.params.id)
    const announcement = res.announcement
    const targetUserIds = announcement.target_user_ids ? JSON.parse(announcement.target_user_ids) : []
    targetUserIdsInput.value = targetUserIds.join(',')
    form.value = {
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority || 0,
      is_marquee: announcement.is_marquee || false,
      target_type: announcement.target_type || 'all',
      target_user_ids: targetUserIds,
      delivery_methods: announcement.delivery_methods ? JSON.parse(announcement.delivery_methods) : [],
      start_time: announcement.start_time,
      end_time: announcement.end_time
    }
  } catch (error) {
    console.error('获取公告失败:', error)
    ElMessage.error('获取公告失败')
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入公告标题')
    return false
  }
  if (!form.value.content.trim()) {
    ElMessage.warning('请输入公告内容')
    return false
  }
  if (form.value.target_type === 'specific' && !targetUserIdsInput.value.trim()) {
    ElMessage.warning('请输入指定用户ID')
    return false
  }
  return true
}

const handleTargetUserIdsChange = () => {
  form.value.target_user_ids = targetUserIdsInput.value
    .split(',')
    .map(id => id.trim())
    .filter(id => id)
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    saving.value = true
    handleTargetUserIdsChange()

    const data = {
      ...form.value,
      target_user_ids: form.value.target_type === 'specific' ? form.value.target_user_ids : []
    }

    if (isEdit.value) {
      await updateAnnouncement(route.params.id, data)
      ElMessage.success('更新公告成功')
    } else {
      await createAnnouncement(data)
      ElMessage.success('发布公告成功')
    }
    router.push('/announcements')
  } catch (error) {
    console.error('保存公告失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchAnnouncement()
})
</script>

<template>
  <div class="announcement-edit-page" v-loading="loading">
    <div class="page-header">
      <div class="header-inner">
        <el-button @click="goBack" circle class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">{{ isEdit ? '编辑公告' : '发布公告' }}</h1>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="main-content">
        <div class="form-card">
          <div class="form-section">
            <label class="form-label">公告标题</label>
            <el-input
              v-model="form.title"
              placeholder="请输入公告标题"
              size="large"
              class="title-input"
            />
          </div>

          <div class="form-section">
            <label class="form-label">公告内容</label>
            <MdEditor
              ref="editorRef"
              v-model="form.content"
              placeholder="开始编写公告内容..."
              :editorId="'announcement-editor'"
              :toolbars="toolbars"
              style="height: 500px"
            >
              <template #defToolbars>
                <NormalToolbar title="插入缩进" @onClick="insertIndent">
                  ↦
                </NormalToolbar>
              </template>
            </MdEditor>
          </div>
        </div>
      </div>

      <div class="sidebar">
        <div class="side-card">
          <div class="card-title">
            <el-icon><Setting /></el-icon>
            发布设置
          </div>

          <div class="form-section">
            <label class="form-label">优先级</label>
            <el-input-number
              v-model="form.priority"
              :min="0"
              :max="100"
              size="large"
              style="width: 100%"
              placeholder="数字越大优先级越高"
            />
            <div class="form-tip">数字越大，跑马灯显示优先级越高</div>
          </div>

          <div class="form-section">
            <div class="switch-row">
              <label class="form-label">首页跑马灯</label>
              <el-switch v-model="form.is_marquee" />
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">发布对象</label>
            <el-radio-group v-model="form.target_type" size="large">
              <el-radio value="all">所有用户</el-radio>
              <el-radio value="specific">指定用户</el-radio>
            </el-radio-group>
            <el-input
              v-if="form.target_type === 'specific'"
              v-model="targetUserIdsInput"
              placeholder="请输入用户ID，多个用逗号分隔"
              size="large"
              style="margin-top: 12px"
              @input="handleTargetUserIdsChange"
            />
          </div>

          <div class="form-section">
            <label class="form-label">发布形式</label>
            <el-checkbox-group v-model="form.delivery_methods" size="large">
              <el-checkbox value="email">邮箱通知</el-checkbox>
              <el-checkbox value="popup">登录弹窗</el-checkbox>
              <el-checkbox value="message">消息中心</el-checkbox>
            </el-checkbox-group>
          </div>

          <div class="form-section">
            <label class="form-label">有效期</label>
            <div class="date-range">
              <el-date-picker
                v-model="form.start_time"
                type="datetime"
                placeholder="开始时间"
                size="large"
                style="width: 100%"
              />
              <span class="date-separator">至</span>
              <el-date-picker
                v-model="form.end_time"
                type="datetime"
                placeholder="结束时间"
                size="large"
                style="width: 100%"
              />
            </div>
          </div>

          <div class="action-buttons">
            <el-button size="large" @click="goBack" class="cancel-btn">
              取消
            </el-button>
            <el-button
              type="primary"
              size="large"
              :loading="saving"
              @click="handleSubmit"
              class="submit-btn"
            >
              <el-icon><Check /></el-icon>
              {{ isEdit ? '更新公告' : '发布公告' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.announcement-edit-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f8fa 0%, #ffffff 100%);
  padding-bottom: 60px;
}

.page-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e6eb;
  padding: 24px 0;
  margin-bottom: 32px;

  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .back-btn {
    background: #f7f8fa;
    border: 1px solid #e5e6eb;
    color: #4e5969;

    &:hover {
      background: #e8f3ff;
      border-color: #165dff;
      color: #165dff;
    }
  }

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1d2129;
    margin: 0;
  }
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 24px;
}

.main-content {
  flex: 1;
}

.sidebar {
  width: 380px;
  flex-shrink: 0;
}

.form-card,
.side-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 12px;
}

.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.indent-btn {
  padding: 4px 12px;
  height: auto;
  font-size: 13px;
  color: #4e5969;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
}

.indent-btn:hover {
  color: #165dff;
  background: #e8f3ff;
  border-color: #165dff;
}

.form-tip {
  font-size: 13px;
  color: #86909c;
  margin-top: 8px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .form-label {
    margin-bottom: 0;
  }
}

.title-input {
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    font-size: 18px;
  }
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12px;

  .date-separator {
    color: #86909c;
    font-size: 14px;
  }
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f2f3f5;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
}

.cancel-btn {
  border: 1px solid #e5e6eb;
  color: #4e5969;
  background: #ffffff;

  &:hover {
    border-color: #86909c;
    color: #1d2129;
  }
}

.submit-btn {
  background: linear-gradient(135deg, #165dff 0%, #2a7bff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);

  &:hover {
    background: linear-gradient(135deg, #0e42d4 0%, #165dff 100%);
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.4);
  }
}

@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    order: 2;
  }

  .main-content {
    order: 1;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 16px 0;
  }

  .page-title {
    font-size: 20px;
  }

  .content-wrapper {
    padding: 0 16px;
  }

  .form-card,
  .side-card {
    padding: 24px;
  }
}
</style>
