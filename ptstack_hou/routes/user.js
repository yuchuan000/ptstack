import { execute } from '../config/db.js'
import { authenticateToken } from '../middleware/auth.js'
import express from 'express'

const router = express.Router()

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: 完善用户资料
 *     tags: [用户]
 *     description: 更新用户昵称和头像，完成资料完善
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 用户昵称
 *               avatar:
 *                 type: string
 *                 description: 用户头像URL（可选）
 *     responses:
 *       200:
 *         description: 资料更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器内部错误
 */
// 完善用户资料
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nickname, avatar } = req.body
    const userId = req.user.id

    if (!nickname) {
      return res.status(400).json({ message: '请输入昵称' })
    }

    // 验证昵称长度
    if (nickname.length < 1 || nickname.length > 50) {
      return res.status(400).json({ message: '昵称长度应在1-50个字符之间' })
    }

    // 更新用户资料
    const updateData = { nickname, profile_completed: 1 }
    if (avatar) {
      updateData.avatar = avatar
    }

    await execute(
      'UPDATE users SET nickname = ?, profile_completed = 1' + (avatar ? ', avatar = ?' : '') + ' WHERE id = ?',
      avatar ? [nickname, avatar, userId] : [nickname, userId]
    )

    // 获取更新后的用户信息
    const users = await execute(
      'SELECT id, username, nickname, email, avatar, profile_completed FROM users WHERE id = ?',
      [userId]
    )

    res.status(200).json({
      message: '资料更新成功',
      user: {
        id: users[0].id,
        username: users[0].username,
        nickname: users[0].nickname,
        email: users[0].email,
        avatar: users[0].avatar,
        profileCompleted: users[0].profile_completed === 1
      }
    })
  } catch (error) {
    console.error('更新用户资料失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [用户]
 *     description: 获取当前登录用户的详细信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户信息
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器内部错误
 */
// 获取当前用户信息
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const users = await execute(
      'SELECT id, username, nickname, email, avatar, profile_completed, created_at FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }

    res.status(200).json({
      user: {
        id: users[0].id,
        username: users[0].username,
        nickname: users[0].nickname,
        email: users[0].email,
        avatar: users[0].avatar,
        profileCompleted: users[0].profile_completed === 1,
        createdAt: users[0].created_at
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

export default router
