<script setup>
// 客户端个人信息页面
// 功能：支持修改头像、昵称、邮箱（邮箱修改需要验证旧邮箱）
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  Edit,
  Camera,
  Message,
  Check,
  Close,
  RefreshLeft,
  ZoomIn,
  ZoomOut,
  Lock,
} from '@element-plus/icons-vue'
import { updateProfile, uploadAvatar, sendEmailVerification, verifyEmailCode } from '@/api/auth'
import { getFullUrl } from '@/utils/url'
import PageHeader from '@/components/PageHeader/PageHeader.vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const uploadingAvatar = ref(false)
const editingNickname = ref(false)
const editingEmail = ref(false)

// 表单数据
const profileForm = reactive({
  nickname: '',
  email: '',
  avatar: '',
})

const tempForm = reactive({
  nickname: '',
  email: '',
})

// 邮箱验证相关
const emailVerification = reactive({
  oldEmailCode: '',
  newEmail: '',
  newEmailCode: '',
  oldEmailSending: false,
  newEmailSending: false,
  oldEmailCountdown: 0,
  newEmailCountdown: 0,
  step: 1, // 1: 验证旧邮箱, 2: 输入新邮箱并验证
})

// 头像裁剪相关
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
const tempAvatarFile = ref(null)

// 初始化表单
const initForm = () => {
  profileForm.nickname = userStore.userInfo?.nickname || ''
  profileForm.email = userStore.userInfo?.email || ''
  profileForm.avatar = userStore.userInfo?.avatar || ''
  tempForm.nickname = profileForm.nickname
  tempForm.email = profileForm.email
}

// 开始编辑昵称
const startEditNickname = () => {
  editingNickname.value = true
  tempForm.nickname = profileForm.nickname
}

// 取消编辑昵称
const cancelEditNickname = () => {
  editingNickname.value = false
}

// 保存昵称
const saveNickname = async () => {
  if (!tempForm.nickname.trim()) {
    ElMessage.warning('昵称不能为空')
    return
  }
  try {
    loading.value = true
    const response = await updateProfile({ nickname: tempForm.nickname.trim() })
    userStore.updateUserInfo(response.user)
    profileForm.nickname = tempForm.nickname
    ElMessage.success('昵称修改成功')
    editingNickname.value = false
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 开始编辑邮箱
const startEditEmail = () => {
  editingEmail.value = true
  emailVerification.step = 1
  emailVerification.oldEmailCode = ''
  emailVerification.newEmail = ''
  emailVerification.newEmailCode = ''
}

// 取消编辑邮箱
const cancelEditEmail = () => {
  editingEmail.value = false
}

// 发送旧邮箱验证码
const sendOldEmailCode = async () => {
  try {
    emailVerification.oldEmailSending = true
    await sendEmailVerification(profileForm.email)
    ElMessage.success('验证码已发送到旧邮箱')
    emailVerification.oldEmailCountdown = 60
    const timer = setInterval(() => {
      emailVerification.oldEmailCountdown--
      if (emailVerification.oldEmailCountdown <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error(error.response?.data?.message || '发送验证码失败')
  } finally {
    emailVerification.oldEmailSending = false
  }
}

// 验证旧邮箱
const verifyOldEmail = async () => {
  if (!emailVerification.oldEmailCode) {
    ElMessage.warning('请输入验证码')
    return
  }
  try {
    loading.value = true
    await verifyEmailCode(profileForm.email, emailVerification.oldEmailCode)
    ElMessage.success('旧邮箱验证成功')
    emailVerification.step = 2
  } catch (error) {
    console.error('验证失败:', error)
    ElMessage.error(error.response?.data?.message || '验证码错误')
  } finally {
    loading.value = false
  }
}

// 发送新邮箱验证码
const sendNewEmailCode = async () => {
  if (!emailVerification.newEmail) {
    ElMessage.warning('请输入新邮箱')
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailVerification.newEmail)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }
  try {
    emailVerification.newEmailSending = true
    await sendEmailVerification(emailVerification.newEmail)
    ElMessage.success('验证码已发送到新邮箱')
    emailVerification.newEmailCountdown = 60
    const timer = setInterval(() => {
      emailVerification.newEmailCountdown--
      if (emailVerification.newEmailCountdown <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error(error.response?.data?.message || '发送验证码失败')
  } finally {
    emailVerification.newEmailSending = false
  }
}

// 保存新邮箱
const saveNewEmail = async () => {
  if (!emailVerification.newEmailCode) {
    ElMessage.warning('请输入验证码')
    return
  }
  try {
    loading.value = true
    await verifyEmailCode(emailVerification.newEmail, emailVerification.newEmailCode)
    // 更新邮箱
    const response = await updateProfile({ email: emailVerification.newEmail })
    userStore.updateUserInfo(response.user)
    profileForm.email = emailVerification.newEmail
    ElMessage.success('邮箱修改成功')
    editingEmail.value = false
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 头像相关
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
      setTimeout(() => {
        initCropper()
      }, 100)
    }
    reader.readAsDataURL(file.raw)
  }
}

const initCropper = () => {
  const canvas = canvasRef.value
  if (!canvas) return

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

    canvasRef.value.toBlob(
      (blob) => {
        const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
        resolve(croppedFile)
      },
      'image/jpeg',
      0.9,
    )
  })
}

const saveAvatar = async () => {
  try {
    loading.value = true
    uploadingAvatar.value = true
    const fileToUpload = await getCroppedFile()
    const uploadResponse = await uploadAvatar(fileToUpload)
    const avatarUrl = uploadResponse.url

    const response = await updateProfile({ avatar: avatarUrl })
    userStore.updateUserInfo(response.user)
    profileForm.avatar = avatarUrl
    ElMessage.success('头像修改成功')
    closeAvatarDialog()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败，请稍后重试')
  } finally {
    loading.value = false
    uploadingAvatar.value = false
  }
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  initForm()
})
</script>

<template>
  <div class="client-profile-page">
    <PageHeader title="个人信息" subtitle="管理您的个人资料和账户信息" />

    <div class="content-card">
      <div class="tab-content">
        <div class="tab-panel">
          <div class="view-section">
            <div class="section-header">
              <div class="section-title">个人资料</div>
            </div>

            <div class="profile-info">
              <!-- 头像区域 -->
              <div class="info-item avatar-item">
                <div class="info-label">头像</div>
                <div class="info-value">
                  <div class="avatar-display" @click="openAvatarDialog">
                    <div class="avatar-wrapper">
                      <div class="avatar-container">
                        <img
                          v-if="profileForm.avatar"
                          :src="getFullUrl(profileForm.avatar)"
                          alt="avatar"
                          class="avatar-img"
                        />
                        <div v-else class="avatar-placeholder">
                          {{
                            (profileForm.nickname || userStore.userInfo?.username)
                              ?.charAt(0)
                              .toUpperCase() || 'U'
                          }}
                        </div>
                      </div>
                      <div class="avatar-overlay">
                        <el-icon><Camera /></el-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 昵称区域 -->
              <div class="info-item">
                <div class="info-label">昵称</div>
                <div class="info-value">
                  <template v-if="!editingNickname">
                    <div class="field-display" @click="startEditNickname">
                      <span class="field-text">{{ profileForm.nickname || '未设置' }}</span>
                      <el-icon class="edit-icon"><Edit /></el-icon>
                    </div>
                  </template>
                  <template v-else>
                    <div class="field-edit">
                      <el-input
                        v-model="tempForm.nickname"
                        placeholder="请输入昵称"
                        maxlength="20"
                        show-word-limit
                        size="large"
                        class="edit-input"
                      />
                      <div class="edit-actions">
                        <el-button size="small" @click="cancelEditNickname">
                          <el-icon><Close /></el-icon>
                        </el-button>
                        <el-button
                          type="primary"
                          size="small"
                          @click="saveNickname"
                          :loading="loading"
                        >
                          <el-icon><Check /></el-icon>
                        </el-button>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- 邮箱区域 -->
              <div class="info-item">
                <div class="info-label">邮箱</div>
                <div class="info-value">
                  <template v-if="!editingEmail">
                    <div class="field-display" @click="startEditEmail">
                      <span class="field-text">{{ profileForm.email || '未设置' }}</span>
                      <el-icon class="edit-icon"><Edit /></el-icon>
                    </div>
                  </template>
                  <template v-else>
                    <div class="field-edit email-edit-form">
                      <!-- 步骤1：验证旧邮箱 -->
                      <template v-if="emailVerification.step === 1">
                        <div class="email-step">
                          <div class="step-title">
                            <el-icon><Lock /></el-icon>
                            验证原邮箱
                          </div>
                          <p class="step-desc">验证码将发送到 {{ profileForm.email }}</p>
                          <div class="verification-input">
                            <el-input
                              v-model="emailVerification.oldEmailCode"
                              placeholder="请输入验证码"
                              maxlength="6"
                              size="large"
                            >
                              <template #append>
                                <el-button
                                  @click="sendOldEmailCode"
                                  :loading="emailVerification.oldEmailSending"
                                  :disabled="emailVerification.oldEmailCountdown > 0"
                                >
                                  {{
                                    emailVerification.oldEmailCountdown > 0
                                      ? `${emailVerification.oldEmailCountdown}s`
                                      : '获取验证码'
                                  }}
                                </el-button>
                              </template>
                            </el-input>
                          </div>
                          <div class="edit-actions">
                            <el-button type="primary" @click="verifyOldEmail" :loading="loading">
                              下一步
                            </el-button>
                            <el-button @click="cancelEditEmail">取消</el-button>
                          </div>
                        </div>
                      </template>

                      <!-- 步骤2：输入新邮箱并验证 -->
                      <template v-if="emailVerification.step === 2">
                        <div class="email-step">
                          <div class="step-title">
                            <el-icon><Message /></el-icon>
                            绑定新邮箱
                          </div>
                          <div class="verification-input">
                            <el-input
                              v-model="emailVerification.newEmail"
                              placeholder="请输入新邮箱"
                              size="large"
                            />
                          </div>
                          <div class="verification-input">
                            <el-input
                              v-model="emailVerification.newEmailCode"
                              placeholder="请输入验证码"
                              maxlength="6"
                              size="large"
                            >
                              <template #append>
                                <el-button
                                  @click="sendNewEmailCode"
                                  :loading="emailVerification.newEmailSending"
                                  :disabled="emailVerification.newEmailCountdown > 0"
                                >
                                  {{
                                    emailVerification.newEmailCountdown > 0
                                      ? `${emailVerification.newEmailCountdown}s`
                                      : '获取验证码'
                                  }}
                                </el-button>
                              </template>
                            </el-input>
                          </div>
                          <div class="edit-actions">
                            <el-button type="primary" @click="saveNewEmail" :loading="loading">
                              保存
                            </el-button>
                            <el-button @click="emailVerification.step = 1">上一步</el-button>
                          </div>
                        </div>
                      </template>
                    </div>
                  </template>
                </div>
              </div>

              <!-- 用户名区域（只读） -->
              <div class="info-item">
                <div class="info-label">用户名</div>
                <div class="info-value">
                  <span class="field-text">{{ userStore.userInfo?.username || '-' }}</span>
                  <span class="info-hint">用户名不可修改</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 头像裁剪对话框 -->
    <el-dialog
      v-model="avatarDialogVisible"
      title="更换头像"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="avatar-dialog-content">
        <el-upload
          v-if="!showCropper"
          class="avatar-uploader"
          accept="image/*"
          :auto-upload="false"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :on-change="handleAvatarChange"
        >
          <div class="upload-placeholder">
            <el-icon :size="48"><Camera /></el-icon>
            <p>点击上传图片</p>
            <p class="upload-hint">支持 JPG、PNG 格式，大小不超过 5MB</p>
          </div>
        </el-upload>

        <div v-else class="cropper-wrapper">
          <div
            class="canvas-container"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
          >
            <canvas ref="canvasRef" class="cropper-canvas"></canvas>
          </div>
          <div class="cropper-tools">
            <el-button circle @click="changeScale('minus')">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
            <el-button circle @click="changeScale('reset')">
              <el-icon><RefreshLeft /></el-icon>
            </el-button>
            <el-button circle @click="changeScale('plus')">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
          </div>
          <p class="cropper-hint">拖动图片调整位置，滚轮或按钮调整大小</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="closeAvatarDialog">取消</el-button>
        <el-button v-if="showCropper" type="primary" @click="saveAvatar" :loading="uploadingAvatar">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.client-profile-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-top: 24px;
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

.avatar-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  border: 2px dashed #e5e6eb;
  transition: var(--el-transition-duration-fast);
}

.avatar-img {
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

/* 邮箱编辑 */
.email-edit-form {
  width: 100%;
}

.email-step {
  background: #f7f8fa;
  padding: 24px;
  border-radius: 12px;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;

  .el-icon {
    color: #165dff;
  }
}

.step-desc {
  font-size: 14px;
  color: #86909c;
  margin: 0 0 16px;
}

.verification-input {
  max-width: 360px;
  margin-bottom: 16px;
}

/* 头像对话框 */
.avatar-dialog-content {
  padding: 20px;
}

.avatar-uploader {
  width: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 300px;
  border: 2px dashed #e5e6eb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #86909c;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #165dff;
    background: #eaf2ff;
    color: #165dff;
  }

  p {
    margin: 8px 0 0;
    font-size: 16px;
  }
}

.upload-hint {
  font-size: 13px !important;
  color: #c0c4cc !important;
}

.cropper-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.canvas-container {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  cursor: move;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #f7f8fa;
  border: 2px solid #e5e6eb;
}

.cropper-canvas {
  width: 100%;
  height: 100%;
}

.cropper-tools {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.cropper-hint {
  font-size: 13px;
  color: #86909c;
  margin-top: 12px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .client-profile-page {
    padding: 16px;
  }

  .content-card {
    margin-top: 16px;
  }

  .tab-content {
    padding: 20px 16px;
  }

  .info-item {
    gap: 12px;
  }

  .verification-input {
    max-width: 100%;
  }

  .edit-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }

  .canvas-container {
    width: 250px;
    height: 250px;
  }
}
</style>
