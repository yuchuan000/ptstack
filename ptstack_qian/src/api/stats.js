import request from '@/utils/request'

/**
 * 获取首页统计数据
 * @returns {Promise}
 */
export const getHomeStats = () => {
  return request({
    url: '/stats/home',
    method: 'GET',
  })
}

/**
 * 获取用户统计数据
 * @returns {Promise}
 */
export const getUserStats = () => {
  return request({
    url: '/stats/users',
    method: 'GET',
  })
}

/**
 * 获取文章统计数据
 * @returns {Promise}
 */
export const getArticleStats = () => {
  return request({
    url: '/stats/articles',
    method: 'GET',
  })
}

/**
 * 获取评论统计数据
 * @returns {Promise}
 */
export const getCommentStats = () => {
  return request({
    url: '/stats/comments',
    method: 'GET',
  })
}

/**
 * 获取在线用户统计数据
 * @returns {Promise}
 */
export const getOnlineStats = () => {
  return request({
    url: '/stats/online',
    method: 'GET',
  })
}
