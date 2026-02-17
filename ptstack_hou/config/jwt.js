import jwt from 'jsonwebtoken'

// JWT密钥 - 生产环境必须更换为强密钥
const JWT_SECRET = process.env.JWT_SECRET || 'ptstack-secret-key-change-in-production'

// Token 有效期配置（从环境变量读取，未设置则使用默认值）
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' // 默认15分钟
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' // 默认7天

/**
 * 生成 Access Token（短期，用于 API 认证）
 * @param {object} payload - 要存储在token中的数据
 * @returns {string} 生成的 Access Token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN })
}

/**
 * 生成 Refresh Token（长期，用于刷新 Access Token）
 * @param {object} payload - 要存储在token中的数据
 * @returns {string} 生成的 Refresh Token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN })
}

/**
 * 验证 JWT Token
 * @param {string} token - 要验证的 JWT token
 * @returns {object} 解码后的 payload 数据
 * @throws {Error} 如果 token 无效或过期会抛出错误
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}

export { JWT_SECRET, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN }
