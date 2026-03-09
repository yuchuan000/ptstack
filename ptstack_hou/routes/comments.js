/**
 * 评论管理路由
 * 处理文章评论的获取、创建和删除
 */
import express from 'express'
import { getComments, createComment, deleteComment } from '../controllers/commentsController.js'
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.js'

const router = express.Router()

/**
 * GET /comments/:articleId
 * 获取文章评论列表
 * @requires optionalAuthMiddleware 可选身份验证
 */
router.get('/:articleId', optionalAuthMiddleware, getComments)

/**
 * POST /comments/:articleId
 * 为文章创建新评论
 * @requires authMiddleware 身份验证
 */
router.post('/:articleId', authMiddleware, createComment)

/**
 * DELETE /comments/:id
 * 删除指定评论
 * @requires authMiddleware 身份验证
 */
router.delete('/:id', authMiddleware, deleteComment)

export default router
