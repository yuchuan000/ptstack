/**
 * 评论点赞相关路由
 * 处理评论的点赞/取消点赞和检查点赞状态
 */
import express from 'express'
import { toggleCommentLike, checkCommentLikes } from '../controllers/commentLikesController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = express.Router()

/**
 * POST /comment-likes/:commentId/toggle
 * 切换评论点赞状态
 * @requires authMiddleware 身份验证
 */
router.post('/:commentId/toggle', authMiddleware, toggleCommentLike)

/**
 * GET /comment-likes/article/:articleId/check
 * 检查文章评论的点赞状态
 * @optional authMiddleware 可选身份验证
 */
router.get(
  '/article/:articleId/check',
  (req, res, next) => {
    if (req.headers.authorization) {
      return authMiddleware(req, res, next)
    }
    req.user = null
    next()
  },
  checkCommentLikes,
)

export default router
