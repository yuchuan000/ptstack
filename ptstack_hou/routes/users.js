import express from 'express'
import { 
  getUsers, 
  getProfile, 
  getUserPublicProfile, 
  updateProfile, 
  getUserArticles,
  getUserComments,
  getRecommendedUsers,
  getFeed,
  getUnreadCount,
  getAllUsersAdmin,
  getUserAdmin,
  updateUserAdmin,
  deleteUserAdmin
} from '../controllers/usersController.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/profile', authMiddleware, getProfile)
router.get('/recommended', optionalAuthMiddleware, getRecommendedUsers)
router.get('/feed', authMiddleware, getFeed)
router.get('/unread-count', authMiddleware, getUnreadCount)
router.get('/admin/all', authMiddleware, getAllUsersAdmin)
router.get('/admin/:id', authMiddleware, getUserAdmin)
router.put('/admin/:id', authMiddleware, updateUserAdmin)
router.delete('/admin/:id', authMiddleware, deleteUserAdmin)
router.get('/:userId', optionalAuthMiddleware, getUserPublicProfile)
router.put('/profile', authMiddleware, updateProfile)
router.get('/:userId/articles', optionalAuthMiddleware, getUserArticles)
router.get('/:userId/comments', optionalAuthMiddleware, getUserComments)

export default router
