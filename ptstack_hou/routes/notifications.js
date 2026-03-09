/**
 * 通知管理路由
 * 处理用户通知的获取、标记已读和删除
 */
import express from 'express'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationsController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = express.Router()

/**
 * GET /notifications
 * 获取用户通知列表
 * @requires authMiddleware 身份验证
 */
router.get('/', authMiddleware, getNotifications)

/**
 * GET /notifications/unread-count
 * 获取未读通知数量
 * @requires authMiddleware 身份验证
 */
router.get('/unread-count', authMiddleware, getUnreadCount)

/**
 * PUT /notifications/:id/read
 * 标记指定通知为已读
 * @requires authMiddleware 身份验证
 */
router.put('/:id/read', authMiddleware, markAsRead)

/**
 * PUT /notifications/read-all
 * 标记所有通知为已读
 * @requires authMiddleware 身份验证
 */
router.put('/read-all', authMiddleware, markAllAsRead)

/**
 * DELETE /notifications/:id
 * 删除指定通知
 * @requires authMiddleware 身份验证
 */
router.delete('/:id', authMiddleware, deleteNotification)

export default router
