import { verifyToken } from '../config/jwt.js'

/**
 * JWT认证中间件
 * 用于验证请求头中的token是否有效
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @param {function} next - Express下一步中间件函数
 */
export const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取Authorization字段
    // 格式：Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    const authHeader = req.headers.authorization

    // 检查是否有Authorization头且格式正确（以"Bearer "开头）
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未提供认证令牌' })
    }

    // 提取token（去掉前面的"Bearer "，共7个字符）
    const token = authHeader.slice(7)
    // 验证token的签名和有效期
    const decoded = verifyToken(token)

    // 将解码后的用户信息存储到req.user中，供后续控制器使用
    req.user = decoded
    // 验证通过，继续执行下一个中间件或路由处理函数
    next()
  } catch (error) {
    // 根据不同的错误类型返回不同的提示
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '令牌已过期，请重新登录' })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的令牌' })
    }
    return res.status(401).json({ message: '认证失败' })
  }
}
