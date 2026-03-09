/**
 * 文章点赞相关路由
 * 处理文章的点赞/取消点赞和检查点赞状态
 */
import express from 'express'
import { toggleLike, checkLike } from '../controllers/likesController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = express.Router()

/**
 * POST /likes/:articleId/toggle
 * 切换文章点赞状态
 * @requires authMiddleware 身份验证
 */
router.post('/:articleId/toggle', authMiddleware, toggleLike)

/**
 * GET /likes/:articleId/check
 * 检查文章点赞状态
 * @optional authMiddleware 可选身份验证
 */
router.get(
  '/:articleId/check',
  (req, res, next) => {
    if (req.headers.authorization) {
      return authMiddleware(req, res, next)
    }
    req.user = null
    next()
  },
  checkLike,
)

export default router
