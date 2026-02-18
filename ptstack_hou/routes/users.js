import express from 'express'
import { 
  getUsers, 
  getProfile, 
  getUserPublicProfile, 
  updateProfile, 
  updatePrivacySettings,
  getUserArticles,
  getUserComments
} from '../controllers/usersController.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/profile', authMiddleware, getProfile)
router.get('/:userId', optionalAuthMiddleware, getUserPublicProfile)
router.put('/profile', authMiddleware, updateProfile)
router.put('/privacy', authMiddleware, updatePrivacySettings)
router.get('/:userId/articles', optionalAuthMiddleware, getUserArticles)
router.get('/:userId/comments', optionalAuthMiddleware, getUserComments)

export default router
