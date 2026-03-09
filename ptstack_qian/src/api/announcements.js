// 公告相关API服务
import request from '@/utils/request'

/**
 * 获取公告列表
 * @returns {Promise<Array<{id: number, title: string, content: string, type: string, priority: number, created_at: string}>>}
 */
export function getAnnouncements() {
  return request({
    url: '/announcements',
    method: 'get',
  })
}

/**
 * 根据ID获取公告详情
 * @param {number|string} id - 公告ID
 * @returns {Promise<{id: number, title: string, content: string, type: string, priority: number, created_at: string}>}
 */
export function getAnnouncementById(id) {
  return request({
    url: `/announcements/${id}`,
    method: 'get',
  })
}

/**
 * 获取跑马灯公告列表
 * @returns {Promise<Array<{id: number, title: string, content: string}>>}
 */
export function getMarqueeAnnouncements() {
  return request({
    url: '/announcements/marquee',
    method: 'get',
  })
}

/**
 * 获取未读弹窗公告列表
 * @returns {Promise<Array<{id: number, title: string, content: string}>>}
 */
export function getUnreadPopupAnnouncements() {
  return request({
    url: '/announcements/unread-popup',
    method: 'get',
  })
}

/**
 * 管理员获取所有公告列表
 * @returns {Promise<Array<{id: number, title: string, content: string, type: string, priority: number, created_at: string}>>}
 */
export function getAllAnnouncementsAdmin() {
  return request({
    url: '/announcements/admin/all',
    method: 'get',
  })
}

/**
 * 创建公告
 * @param {object} data - 公告数据
 * @param {string} data.title - 公告标题
 * @param {string} data.content - 公告内容
 * @param {string} data.type - 公告类型（normal/important/urgent）
 * @param {number} data.priority - 优先级（1-10）
 * @returns {Promise<{message: string, announcementId: number}>}
 */
export function createAnnouncement(data) {
  return request({
    url: '/announcements',
    method: 'post',
    data,
  })
}

/**
 * 更新公告
 * @param {number|string} id - 公告ID
 * @param {object} data - 公告数据
 * @param {string} data.title - 公告标题
 * @param {string} data.content - 公告内容
 * @param {string} data.type - 公告类型
 * @param {number} data.priority - 优先级
 * @returns {Promise<{message: string}>}
 */
export function updateAnnouncement(id, data) {
  return request({
    url: `/announcements/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除公告
 * @param {number|string} id - 公告ID
 * @returns {Promise<{message: string}>}
 */
export function deleteAnnouncement(id) {
  return request({
    url: `/announcements/${id}`,
    method: 'delete',
  })
}

/**
 * 标记公告为已读
 * @param {number|string} id - 公告ID
 * @returns {Promise<{message: string}>}
 */
export function markAnnouncementRead(id) {
  return request({
    url: `/announcements/${id}/read`,
    method: 'post',
  })
}
