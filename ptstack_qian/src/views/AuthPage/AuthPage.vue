<script setup>
// 登录注册页面组件
// 功能：提供用户登录和注册功能，支持邮箱验证
// 导入Vue的ref响应式函数，用于创建响应式数据
import { ref, reactive, onUnmounted, watch, onMounted } from 'vue'
// 导入Vue Router的useRouter和useRoute函数
import { useRouter, useRoute } from 'vue-router'
// 导入Element Plus的消息提示组件
import { ElMessage } from 'element-plus'
// 导入Element Plus的Check图标组件
import { Check } from '@element-plus/icons-vue'
// 导入认证相关的API函数
import {
  login as loginAPI,
  register as registerAPI,
  sendEmailVerification,
  verifyEmailCode,
  checkEmailVerified
} from '@/api/auth'
// 导入用户状态管理store
import { useUserStore } from '@/stores/user'

// 创建路由实例，用于页面跳转等操作
const router = useRouter()
// 创建当前路由实例，用于获取路由信息
const route = useRoute()
// 创建用户状态管理实例
const userStore = useUserStore()

// 创建表单引用，用于表单验证
const formRef = ref(null)
// 创建登录/注册加载状态
const loading = ref(false)
// 创建发送邮件的加载状态
const sendingEmail = ref(false)

// 创建当前视图状态：'login'表示登录视图，'register'表示注册视图
const currentView = ref('login')

// 组件挂载时初始化
onMounted(() => {
  // 根据路由meta信息设置当前视图
  if (route.meta.view === 'register') {
    currentView.value = 'register'
  } else {
    currentView.value = 'login'
  }
})

// 监听路由变化
watch(() => route.path, () => {
  // 根据路由meta信息设置当前视图
  if (route.meta.view === 'register') {
    currentView.value = 'register'
  } else {
    currentView.value = 'login'
  }
})

// 注册页面相关状态
// 邮箱是否已验证
const emailVerified = ref(false)
// 邮箱验证倒计时
const emailCountdown = ref(0)
// 倒计时定时器引用
let countdownTimer = null
// 验证码值
const verificationCode = ref('')
// 验证码加载状态
const verifyingCode = ref(false)
// 是否显示验证码输入框（点击发送验证后才显示）
const showVerificationCodeInput = ref(false)
// 邮箱验证令牌
const emailVerificationToken = ref('')

// 邮箱格式验证正则表达式
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 登录表单响应式数据
const loginForm = reactive({
  // 用户名/邮箱
  username: '',
  // 密码
  password: '',
  // 是否记住登录状态
  remember: false
})

// 注册表单数据
const registerForm = reactive({
  // 邮箱
  email: '',
  // 用户名
  username: '',
  // 密码
  password: '',
  // 确认密码
  confirmPassword: '',
  // 同意隐私政策和服务条款
  agreeToTerms: false
})

// 监听注册邮箱变化
watch(() => registerForm.email, (newEmail) => {
  // 如果邮箱为空
  if (!newEmail) {
    // 重置验证状态
    emailVerified.value = false
    showVerificationCodeInput.value = false
    verificationCode.value = ''
    emailVerificationToken.value = ''
    // 提前返回
    return
  }
  // 邮箱有变化，重置所有验证状态（强制用户重新验证，安全起见）
  emailVerified.value = false
  showVerificationCodeInput.value = false
  verificationCode.value = ''
  emailVerificationToken.value = ''
  // 不再自动检查旧状态，强制用户重新验证
})

// 确认密码验证函数
const validateConfirmPassword = (rule, value, callback) => {
  // 如果确认密码为空
  if (value === '') {
    // 返回错误提示
    callback(new Error('请再次输入密码'))
  }
  // 如果确认密码与密码不一致
  else if (value !== registerForm.password) {
    // 返回错误提示
    callback(new Error('两次输入密码不一致'))
  }
  // 验证通过
  else {
    // 调用回调函数
    callback()
  }
}

// 登录表单验证规则
const loginRules = {
  // 用户名验证规则
  username: [
    // 必填验证
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  // 密码验证规则
  password: [
    // 必填验证
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  // 邮箱验证规则
  email: [
    // 必填验证
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    // 邮箱格式验证
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  // 用户名验证规则
  username: [
    // 必填验证
    { required: true, message: '请输入用户名', trigger: 'blur' },
    // 用户名格式验证：只能是英文、数字、下划线，长度3-20个字符
    { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '用户名只能包含英文、数字和下划线，长度3-20个字符', trigger: 'blur' }
  ],
  // 密码验证规则
  password: [
    // 必填验证
    { required: true, message: '请输入密码', trigger: 'blur' },
    // 密码长度验证：至少6个字符
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  // 确认密码验证规则
  confirmPassword: [
    // 必填验证 + 自定义验证
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  // 同意条款验证规则
  agreeToTerms: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请阅读并同意隐私政策和服务条款'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 切换到登录视图
const switchToLogin = () => {
  // 跳转到登录页面
  router.push('/login')
}

// 切换到注册视图
const switchToRegister = () => {
  // 跳转到注册页面
  router.push('/register')
}

// 跳转到隐私政策页面
const goToPrivacy = () => {
  router.push('/privacy')
}

// 跳转到服务条款页面
const goToTerms = () => {
  router.push('/terms')
}

// 处理发送邮箱验证
const handleSendVerification = async () => {
  // 如果邮箱为空或格式不正确
  if (!registerForm.email || !emailRegex.test(registerForm.email)) {
    // 显示警告提示
    ElMessage.warning('请先输入有效的邮箱')
    // 提前返回
    return
  }

  // 设置发送邮件状态为加载中
  sendingEmail.value = true
  // 使用try-catch捕获异步操作中的错误
  try {
    // 调用发送验证邮件API
    await sendEmailVerification(registerForm.email)

    // 显示成功提示
    ElMessage.success('验证邮件已发送，请输入邮件中的6位验证码')

    // 显示验证码输入框
    showVerificationCodeInput.value = true

    // 设置倒计时为60秒
    emailCountdown.value = 60
    // 启动倒计时定时器
    countdownTimer = setInterval(() => {
      // 倒计时减1
      emailCountdown.value--
      // 如果倒计时小于等于0
      if (emailCountdown.value <= 0) {
        // 清除定时器
        clearInterval(countdownTimer)
      }
    }, 1000) // 每1000毫秒（1秒）执行一次
  } catch (error) {
    // 在控制台输出错误信息
    console.error('发送验证邮件失败:', error)
    // 显示错误提示
    ElMessage.error(error.response?.data?.message || '发送验证邮件失败，请稍后重试')
  } finally {
    // 无论成功或失败，都设置发送邮件状态为非加载中
    sendingEmail.value = false
  }
}

// 验证邮箱验证码
const handleVerifyCode = async () => {
  // 如果邮箱为空
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  // 如果验证码为空
  if (!verificationCode.value) {
    ElMessage.warning('请输入验证码')
    return
  }
  // 如果验证码长度不是6位
  if (verificationCode.value.length !== 6) {
    ElMessage.warning('验证码必须是6位')
    return
  }

  // 设置验证码验证状态为加载中
  verifyingCode.value = true
  try {
    // 调用验证验证码API
    const response = await verifyEmailCode(registerForm.email, verificationCode.value)
    // 显示成功提示
    ElMessage.success(response.message || '邮箱验证成功')
    // 设置邮箱已验证状态
    emailVerified.value = true
    // 保存验证令牌
    emailVerificationToken.value = response.verificationToken
  } catch (error) {
    console.error('验证验证码失败:', error)
    ElMessage.error(error.response?.data?.message || '验证码验证失败，请检查')
  } finally {
    verifyingCode.value = false
  }
}

// 检查邮箱验证状态
const checkEmailStatus = async () => {
  // 如果邮箱为空
  if (!registerForm.email) {
    // 提前返回
    return
  }

  // 使用try-catch捕获异步操作中的错误
  try {
    // 调用检查邮箱验证状态API
    const response = await checkEmailVerified(registerForm.email)
    // 更新邮箱验证状态
    emailVerified.value = response.verified
  } catch (error) {
    // 在控制台输出错误信息
    console.error('检查邮箱状态失败:', error)
  }
}

// 处理登录
const handleLogin = async () => {
  // 如果表单引用不存在
  if (!formRef.value) {
    // 提前返回
    return
  }

  // 使用try-catch捕获异步操作中的错误
  try {
    // 设置加载状态为true
    loading.value = true

    // 检查用户名和密码是否都已填写
    if (!loginForm.username || !loginForm.password) {
      // 显示警告提示
      ElMessage.warning('请输入用户名和密码')
      // 提前返回
      return
    }

    // 调用登录API，传入用户名、密码和记住登录状态参数
    const response = await loginAPI({
      // 传入用户名
      username: loginForm.username,
      // 传入密码
      password: loginForm.password,
      // 传入记住登录状态参数
      remember: loginForm.remember,
    })

    // 调用userStore的login方法，保存访问令牌和刷新令牌
    userStore.login(response.accessToken, response.refreshToken, loginForm.remember)
    // 调用userStore的setUserInfo方法，保存用户信息
    userStore.setUserInfo(response.user)

    // 显示登录成功的提示信息
    ElMessage.success('登录成功')

    // 检查是否需要完善资料
    if (response.user.profileCompleted) {
      // 已完善资料，跳转到首页
      router.push('/')
    } else {
      // 未完善资料，跳转到资料完善页
      router.push('/complete-profile')
    }
  } catch (error) {
    // 在控制台输出错误信息
    console.error('登录失败:', error)
    // 显示错误提示
    ElMessage.error(error.response?.data?.message || '登录失败，请稍后重试')
  } finally {
    // 无论登录成功或失败，都设置加载状态为false
    loading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  // 如果表单引用不存在
  if (!formRef.value) {
    // 提前返回
    return
  }

  // 验证表单
  await formRef.value.validate(async (valid) => {
    // 如果验证通过
    if (valid) {
      // 如果邮箱未验证
      if (!emailVerified.value) {
        // 检查邮箱验证状态
        await checkEmailStatus()
        // 如果仍然未验证
        if (!emailVerified.value) {
          // 显示警告提示
          ElMessage.warning('请先验证邮箱')
          // 提前返回
          return
        }
      }

      // 设置加载状态为true
      loading.value = true
      // 使用try-catch捕获异步操作中的错误
      try {
        // 调用注册API
        const result = await registerAPI({
          // 传入用户名
          username: registerForm.username,
          // 传入密码
          password: registerForm.password,
          // 传入邮箱
          email: registerForm.email,
          // 传入验证令牌
          verificationToken: emailVerificationToken.value,
        })

        // 显示注册成功的提示信息
        ElMessage.success(result.message || '注册成功！')
        // 切换到登录视图
        switchToLogin()
      } catch (error) {
        // 在控制台输出错误信息
        console.error('注册失败:', error)
        // 显示错误提示
        ElMessage.error(error.response?.data?.message || '注册失败，请稍后重试')
      } finally {
        // 无论注册成功或失败，都设置加载状态为false
        loading.value = false
      }
    }
  })
}

// 组件卸载时的清理工作
onUnmounted(() => {
  // 如果倒计时定时器存在
  if (countdownTimer) {
    // 清除定时器
    clearInterval(countdownTimer)
  }
})
</script>

<template>
  <!-- 登录/注册页面容器 -->
  <div class="auth-page">
    <!-- 左侧品牌展示区 -->
    <div class="brand-section">
      <!-- 品牌内容容器 -->
      <div class="brand-content">
        <!-- Logo区域 -->
        <div class="logo">
          <!-- Logo图标 -->
          <span class="logo-icon">🚀</span>
          <!-- Logo文字 -->
          <span class="logo-text">PTStack</span>
        </div>
        <!-- 品牌标题 -->
        <h1 class="brand-title">欢迎使用 PTStack</h1>
        <!-- 品牌副标题 -->
        <p class="brand-subtitle">高效开发，轻松管理</p>

        <!-- 功能卡片区域 -->
        <div class="feature-cards">
          <!-- 第一个功能卡片 -->
          <div class="feature-card">
            <!-- 功能编号/标题 -->
            <div class="feature-number">15分钟</div>
            <!-- 功能描述 -->
            <div class="feature-desc">
              <!-- 功能标题 -->
              <div class="feature-title">短期令牌</div>
              <!-- 功能文字 -->
              <div class="feature-text">Access Token 安全便捷</div>
            </div>
          </div>
          <!-- 第二个功能卡片 -->
          <div class="feature-card">
            <!-- 功能编号/标题 -->
            <div class="feature-number">7天</div>
            <!-- 功能描述 -->
            <div class="feature-desc">
              <!-- 功能标题 -->
              <div class="feature-title">长期免登</div>
              <!-- 功能文字 -->
              <div class="feature-text">Refresh Token 无需重复登录</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="auth-section">
      <!-- 表单卡片容器 -->
      <div class="auth-card">
        <!-- 表单头部 -->
        <div class="auth-header">
          <!-- 根据当前视图显示不同的标题 -->
          <h2 class="auth-title">
            <!-- 登录视图显示"欢迎回来" -->
            <span v-if="currentView === 'login'">欢迎回来</span>
            <!-- 注册视图显示"创建账号" -->
            <span v-else>创建账号</span>
          </h2>
          <!-- 根据当前视图显示不同的副标题 -->
          <p class="auth-subtitle">
            <!-- 登录视图显示"请登录您的账号" -->
            <span v-if="currentView === 'login'">请登录您的账号</span>
            <!-- 注册视图显示"开始您的 PTStack 之旅" -->
            <span v-else>开始您的 PTStack 之旅</span>
          </p>
        </div>

        <!-- 登录表单 -->
        <el-form
          v-if="currentView === 'login'"
          ref="formRef"
          :model="loginForm"
          :rules="loginRules"
          class="auth-form"
        >
          <!-- 用户名输入框 -->
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名或邮箱"
              size="large"
              class="auth-input"
              autocomplete="username"
            />
          </el-form-item>

          <!-- 密码输入框 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              size="large"
              class="auth-input"
              autocomplete="current-password"
            />
          </el-form-item>

          <!-- 记住登录状态复选框 -->
          <div class="auth-options">
            <el-checkbox v-model="loginForm.remember" class="remember-checkbox">
              7天内免登录
            </el-checkbox>
          </div>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              class="auth-button"
              size="large"
              @click="handleLogin"
              :loading="loading"
              :disabled="loading"
            >
              登录
            </el-button>
          </el-form-item>

          <!-- 底部链接：还没有账号？去注册 -->
          <div class="auth-footer">
            <span class="footer-text">还没有账号？</span>
            <el-link type="primary" underline="never" class="footer-link" @click="switchToRegister">
              立即注册
            </el-link>
          </div>
        </el-form>

        <!-- 注册表单 -->
        <el-form
          v-else
          ref="formRef"
          :model="registerForm"
          :rules="registerRules"
          class="auth-form"
        >
          <!-- 邮箱输入框 + 验证按钮 -->
          <el-form-item prop="email">
            <div class="email-input-group">
              <!-- 邮箱输入框 -->
              <el-input
                v-model="registerForm.email"
                type="email"
                placeholder="请输入邮箱"
                size="large"
                class="auth-input"
                :disabled="emailVerified"
                autocomplete="email"
              />
              <!-- 发送验证按钮（未验证时显示） -->
              <el-button
                v-if="!emailVerified"
                type="primary"
                size="large"
                :loading="sendingEmail"
                :disabled="!registerForm.email || emailRegex.test(registerForm.email) === false || emailCountdown > 0"
                @click="handleSendVerification"
                class="verify-button"
              >
                {{ emailCountdown > 0 ? `${emailCountdown}s` : '发送验证' }}
              </el-button>
              <!-- 已验证标签（验证成功后显示） -->
              <el-tag v-else type="success" size="large" class="verified-tag">
                <el-icon><Check /></el-icon>
                已验证
              </el-tag>
            </div>
          </el-form-item>

          <!-- 验证码输入框 + 验证按钮 -->
          <el-form-item v-if="showVerificationCodeInput && !emailVerified">
            <div class="verification-code-group">
              <!-- 验证码输入框 -->
              <el-input
                v-model="verificationCode"
                type="text"
                placeholder="请输入6位验证码"
                size="large"
                class="verification-code-input"
                maxlength="6"
                show-word-limit
              />
              <!-- 验证按钮 -->
              <el-button
                type="primary"
                size="large"
                :loading="verifyingCode"
                :disabled="!verificationCode || verificationCode.length !== 6"
                @click="handleVerifyCode"
                class="verify-code-button"
              >
                验证
              </el-button>
            </div>
          </el-form-item>

          <!-- 用户名输入框 -->
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              type="text"
              placeholder="请设置用户名（只能是英文、数字、下划线）"
              size="large"
              class="auth-input"
              autocomplete="username"
            />
          </el-form-item>

          <!-- 密码输入框 -->
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请设置密码"
              size="large"
              class="auth-input"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>

          <!-- 确认密码输入框 -->
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              class="auth-input"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>

          <!-- 隐私政策和服务条款勾选框 -->
          <el-form-item prop="agreeToTerms">
            <el-checkbox v-model="registerForm.agreeToTerms">
              我已阅读并同意
              <el-link type="primary" underline="never" @click="goToPrivacy">隐私政策</el-link>
              和
              <el-link type="primary" underline="never" @click="goToTerms">服务条款</el-link>
            </el-checkbox>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              class="auth-button"
              size="large"
              @click="handleRegister"
              :loading="loading"
              :disabled="!emailVerified"
            >
              注册
            </el-button>
          </el-form-item>

          <!-- 底部链接：已有账号？去登录 -->
          <div class="auth-footer">
            <span class="footer-text">已有账号？</span>
            <el-link type="primary" underline="never" class="footer-link" @click="switchToLogin">
              去登录
            </el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 登录/注册页面容器样式 */
.auth-page {
  /* 使用flex布局 */
  display: flex;
  /* 高度100%视口高度 */
  height: 100vh;
  /* 宽度100%视口宽度 */
  width: 100vw;
  /* 隐藏溢出内容 */
  overflow: hidden;
  /* 背景颜色 */
  background-color: #f8f9fa;
}

/* 左侧品牌展示区样式 */
.brand-section {
  /* 占据剩余空间 */
  flex: 1;
  /* 背景颜色 */
  background-color: #f8f9fa;
  /* 使用flex布局 */
  display: flex;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
  justify-content: center;
  /* 内边距 */
  padding: 60px;

  /* 品牌内容容器样式 */
  .brand-content {
    /* 最大宽度 */
    max-width: 500px;
  }

  /* Logo区域样式 */
  .logo {
    /* 使用flex布局 */
    display: flex;
    /* 垂直居中 */
    align-items: center;
    /* 元素间距 */
    gap: 12px;
    /* 底部外边距 */
    margin-bottom: 40px;

    /* Logo图标样式 */
    .logo-icon {
      /* 字体大小 */
      font-size: 32px;
    }

    /* Logo文字样式 */
    .logo-text {
      /* 字体大小 */
      font-size: 28px;
      /* 字体粗细 */
      font-weight: 700;
      /* 背景渐变 */
      background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
      /* 背景裁剪为文字 */
      -webkit-background-clip: text;
      /* 文字颜色透明，显示背景渐变 */
      -webkit-text-fill-color: transparent;
      /* 标准背景裁剪 */
      background-clip: text;
      /* 文字阴影 */
      text-shadow: 0 0 20px rgba(22, 93, 255, 0.2);
    }
  }

  /* 品牌标题样式 */
  .brand-title {
    /* 字体大小 */
    font-size: 42px;
    /* 字体粗细 */
    font-weight: 700;
    /* 背景渐变 */
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    /* 背景裁剪为文字 */
    -webkit-background-clip: text;
    /* 文字颜色透明，显示背景渐变 */
    -webkit-text-fill-color: transparent;
    /* 标准背景裁剪 */
    background-clip: text;
    /* 文字阴影 */
    text-shadow: 0 0 40px rgba(22, 93, 255, 0.3);
    /* 底部外边距 */
    margin-bottom: 12px;
    /* 行高 */
    line-height: 1.2;
  }

  /* 品牌副标题样式 */
  .brand-subtitle {
    /* 字体大小 */
    font-size: 18px;
    /* 文字颜色 */
    color: #4e5969;
    /* 底部外边距 */
    margin-bottom: 60px;
  }

  /* 功能卡片区域样式 */
  .feature-cards {
    /* 使用网格布局 */
    display: grid;
    /* 两列等宽 */
    grid-template-columns: 1fr 1fr;
    /* 卡片间距 */
    gap: 20px;
  }

  /* 功能卡片样式 */
  .feature-card {
    /* 背景颜色 */
    background: white;
    /* 内边距 */
    padding: 24px;
    /* 圆角 */
    border-radius: 12px;
    /* 阴影 */
    box-shadow: 0 4px 20px rgba(22, 93, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
    /* 边框 */
    border: 1px solid rgba(22, 93, 255, 0.1);
  }

  /* 功能编号/标题样式 */
  .feature-number {
    /* 字体大小 */
    font-size: 36px;
    /* 字体粗细 */
    font-weight: 700;
    /* 背景渐变 */
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    /* 背景裁剪为文字 */
    -webkit-background-clip: text;
    /* 文字颜色透明，显示背景渐变 */
    -webkit-text-fill-color: transparent;
    /* 标准背景裁剪 */
    background-clip: text;
    /* 文字阴影 */
    text-shadow: 0 0 30px rgba(22, 93, 255, 0.3);
    /* 底部外边距 */
    margin-bottom: 8px;
  }

  /* 功能标题样式 */
  .feature-title {
    /* 字体大小 */
    font-size: 14px;
    /* 字体粗细 */
    font-weight: 600;
    /* 文字颜色 */
    color: #1d2129;
    /* 底部外边距 */
    margin-bottom: 4px;
  }

  /* 功能文字样式 */
  .feature-text {
    /* 字体大小 */
    font-size: 12px;
    /* 文字颜色 */
    color: #86909c;
    /* 行高 */
    line-height: 1.4;
  }
}

/* 右侧表单区样式 */
.auth-section {
  /* 占据剩余空间 */
  flex: 1;
  /* 使用flex布局 */
  display: flex;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
  justify-content: center;
  /* 内边距 */
  padding: 40px;
  /* 背景颜色 */
  background-color: #f8f9fa;
}

/* 表单卡片样式 */
.auth-card {
  /* 宽度100% */
  width: 100%;
  /* 最大宽度 */
  max-width: 420px;
  /* 背景颜色 */
  background: white;
  /* 圆角 */
  border-radius: 12px;
  /* 阴影 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  /* 内边距 */
  padding: 48px;
  /* 边框 */
  border: 1px solid #e5e6eb;
}

/* 表单头部样式 */
.auth-header {
  /* 文字居中 */
  text-align: center;
  /* 底部外边距 */
  margin-bottom: 40px;

  /* 表单标题样式 */
  .auth-title {
    /* 字体大小 */
    font-size: 24px;
    /* 字体粗细 */
    font-weight: 600;
    /* 文字颜色 */
    color: #1d2129;
    /* 底部外边距 */
    margin-bottom: 8px;
  }

  /* 表单副标题样式 */
  .auth-subtitle {
    /* 字体大小 */
    font-size: 14px;
    /* 文字颜色 */
    color: #86909c;
  }
}

/* 表单样式 */
.auth-form {
  /* 宽度100% */
  width: 100%;
}

/* 邮箱输入组样式 */
.email-input-group {
  /* 使用flex布局 */
  display: flex;
  /* 元素间距 */
  gap: 12px;
  /* 垂直居中 */
  align-items: center;
  /* 宽度100% */
  width: 100%;
}

/* 输入框样式 */
.auth-input {
  /* 自动填充剩余空间 */
  flex: 1;

  /* 深度选择器：输入框包装器 */
  :deep(.el-input__wrapper) {
    /* 圆角 */
    border-radius: 6px;
    /* 阴影（模拟边框） */
    box-shadow: 0 0 0 1px #e5e6eb inset;

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

/* 验证按钮样式 */
.verify-button {
  /* 不收缩 */
  flex-shrink: 0;
  /* 不换行 */
  white-space: nowrap;
  /* 高度 */
  height: 40px;
  /* 最小宽度 */
  min-width: 80px;
  /* 字体大小 */
  font-size: 14px;
  /* 圆角 */
  border-radius: 6px;
  /* 背景颜色 */
  background-color: #165dff;
  /* 边框颜色 */
  border-color: #165dff;
  /* 文字颜色 */
  color: white;

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

  /* 禁用状态 */
  &:disabled {
    /* 背景颜色 */
    background-color: #f2f3f5;
    /* 边框颜色 */
    border-color: #e5e6eb;
    /* 文字颜色 */
    color: #c9cdd4;
  }
}

/* 已验证标签样式 */
.verified-tag {
  /* 不收缩 */
  flex-shrink: 0;
  /* 高度 */
  height: 40px;
  /* 使用flex布局 */
  display: inline-flex;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
  justify-content: center;
  /* 元素间距 */
  gap: 4px;
  /* 内边距 */
  padding: 0 16px;
  /* 行高 */
  line-height: 1;

  /* 图标样式 */
  :deep(.el-icon) {
    /* 垂直对齐 */
    vertical-align: middle;
    /* 不换行 */
    display: inline-flex;
  }
}

/* 验证码输入框组样式 */
.verification-code-group {
  /* 使用flex布局 */
  display: flex;
  /* 元素间距 */
  gap: 12px;
  /* 宽度100% */
  width: 100%;
}

/* 验证码输入框样式 */
.verification-code-input {
  /* 自动填充剩余空间 */
  flex: 1;

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

  /* 字数统计样式 */
  :deep(.el-input__count) {
    /* 字体大小 */
    font-size: 12px;
    /* 文字颜色 */
    color: #86909c;
  }
}

/* 验证码验证按钮样式 */
.verify-code-button {
  /* 不收缩 */
  flex-shrink: 0;
  /* 不换行 */
  white-space: nowrap;
  /* 高度 */
  height: 40px;
  /* 最小宽度 */
  min-width: 80px;
  /* 字体大小 */
  font-size: 14px;
  /* 圆角 */
  border-radius: 6px;
  /* 背景颜色 */
  background-color: #165dff;
  /* 边框颜色 */
  border-color: #165dff;
  /* 文字颜色 */
  color: white;

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

  /* 禁用状态 */
  &:disabled {
    /* 背景颜色 */
    background-color: #f2f3f5;
    /* 边框颜色 */
    border-color: #e5e6eb;
    /* 文字颜色 */
    color: #c9cdd4;
  }
}

/* 表单选项区域样式 */
.auth-options {
  /* 上下外边距 */
  margin: 24px 0;

  /* 记住登录复选框样式 */
  .remember-checkbox {
    /* 文字颜色 */
    color: #4e5969;
    /* 字体大小 */
    font-size: 14px;
  }
}

/* 登录/注册按钮样式 */
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
  /* 文字颜色 */
  color: white;

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

/* 表单底部样式 */
.auth-footer {
  /* 使用flex布局 */
  display: flex;
  /* 水平居中 */
  justify-content: center;
  /* 垂直居中 */
  align-items: center;
  /* 元素间距 */
  gap: 8px;
  /* 顶部外边距 */
  margin-top: 32px;

  /* 底部文字样式 */
  .footer-text {
    /* 字体大小 */
    font-size: 14px;
    /* 文字颜色 */
    color: #86909c;
  }

  /* 底部链接样式 */
  .footer-link {
    /* 字体大小 */
    font-size: 14px;
    /* 文字颜色 */
    color: #165dff;

    /* 悬停状态 */
    &:hover {
      /* 文字颜色变浅 */
      color: #4080ff;
    }
  }
}

/* 响应式样式：小屏幕 */
@media (max-width: 1024px) {
  /* 隐藏品牌展示区 */
  .brand-section {
    display: none;
  }

  /* 表单区占据全部空间 */
  .auth-section {
    flex: 1;
    /* 减小内边距 */
    padding: 24px;
  }

  /* 减小表单卡片内边距 */
  .auth-card {
    padding: 32px 24px;
  }
}
</style>
