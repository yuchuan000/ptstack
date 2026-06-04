import express from 'express'
const router = express.Router()

import * as authController from './auth.controller'

router.post('/login', authController.loginController)

export default router
