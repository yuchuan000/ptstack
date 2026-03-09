/**
 * URL处理工具
 * 用于构建完整的API URL
 */

/**
 * API基础URL
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * 获取完整的URL
 * @param {string} url - 相对或绝对URL
 * @returns {string|null} 完整的URL或null
 */
export function getFullUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/')) {
    return BASE_URL + url
  }
  return BASE_URL + '/' + url
}
