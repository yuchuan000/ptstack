/**
 * @swagger
 * tags:
 *   name: 认证
 *   description: 用户登录注册相关接口
 */

// 认证控制器
import { execute } from '../config/db.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { generateAccessToken, generateRefreshToken, verifyToken } from '../config/jwt.js'
import { generateVerificationCode, sendVerificationEmail } from '../services/emailService.js'

dotenv.config()

// 密码加密盐值
const SALT_ROUNDS = 10
// 邮箱验证码有效期（分钟）
const EMAIL_VERIFICATION_CODE_EXPIRES_IN = parseInt(process.env.EMAIL_VERIFICATION_CODE_EXPIRES_IN) || 15

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
export const sendEmailVerification = async (req, res, next) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ message: '请提供邮箱地址' })
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '请输入有效的邮箱地址' })
    }
    
    // 检查该邮箱是否已被注册
    const existingUsers = await execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '该邮箱已被注册' })
    }
    
    // 检查是否在冷却时间内（60秒）
    const recentRecords = await execute(
      'SELECT id, created_at FROM email_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    )
    
    if (recentRecords.length > 0) {
      const lastSentAt = new Date(recentRecords[0].created_at)
      const now = new Date()
      const timeDiff = (now - lastSentAt) / 1000 // 转换为秒
      
      if (timeDiff < 60) {
        const remainingTime = Math.ceil(60 - timeDiff)
        return res.status(400).json({ 
          message: `发送太频繁，请等待 ${remainingTime} 秒后再试`,
          remainingTime: remainingTime
        })
      }
      
      // 超过冷却时间，删除旧记录
      await execute(
        'DELETE FROM email_verifications WHERE id = ?',
        [recentRecords[0].id]
      )
    }
    
    // 生成6位验证码
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_CODE_EXPIRES_IN * 60 * 1000)
    
    // 保存到临时验证表
    await execute(
      'INSERT INTO email_verifications (email, verification_code, verification_code_expires_at) VALUES (?, ?, ?)',
      [email, verificationCode, expiresAt]
    )
    
    // 发送验证邮件
    try {
      await sendVerificationEmail(email, '用户', verificationCode)
    } catch (emailError) {
      console.error('发送验证邮件失败:', emailError.message)
      // 邮件发送失败，删除临时记录
      await execute(
        'DELETE FROM email_verifications WHERE email = ? AND verification_code = ?',
        [email, verificationCode]
      )
      return res.status(500).json({ message: '发送验证邮件失败，请稍后重试' })
    }
    
    res.status(200).json({ 
      message: '验证邮件已发送，请查收',
      email: email
    })
  } catch (error) {
    console.error('发送验证邮件失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

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
export const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ message: '缺少邮箱或验证码' })
    }

    // 查找临时验证记录
    const verifications = await execute(
      'SELECT * FROM email_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    )

    if (verifications.length === 0) {
      return res.status(400).json({ message: '请先发送验证码' })
    }

    const verification = verifications[0]

    // 检查验证码是否过期
    if (new Date(verification.verification_code_expires_at) < new Date()) {
      // 删除过期记录
      await execute(
        'DELETE FROM email_verifications WHERE id = ?',
        [verification.id]
      )
      return res.status(400).json({ message: '验证码已过期，请重新发送' })
    }

    // 检查验证码是否正确（不区分大小写）
    if (verification.verification_code.toUpperCase() !== code.toUpperCase()) {
      return res.status(400).json({ message: '验证码错误' })
    }

    // 生成验证令牌
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // 更新为已验证状态并保存验证令牌
    await execute(
      'UPDATE email_verifications SET email_verified = 1, verification_token = ? WHERE id = ?',
      [verificationToken, verification.id]
    )

    res.status(200).json({ 
      message: '邮箱验证成功！', 
      email: verification.email,
      verificationToken: verificationToken
    })
  } catch (error) {
    console.error('邮箱验证失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

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
export const checkEmailVerified = async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ message: '请提供邮箱地址' })
    }
    
    // 查找验证记录
    const verifications = await execute(
      'SELECT email_verified FROM email_verifications WHERE email = ? AND verification_code_expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email]
    )
    
    if (verifications.length === 0) {
      return res.status(200).json({ verified: false })
    }
    
    res.status(200).json({ 
      verified: verifications[0].email_verified === 1 
    })
  } catch (error) {
    console.error('检查邮箱验证状态失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

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
 *               - verificationToken
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
 *               verificationToken:
 *                 type: string
 *                 description: 邮箱验证令牌
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 请求参数错误或邮箱未验证
 *       500:
 *         description: 服务器内部错误
 */
// 注册处理函数
export const register = async (req, res, next) => {
  try {
    const { username, password, email, verificationToken } = req.body
    
    // 验证请求数据
    if (!username || !password || !email || !verificationToken) {
      return res.status(400).json({ message: '缺少必要参数' })
    }
    
    // 验证username格式：只能是英文、数字、下划线，3-20个字符
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        message: '用户名只能包含英文、数字和下划线，长度3-20个字符' 
      })
    }
    
    // 检查邮箱是否已验证，并且验证令牌匹配
    const verifications = await execute(
      'SELECT id, email_verified, verification_token FROM email_verifications WHERE email = ? AND verification_code_expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email]
    )
    
    if (verifications.length === 0 || verifications[0].email_verified !== 1) {
      return res.status(400).json({ message: '请先验证邮箱' })
    }
    
    // 验证令牌是否匹配
    if (verifications[0].verification_token !== verificationToken) {
      return res.status(400).json({ message: '验证令牌无效，请重新验证邮箱' })
    }
    
    // 检查用户名是否已存在
    const existingUsers = await execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名或邮箱已存在' })
    }
    
    // 使用bcrypt加密密码
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    
    // 创建用户（nickname和avatar留空，profile_completed设为0）
    const result = await execute(
      'INSERT INTO users (username, password, email, profile_completed) VALUES (?, ?, ?, 0)',
      [username, hashedPassword, email]
    )
    
    // 删除临时验证记录
    await execute(
      'DELETE FROM email_verifications WHERE email = ?',
      [email]
    )
    
    res.status(201).json({ 
      message: '注册成功！', 
      user: { 
        id: result.insertId, 
        username,
        email,
        profileCompleted: false
      } 
    })
  } catch (error) {
    console.error('注册失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

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
// 登录处理函数
export const login = async (req, res, next) => {
  try {
    const { username, password, remember = false } = req.body
    
    // 验证请求数据
    if (!username || !password) {
      return res.status(400).json({ message: '缺少用户名或密码' })
    }
    
    // 查找用户（支持用户名或邮箱登录）
    const users = await execute(
      'SELECT id, username, nickname, password, email, avatar, profile_completed, is_admin FROM users WHERE username = ? OR email = ?',
      [username, username]
    )
    
    if (users.length === 0) {
      return res.status(401).json({ message: '账号或密码错误' })
    }
    
    const user = users[0]
    
    // 使用bcrypt验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: '账号或密码错误' })
    }
    
    // 生成 payload
    const payload = {
      id: user.id,
      username: user.username,
      nickname: user.nickname || user.username,
      email: user.email,
      is_admin: user.is_admin
    }
    
    // 生成 Access Token
    const accessToken = generateAccessToken(payload)
    
    // 准备响应数据
    const response = {
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        profileCompleted: user.profile_completed === 1,
        isAdmin: user.is_admin === 1
      },
      accessToken
    }
    
    // 如果勾选了"记住我"，则返回 Refresh Token
    if (remember) {
      response.refreshToken = generateRefreshToken(payload)
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('登录失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

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
// 刷新 Token 处理函数
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return res.status(400).json({ message: '缺少 refreshToken' })
    }
    
    // 验证 Refresh Token
    const decoded = verifyToken(refreshToken)
    
    // 生成新的 Access Token
    const newAccessToken = generateAccessToken({
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    })
    
    res.status(200).json({
      accessToken: newAccessToken
    })
  } catch (error) {
    console.error('刷新 Token 失败:', error.message)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '登录已过期，请重新登录' })
    }
    res.status(401).json({ message: '无效的 refreshToken' })
  }
}
