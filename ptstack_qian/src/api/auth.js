// 认证API服务
import request from '@/utils/request'

/**
 * 发送邮箱验证邮件
 * @param {string} email - 邮箱地址
 * @returns {Promise<{message: string, email: string}>}
 */
export async function sendEmailVerification(email) {
  return request.post('/auth/send-email-verification', { email }, { _skipErrorToast: true })
}

/**
 * 验证邮箱验证码
 * @param {string} email - 邮箱地址
 * @param {string} code - 6位验证码
 * @returns {Promise<{message: string, email: string}>}
 */
export async function verifyEmailCode(email, code) {
  return request.post('/auth/verify-email-code', { email, code }, { _skipErrorToast: true })
}

/**
 * 检查邮箱是否已验证
 * @param {string} email - 邮箱地址
 * @returns {Promise<{verified: boolean}>}
 */
export async function checkEmailVerified(email) {
  return request.post('/auth/check-email-verified', { email })
}

/**
 * 用户注册
 * @param {object} userData - 用户注册数据
 * @param {string} userData.username - 用户名
 * @param {string} userData.password - 密码
 * @param {string} userData.email - 已验证的邮箱
 * @returns {Promise<{message: string, user: object}>}
 */
export async function register(userData) {
  return request.post('/auth/register', userData, { _skipErrorToast: true })
}

/**
 * 用户登录
 * @param {object} credentials - 登录凭据
 * @param {string} credentials.username - 用户名或邮箱
 * @param {string} credentials.password - 密码
 * @param {boolean} credentials.remember - 是否记住登录
 * @returns {Promise<{token: string, user: {id: number, username: string, email: string, profileCompleted: boolean}}>}
 */
export async function login(credentials) {
  return request.post('/auth/login', credentials)
}

/**
 * 获取用户信息（需要token）
 * @returns {Promise<{id: number, username: string, email: string, profileCompleted: boolean}>}
 */
export async function getProfile() {
  return request.get('/users/profile')
}

/**
 * 上传头像
 * @param {File} file - 头像文件
 * @returns {Promise<{message: string, url: string, filename: string}>}
 */
export async function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  return request.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 更新用户资料
 * @param {object} profileData - 资料数据
 * @param {string} profileData.nickname - 昵称
 * @param {string} profileData.avatar - 头像（可选）
 * @returns {Promise<{message: string, user: object}>}
 */
export async function updateProfile(profileData) {
  return request.put('/users/profile', profileData)
}
