import express from 'express'
const router = express.Router()

import * as authController from './auth.controller'

router.post('/login', authController.login)

export default router
