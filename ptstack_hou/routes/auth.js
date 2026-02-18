import express from 'express'
import { 
  register, 
  login, 
  refreshToken,
  sendEmailVerification,
  verifyEmailCode,
  checkEmailVerified
} from '../controllers/authController.js'

const router = express.Router()

/**
 * @swagger
 * /auth/send-email-verification:
 *   post:
 *     summary: 发送邮箱验证邮件
 *     tags: [认证]
 *     description: 发送邮箱验证邮件，用于注册前验证邮箱
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *     responses:
 *       200:
 *         description: 验证邮件已发送
 *       400:
 *         description: 请求参数错误或邮箱已存在
 *       500:
 *         description: 服务器内部错误
 */
// 发送邮箱验证邮件
router.post('/send-email-verification', sendEmailVerification)

/**
 * @swagger
 * /auth/verify-email-code:
 *   post:
 *     summary: 验证邮箱验证码
 *     tags: [认证]
 *     description: 使用6位验证码验证邮箱
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *               code:
 *                 type: string
 *                 description: 6位验证码
 *     responses:
 *       200:
 *         description: 邮箱验证成功
 *       400:
 *         description: 验证码无效或已过期
 *       500:
 *         description: 服务器内部错误
 */
// 验证邮箱验证码
router.post('/verify-email-code', verifyEmailCode)

/**
 * @swagger
 * /auth/check-email-verified:
 *   post:
 *     summary: 检查邮箱是否已验证
 *     tags: [认证]
 *     description: 检查邮箱是否已通过验证
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *     responses:
 *       200:
 *         description: 邮箱验证状态
 *       400:
 *         description: 请求参数错误
 */
// 检查邮箱是否已验证
router.post('/check-email-verified', checkEmailVerified)

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     description: 创建新用户账号（需要先验证邮箱）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *               email:
 *                 type: string
 *                 description: 已验证的邮箱
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 请求参数错误或邮箱未验证
 *       500:
 *         description: 服务器内部错误
 */
// 注册路由
router.post('/register', register)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     description: 用户登录并获取认证令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名或邮箱
 *               password:
 *                 type: string
 *                 description: 密码
 *               remember:
 *                 type: boolean
 *                 description: 是否记住登录状态
 *     responses:
 *       200:
 *         description: 登录成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 用户名或密码错误
 *       500:
 *         description: 服务器内部错误
 */
// 登录路由
router.post('/login', login)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 刷新 Access Token
 *     tags: [认证]
 *     description: 使用 Refresh Token 获取新的 Access Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh Token
 *     responses:
 *       200:
 *         description: 刷新成功
 *       401:
 *         description: Refresh Token 无效或已过期
 *       500:
 *         description: 服务器内部错误
 */
// 刷新 Token 路由
router.post('/refresh', refreshToken)

export default router
