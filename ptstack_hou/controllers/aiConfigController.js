/**
 * AI配置控制器
 * 处理AI服务提供商的配置管理，包括获取、创建、更新、删除和状态管理
 */
import { execute } from '../config/db.js'

/**
 * 获取所有AI配置
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回所有AI配置列表
 */
export async function getAiProviders(req, res) {
  try {
    const rows = await execute(
      'SELECT * FROM ai_providers ORDER BY ai_type ASC, purpose ASC, priority ASC, id ASC',
    )

    const providers = rows.map((row) => ({
      id: row.id,
      name: row.name,
      provider: row.provider,
      apiKey: row.api_key,
      apiUrl: row.api_url,
      modelId: row.model_id,
      aiType: row.ai_type,
      purpose: row.purpose,
      isEnabled: row.is_enabled === 1,
      priority: row.priority,
      config: row.config,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    res.json({ providers })
  } catch (error) {
    console.error('获取AI配置失败:', error)
    res.status(500).json({ error: '获取AI配置失败' })
  }
}

/**
 * 获取启用的AI配置（按类型和用途）
 * @param {Object} req - Express请求对象，包含查询参数aiType和purpose
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回符合条件的启用AI配置列表
 */
export async function getEnabledAiProviders(req, res) {
  const { aiType, purpose } = req.query

  try {
    let sql = 'SELECT * FROM ai_providers WHERE is_enabled = 1'
    const params = []

    if (aiType) {
      sql += ' AND ai_type = ?'
      params.push(aiType)
    }

    if (purpose) {
      sql += ' AND purpose = ?'
      params.push(purpose)
    }

    sql += ' ORDER BY priority ASC, id ASC'

    const rows = await execute(sql, params)

    const providers = rows.map((row) => ({
      id: row.id,
      name: row.name,
      provider: row.provider,
      apiKey: row.api_key,
      apiUrl: row.api_url,
      modelId: row.model_id,
      aiType: row.ai_type,
      purpose: row.purpose,
      isEnabled: row.is_enabled === 1,
      priority: row.priority,
      config: row.config,
      description: row.description,
    }))

    res.json({ providers })
  } catch (error) {
    console.error('获取AI配置失败:', error)
    res.status(500).json({ error: '获取AI配置失败' })
  }
}

/**
 * 创建AI配置
 * @param {Object} req - Express请求对象，包含请求体
 * @param {Object} req.body - 请求体，包含name, provider, apiKey, apiUrl, modelId, aiType, purpose, isEnabled, priority, config, description
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回创建结果
 */
export async function createAiProvider(req, res) {
  const {
    name,
    provider,
    apiKey,
    apiUrl,
    modelId,
    aiType,
    purpose,
    isEnabled,
    priority,
    config,
    description,
  } = req.body

  if (!name || !provider || !apiKey || !apiUrl || !modelId || !aiType || !purpose) {
    return res
      .status(400)
      .json({ error: '名称、厂商、API密钥、API地址、模型ID、AI类型和用途不能为空' })
  }

  // 验证AI类型和用途的匹配关系
  if (aiType === 'chat' && purpose !== 'summary') {
    return res.status(400).json({ error: '语言模型(chat)只能用于生成总结(summary)' })
  }
  if (aiType === 'image' && purpose !== 'cover') {
    return res.status(400).json({ error: '图片模型(image)只能用于生成封面(cover)' })
  }

  try {
    const result = await execute(
      'INSERT INTO ai_providers (name, provider, api_key, api_url, model_id, ai_type, purpose, is_enabled, priority, config, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        provider,
        apiKey,
        apiUrl,
        modelId,
        aiType,
        purpose,
        isEnabled ? 1 : 0,
        priority || 0,
        config,
        description,
      ],
    )

    res.json({ message: '创建AI配置成功', id: result.insertId })
  } catch (error) {
    console.error('创建AI配置失败:', error)
    res.status(500).json({ error: '创建AI配置失败' })
  }
}

/**
 * 更新AI配置
 * @param {Object} req - Express请求对象，包含参数和请求体
 * @param {Object} req.params - 路径参数，包含id
 * @param {Object} req.body - 请求体，包含name, provider, apiKey, apiUrl, modelId, aiType, purpose, isEnabled, priority, config, description
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回更新结果
 */
export async function updateAiProvider(req, res) {
  const { id } = req.params
  const {
    name,
    provider,
    apiKey,
    apiUrl,
    modelId,
    aiType,
    purpose,
    isEnabled,
    priority,
    config,
    description,
  } = req.body

  if (!name || !provider || !apiKey || !apiUrl || !modelId || !aiType || !purpose) {
    return res
      .status(400)
      .json({ error: '名称、厂商、API密钥、API地址、模型ID、AI类型和用途不能为空' })
  }

  // 验证AI类型和用途的匹配关系
  if (aiType === 'chat' && purpose !== 'summary') {
    return res.status(400).json({ error: '语言模型(chat)只能用于生成总结(summary)' })
  }
  if (aiType === 'image' && purpose !== 'cover') {
    return res.status(400).json({ error: '图片模型(image)只能用于生成封面(cover)' })
  }

  try {
    const result = await execute(
      'UPDATE ai_providers SET name = ?, provider = ?, api_key = ?, api_url = ?, model_id = ?, ai_type = ?, purpose = ?, is_enabled = ?, priority = ?, config = ?, description = ? WHERE id = ?',
      [
        name,
        provider,
        apiKey,
        apiUrl,
        modelId,
        aiType,
        purpose,
        isEnabled ? 1 : 0,
        priority || 0,
        config,
        description,
        id,
      ],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'AI配置不存在' })
    }

    res.json({ message: '更新AI配置成功' })
  } catch (error) {
    console.error('更新AI配置失败:', error)
    res.status(500).json({ error: '更新AI配置失败' })
  }
}

/**
 * 删除AI配置
 * @param {Object} req - Express请求对象，包含参数
 * @param {Object} req.params - 路径参数，包含id
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回删除结果
 */
export async function deleteAiProvider(req, res) {
  const { id } = req.params

  try {
    const result = await execute('DELETE FROM ai_providers WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'AI配置不存在' })
    }

    res.json({ message: '删除AI配置成功' })
  } catch (error) {
    console.error('删除AI配置失败:', error)
    res.status(500).json({ error: '删除AI配置失败' })
  }
}

/**
 * 切换AI配置启用状态
 * @param {Object} req - Express请求对象，包含参数和请求体
 * @param {Object} req.params - 路径参数，包含id
 * @param {Object} req.body - 请求体，包含isEnabled
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回状态切换结果
 */
export async function toggleAiProviderStatus(req, res) {
  const { id } = req.params
  const { isEnabled } = req.body

  try {
    const result = await execute('UPDATE ai_providers SET is_enabled = ? WHERE id = ?', [
      isEnabled ? 1 : 0,
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'AI配置不存在' })
    }

    res.json({ message: isEnabled ? '启用成功' : '禁用成功', isEnabled })
  } catch (error) {
    console.error('切换AI配置状态失败:', error)
    res.status(500).json({ error: '切换AI配置状态失败' })
  }
}

/**
 * 初始化默认AI配置
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回初始化结果
 */
export async function initDefaultAiProviders(req, res) {
  const defaultProviders = [
    {
      name: '豆包-总结-1',
      provider: 'doubao',
      apiKey: '',
      apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      modelId: 'doubao-seed-1-6-lite-251015',
      aiType: 'chat',
      purpose: 'summary',
      isEnabled: true,
      priority: 0,
      config: null,
      description: '豆包语言模型，用于生成文章摘要',
    },
    {
      name: '豆包-封面-1',
      provider: 'doubao',
      apiKey: '',
      apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
      modelId: 'doubao-seedream-4-5-251128',
      aiType: 'image',
      purpose: 'cover',
      isEnabled: true,
      priority: 0,
      config: null,
      description: '豆包图片模型，用于生成文章封面',
    },
  ]

  try {
    for (const provider of defaultProviders) {
      const [existing] = await execute(
        'SELECT id FROM ai_providers WHERE name = ? AND ai_type = ? AND purpose = ?',
        [provider.name, provider.aiType, provider.purpose],
      )

      if (!existing) {
        await execute(
          'INSERT INTO ai_providers (name, provider, api_key, api_url, model_id, ai_type, purpose, is_enabled, priority, config, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            provider.name,
            provider.provider,
            provider.apiKey,
            provider.apiUrl,
            provider.modelId,
            provider.aiType,
            provider.purpose,
            provider.isEnabled ? 1 : 0,
            provider.priority,
            provider.config,
            provider.description,
          ],
        )
      }
    }

    res.json({ message: '初始化默认AI配置成功' })
  } catch (error) {
    console.error('初始化默认AI配置失败:', error)
    res.status(500).json({ error: '初始化默认AI配置失败' })
  }
}
