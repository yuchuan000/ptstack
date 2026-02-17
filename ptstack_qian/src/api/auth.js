// 认证API服务
import request from '@/utils/request'

/**
 * 用户注册
 * @param {object} userData - 用户注册数据
 * @param {string} userData.username - 用户名
 * @param {string} userData.password - 密码
 * @param {string} userData.email - 邮箱
 * @returns {Promise<{message: string}>}
 */
export async function register(userData) {
  return request.post('/auth/register', userData)
}

/**
 * 用户登录
 * @param {object} credentials - 登录凭据
 * @param {string} credentials.username - 用户名或邮箱
 * @param {string} credentials.password - 密码
 * @returns {Promise<{token: string, user: {id: number, username: string, email: string}}>}
 */
export async function login(credentials) {
  return request.post('/auth/login', credentials)
}

/**
 * 获取用户信息（需要token）
 * @param {string} token - 认证token（可选，会从store自动获取）
 * @returns {Promise<{id: number, username: string, email: string}>}
 */
export async function getProfile(token) {
  return request.get('/users/profile')
}
