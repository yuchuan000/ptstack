import { verifyToken } from '../config/jwt.js'

export const authMiddleware = (req, res, next) => {
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
