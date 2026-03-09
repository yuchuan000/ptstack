/**
 * 认证中间件
 * 处理用户认证相关的中间件函数
 */
import { verifyToken } from '../config/jwt.js'

/**
 * 认证中间件
 * 验证请求中的JWT令牌，确保用户已登录
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @param {function} next - Express下一个中间件函数
 * @returns {void}
 */
export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未提供认证令牌' })
    }

    const token = authHeader.slice(7)
    const decoded = verifyToken(token)

    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '令牌已过期，请重新登录' })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的令牌' })
    }
    return res.status(401).json({ message: '认证失败' })
  }
}

/**
 * 认证中间件（别名）
 */
export const authMiddleware = auth

/**
 * 认证中间件（别名）
 */
export const authenticateToken = auth

/**
 * 可选认证中间件
 * 尝试验证请求中的JWT令牌，但不强制要求登录
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @param {function} next - Express下一个中间件函数
 * @returns {void}
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      try {
        const decoded = verifyToken(token)
        req.user = decoded
      } catch (e) {
        req.user = null
      }
    } else {
      req.user = null
    }

    next()
  } catch (error) {
    req.user = null
    next()
  }
}
