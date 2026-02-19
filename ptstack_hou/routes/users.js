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
  getUnreadCount
} from '../controllers/usersController.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/profile', authMiddleware, getProfile)
router.get('/recommended', optionalAuthMiddleware, getRecommendedUsers)
router.get('/feed', authMiddleware, getFeed)
router.get('/unread-count', authMiddleware, getUnreadCount)
router.get('/:userId', optionalAuthMiddleware, getUserPublicProfile)
router.put('/profile', authMiddleware, updateProfile)
router.get('/:userId/articles', optionalAuthMiddleware, getUserArticles)
router.get('/:userId/comments', optionalAuthMiddleware, getUserComments)

export default router
