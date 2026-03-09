/**
 * 文件上传相关路由
 * 处理头像、团队成员头像和作品集图片的上传
 */
import express from 'express'
import {
  upload,
  uploadAttachment,
  uploadAvatar,
  uploadTeamMemberAvatar,
  uploadPortfolioImage,
  uploadArticleAttachment,
  uploadCoverImage,
} from '../controllers/uploadController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = express.Router()

/**
 * POST /upload/avatar
 * 上传用户头像
 * @requires authMiddleware 身份验证
 */
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar)

/**
 * POST /upload/about/team-avatar
 * 上传团队成员头像
 * @requires authMiddleware 身份验证
 */
router.post('/about/team-avatar', authMiddleware, upload.single('avatar'), uploadTeamMemberAvatar)

/**
 * POST /upload/about/portfolio-image
 * 上传作品集项目图片
 * @requires authMiddleware 身份验证
 */
router.post('/about/portfolio-image', authMiddleware, upload.single('image'), uploadPortfolioImage)

/**
 * POST /upload/article/attachment
 * 上传文章附件
 * @requires authMiddleware 身份验证
 */
router.post(
  '/article/attachment',
  authMiddleware,
  uploadAttachment.single('attachment'),
  uploadArticleAttachment,
)

/**
 * POST /upload/cover
 * 上传封面图片
 * @requires authMiddleware 身份验证
 */
router.post('/cover', authMiddleware, upload.single('image'), uploadCoverImage)

export default router
