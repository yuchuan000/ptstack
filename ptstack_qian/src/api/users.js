// 用户相关API服务
import request from '@/utils/request'

/**
 * 获取用户公开信息
 * @param {number|string} userId - 用户ID
 * @returns {Promise<{user: {id: number, username: string, bio: string, website: string, follower_count: number, following_count: number, isSubscribed: boolean, isOwn: boolean}}>}
 */
export function getUserPublicProfile(userId) {
  return request({
    url: `/users/${userId}`,
    method: 'get'
  })
}

/**
 * 更新用户个人资料
 * @param {object} data - 用户资料数据
 * @param {string} data.bio - 个人简介
 * @param {string} data.website - 个人网站
 * @returns {Promise<{message: string, user: {id: number, username: string, email: string, bio: string, website: string}}>}
 */
export function updateProfile(data) {
  return request({
    url: '/users/profile',
    method: 'put',
    data
  })
}

/**
 * 更新用户隐私设置
 * @param {object} data - 隐私设置数据
 * @param {boolean} data.show_followers - 是否显示粉丝列表
 * @param {boolean} data.show_following - 是否显示关注列表
 * @param {boolean} data.show_articles - 是否显示文章列表
 * @param {boolean} data.show_comments - 是否显示评论列表
 * @returns {Promise<{message: string, user: {id: number, username: string, show_followers: boolean, show_following: boolean, show_articles: boolean, show_comments: boolean}}>}
 */
export function updatePrivacySettings(data) {
  return request({
    url: '/users/privacy',
    method: 'put',
    data
  })
}

/**
 * 获取用户文章列表
 * @param {number|string} userId - 用户ID
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.search - 搜索关键词
 * @param {string} params.sort - 排序字段
 * @param {string} params.sortOrder - 排序顺序
 * @returns {Promise<{articles: Array, total: number, page: number, pageSize: number}>}
 */
export function getUserArticles(userId, params) {
  return request({
    url: `/users/${userId}/articles`,
    method: 'get',
    params
  })
}

/**
 * 获取用户评论列表
 * @param {number|string} userId - 用户ID
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.search - 搜索关键词
 * @param {string} params.sort - 排序字段
 * @param {string} params.sortOrder - 排序顺序
 * @returns {Promise<{comments: Array, total: number, page: number, pageSize: number}>}
 */
export function getUserComments(userId, params) {
  return request({
    url: `/users/${userId}/comments`,
    method: 'get',
    params
  })
}

/**
 * 获取推荐关注用户
 * @param {object} params - 查询参数
 * @param {number} params.limit - 返回数量
 * @returns {Promise<{users: Array}>}
 */
export function getRecommendedUsers(params) {
  return request({
    url: '/users/recommended',
    method: 'get',
    params
  })
}

/**
 * 获取关注用户的Feed流
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise<{articles: Array, total: number, page: number, pageSize: number}>}
 */
export function getFeed(params) {
  return request({
    url: '/users/feed',
    method: 'get',
    params
  })
}

/**
 * 获取未读消息数
 * @returns {Promise<{total: number, comments: number, likes: number, followers: number}>}
 */
export function getUnreadCount() {
  return request({
    url: '/users/unread-count',
    method: 'get'
  })
}