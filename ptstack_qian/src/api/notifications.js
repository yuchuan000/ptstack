// 通知相关API服务
import request from '@/utils/request'

/**
 * 获取通知列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.type - 通知类型（all/comment/like/follow）
 * @returns {Promise<{notifications: Array, total: number, page: number, pageSize: number}>}
 */
export function getNotifications(params) {
  return request({
    url: '/notifications',
    method: 'get',
    params,
  })
}

/**
 * 获取未读通知数量
 * @returns {Promise<{count: number}>}
 */
export function getUnreadCount() {
  return request({
    url: '/notifications/unread-count',
    method: 'get',
  })
}

/**
 * 标记通知为已读
 * @param {number|string} id - 通知ID
 * @returns {Promise<{message: string}>}
 */
export function markAsRead(id) {
  return request({
    url: `/notifications/${id}/read`,
    method: 'put',
  })
}

/**
 * 标记所有通知为已读
 * @returns {Promise<{message: string}>}
 */
export function markAllAsRead() {
  return request({
    url: '/notifications/read-all',
    method: 'put',
  })
}

/**
 * 删除通知
 * @param {number|string} id - 通知ID
 * @returns {Promise<{message: string}>}
 */
export function deleteNotification(id) {
  return request({
    url: `/notifications/${id}`,
    method: 'delete',
  })
}
