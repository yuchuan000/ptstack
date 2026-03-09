/**
 * AI配置相关API服务
 */
import request from '@/utils/request'

/**
 * 获取AI提供商列表
 * @returns {Promise<{providers: Array}>}
 */
export const getAiProviders = () => {
  return request({
    url: '/ai-config',
    method: 'get',
  })
}

/**
 * 获取启用的AI提供商
 * @param {object} params - 查询参数
 * @returns {Promise<{providers: Array}>}
 */
export const getEnabledAiProviders = (params) => {
  return request({
    url: '/ai-config/enabled',
    method: 'get',
    params,
  })
}

/**
 * 初始化默认AI提供商
 * @returns {Promise<{message: string}>}
 */
export const initDefaultAiProviders = () => {
  return request({
    url: '/ai-config/init',
    method: 'get',
  })
}

/**
 * 创建AI提供商
 * @param {object} data - AI提供商数据
 * @returns {Promise<{message: string, id: number}>}
 */
export const createAiProvider = (data) => {
  return request({
    url: '/ai-config',
    method: 'post',
    data,
  })
}

/**
 * 更新AI提供商
 * @param {number|string} id - 提供商ID
 * @param {object} data - AI提供商数据
 * @returns {Promise<{message: string}>}
 */
export const updateAiProvider = (id, data) => {
  return request({
    url: `/ai-config/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除AI提供商
 * @param {number|string} id - 提供商ID
 * @returns {Promise<{message: string}>}
 */
export const deleteAiProvider = (id) => {
  return request({
    url: `/ai-config/${id}`,
    method: 'delete',
  })
}

/**
 * 切换AI提供商状态
 * @param {number|string} id - 提供商ID
 * @param {boolean} isEnabled - 是否启用
 * @returns {Promise<{message: string, isEnabled: boolean}>}
 */
export const toggleAiProviderStatus = (id, isEnabled) => {
  return request({
    url: `/ai-config/${id}/status`,
    method: 'patch',
    data: { isEnabled },
  })
}
