import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'

const STORAGE_KEY = 'ptstack_user'

/**
 * 用户状态管理仓库
 * 使用 Pinia 组合式 API（Setup Store）
 */
export const useUserStore = defineStore('user', () => {
  // ==================== State（状态）====================

  // 尝试从 localStorage 读取持久化的数据
  const loadFromStorage = () => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        return JSON.parse(savedData)
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    return null
  }

  const initialData = loadFromStorage()

  // Access Token（短期，用于 API 认证）
  const accessToken = ref(initialData?.accessToken || '')
  // Refresh Token（长期，用于刷新 Access Token）
  const refreshToken = ref(initialData?.refreshToken || '')
  // 用户信息状态
  const userInfo = ref(initialData?.userInfo || null)

  // ==================== Getters（计算属性）====================

  /**
   * 检查用户是否已登录
   * 会同时验证 Access Token 是否过期
   * @returns {boolean} 是否已登录
   */
  const isLoggedIn = computed(() => {
    if (!accessToken.value) return false
    try {
      const decoded = jwtDecode(accessToken.value)
      const currentTime = Date.now() / 1000
      if (decoded.exp && decoded.exp < currentTime) {
        return false
      }
      return true
    } catch (e) {
      return false
    }
  })

  // ==================== Actions（方法）====================

  /**
   * 登录：保存 token
   * @param {string} newAccessToken - Access Token
   * @param {string} newRefreshToken - Refresh Token（可选）
   * @param {boolean} remember - 是否持久化保存到 localStorage
   */
  const login = (newAccessToken, newRefreshToken = '', remember = false) => {
    accessToken.value = newAccessToken
    refreshToken.value = newRefreshToken
    if (remember) {
      persist()
    }
  }

  /**
   * 更新 Access Token（刷新时使用）
   * @param {string} newAccessToken - 新的 Access Token
   */
  const updateAccessToken = (newAccessToken) => {
    accessToken.value = newAccessToken
    if (refreshToken.value) {
      persist()
    }
  }

  /**
   * 登出：清除所有状态和 localStorage
   */
  const logout = () => {
    accessToken.value = ''
    refreshToken.value = ''
    userInfo.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * 设置用户信息
   * @param {object} info - 用户信息对象
   */
  const setUserInfo = (info) => {
    userInfo.value = info
    if (accessToken.value) {
      persist()
    }
  }

  /**
   * 持久化存储：将当前状态保存到 localStorage
   */
  const persist = () => {
    const data = {
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      userInfo: userInfo.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // ==================== 返回给外部使用 =====================
  return {
    accessToken,
    refreshToken,
    userInfo,
    isLoggedIn,
    login,
    logout,
    setUserInfo,
    updateAccessToken,
  }
})
