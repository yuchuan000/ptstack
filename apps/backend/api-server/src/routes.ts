import express from 'express'
import adminAuthRouter from './admin/auth/auth.route'
import adminCategoryRouter from './admin/category/category.route'

const router = express.Router()

router.use('/admin', adminAuthRouter)
router.use('/admin', adminCategoryRouter)

export default router
