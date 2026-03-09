/**
 * AI 相关功能路由
 * 处理AI生成摘要和封面图等功能
 */
import express from 'express'
import { generateSummary, generateCover } from '../controllers/aiController.js'
import { auth } from '../middlewares/auth.js'

const router = express.Router()

/**
 * POST /ai/generate-summary
 * 生成文章摘要
 * @requires auth 身份验证
 */
router.post('/generate-summary', auth, generateSummary)

/**
 * POST /ai/generate-cover
 * 生成文章封面图
 * @requires auth 身份验证
 */
router.post('/generate-cover', auth, generateCover)

export default router
