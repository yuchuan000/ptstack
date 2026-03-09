/**
 * AI控制器
 * 处理AI相关功能，包括生成文章摘要和封面图片
 */
import { execute } from '../config/db.js'
import AdapterFactory from '../adapters/adapterFactory.js'

/**
 * 获取指定用途的AI配置列表（按优先级排序）
 * @param {string} purpose - 用途：summary 或 cover
 * @returns {Promise<Array>} AI配置列表
 */
async function getAiProvidersByPurpose(purpose) {
  try {
    const aiType = purpose === 'summary' ? 'chat' : 'image'

    const rows = await execute(
      'SELECT * FROM ai_providers WHERE ai_type = ? AND purpose = ? AND is_enabled = 1 ORDER BY priority ASC, id ASC',
      [aiType, purpose],
    )

    if (rows.length === 0) {
      return []
    }

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      provider: row.provider,
      apiKey: row.api_key,
      apiUrl: row.api_url,
      modelId: row.model_id,
      aiType: row.ai_type,
      purpose: row.purpose,
      config: row.config,
    }))
  } catch (error) {
    console.error(`获取AI配置失败:`, error)
    return []
  }
}

/**
 * 调用AI服务（带自动切换）
 * @param {Array} providers - AI配置列表
 * @param {Function} callFn - 调用函数
 * @returns {Promise<any>} 调用结果
 */
async function callAiWithFallback(providers, callFn) {
  if (!providers || providers.length === 0) {
    throw new Error('没有可用的AI配置')
  }

  const errors = []

  for (const provider of providers) {
    try {
      const result = await callFn(provider)
      return result
    } catch (error) {
      console.error(`AI调用失败 [${provider.name}]:`, error.message)
      errors.push({ provider: provider.name, error: error.message })

      // 如果是token不足或配额限制，继续尝试下一个
      if (error.response?.status === 429 || error.response?.status === 403) {
        continue
      }

      // 其他错误也继续尝试
      continue
    }
  }

  // 所有配置都失败了
  throw new Error(
    `所有AI配置都调用失败: ${errors.map((e) => `${e.provider}: ${e.error}`).join('; ')}`,
  )
}

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI相关接口
 */

/**
 * @swagger
 * /ai/generate-summary:
 *   post:
 *     summary: 生成文章摘要
 *     tags: [AI]
 *     description: 使用AI生成文章摘要
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 文章标题
 *               content:
 *                 type: string
 *                 description: 文章内容
 *     responses:
 *       200:
 *         description: 生成成功
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器内部错误
 */
/**
 * 生成文章摘要
 * @param {Object} req - Express请求对象
 * @param {Object} req.body - 请求体，包含title和content
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回生成的摘要
 */
export const generateSummary = async (req, res) => {
  try {
    const { title, content } = req.body

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: '请提供文章内容' })
    }

    // 获取用于生成摘要的AI配置列表
    const providers = await getAiProvidersByPurpose('summary')

    if (providers.length === 0) {
      return res.status(400).json({ message: 'AI配置未完成，请先配置AI服务' })
    }

    const prompt = `请为以下文章生成一个简洁的摘要，控制在100-200字之间：

标题：${title || '无标题'}

内容：
${content.substring(0, 3000)}`

    const result = await callAiWithFallback(providers, async (provider) => {
      const adapter = AdapterFactory.createAdapter(provider)
      return await adapter.generateSummary(prompt, {
        temperature: 0.7,
        maxTokens: 300,
        timeout: 30000,
      })
    })

    res.status(200).json({ summary: result })
  } catch (error) {
    console.error('生成摘要失败:', error.message)
    res.status(500).json({ message: `生成摘要失败: ${error.message}` })
  }
}

/**
 * @swagger
 * /ai/generate-cover:
 *   post:
 *     summary: 生成文章封面
 *     tags: [AI]
 *     description: 使用AI生成文章封面图片
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 文章标题
 *               content:
 *                 type: string
 *                 description: 文章内容
 *               size:
 *                 type: string
 *                 description: 图片尺寸，默认2048x2048
 *                 example: "2048x2048"
 *     responses:
 *       200:
 *         description: 生成成功
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器内部错误
 */
/**
 * 生成文章封面
 * @param {Object} req - Express请求对象
 * @param {Object} req.body - 请求体，包含title, content和可选的size
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回生成的封面图片URL
 */
export const generateCover = async (req, res) => {
  try {
    const { title, content, size = '2048x2048' } = req.body

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: '请提供文章标题' })
    }

    // 获取用于生成封面的AI配置列表
    const providers = await getAiProvidersByPurpose('cover')

    if (providers.length === 0) {
      return res.status(400).json({ message: 'AI配置未完成，请先配置AI服务' })
    }

    const prompt = `为文章生成一张专业的封面图片。文章标题：${title}。${content ? `文章内容概要：${content.substring(0, 500)}` : ''}。要求：图片风格现代简约，适合作为技术文章封面，色彩和谐，构图美观。`

    const result = await callAiWithFallback(providers, async (provider) => {
      const adapter = AdapterFactory.createAdapter(provider)
      return await adapter.generateImage(prompt, {
        size: size,
        timeout: 60000,
      })
    })

    res.status(200).json({ imageUrl: result })
  } catch (error) {
    console.error('生成封面失败:', error.message)
    res.status(500).json({ message: `生成封面失败: ${error.message}` })
  }
}
