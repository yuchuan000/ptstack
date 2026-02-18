<template>
  <!-- 完善资料页面容器 -->
  <div class="complete-profile-page">
    <!-- 左侧品牌展示区 -->
    <div class="brand-section">
      <!-- 品牌内容容器 -->
      <div class="brand-content">
        <!-- 品牌名称 -->
        <h1 class="brand-title">PTStack</h1>
        <!-- 品牌标语 -->
        <p class="brand-slogan">技术分享，知识共享</p>
      </div>
    </div>
    <!-- 右侧表单区 -->
    <div class="form-section">
      <!-- 表单卡片 -->
      <div class="form-card">
        <!-- 头部区域 -->
        <div class="card-header">
          <!-- 大标题 -->
          <h2 class="auth-title">完善个人资料</h2>
          <!-- 副标题 -->
          <p class="auth-subtitle">请设置您的昵称和头像，让大家认识您</p>
        </div>

        <!-- 表单 -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="0"
          class="auth-form"
        >
          <!-- 头像上传 -->
          <div class="avatar-section">
            <div class="avatar-label">头像</div>
            <div class="avatar-upload">
              <el-upload
                class="avatar-uploader"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="handleAvatarUpload"
              >
                <img v-if="previewAvatarUrl || form.avatar" :src="previewAvatarUrl || getAvatarUrl(form.avatar)" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
              <div class="avatar-tip">
                {{ uploadingAvatar ? '上传中...' : '点击上传头像（可选）' }}
              </div>
            </div>
          </div>

          <!-- 昵称输入 -->
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

          <!-- 提交按钮 -->
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
  </div>
</template>

<script setup>
// 导入Vue的ref响应式函数
import { ref, reactive } from 'vue'
// 导入Vue Router的useRouter函数
import { useRouter } from 'vue-router'
// 导入Element Plus的消息提示组件
import { ElMessage } from 'element-plus'
// 导入Element Plus的Plus图标组件
import { Plus } from '@element-plus/icons-vue'
// 导入用户状态管理store
import { useUserStore } from '@/stores/user'
// 导入更新用户资料API函数
import { updateProfile, uploadAvatar } from '@/api/auth'

// 创建路由实例
const router = useRouter()
// 创建用户状态管理实例
const userStore = useUserStore()

// 创建表单引用
const formRef = ref(null)
// 创建加载状态
const loading = ref(false)
// 头像上传加载状态
const uploadingAvatar = ref(false)

// 表单数据
const form = reactive({
  // 昵称
  nickname: '',
  // 头像（存储URL）
  avatar: ''
})

// 临时保存头像文件
const tempAvatarFile = ref(null)
// 本地预览的图片URL
const previewAvatarUrl = ref('')

// 表单验证规则
const rules = {
  // 昵称验证规则
  nickname: [
    // 必填验证
    { required: true, message: '请输入昵称', trigger: 'blur' },
    // 长度验证
    { min: 1, max: 50, message: '昵称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 获取头像完整URL
const getAvatarUrl = (url) => {
  if (!url) return ''
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 否则拼接后端地址
  return `http://localhost:3000${url}`
}

// 头像上传前检查
const beforeAvatarUpload = (file) => {
  // 检查文件类型是否为图片
  const isImage = file.type.startsWith('image/')
  // 检查文件大小是否小于5MB
  const isLt5M = file.size / 1024 / 1024 < 5

  // 如果不是图片文件
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    // 返回false取消上传
    return false
  }
  // 如果文件大小超过5MB
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    // 返回false取消上传
    return false
  }
  // 验证通过，返回true继续上传
  return true
}

// 处理头像上传（只做本地预览，不上传服务器）
const handleAvatarUpload = (options) => {
  // 保存文件
  tempAvatarFile.value = options.file
  // 生成本地预览URL
  previewAvatarUrl.value = URL.createObjectURL(options.file)
}

// 提交资料
const handleSubmit = async () => {
  // 如果表单引用不存在
  if (!formRef.value) return

  // 验证表单
  await formRef.value.validate(async (valid) => {
    // 如果验证通过
    if (valid) {
      // 设置加载状态为true
      loading.value = true
      // 使用try-catch捕获异步操作中的错误
      try {
        // 如果有临时头像文件，先上传
        let avatarUrl = form.avatar
        if (tempAvatarFile.value) {
          uploadingAvatar.value = true
          const uploadResponse = await uploadAvatar(tempAvatarFile.value)
          avatarUrl = uploadResponse.url
        }

        // 调用更新资料API
        const response = await updateProfile({
          // 传入昵称
          nickname: form.nickname,
          // 传入头像（如果没有则传入undefined）
          avatar: avatarUrl || undefined
        })

        // 显示成功提示
        ElMessage.success(response.message || '资料完善成功！')

        // 更新store中的用户信息
        userStore.updateUserInfo(response.user)

        // 跳转到首页
        router.push('/')
      } catch (error) {
        // 在控制台输出错误信息
        console.error('完善资料失败:', error)
        // 显示错误提示
        ElMessage.error(error.response?.data?.message || '完善资料失败，请稍后重试')
      } finally {
        // 无论成功或失败，都设置加载状态为false
        loading.value = false
        uploadingAvatar.value = false
      }
    }
  })
}
</script>

<style scoped>
/* 完善资料页面容器 */
.complete-profile-page {
  /* 最小高度为视口高度 */
  min-height: 100vh;
  /* 使用flex布局 */
  display: flex;
}

/* 左侧品牌展示区 */
.brand-section {
  /* 占据剩余空间 */
  flex: 1;
  /* 背景图片 */
  background-image: url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&q=80');
  /* 背景图片不重复 */
  background-repeat: no-repeat;
  /* 背景图片覆盖整个区域 */
  background-size: cover;
  /* 背景图片居中 */
  background-position: center;
  /* 使用flex布局 */
  display: flex;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
  justify-content: center;
  /* 相对定位 */
  position: relative;
}

/* 品牌展示区遮罩层 */
.brand-section::before {
  /* 伪元素内容为空 */
  content: '';
  /* 绝对定位 */
  position: absolute;
  /* 距离顶部0 */
  top: 0;
  /* 距离左侧0 */
  left: 0;
  /* 距离右侧0 */
  right: 0;
  /* 距离底部0 */
  bottom: 0;
  /* 背景颜色为半透明黑色 */
  background: rgba(0, 0, 0, 0.4);
}

/* 品牌内容容器 */
.brand-content {
  /* 相对定位 */
  position: relative;
  /* 文字居中 */
  text-align: center;
  /* 白色文字 */
  color: white;
}

/* 品牌标题样式 */
.brand-title {
  /* 字体大小 */
  font-size: 48px;
  /* 字体粗细 */
  font-weight: 700;
  /* 外边距 */
  margin: 0 0 16px 0;
  /* 文字间距 */
  letter-spacing: 2px;
}

/* 品牌标语样式 */
.brand-slogan {
  /* 字体大小 */
  font-size: 18px;
  /* 字体粗细 */
  font-weight: 400;
  /* 外边距 */
  margin: 0;
  /* 透明度 */
  opacity: 0.9;
}

/* 右侧表单区 */
.form-section {
  /* 固定宽度 */
  width: 500px;
  /* 使用flex布局 */
  display: flex;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
  justify-content: center;
  /* 背景颜色为白色 */
  background: white;
  /* 内边距 */
  padding: 40px;
}

/* 表单卡片样式 */
.form-card {
  /* 宽度100% */
  width: 100%;
  /* 最大宽度为420px */
  max-width: 420px;
}

/* 卡片头部样式 */
.card-header {
  /* 底部外边距 */
  margin-bottom: 40px;
  /* 文字居中 */
  text-align: center;
}

/* 认证标题样式 */
.auth-title {
  /* 字体大小 */
  font-size: 28px;
  /* 字体粗细 */
  font-weight: 600;
  /* 文字颜色 */
  color: #1d2129;
  /* 外边距 */
  margin: 0 0 8px 0;
}

/* 认证副标题样式 */
.auth-subtitle {
  /* 字体大小 */
  font-size: 14px;
  /* 文字颜色 */
  color: #86909c;
  /* 外边距 */
  margin: 0;
}

/* 认证表单样式 */
.auth-form {
  /* 宽度100% */
  width: 100%;
}

/* 头像上传区样式 */
.avatar-section {
  /* 使用flex布局 */
  display: flex;
  /* 垂直居中 */
  align-items: flex-start;
  /* 底部外边距 */
  margin-bottom: 24px;
  /* 元素间距 */
  gap: 20px;
}

/* 头像标签样式 */
.avatar-label {
  /* 字体大小 */
  font-size: 14px;
  /* 文字颜色 */
  color: #1d2129;
  /* 行高 */
  line-height: 40px;
  /* 不换行 */
  white-space: nowrap;
}

/* 头像上传容器样式 */
.avatar-upload {
  /* 使用flex布局 */
  display: flex;
  /* 垂直排列 */
  flex-direction: column;
  /* 元素间距 */
  gap: 8px;
}

/* 头像上传器样式 */
.avatar-uploader :deep(.el-upload) {
  /* 边框 */
  border: 1px dashed var(--el-border-color);
  /* 圆角 */
  border-radius: 6px;
  /* 鼠标指针 */
  cursor: pointer;
  /* 相对定位 */
  position: relative;
  /* 隐藏溢出 */
  overflow: hidden;
  /* 过渡动画 */
  transition: var(--el-transition-duration-fast);
}

/* 头像上传器悬停样式 */
.avatar-uploader :deep(.el-upload:hover) {
  /* 边框颜色 */
  border-color: var(--el-color-primary);
}

/* 头像上传图标样式 */
.el-icon.avatar-uploader-icon {
  /* 字体大小 */
  font-size: 28px;
  /* 文字颜色 */
  color: #8c939d;
  /* 宽度 */
  width: 80px;
  /* 高度 */
  height: 80px;
  /* 文字居中 */
  text-align: center;
  /* 使用flex布局 */
  display: flex;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
  justify-content: center;
}

/* 头像图片样式 */
.avatar {
  /* 宽度 */
  width: 80px;
  /* 高度 */
  height: 80px;
  /* 显示为块级元素 */
  display: block;
  /* 圆角 */
  border-radius: 6px;
  /* 图片缩放方式 */
  object-fit: cover;
}

/* 头像提示文字样式 */
.avatar-tip {
  /* 字体大小 */
  font-size: 12px;
  /* 文字颜色 */
  color: #86909c;
}

/* 认证输入框样式 */
.auth-input {
  /* 输入框内部样式 */
  :deep(.el-input__wrapper) {
    /* 圆角 */
    border-radius: 6px;
    /* 阴影（模拟边框） */
    box-shadow: 0 0 0 1px #e5e6eb inset;
    /* 内边距 */
    padding: 1px 15px;

    /* 悬停状态 */
    &:hover {
      /* 阴影加深 */
      box-shadow: 0 0 0 1px #c9cdd4 inset;
    }

    /* 聚焦状态 */
    &.is-focus {
      /* 阴影变为蓝色边框 */
      box-shadow: 0 0 0 2px #165dff inset;
    }
  }
}

/* 认证按钮样式 */
.auth-button {
  /* 宽度100% */
  width: 100%;
  /* 高度 */
  height: 44px;
  /* 字体大小 */
  font-size: 16px;
  /* 字体粗细 */
  font-weight: 500;
  /* 圆角 */
  border-radius: 6px;
  /* 背景颜色 */
  background-color: #165dff;
  /* 边框颜色 */
  border-color: #165dff;

  /* 悬停状态 */
  &:hover {
    /* 背景颜色变浅 */
    background-color: #4080ff;
    /* 边框颜色变浅 */
    border-color: #4080ff;
  }

  /* 激活状态 */
  &:active {
    /* 背景颜色变深 */
    background-color: #0e42d2;
    /* 边框颜色变深 */
    border-color: #0e42d2;
  }
}
</style>
