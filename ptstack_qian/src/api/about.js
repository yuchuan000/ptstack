// 关于我们页面配置相关API服务
import request from '@/utils/request'

/**
 * 获取团队成员列表
 * @returns {Promise<{members: Array}>}
 */
export function getTeamMembers() {
  return request({
    url: '/about/team',
    method: 'get',
  })
}

/**
 * 创建团队成员
 * @param {object} data - 团队成员数据
 * @param {string} data.name - 姓名
 * @param {string} data.role - 职位
 * @param {string} data.avatar - 头像URL
 * @param {string} data.bio - 个人简介
 * @param {Array<string>} data.skills - 技能列表
 * @param {Array} data.portfolio - 作品集列表
 * @returns {Promise<{message: string, id: number}>}
 */
export function createTeamMember(data) {
  return request({
    url: '/about/team',
    method: 'post',
    data,
  })
}

/**
 * 更新团队成员
 * @param {number|string} id - 成员ID
 * @param {object} data - 团队成员数据
 * @returns {Promise<{message: string}>}
 */
export function updateTeamMember(id, data) {
  return request({
    url: `/about/team/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除团队成员
 * @param {number|string} id - 成员ID
 * @returns {Promise<{message: string}>}
 */
export function deleteTeamMember(id) {
  return request({
    url: `/about/team/${id}`,
    method: 'delete',
  })
}

/**
 * 获取联系信息列表
 * @returns {Promise<{items: Array}>}
 */
export function getContactItems() {
  return request({
    url: '/about/contact',
    method: 'get',
  })
}

/**
 * 创建联系信息
 * @param {object} data - 联系信息数据
 * @param {string} data.icon - 图标名称
 * @param {string} data.name - 名称
 * @param {string} data.info - 联系信息
 * @param {string} data.link - 跳转链接（可选）
 * @returns {Promise<{message: string, id: number}>}
 */
export function createContactItem(data) {
  return request({
    url: '/about/contact',
    method: 'post',
    data,
  })
}

/**
 * 更新联系信息
 * @param {number|string} id - 联系信息ID
 * @param {object} data - 联系信息数据
 * @returns {Promise<{message: string}>}
 */
export function updateContactItem(id, data) {
  return request({
    url: `/about/contact/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除联系信息
 * @param {number|string} id - 联系信息ID
 * @returns {Promise<{message: string}>}
 */
export function deleteContactItem(id) {
  return request({
    url: `/about/contact/${id}`,
    method: 'delete',
  })
}

/**
 * 更新联系信息排序
 * @param {Array<number>} ids - 排序后的ID列表
 * @returns {Promise<{message: string}>}
 */
export function updateContactOrder(ids) {
  return request({
    url: '/about/contact/order',
    method: 'put',
    data: { ids },
  })
}

/**
 * 切换联系信息显示/隐藏状态
 * @param {number|string} id - 联系信息ID
 * @param {boolean} is_hidden - 是否隐藏
 * @returns {Promise<{message: string, is_hidden: boolean}>}
 */
export function toggleContactVisibility(id, is_hidden) {
  return request({
    url: `/about/contact/${id}/hide`,
    method: 'put',
    data: { is_hidden },
  })
}

/**
 * 上传团队成员头像
 * @param {File} file - 头像文件
 * @returns {Promise<{message: string, url: string, filename: string}>}
 */
export function uploadTeamMemberAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  return request({
    url: '/upload/about/team-avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 上传作品集项目图片
 * @param {File} file - 图片文件
 * @returns {Promise<{message: string, url: string, filename: string}>}
 */
export function uploadPortfolioImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  return request({
    url: '/upload/about/portfolio-image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 获取底部信息列表
 * @returns {Promise<{items: Array}>}
 */
export function getFooterItems() {
  return request({
    url: '/about/footer',
    method: 'get',
  })
}

/**
 * 创建底部信息
 * @param {object} data - 底部信息数据
 * @param {string} data.display - 显示内容
 * @param {string} data.link - 跳转链接
 * @param {number} data.rowId - 行数ID
 * @param {boolean} data.showOnPc - 是否在PC端显示
 * @param {boolean} data.showOnMobile - 是否在移动端显示
 * @returns {Promise<{message: string, id: number}>}
 */
export function createFooterItem(data) {
  return request({
    url: '/about/footer',
    method: 'post',
    data,
  })
}

/**
 * 更新底部信息
 * @param {number|string} id - 底部信息ID
 * @param {object} data - 底部信息数据
 * @returns {Promise<{message: string}>}
 */
export function updateFooterItem(id, data) {
  return request({
    url: `/about/footer/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除底部信息
 * @param {number|string} id - 底部信息ID
 * @returns {Promise<{message: string}>}
 */
export function deleteFooterItem(id) {
  return request({
    url: `/about/footer/${id}`,
    method: 'delete',
  })
}
