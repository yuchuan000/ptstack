<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register as registerAPI } from '@/api/auth'

const router = useRouter()

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  agree: false,
})

const loading = ref(false)

const handleRegister = async () => {
  try {
    loading.value = true

    if (!form.value.username || !form.value.password || !form.value.email) {
      ElMessage.warning('请填写所有必填字段')
      return
    }

    if (!form.value.agree) {
      ElMessage.warning('请阅读并同意服务协议和隐私政策')
      return
    }

    if (form.value.password !== form.value.confirmPassword) {
      ElMessage.warning('两次输入的密码不一致')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email)) {
      ElMessage.warning('请输入有效的邮箱地址')
      return
    }

    await registerAPI({
      username: form.value.username,
      password: form.value.password,
      email: form.value.email,
    })

    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="login-page">
    <div class="brand-section">
      <div class="brand-content">
        <div class="logo">
          <span class="logo-icon">🚀</span>
          <span class="logo-text">PTStack</span>
        </div>
        <h1 class="brand-title">加入 PTStack</h1>
        <p class="brand-subtitle">开始您的高效开发之旅</p>

        <div class="feature-cards">
          <div class="feature-card">
            <div class="feature-number">15分钟</div>
            <div class="feature-desc">
              <div class="feature-title">短期令牌</div>
              <div class="feature-text">Access Token 安全便捷</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-number">7天</div>
            <div class="feature-desc">
              <div class="feature-title">长期免登</div>
              <div class="feature-text">Refresh Token 无需重复登录</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="login-section">
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">创建账号</h2>
          <p class="login-subtitle">欢迎加入 PTStack</p>
        </div>

        <el-form class="login-form">
          <el-form-item>
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              class="login-input"
              autocomplete="username"
            />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱地址"
              size="large"
              class="login-input"
              autocomplete="email"
            />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请确认密码"
              show-password
              size="large"
              class="login-input"
              autocomplete="new-password"
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="form.agree" class="agree-checkbox">
              我已阅读并同意
              <router-link to="/terms" class="policy-link">服务协议</router-link>
              和
              <router-link to="/privacy" class="policy-link">隐私政策</router-link>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              size="large"
              @click="handleRegister"
              :loading="loading"
              :disabled="loading"
            >
              注册
            </el-button>
          </el-form-item>

          <div class="login-footer">
            <span class="footer-text">已有账号？</span>
            <el-link type="primary" underline="never" class="footer-link" @click="goToLogin"> 立即登录 </el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f8f9fa;
}

.brand-section {
  flex: 1;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;

  .brand-content {
    max-width: 500px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;

    .logo-icon {
      font-size: 32px;
    }

    .logo-text {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 20px rgba(22, 93, 255, 0.2);
    }
  }

  .brand-title {
    font-size: 42px;
    font-weight: 700;
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 40px rgba(22, 93, 255, 0.3);
    margin-bottom: 12px;
    line-height: 1.2;
  }

  .brand-subtitle {
    font-size: 18px;
    color: #4e5969;
    margin-bottom: 60px;
  }

  .feature-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .feature-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(22, 93, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(22, 93, 255, 0.1);
  }

  .feature-number {
    font-size: 36px;
    font-weight: 700;
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(22, 93, 255, 0.3);
    margin-bottom: 8px;
  }

  .feature-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 4px;
  }

  .feature-text {
    font-size: 12px;
    color: #86909c;
    line-height: 1.4;
  }
}

.login-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #f8f9fa;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 48px;
  border: 1px solid #e5e6eb;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .login-title {
    font-size: 24px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 8px;
  }

  .login-subtitle {
    font-size: 14px;
    color: #86909c;
  }
}

.login-form {
  width: 100%;
}

.agree-checkbox {
  color: #4e5969;
  font-size: 14px;
  line-height: 1.5;

  :deep(.el-checkbox__label) {
    display: inline-flex;
    align-items: center;
    line-height: 1.5;
  }
}

.policy-link {
  font-size: 14px;
  color: #165dff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  margin: 0 4px;

  &:hover {
    color: #4080ff;
    text-decoration: underline;
  }
}

.login-input {
  :deep(.el-input__wrapper) {
    border-radius: 6px;
    box-shadow: 0 0 0 1px #e5e6eb inset;

    &:hover {
      box-shadow: 0 0 0 1px #c9cdd4 inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 2px #165dff inset;
    }
  }
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
  background-color: #165dff;
  border-color: #165dff;
  color: white;

  &:hover {
    background-color: #4080ff;
    border-color: #4080ff;
  }

  &:active {
    background-color: #0e42d2;
    border-color: #0e42d2;
  }
}

.login-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;

  .footer-text {
    font-size: 14px;
    color: #86909c;
  }

  .footer-link {
    font-size: 14px;
    color: #165dff;

    &:hover {
      color: #4080ff;
    }
  }
}

@media (max-width: 1024px) {
  .brand-section {
    display: none;
  }

  .login-section {
    flex: 1;
    padding: 24px;
  }

  .login-card {
    padding: 32px 24px;
  }
}
</style>
