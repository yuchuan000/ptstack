import express from 'express'
import { getUsers, getProfile } from '../controllers/usersController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

/* GET users listing. */
router.get('/', getUsers)

/* GET user profile - 需要token验证 */
router.get('/profile', authMiddleware, getProfile)

export default router
