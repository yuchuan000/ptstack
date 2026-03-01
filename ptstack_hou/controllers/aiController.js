import axios from 'axios'

const DOUBAO_API_URL =
  process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY
const DOUBAO_MODEL = process.env.DOUBAO_MODEL || 'doubao-seed-1-6-lite-251015'

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
 *     description: 使用豆包AI生成文章摘要
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
export const generateSummary = async (req, res) => {
  try {
    const { title, content } = req.body

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: '请提供文章内容' })
    }

    const prompt = `请为以下文章生成一个简洁的摘要，控制在100-200字之间：

标题：${title || '无标题'}

内容：
${content.substring(0, 3000)}`

    const response = await axios.post(
      DOUBAO_API_URL,
      {
        model: DOUBAO_MODEL,
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
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DOUBAO_API_KEY}`,
        },
      },
    )

    const summary = response.data.choices[0].message.content.trim()

    res.status(200).json({ summary })
  } catch (error) {
    console.error('生成摘要失败:', error.message)
    if (error.response) {
      console.error('豆包API错误:', error.response.data)
    }
    res.status(500).json({ message: '生成摘要失败，请稍后重试' })
  }
}
