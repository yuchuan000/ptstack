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
    data
  })
}
