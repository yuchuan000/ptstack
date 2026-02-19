<template>
  <div class="complete-profile-page">
    <div class="welcome-section">
      <div class="welcome-decoration"></div>
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎加入 PTStack</h1>
        <p class="welcome-slogan">技术分享，知识共享</p>
        <div class="divider"></div>
        <div class="user-info">
          <div class="info-item">
            <el-icon class="info-icon"><User /></el-icon>
            <span class="info-label">用户名</span>
            <span class="info-value">{{ userStore.userInfo?.username }}</span>
          </div>
          <div class="info-item">
            <el-icon class="info-icon"><Message /></el-icon>
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ userStore.userInfo?.email }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-card">
        <div class="card-header">
          <h2 class="auth-title">完善个人资料</h2>
          <p class="auth-subtitle">请设置您的昵称和头像，让大家认识您</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="0"
          class="auth-form"
        >
          <div class="avatar-section">
            <div class="avatar-upload">
              <div class="avatar-display" @click="openAvatarDialog">
                <div class="avatar-wrapper">
                  <el-upload
                    class="avatar-uploader"
                    :show-file-list="false"
                    :auto-upload="false"
                    accept="image/*"
                  >
                    <div class="avatar-container">
                      <img v-if="form.avatar" :src="getFullUrl(form.avatar)" class="avatar-preview" />
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
              <div class="avatar-tip">
                {{ uploadingAvatar ? '上传中...' : '点击上传头像（可选）' }}
              </div>
            </div>
          </div>

          <el-form-item prop="nickname">
            <el-input
              v-model="form.nickname"
              type="text"
              placeholder="请输入昵称"
              size="large"
              class="auth-input"
              clearable
            />
          </el-form-item>

          <el-form-item prop="bio">
            <el-input
              v-model="form.bio"
              type="textarea"
              :rows="4"
              placeholder="请填写个人简介（可选）"
              size="large"
              class="auth-input"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="auth-button"
              :loading="loading"
              @click="handleSubmit"
            >
              完成
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-dialog
      v-model="avatarDialogVisible"
      title="修改头像"
      width="600px"
      :close-on-click-modal="false"
      class="avatar-dialog"
    >
      <el-row :gutter="20" class="avatar-dialog-content">
        <el-col :span="24">
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

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, User, Message, Camera, RefreshLeft, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { updateProfile, uploadAvatar } from '@/api/auth'
import { getFullUrl } from '@/utils/url'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const uploadingAvatar = ref(false)
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
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const form = reactive({
  nickname: '',
  avatar: '',
  bio: ''
})

const tempAvatarFile = ref(null)

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 50, message: '昵称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
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
    if (tempAvatarFile.value) {
      uploadingAvatar.value = true
      const fileToUpload = await getCroppedFile()
      const uploadResponse = await uploadAvatar(fileToUpload)
      form.avatar = uploadResponse.url
    }
    ElMessage.success('头像保存成功')
    closeAvatarDialog()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败，请稍后重试')
  } finally {
    loading.value = false
    uploadingAvatar.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await updateProfile({
          nickname: form.nickname,
          avatar: form.avatar || undefined,
          bio: form.bio || undefined
        })

        ElMessage.success(response.message || '资料完善成功！')
        userStore.updateUserInfo(response.user)
        router.push('/')
      } catch (error) {
        console.error('完善资料失败:', error)
        ElMessage.error(error.response?.data?.message || '完善资料失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.complete-profile-page {
  min-height: 100vh;
  display: flex;
}

.welcome-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.welcome-section::after {
  content: '';
  position: absolute;
  bottom: -150px;
  left: -80px;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.welcome-decoration {
  position: absolute;
  top: 20%;
  left: -100px;
  width: 300px;
  height: 600px;
  border-radius: 0 300px 300px 0;
  background: rgba(255, 255, 255, 0.06);
}

.welcome-content {
  position: relative;
  text-align: center;
  color: white;
  padding: 40px;
  max-width: 500px;
}

.welcome-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 2px;
}

.welcome-slogan {
  font-size: 20px;
  font-weight: 400;
  margin: 0 0 32px 0;
  opacity: 0.9;
}

.divider {
  width: 80px;
  height: 3px;
  background: white;
  margin: 0 auto 40px auto;
  border-radius: 2px;
  opacity: 0.6;
}

.user-info {
  background: rgba(255, 255, 255, 0.15);
  padding: 24px 32px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  font-size: 20px;
  opacity: 0.9;
}

.info-label {
  font-size: 14px;
  opacity: 0.7;
  min-width: 60px;
  text-align: left;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  flex: 1;
  text-align: left;
}

.form-section {
  width: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 40px;
}

.form-card {
  width: 100%;
  max-width: 480px;
}

.card-header {
  margin-bottom: 40px;
  text-align: center;
}

.auth-title {
  font-size: 28px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px 0;
}

.auth-subtitle {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

.auth-form {
  width: 100%;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-display {
  cursor: pointer;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;

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
  width: 120px;
  height: 120px;
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
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
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
    font-size: 32px;
    color: white;
  }
}

.avatar-tip {
  font-size: 13px;
  color: #86909c;
}

.auth-input {
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px #e5e6eb inset;
    padding: 12px 16px;
    font-size: 15px;

    &:hover {
      box-shadow: 0 0 0 1px #c9cdd4 inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 2px #165dff inset;
    }
  }
}

.auth-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background-color: #165dff;
  border-color: #165dff;
  margin-top: 8px;

  &:hover {
    background-color: #4080ff;
    border-color: #4080ff;
  }

  &:active {
    background-color: #0e42d2;
    border-color: #0e42d2;
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
  .complete-profile-page {
    flex-direction: column;
  }

  .welcome-section {
    padding: 40px 20px;
  }

  .form-section {
    width: 100%;
    padding: 40px 20px;
  }

  .cropper-container {
    width: 250px;
    height: 250px;
  }
}
</style>
