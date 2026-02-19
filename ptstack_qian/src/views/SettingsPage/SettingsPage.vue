<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Edit, Check, Close, Plus, Camera, RefreshLeft, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import { updateProfile, uploadAvatar } from '@/api/auth'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import { getFullUrl } from '@/utils/url'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('profile')
const loading = ref(false)
const uploadingAvatar = ref(false)
const editingField = ref(null)
const avatarDialogVisible = ref(false)
const avatarPreview = ref('')
const canvasRef = ref(null)
const showCropper = ref(false)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const imageRef = ref(null)
const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 768)

const dialogWidth = computed(() => {
  if (windowWidth.value < 768) return '90%'
  if (windowWidth.value < 992) return '500px'
  return '600px'
})

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  initForm()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const profileForm = reactive({
  nickname: '',
  bio: '',
  avatar: ''
})

const tempForm = reactive({
  nickname: '',
  bio: '',
  avatar: ''
})

const privacyForm = reactive({
  show_followers: true,
  show_following: true,
  show_articles: true,
  show_comments: true
})

const tempAvatarFile = ref(null)

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 50, message: '昵称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

const initForm = () => {
  profileForm.nickname = userStore.userInfo?.nickname || ''
  profileForm.bio = userStore.userInfo?.bio || ''
  profileForm.avatar = userStore.userInfo?.avatar || ''

  tempForm.nickname = profileForm.nickname
  tempForm.bio = profileForm.bio
  tempForm.avatar = profileForm.avatar

  privacyForm.show_followers = userStore.userInfo?.show_followers !== false
  privacyForm.show_following = userStore.userInfo?.show_following !== false
  privacyForm.show_articles = userStore.userInfo?.show_articles !== false
  privacyForm.show_comments = userStore.userInfo?.show_comments !== false
}

const startEdit = (field) => {
  editingField.value = field
  tempForm[field] = profileForm[field]
}

const cancelEdit = () => {
  editingField.value = null
}

const saveField = async (field) => {
  try {
    loading.value = true
    const data = { [field]: tempForm[field] }
    const response = await updateProfile(data)
    userStore.updateUserInfo(response.user)
    profileForm[field] = tempForm[field]
    ElMessage.success('保存成功')
    editingField.value = null
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const openAvatarDialog = () => {
  avatarDialogVisible.value = true
  tempAvatarFile.value = null
  avatarPreview.value = ''
  showCropper.value = false
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

const closeAvatarDialog = () => {
  avatarDialogVisible.value = false
  tempAvatarFile.value = null
  avatarPreview.value = ''
  showCropper.value = false
}

const beforeAvatarUpload = (file) => {
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

const handleAvatarChange = (file) => {
  if (file.raw) {
    tempAvatarFile.value = file.raw
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
      showCropper.value = true
      nextTick(() => {
        initCropper()
      })
    }
    reader.readAsDataURL(file.raw)
  }
}

const initCropper = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.onload = () => {
    imageRef.value = img
    const minSide = Math.min(img.width, img.height)
    const initialScale = 300 / minSide
    scale.value = initialScale
    translateX.value = 0
    translateY.value = 0
    drawCanvas()
  }
  img.src = avatarPreview.value
}

const drawCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas || !imageRef.value) return

  const ctx = canvas.getContext('2d')
  const size = 300

  canvas.width = size
  canvas.height = size

  ctx.fillStyle = '#f7f8fa'
  ctx.fillRect(0, 0, size, size)

  const img = imageRef.value
  const imgWidth = img.width * scale.value
  const imgHeight = img.height * scale.value
  const imgX = (size - imgWidth) / 2 + translateX.value
  const imgY = (size - imgHeight) / 2 + translateY.value

  ctx.save()
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.clip()

  ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight)

  ctx.restore()
}

const changeScale = (type) => {
  if (type === 'plus') {
    scale.value = Math.min(scale.value * 1.1, 5)
  } else if (type === 'minus') {
    scale.value = Math.max(scale.value * 0.9, 0.1)
  } else if (type === 'reset') {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }
  drawCanvas()
}

const handleMouseDown = (e) => {
  isDragging.value = true
  startX.value = e.clientX - translateX.value
  startY.value = e.clientY - translateY.value
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return
  translateX.value = e.clientX - startX.value
  translateY.value = e.clientY - startY.value
  drawCanvas()
}

const handleMouseUp = () => {
  isDragging.value = false
}

const getCroppedFile = () => {
  return new Promise((resolve) => {
    if (!canvasRef.value || !showCropper.value) {
      resolve(tempAvatarFile.value)
      return
    }

    canvasRef.value.toBlob((blob) => {
      const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      resolve(croppedFile)
    }, 'image/jpeg', 0.9)
  })
}

const saveAvatar = async () => {
  try {
    loading.value = true
    let avatarUrl = profileForm.avatar

    if (tempAvatarFile.value) {
      uploadingAvatar.value = true
      const fileToUpload = await getCroppedFile()
      const uploadResponse = await uploadAvatar(fileToUpload)
      avatarUrl = uploadResponse.url
    }

    const response = await updateProfile({ avatar: avatarUrl || undefined })
    userStore.updateUserInfo(response.user)
    profileForm.avatar = avatarUrl
    ElMessage.success('保存成功')
    closeAvatarDialog()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败，请稍后重试')
  } finally {
    loading.value = false
    uploadingAvatar.value = false
  }
}

const handleSavePrivacy = async () => {
  try {
    loading.value = true
    const res = await updateProfile(privacyForm)
    userStore.updateUserInfo(res.user)
    ElMessage.success('隐私设置已保存')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

const goToProfile = () => {
  router.push(`/profile/${userStore.userInfo?.id}`)
}
</script>

<template>
  <div class="settings-page">
    <PageHeader title="设置" subtitle="管理您的个人资料和隐私设置">
      <template #actions>
        <el-button type="primary" @click="goToProfile">
          <el-icon><User /></el-icon>
          查看我的主页
        </el-button>
      </template>
    </PageHeader>

    <div class="content-card">
      <div class="tabs-section">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          <el-icon><User /></el-icon>
          <span>个人资料</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'privacy' }"
          @click="activeTab = 'privacy'"
        >
          <el-icon><Lock /></el-icon>
          <span>隐私设置</span>
        </div>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'profile'" class="tab-panel">
          <div class="view-section">
            <div class="section-header">
              <div class="section-title">个人资料</div>
            </div>

            <div class="profile-info">
              <div class="info-item avatar-item">
                <div class="info-label">头像</div>
                <div class="info-value">
                  <div class="avatar-display" @click="openAvatarDialog">
                    <div class="avatar-wrapper">
                      <el-upload
                        class="avatar-uploader"
                        :show-file-list="false"
                        :auto-upload="false"
                        accept="image/*"
                      >
                        <div class="avatar-container">
                          <img v-if="userStore.userInfo?.avatar" :src="getFullUrl(userStore.userInfo.avatar)" class="avatar-preview" />
                          <span v-else class="avatar-placeholder">
                            {{ (userStore.userInfo?.nickname || userStore.userInfo?.username)?.charAt(0).toUpperCase() || 'U' }}
                          </span>
                        </div>
                      </el-upload>
                      <div class="avatar-overlay">
                        <el-icon><Camera /></el-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">昵称</div>
                <div class="info-value">
                  <div v-if="editingField !== 'nickname'" class="field-display" @click="startEdit('nickname')">
                    <span class="field-text">{{ userStore.userInfo?.nickname || '-' }}</span>
                    <el-icon class="edit-icon"><Edit /></el-icon>
                  </div>
                  <div v-else class="field-edit">
                    <el-input
                      v-model="tempForm.nickname"
                      size="large"
                      class="edit-input"
                      @keyup.enter="saveField('nickname')"
                    />
                    <div class="edit-actions">
                      <el-button size="small" @click="cancelEdit">
                        <el-icon><Close /></el-icon>
                      </el-button>
                      <el-button type="primary" size="small" @click="saveField('nickname')" :loading="loading">
                        <el-icon><Check /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">个人简介</div>
                <div class="info-value">
                  <div v-if="editingField !== 'bio'" class="field-display" @click="startEdit('bio')">
                    <span class="field-text bio-text">{{ userStore.userInfo?.bio || '暂无简介' }}</span>
                    <el-icon class="edit-icon"><Edit /></el-icon>
                  </div>
                  <div v-else class="field-edit">
                    <el-input
                      v-model="tempForm.bio"
                      type="textarea"
                      :rows="4"
                      size="large"
                      class="edit-input"
                      maxlength="500"
                      show-word-limit
                    />
                    <div class="edit-actions">
                      <el-button size="small" @click="cancelEdit">
                        <el-icon><Close /></el-icon>
                      </el-button>
                      <el-button type="primary" size="small" @click="saveField('bio')" :loading="loading">
                        <el-icon><Check /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">用户名</div>
                <div class="info-value">
                  <span class="field-text">{{ userStore.userInfo?.username }}</span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">邮箱</div>
                <div class="info-value">
                  <span class="field-text">{{ userStore.userInfo?.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'privacy'" class="tab-panel">
          <div class="privacy-section">
            <div class="section-header">
              <div class="section-title">隐私设置</div>
              <div class="section-desc">控制哪些信息可以被其他用户查看</div>
            </div>

            <div class="privacy-options">
              <div class="privacy-option">
                <div class="option-content">
                  <div class="option-title">显示订阅者列表</div>
                  <div class="option-desc">允许其他人查看你的订阅者列表</div>
                </div>
                <el-switch v-model="privacyForm.show_followers" size="large" />
              </div>

              <div class="privacy-option">
                <div class="option-content">
                  <div class="option-title">显示订阅列表</div>
                  <div class="option-desc">允许其他人查看你订阅了哪些用户</div>
                </div>
                <el-switch v-model="privacyForm.show_following" size="large" />
              </div>

              <div class="privacy-option">
                <div class="option-content">
                  <div class="option-title">显示发布的文章</div>
                  <div class="option-desc">允许其他人在你的主页看到你发布的文章</div>
                </div>
                <el-switch v-model="privacyForm.show_articles" size="large" />
              </div>

              <div class="privacy-option">
                <div class="option-content">
                  <div class="option-title">显示发表的评论</div>
                  <div class="option-desc">允许其他人在你的主页看到你发表的评论</div>
                </div>
                <el-switch v-model="privacyForm.show_comments" size="large" />
              </div>
            </div>

            <div class="form-footer">
              <el-button
                type="primary"
                size="large"
                @click="handleSavePrivacy"
                :loading="loading"
                class="save-btn"
              >
                <el-icon><Check /></el-icon>
                保存设置
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="avatarDialogVisible"
      title="修改头像"
      :width="dialogWidth"
      :fullscreen="isMobile"
      :close-on-click-modal="false"
      class="avatar-dialog"
    >
      <el-row :gutter="20" class="avatar-dialog-content">
        <el-col :xs="24" :sm="24" :md="24" :lg="24">
          <div v-if="!showCropper" class="upload-area">
            <el-upload
              class="avatar-uploader-dialog"
              :show-file-list="false"
              :auto-upload="false"
              :before-upload="beforeAvatarUpload"
              :on-change="handleAvatarChange"
              accept="image/*"
              drag
            >
              <div class="drop-zone">
                <el-icon class="drop-icon"><Plus /></el-icon>
                <div class="drop-text">将图片拖到此处，或点击上传</div>
              </div>
            </el-upload>
          </div>
          <div v-else class="cropper-area">
            <div
              class="cropper-container"
              @mousedown="handleMouseDown"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
            >
              <canvas ref="canvasRef" class="cropper-canvas" />
              <div class="crop-circle-overlay" />
            </div>
            <el-space class="cropper-tools" justify="center">
              <el-button size="small" @click="changeScale('minus')">
                <el-icon><ZoomOut /></el-icon>
              </el-button>
              <el-button size="small" @click="changeScale('reset')">
                <el-icon><RefreshLeft /></el-icon>
              </el-button>
              <el-button size="small" @click="changeScale('plus')">
                <el-icon><ZoomIn /></el-icon>
              </el-button>
            </el-space>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeAvatarDialog">取消</el-button>
          <el-button type="primary" @click="saveAvatar" :loading="loading">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.tabs-section {
  display: flex;
  gap: 8px;
  padding: 24px 24px 0;
  border-bottom: 1px solid #f7f8fa;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #4e5969;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -1px;

  &:hover {
    background: #f7f8fa;
    color: #1d2129;
  }

  &.active {
    background: #eaf2ff;
    color: #165dff;
  }

  .el-icon {
    font-size: 16px;
  }
}

.tab-content {
  padding: 32px 24px;
}

.tab-panel {
  max-width: 700px;
}

.view-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  margin-bottom: 8px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.section-desc {
  font-size: 13px;
  color: #86909c;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.avatar-item {
    align-items: flex-start;
  }
}

.info-label {
  font-size: 13px;
  font-weight: 500;
  color: #86909c;
}

.info-value {
  font-size: 15px;
  color: #1d2129;
  line-height: 1.6;
}

.field-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: -8px -12px;

  &:hover {
    background: #f7f8fa;

    .edit-icon {
      opacity: 1;
    }
  }

  .field-text {
    flex: 1;

    &.bio-text {
      color: #4e5969;
    }
  }

  .edit-icon {
    font-size: 16px;
    color: #86909c;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

.field-edit {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .edit-input {
    width: 100%;
  }
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.avatar-display {
  cursor: pointer;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.avatar-uploader :deep(.el-upload) {
  border: 2px dashed #e5e6eb;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px;
  height: 100px;
}

.avatar-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 600;
  color: white;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;

  .el-icon {
    font-size: 28px;
    color: white;
  }
}

.privacy-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.privacy-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f7f8fa;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: #f2f3f5;
  }
}

.option-content {
  flex: 1;
  margin-right: 20px;
}

.option-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 13px;
  color: #86909c;
  line-height: 1.5;
}

.form-footer {
  display: flex;
  justify-content: flex-start;
  padding-top: 8px;
}

.save-btn {
  border-radius: 8px;
  height: 48px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

  &:hover {
    background: linear-gradient(135deg, #4080ff 0%, #165dff 100%);
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
  }
}

.avatar-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.avatar-dialog-content {
  width: 100%;
}

.upload-area {
  width: 100%;
}

.avatar-uploader-dialog {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #e5e6eb;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #165dff;
    background: #eaf2ff;
  }

  .drop-icon {
    font-size: 48px;
    color: #8c939d;
    margin-bottom: 16px;
  }

  .drop-text {
    font-size: 14px;
    color: #86909c;
  }
}

.cropper-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.cropper-container {
  position: relative;
  width: 300px;
  height: 300px;
  cursor: move;
  border-radius: 50%;
  overflow: hidden;
  background: #f7f8fa;
  border: 2px solid #e5e6eb;
}

.cropper-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.crop-circle-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.cropper-tools {
  width: 100%;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
}

@media (max-width: 768px) {
  .tabs-section {
    flex-direction: column;
    gap: 4px;
  }

  .tab-item {
    width: 100%;
  }

  .save-btn {
    width: 100%;
    justify-content: center;
  }

  .cropper-container {
    width: 250px;
    height: 250px;
  }
}
</style>
