<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login as loginAPI } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: '',
  remember: false,
})

const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true

    if (!form.value.username || !form.value.password) {
      ElMessage.warning('请输入用户名和密码')
      return
    }

    const response = await loginAPI({
      username: form.value.username,
      password: form.value.password,
      remember: form.value.remember,
    })

    userStore.login(response.accessToken, response.refreshToken, form.value.remember)
    userStore.setUserInfo(response.user)

    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
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
        <h1 class="brand-title">欢迎使用 PTStack</h1>
        <p class="brand-subtitle">高效开发，轻松管理</p>

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
          <h2 class="login-title">欢迎回来</h2>
          <p class="login-subtitle">请登录您的账号</p>
        </div>

        <el-form class="login-form">
          <el-form-item>
            <el-input
              v-model="form.username"
              placeholder="请输入用户名或邮箱"
              size="large"
              class="login-input"
              autocomplete="username"
            />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
              size="large"
              class="login-input"
              autocomplete="current-password"
            />
          </el-form-item>

          <div class="login-options">
            <el-checkbox v-model="form.remember" class="remember-checkbox"> 7天内免登录 </el-checkbox>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              size="large"
              @click="handleLogin"
              :loading="loading"
              :disabled="loading"
            >
              登录
            </el-button>
          </el-form-item>

          <div class="login-footer">
            <span class="footer-text">还没有账号？</span>
            <el-link type="primary" underline="never" class="footer-link" @click="goToRegister"> 立即注册 </el-link>
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

.login-options {
  margin: 24px 0;

  .remember-checkbox {
    color: #4e5969;
    font-size: 14px;
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
