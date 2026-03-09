// AI相关API服务
import request from '@/utils/request'

/**
 * 生成文章摘要
 * @param {object} data - 请求数据
 * @param {string} data.content - 文章内容
 * @returns {Promise<{summary: string}>}
 */
export const generateSummary = (data) => {
  return request({
    url: '/ai/generate-summary',
    method: 'post',
    data,
  })
}

/**
 * 生成文章封面
 * @param {object} data - 请求数据
 * @param {string} data.title - 文章标题
 * @param {string} data.content - 文章内容
 * @param {string} data.size - 图片尺寸，默认2048x2048
 * @returns {Promise<{imageUrl: string}>}
 */
export const generateCover = (data) => {
  return request({
    url: '/ai/generate-cover',
    method: 'post',
    data,
  })
}
