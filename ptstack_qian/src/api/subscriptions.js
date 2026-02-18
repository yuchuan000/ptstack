// 订阅相关API服务
import request from '@/utils/request'

/**
 * 切换订阅状态（关注/取消关注）
 * @param {number|string} followingId - 要订阅的用户ID
 * @returns {Promise<{message: string, isSubscribed: boolean}>}
 */
export function toggleSubscription(followingId) {
  return request({
    url: `/subscriptions/${followingId}`,
    method: 'post'
  })
}

/**
 * 检查是否已订阅
 * @param {number|string} followingId - 要检查的用户ID
 * @returns {Promise<{isSubscribed: boolean}>}
 */
export function checkSubscription(followingId) {
  return request({
    url: `/subscriptions/check/${followingId}`,
    method: 'get'
  })
}

/**
 * 获取用户粉丝列表
 * @param {number|string} userId - 用户ID
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.search - 搜索关键词
 * @returns {Promise<{users: Array, total: number, page: number, pageSize: number}>}
 */
export function getUserFollowers(userId, params) {
  return request({
    url: `/subscriptions/followers/${userId}`,
    method: 'get',
    params
  })
}

/**
 * 获取用户关注列表
 * @param {number|string} userId - 用户ID
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.search - 搜索关键词
 * @returns {Promise<{users: Array, total: number, page: number, pageSize: number}>}
 */
export function getUserFollowing(userId, params) {
  return request({
    url: `/subscriptions/following/${userId}`,
    method: 'get',
    params
  })
}
