import request from '@/utils/request'

export function getAnnouncements() {
  return request({
    url: '/announcements',
    method: 'get'
  })
}

export function getAnnouncementById(id) {
  return request({
    url: `/announcements/${id}`,
    method: 'get'
  })
}

export function getMarqueeAnnouncements() {
  return request({
    url: '/announcements/marquee',
    method: 'get'
  })
}

export function getUnreadPopupAnnouncements() {
  return request({
    url: '/announcements/unread-popup',
    method: 'get'
  })
}

export function getAllAnnouncementsAdmin() {
  return request({
    url: '/announcements/admin/all',
    method: 'get'
  })
}

export function createAnnouncement(data) {
  return request({
    url: '/announcements',
    method: 'post',
    data
  })
}

export function updateAnnouncement(id, data) {
  return request({
    url: `/announcements/${id}`,
    method: 'put',
    data
  })
}

export function deleteAnnouncement(id) {
  return request({
    url: `/announcements/${id}`,
    method: 'delete'
  })
}

export function markAnnouncementRead(id) {
  return request({
    url: `/announcements/${id}/read`,
    method: 'post'
  })
}
