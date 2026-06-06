import axios from 'axios'
import { ElMessage } from 'element-plus'
// 声明自定义参数
declare module 'axios' {
  export interface AxiosRequestConfig {
    custom?: {
      noMessage?: boolean
    }
  }
}

export const request = axios.create({
  baseURL: 'http://127.0.0.1:3000',
  timeout: 1000,
})

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    console.log('发送前')
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  },
)

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    if (!response.config.custom?.noMessage) {
      ElMessage.success(response.data.message)
    }
    return response
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    ElMessage.error(error.response.data.message)
    return Promise.reject(error)
  },
)
