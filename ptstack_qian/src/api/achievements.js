import request from '@/utils/request'

export function getAchievements() {
  return request({
    url: '/achievements',
    method: 'get'
  })
}

export function getAchievementById(id) {
  return request({
    url: `/achievements/${id}`,
    method: 'get'
  })
}

export function getMyAchievements() {
  return request({
    url: '/achievements/my',
    method: 'get'
  })
}

export function createAchievement(data) {
  return request({
    url: '/achievements',
    method: 'post',
    data
  })
}

export function updateAchievement(id, data) {
  return request({
    url: `/achievements/${id}`,
    method: 'put',
    data
  })
}

export function deleteAchievement(id) {
  return request({
    url: `/achievements/${id}`,
    method: 'delete'
  })
}

export function grantAchievement(data) {
  return request({
    url: '/achievements/grant',
    method: 'post',
    data
  })
}

export function getAchievementUsers(id) {
  return request({
    url: `/achievements/${id}/users`,
    method: 'get'
  })
}

export function removeAchievementFromUser(data) {
  return request({
    url: '/achievements/remove',
    method: 'post',
    data
  })
}
