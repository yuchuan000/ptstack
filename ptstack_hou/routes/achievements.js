import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { 
  getAchievements, 
  getAchievementById,
  getMyAchievements, 
  createAchievement, 
  updateAchievement, 
  deleteAchievement,
  grantAchievement,
  getAchievementUsers,
  removeAchievementFromUser,
  batchGrantAchievements,
  batchRemoveAchievements
} from '../controllers/achievementsController.js'

const router = express.Router()

router.get('/', authMiddleware, getAchievements)
router.get('/my', authMiddleware, getMyAchievements)
router.get('/:id', authMiddleware, getAchievementById)
router.post('/', authMiddleware, createAchievement)

router.post('/grant', (req, res, next) => {
  console.log('🟢 匹配到 /grant 路由')
  next()
}, authMiddleware, grantAchievement)

router.post('/batch-grant', authMiddleware, batchGrantAchievements)
router.post('/batch-remove', authMiddleware, batchRemoveAchievements)

router.post('/remove', authMiddleware, removeAchievementFromUser)
router.get('/:id/users', authMiddleware, getAchievementUsers)

router.put('/:id', (req, res, next) => {
  console.log('🟡 匹配到 /:id 路由, id:', req.params.id)
  next()
}, authMiddleware, updateAchievement)

router.delete('/:id', authMiddleware, deleteAchievement)

export default router
