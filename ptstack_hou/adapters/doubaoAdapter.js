import axios from 'axios'
import BaseAdapter from './baseAdapter.js'

/**
 * 豆包适配器
 */
class DoubaoAdapter extends BaseAdapter {
  /**
   * 生成摘要
   * @param {string} prompt - 提示词
   * @param {object} options - 选项
   * @returns {Promise<string>} 生成的摘要
   */
  async generateSummary(prompt, options = {}) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.modelId,
          messages: [
            {
              role: 'system',
              content:
                '你是一个专业的文章摘要生成助手，能够准确提取文章的核心内容，生成简洁明了的摘要。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 300,
          ...this.providerConfig,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: options.timeout || 30000,
        },
      )

      return response.data.choices[0].message.content.trim()
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 生成图片
   * @param {string} prompt - 提示词
   * @param {object} options - 选项
   * @returns {Promise<string>} 生成的图片URL
   */
  async generateImage(prompt, options = {}) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.modelId,
          prompt: prompt,
          size: options.size || '1024x1024',
          ...this.providerConfig,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: options.timeout || 60000,
        },
      )

      return response.data.data[0].url
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

export default DoubaoAdapter
