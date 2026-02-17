import express from 'express'
import { register, login, refreshToken } from '../controllers/authController.js'

const router = express.Router()

// 注册路由
router.post('/register', register)

// 登录路由
router.post('/login', login)

// 刷新 Token 路由
router.post('/refresh', refreshToken)

export default router
