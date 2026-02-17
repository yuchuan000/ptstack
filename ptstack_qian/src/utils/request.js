import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { jwtDecode } from 'jwt-decode'

// ======================================================
// 创建 axios 实例
// ======================================================
const request = axios.create({
  baseURL: 'http://localhost:3000', // 后端 API 基础地址
  timeout: 10000, // 请求超时时间（毫秒）
  headers: {
    'Content-Type': 'application/json' // 默认请求头
  }
})

// ======================================================
// 判断 Token 是否过期
// ======================================================
// 参数：token - JWT token 字符串
// 返回：true-已过期，false-未过期
const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000
    // decoded.exp 是 token 过期时间戳（秒）
    if (decoded.exp && decoded.exp < currentTime) {
      return true
    }
    return false
  } catch (e) {
    return true
  }
}

// ======================================================
// Token 刷新相关状态管理
// ======================================================
// 标记是否正在刷新 token（防止多个请求同时刷新）
let isRefreshing = false
// 等待刷新的请求队列（token 刷新期间进来的请求先存起来）
let refreshSubscribers = []

// ======================================================
// 订阅刷新完成的回调
// ======================================================
// 当有新请求进来但正在刷新时，把请求加入队列
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

// ======================================================
// 通知所有等待刷新的请求
// ======================================================
// token 刷新成功后，执行队列里所有等待的请求
const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

// ======================================================
// 请求拦截器（发送请求前执行）
// ======================================================
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    // 如果有 Access Token，就添加到请求头
    // 格式：Authorization: Bearer xxx.yyy.zzz
    if (userStore.accessToken) {
      config.headers.Authorization = `Bearer ${userStore.accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ======================================================
// 响应拦截器（收到响应后执行）
// ==================================================
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const userStore = useUserStore()
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(request(originalRequest))
          })
        })
      }

      isRefreshing = true
      originalRequest._retry = true

      try {
        if (userStore.refreshToken) {
          const response = await axios.post('http://localhost:3000/auth/refresh', {
            refreshToken: userStore.refreshToken
          })

          const newAccessToken = response.data.accessToken
          userStore.updateAccessToken(newAccessToken)
          onTokenRefreshed(newAccessToken)

          const headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`
          }

          const retryResponse = await axios({
            method: originalRequest.method,
            url: 'http://localhost:3000' + originalRequest.url,
            headers: headers,
            data: originalRequest.data
          })

          return retryResponse.data
        } else {
          throw new Error('没有 Refresh Token')
        }
      } catch (refreshError) {
        ElMessage.error('登录已过期，请重新登录')
        userStore.logout()
        router.push('/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (!error._handled && !originalRequest._skipErrorToast) {
      let message = '请求失败'
      if (error.code === 'ECONNABORTED') {
        message = '请求超时，请检查网络连接'
      } else if (!error.response) {
        message = '网络连接失败，请检查网络'
      } else {
        message = error.response?.data?.message || message
      }
      ElMessage.error(message)
    }
    return Promise.reject(error)
  }
)

export default request
