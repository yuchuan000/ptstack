import express from 'express'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authMiddleware, getNotifications)
router.get('/unread-count', authMiddleware, getUnreadCount)
router.put('/:id/read', authMiddleware, markAsRead)
router.put('/read-all', authMiddleware, markAllAsRead)
router.delete('/:id', authMiddleware, deleteNotification)

export default router
