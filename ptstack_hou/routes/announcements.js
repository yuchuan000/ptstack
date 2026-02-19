import express from 'express'
import { 
  getAnnouncements, 
  getMarqueeAnnouncements,
  createAnnouncement, 
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementRead,
  getUnreadPopupAnnouncements,
  getAllAnnouncementsAdmin
} from '../controllers/announcementsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authMiddleware, getAnnouncements)
router.get('/marquee', getMarqueeAnnouncements)
router.get('/unread-popup', authMiddleware, getUnreadPopupAnnouncements)
router.get('/admin/all', authMiddleware, getAllAnnouncementsAdmin)
router.post('/', authMiddleware, createAnnouncement)
router.put('/:id', authMiddleware, updateAnnouncement)
router.delete('/:id', authMiddleware, deleteAnnouncement)
router.post('/:id/read', authMiddleware, markAnnouncementRead)

export default router
