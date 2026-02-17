/**
 * @swagger
 * tags:
 *   name: 认证
 *   description: 用户登录注册相关接口
 */

// 认证控制器
import { execute } from '../config/db.js'
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken, verifyToken } from '../config/jwt.js'

// 密码加密盐值
const SALT_ROUNDS = 10

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     description: 创建新用户账号
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: 请求参数错误或用户名/邮箱已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 注册处理函数
export const register = async (req, res, next) => {
  try {
    const { username, password, email } = req.body
    
    // 验证请求数据
    if (!username || !password || !email) {
      return res.status(400).json({ message: '缺少必要参数' })
    }
    
    // 检查用户是否已存在（用户名或邮箱不能重复）
    const existingUsers = await execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名或邮箱已存在' })
    }
    
    // 使用bcrypt加密密码
    // SALT_ROUNDS=10 表示进行10轮哈希计算，越安全但越慢
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    
    // 将加密后的密码存入数据库（永远不要存明文密码！）
    const result = await execute(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    )
    
    res.status(201).json({ 
      message: '注册成功', 
      user: { 
        id: result.insertId, 
        username, 
        email 
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
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 用户名或密码错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
    // WHERE username = ? OR email = ? 表示可以用用户名或邮箱任意一个登录
    const users = await execute(
      'SELECT id, username, password, email FROM users WHERE username = ? OR email = ?',
      [username, username]
    )
    
    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }
    
    const user = users[0]
    
    // 使用bcrypt验证密码
    // bcrypt.compare(明文密码, 加密后的密码) 会自动处理盐值
    // 注意：不能用简单的字符串比较，因为每次加密的盐值都不同！
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }
    
    // 生成 payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email
    }
    
    // 生成 Access Token（总是返回）
    const accessToken = generateAccessToken(payload)
    
    // 准备响应数据
    const response = {
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: 新的 Access Token
 *       401:
 *         description: Refresh Token 无效或已过期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
