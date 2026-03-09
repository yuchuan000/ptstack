/**
 * ID生成工具
 * 用于生成各种类型的ID
 */
import { customAlphabet } from 'nanoid'

/**
 * 字符集定义
 */
const ALPHABETS = {
  letter: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', // 字母
  digit: '0123456789', // 数字
  symbol: '_-', // 符号
  alphanumeric: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', // 字母数字
  all: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-', // 所有字符
}

/**
 * 根据模式生成ID
 * @param {string} pattern - ID模式，如 'user_{digit}{12}'
 * @returns {string} 生成的ID
 */
function generateIdByPattern(pattern) {
  const regex = /\{([a-z]+)\}\{(\d+)\}/g
  let result = pattern
  let match

  while ((match = regex.exec(pattern)) !== null) {
    const type = match[1] // 字符类型
    const length = parseInt(match[2]) // 长度
    const placeholder = match[0] // 占位符
    const alphabet = ALPHABETS[type] || ALPHABETS.alphanumeric // 获取字符集
    const generator = customAlphabet(alphabet, length) // 创建生成器
    result = result.replace(placeholder, generator()) // 替换占位符
  }

  return result
}

/**
 * 生成用户ID
 * @returns {string} 用户ID
 */
export function generateUserId() {
  const pattern = process.env.USER_ID_PATTERN || 'user_{digit}{12}'
  return generateIdByPattern(pattern)
}

/**
 * 生成文章ID
 * @returns {string} 文章ID
 */
export function generateArticleId() {
  const pattern = process.env.ARTICLE_ID_PATTERN || 'article_{digit}{12}'
  return generateIdByPattern(pattern)
}

/**
 * 生成公告ID
 * @returns {string} 公告ID
 */
export function generateAnnouncementId() {
  const pattern = process.env.ANNOUNCEMENT_ID_PATTERN || 'announce_{digit}{12}'
  return generateIdByPattern(pattern)
}
