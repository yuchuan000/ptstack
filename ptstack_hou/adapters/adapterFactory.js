/**
 * 适配器工厂
 * 根据厂商类型创建对应的适配器实例
 */
import OpenAIAdapter from './openaiAdapter.js'
import DoubaoAdapter from './doubaoAdapter.js'

class AdapterFactory {
  /**
   * 创建适配器实例
   * @param {object} config - 配置对象
   * @returns {BaseAdapter} 适配器实例
   */
  static createAdapter(config) {
    const { provider, apiKey, apiUrl, modelId, config: providerConfig } = config

    if (!provider) {
      throw new Error('厂商不能为空')
    }

    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIAdapter({ apiKey, apiUrl, modelId, config: providerConfig })
      case 'doubao':
        return new DoubaoAdapter({ apiKey, apiUrl, modelId, config: providerConfig })
      default:
        throw new Error(`不支持的厂商: ${provider}`)
    }
  }

  /**
   * 获取支持的厂商列表
   * @returns {Array} 支持的厂商列表
   */
  static getSupportedProviders() {
    return [
      { value: 'openai', label: 'OpenAI' },
      { value: 'doubao', label: '豆包' },
    ]
  }
}

export default AdapterFactory
