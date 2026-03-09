/**
 * 基础AI适配器类
 * 所有厂商适配器都应该继承此类
 */
class BaseAdapter {
  constructor(config) {
    this.config = config
    this.apiKey = config.apiKey
    this.apiUrl = config.apiUrl
    this.modelId = config.modelId
    this.providerConfig = config.config || {}
  }

  /**
   * 生成摘要
   * @param {string} prompt - 提示词
   * @param {object} options - 选项
   * @returns {Promise<string>} 生成的摘要
   */
  async generateSummary(prompt, options = {}) {
    throw new Error('子类必须实现generateSummary方法')
  }

  /**
   * 生成图片
   * @param {string} prompt - 提示词
   * @param {object} options - 选项
   * @returns {Promise<string>} 生成的图片URL
   */
  async generateImage(prompt, options = {}) {
    throw new Error('子类必须实现generateImage方法')
  }

  /**
   * 处理API错误
   * @param {Error} error - 错误对象
   * @returns {Error} 处理后的错误
   */
  handleError(error) {
    if (error.response) {
      // 服务器返回错误状态码
      const status = error.response.status
      const data = error.response.data

      if (status === 401) {
        return new Error('API密钥无效或已过期')
      } else if (status === 403) {
        return new Error('没有权限访问此API')
      } else if (status === 429) {
        return new Error('API调用频率过高，请稍后再试')
      } else if (status === 500) {
        return new Error('服务器内部错误')
      } else {
        return new Error(`API错误: ${data.error?.message || `状态码 ${status}`}`)
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      return new Error('无法连接到AI服务，请检查网络连接')
    } else {
      // 请求配置错误
      return new Error(`请求错误: ${error.message}`)
    }
  }
}

export default BaseAdapter
