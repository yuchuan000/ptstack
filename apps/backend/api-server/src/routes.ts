import express from 'express'
import adminAuthRouter from './admin/auth/auth.route'

const router = express.Router()

router.use('/admin', adminAuthRouter)

export default router
