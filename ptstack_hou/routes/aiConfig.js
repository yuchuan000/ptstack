/**
 * AI 配置管理路由
 * 处理AI提供者的配置、状态管理和初始化
 */
import express from 'express'
import {
  getAiProviders,
  getEnabledAiProviders,
  createAiProvider,
  updateAiProvider,
  deleteAiProvider,
  toggleAiProviderStatus,
  initDefaultAiProviders,
} from '../controllers/aiConfigController.js'
import { auth } from '../middlewares/auth.js'

const router = express.Router()

/**
 * GET /ai-config
 * 获取所有AI提供者配置
 * @requires auth 身份验证
 */
router.get('/', auth, getAiProviders)

/**
 * GET /ai-config/enabled
 * 获取已启用的AI提供者
 * @requires auth 身份验证
 */
router.get('/enabled', auth, getEnabledAiProviders)

/**
 * GET /ai-config/init
 * 初始化默认AI提供者
 * @requires auth 身份验证
 */
router.get('/init', auth, initDefaultAiProviders)

/**
 * POST /ai-config
 * 创建新的AI提供者配置
 * @requires auth 身份验证
 */
router.post('/', auth, createAiProvider)

/**
 * PUT /ai-config/:id
 * 更新指定AI提供者配置
 * @requires auth 身份验证
 */
router.put('/:id', auth, updateAiProvider)

/**
 * DELETE /ai-config/:id
 * 删除指定AI提供者配置
 * @requires auth 身份验证
 */
router.delete('/:id', auth, deleteAiProvider)

/**
 * PATCH /ai-config/:id/status
 * 切换AI提供者启用状态
 * @requires auth 身份验证
 */
router.patch('/:id/status', auth, toggleAiProviderStatus)

export default router
