import { ref } from 'vue'
import { request } from '@ptstack/request'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export function adminLogin() {
  // 路由对象
  const router = useRouter()

  // 表单数据
  const loginForm = ref({
    username: '',
    password: '',
  })

  // 登录处理
  const handleLogin = async () => {
    console.log(loginForm.value)
    const res = await request.post('/admin/login', loginForm.value)
    console.log(res)
    if (res.data.code === 200) {
      ElMessage({
        message: res.data.message,
        type: 'success',
      })
      await router.push('/')
    } else {
      ElMessage.error(res.data.message)
    }
  }
  return {
    loginForm,
    handleLogin,
  }
}
