import axios from 'axios' // 导入axios库
import { ElMessage } from 'element-plus' // 导入Element Plus的消息提示组件
import router from '@/router' // 导入路由实例
import { useUserStore } from '@/stores/user' // 导入用户状态管理
import { jwtDecode } from 'jwt-decode' // 导入JWT解码库

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:3000', // 后端API基础地址
  timeout: 10000, // 请求超时时间，单位毫秒
  headers: {
    'Content-Type': 'application/json' // 默认请求头，设置内容类型为JSON
  }
})

// 判断Token是否过期的函数
const isTokenExpired = (token) => {
  if (!token) return true // 没有token直接返回已过期
  try {
    const decoded = jwtDecode(token) // 解码token
    const currentTime = Date.now() / 1000 // 获取当前时间戳（秒）
    if (decoded.exp && decoded.exp < currentTime) {
      return true // token已过期
    }
    return false // token未过期
  } catch (e) {
    return true // 解码失败，视为已过期
  }
}

// Token刷新相关状态
let isRefreshing = false // 标记是否正在刷新token，防止多个请求同时刷新
let refreshSubscribers = [] // 等待刷新的请求队列

// 订阅刷新完成的回调
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback) // 将回调加入队列
}

// 通知所有等待刷新的请求
const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken)) // 执行所有等待的回调
  refreshSubscribers = [] // 清空队列
}

// 请求拦截器：发送请求前执行
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore() // 获取用户状态仓库

    // 如果有Access Token，就添加到请求头
    if (userStore.accessToken) {
      config.headers.Authorization = `Bearer ${userStore.accessToken}` // 设置Authorization头
    }

    return config // 返回配置
  },
  (error) => {
    return Promise.reject(error) // 请求错误，拒绝Promise
  }
)

// 响应拦截器：收到响应后执行
request.interceptors.response.use(
  (response) => {
    return response.data // 成功响应，直接返回响应数据
  },
  async (error) => {
    const userStore = useUserStore() // 获取用户状态仓库
    const originalRequest = error.config // 保存原始请求配置

    // 如果是401错误且未重试过
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果正在刷新token
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}` // 更新token
            resolve(request(originalRequest)) // 重新发起请求
          })
        })
      }

      isRefreshing = true // 标记开始刷新
      originalRequest._retry = true // 标记已重试

      try {
        // 如果有Refresh Token
        if (userStore.refreshToken) {
          // 请求刷新token
          const response = await axios.post('http://localhost:3000/auth/refresh', {
            refreshToken: userStore.refreshToken
          })

          const newAccessToken = response.data.accessToken // 获取新的Access Token
          userStore.updateAccessToken(newAccessToken) // 更新store中的token
          onTokenRefreshed(newAccessToken) // 通知等待的请求

          const headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}` // 设置新token
          }

          // 重新发起原始请求
          const retryResponse = await axios({
            method: originalRequest.method,
            url: 'http://localhost:3000' + originalRequest.url,
            headers: headers,
            data: originalRequest.data
          })

          return retryResponse.data // 返回重试后的响应数据
        } else {
          throw new Error('没有 Refresh Token') // 抛出错误
        }
      } catch (refreshError) {
        ElMessage.error('登录已过期，请重新登录') // 提示用户
        userStore.logout() // 登出
        router.push('/login') // 跳转到登录页
        return Promise.reject(refreshError) // 拒绝Promise
      } finally {
        isRefreshing = false // 重置刷新状态
      }
    }

    // 处理其他错误
    if (!error._handled && !originalRequest._skipErrorToast) {
      let message = '请求失败' // 默认错误消息
      if (error.code === 'ECONNABORTED') {
        message = '请求超时，请检查网络连接' // 超时错误
      } else if (!error.response) {
        message = '网络连接失败，请检查网络' // 网络错误
      } else {
        message = error.response?.data?.message || message // 后端返回的错误消息
      }
      ElMessage.error(message) // 显示错误提示
    }
    return Promise.reject(error) // 拒绝Promise
  }
)

export default request // 导出axios实例