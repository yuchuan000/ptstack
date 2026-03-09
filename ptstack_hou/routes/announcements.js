/**
 * 公告管理路由
 * 处理公告的CRUD操作、标记已读和获取不同类型公告
 */
import express from 'express'
import {
  getAnnouncements,
  getMarqueeAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementRead,
  getUnreadPopupAnnouncements,
  getAllAnnouncementsAdmin,
} from '../controllers/announcementsController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = express.Router()

/**
 * GET /announcements
 * 获取公告列表
 * @requires authMiddleware 身份验证
 */
router.get('/', authMiddleware, getAnnouncements)

/**
 * GET /announcements/marquee
 * 获取跑马灯公告
 */
router.get('/marquee', getMarqueeAnnouncements)

/**
 * GET /announcements/unread-popup
 * 获取未读弹窗公告
 * @requires authMiddleware 身份验证
 */
router.get('/unread-popup', authMiddleware, getUnreadPopupAnnouncements)

/**
 * GET /announcements/admin/all
 * 获取所有公告（管理员）
 * @requires authMiddleware 身份验证
 */
router.get('/admin/all', authMiddleware, getAllAnnouncementsAdmin)

/**
 * GET /announcements/:id
 * 获取指定公告详情
 * @requires authMiddleware 身份验证
 */
router.get('/:id', authMiddleware, getAnnouncementById)

/**
 * POST /announcements
 * 创建新公告
 * @requires authMiddleware 身份验证
 */
router.post('/', authMiddleware, createAnnouncement)

/**
 * PUT /announcements/:id
 * 更新指定公告
 * @requires authMiddleware 身份验证
 */
router.put('/:id', authMiddleware, updateAnnouncement)

/**
 * DELETE /announcements/:id
 * 删除指定公告
 * @requires authMiddleware 身份验证
 */
router.delete('/:id', authMiddleware, deleteAnnouncement)

/**
 * POST /announcements/:id/read
 * 标记公告为已读
 * @requires authMiddleware 身份验证
 */
router.post('/:id/read', authMiddleware, markAnnouncementRead)

export default router
