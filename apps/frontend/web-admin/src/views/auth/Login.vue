<script setup lang="ts">
// 组件加载
import FooterCopyright from '@/components/FooterCopyright.vue'

// 业务逻辑
import { adminLogin } from './Login.ts'
const { loginForm, handleLogin } = adminLogin()
</script>

<template>
  <div class="login">
    <div class="form">
      <el-text class="mx-1 form-title" size="large" tag="b">管理员登录</el-text>
      <div class="uname">
        <el-text>账号：</el-text>
        <el-input v-model="loginForm.username" placeholder="请输入账号" />
      </div>
      <div class="pwd">
        <el-text>密码：</el-text>
        <el-input
          v-model="loginForm.password"
          placeholder="请输入密码"
          type="password"
          show-password
        />
      </div>
      <el-button color="#000000" @click="handleLogin">登录</el-button>
    </div>
    <div class="footer">
      <FooterCopyright></FooterCopyright>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login {
  height: 100vh;
  padding: 1vh;
  display: flex;
  flex-direction: column;
  .form {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .form-title {
      margin-bottom: 4rem;
    }
    .uname,
    .pwd {
      width: 20rem;
      margin-bottom: 1rem;
      display: flex;
      .el-input {
        flex: 1;
      }
    }
    .el-button {
      margin-top: 1rem;
      width: 20rem;
    }
  }
}
</style>
