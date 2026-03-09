/**
 * Markdown代码块处理工具
 * 用于编码和解码Markdown中的代码块，避免HTML转义问题
 */

/**
 * 代码块标记
 */
const CODE_BLOCK_MARKER = '::CODE_BLOCK::'

/**
 * 行内代码标记
 */
const INLINE_CODE_MARKER = '::INLINE_CODE::'

/**
 * HTML转义函数
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>'"]/g, (m) => map[m])
}

/**
 * HTML反转义函数
 * @param {string} text - 要反转义的文本
 * @returns {string} 反转义后的文本
 */
function unescapeHtml(text) {
  const map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  }
  return text.replace(/&(amp|lt|gt|quot|#039);/g, (m) => map[m])
}

/**
 * 编码Markdown中的代码块
 * @param {string} markdown - Markdown文本
 * @returns {string} 编码后的文本
 */
export function encodeMarkdownCodeBlocks(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return markdown
  }

  let encoded = markdown

  // 编码代码块
  encoded = encoded.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const escapedCode = escapeHtml(code)
    return `${CODE_BLOCK_MARKER}${lang}|${escapedCode}${CODE_BLOCK_MARKER}`
  })

  // 编码行内代码
  encoded = encoded.replace(/`([^`]+)`/g, (match, code) => {
    const escapedCode = escapeHtml(code)
    return `${INLINE_CODE_MARKER}${escapedCode}${INLINE_CODE_MARKER}`
  })

  // 转义剩余的HTML字符
  encoded = escapeHtml(encoded)

  return encoded
}

/**
 * 解码Markdown中的代码块
 * @param {string} encodedMarkdown - 编码后的Markdown文本
 * @returns {string} 解码后的Markdown文本
 */
export function decodeMarkdownCodeBlocks(encodedMarkdown) {
  if (!encodedMarkdown || typeof encodedMarkdown !== 'string') {
    return encodedMarkdown
  }

  let decoded = unescapeHtml(encodedMarkdown)

  // 解码代码块
  decoded = decoded.replace(
    new RegExp(`${CODE_BLOCK_MARKER}(w*)\\|([\\s\\S]*?)${CODE_BLOCK_MARKER}`, 'g'),
    (match, lang, code) => {
      const unescapedCode = unescapeHtml(code)
      return `\`\`\`${lang}\n${unescapedCode}\`\`\``
    },
  )

  // 解码行内代码
  decoded = decoded.replace(
    new RegExp(`${INLINE_CODE_MARKER}([\\s\\S]*?)${INLINE_CODE_MARKER}`, 'g'),
    (match, code) => {
      const unescapedCode = unescapeHtml(code)
      return `\`${unescapedCode}\``
    },
  )

  return decoded
}
