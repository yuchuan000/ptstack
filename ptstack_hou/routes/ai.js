import express from 'express'
import { generateSummary } from '../controllers/aiController.js'
import { auth } from '../middlewares/auth.js'

const router = express.Router()

router.post('/generate-summary', auth, generateSummary)

export default router
