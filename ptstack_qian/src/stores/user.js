/**
 * 用户状态管理仓库
 * 管理用户认证状态、token和用户信息
 */

import { defineStore } from 'pinia' // 导入Pinia的defineStore方法
import { ref, computed } from 'vue' // 导入Vue的响应式API
import { jwtDecode } from 'jwt-decode' // 导入JWT解码库

/**
 * 本地存储的key名称
 */
const STORAGE_KEY = 'ptstack_user'

/**
 * 从localStorage读取持久化数据的函数
 * @returns {Object|null} 存储的用户数据或null
 */
const loadFromStorage = () => {
  const savedData = localStorage.getItem(STORAGE_KEY) // 获取存储的数据
  if (savedData) {
    try {
      return JSON.parse(savedData) // 解析JSON数据
    } catch {
      localStorage.removeItem(STORAGE_KEY) // 解析失败则删除无效数据
    }
  }
  return null // 没有数据返回null
}

/**
 * 用户状态管理仓库
 */
export const useUserStore = defineStore('user', () => {
  // ==================== State（状态）====================

  const initialData = loadFromStorage() // 获取初始数据

  /**
   * Access Token，用于API认证
   */
  const accessToken = ref(initialData?.accessToken || '')

  /**
   * Refresh Token，用于刷新Access Token
   */
  const refreshToken = ref(initialData?.refreshToken || '')

  /**
   * 用户信息状态
   */
  const userInfo = ref(initialData?.userInfo || null)

  // ==================== Getters（计算属性）====================

  /**
   * 检查用户是否已登录，同时验证Access Token是否过期
   * @returns {boolean} 是否已登录
   */
  const isLoggedIn = computed(() => {
    if (!accessToken.value) return false // 没有token直接返回未登录
    try {
      const decoded = jwtDecode(accessToken.value) // 解码token
      const currentTime = Date.now() / 1000 // 获取当前时间戳（秒）
      if (decoded.exp && decoded.exp < currentTime) {
        return false // token已过期
      }
      return true // token有效
    } catch {
      return false // 解码失败，返回未登录
    }
  })

  // ==================== Actions（方法）====================

  /**
   * 登录方法：保存token
   * @param {string} newAccessToken - 新的Access Token
   * @param {string} [newRefreshToken=''] - 新的Refresh Token
   * @param {boolean} [remember=false] - 是否持久化存储
   */
  const login = (newAccessToken, newRefreshToken = '', remember = false) => {
    accessToken.value = newAccessToken // 更新Access Token
    refreshToken.value = newRefreshToken // 更新Refresh Token
    if (remember) {
      persist() // 如果需要持久化，保存到localStorage
    }
  }

  /**
   * 更新Access Token（刷新时使用）
   * @param {string} newAccessToken - 新的Access Token
   */
  const updateAccessToken = (newAccessToken) => {
    accessToken.value = newAccessToken // 更新Access Token
    if (refreshToken.value) {
      persist() // 如果有Refresh Token，持久化保存
    }
  }

  /**
   * 登出方法：清除所有状态和localStorage
   */
  const logout = () => {
    accessToken.value = '' // 清空Access Token
    refreshToken.value = '' // 清空Refresh Token
    userInfo.value = null // 清空用户信息
    localStorage.removeItem(STORAGE_KEY) // 移除本地存储
  }

  /**
   * 设置用户信息
   * @param {Object} info - 用户信息对象
   */
  const setUserInfo = (info) => {
    userInfo.value = info // 更新用户信息
    if (accessToken.value) {
      persist() // 如果有token，持久化保存
    }
  }

  /**
   * 更新用户信息（增量更新）
   * @param {Object} info - 要更新的用户信息
   */
  const updateUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info } // 合并新旧用户信息
    if (accessToken.value) {
      persist() // 如果有token，持久化保存
    }
  }

  /**
   * 持久化存储：将当前状态保存到localStorage
   */
  const persist = () => {
    const data = {
      accessToken: accessToken.value, // Access Token
      refreshToken: refreshToken.value, // Refresh Token
      userInfo: userInfo.value, // 用户信息
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) // 保存到localStorage
  }

  // ==================== 返回给外部使用 =====================
  return {
    accessToken, // 暴露accessToken状态
    refreshToken, // 暴露refreshToken状态
    userInfo, // 暴露userInfo状态
    isLoggedIn, // 暴露isLoggedIn计算属性
    login, // 暴露login方法
    logout, // 暴露logout方法
    setUserInfo, // 暴露setUserInfo方法
    updateUserInfo, // 暴露updateUserInfo方法
    updateAccessToken, // 暴露updateAccessToken方法
  }
})
