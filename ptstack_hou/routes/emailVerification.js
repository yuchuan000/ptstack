import { Router } from 'express';
import { execute } from '../config/db.js';
import { generateVerificationToken, sendVerificationEmail } from '../services/emailService.js';

const router = Router();

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: 验证邮箱
 *     tags: [认证]
 *     description: 使用验证令牌验证邮箱
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 邮箱验证令牌
 *     responses:
 *       200:
 *         description: 邮箱验证成功
 *       400:
 *         description: 验证令牌无效或已过期
 *       500:
 *         description: 服务器内部错误
 */
// 验证邮箱
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: '缺少验证令牌' });
    }

    // 查找用户
    const users = await execute(
      'SELECT id, username, email, verification_token_expires_at FROM users WHERE verification_token = ?',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: '无效的验证链接' });
    }

    const user = users[0];

    // 检查令牌是否过期（24小时）
    if (user.verification_token_expires_at && new Date(user.verification_token_expires_at) < new Date()) {
      return res.status(400).json({ message: '验证链接已过期，请重新发送验证邮件' });
    }

    // 更新用户状态为已验证
    await execute(
      'UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expires_at = NULL WHERE id = ?',
      [user.id]
    );

    res.status(200).json({ 
      message: '邮箱验证成功！', 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: true
      }
    });
  } catch (error) {
    console.error('邮箱验证失败:', error.message);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: 重新发送验证邮件
 *     tags: [认证]
 *     description: 重新发送邮箱验证邮件
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
 *         description: 验证邮件已重新发送
 *       400:
 *         description: 请求参数错误或邮箱已验证
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
// 重新发送验证邮件
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: '请提供邮箱地址' });
    }

    // 查找用户
    const users = await execute(
      'SELECT id, username, email, email_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = users[0];

    if (user.email_verified) {
      return res.status(400).json({ message: '邮箱已经验证过了' });
    }

    // 生成新的验证令牌
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 更新用户的验证令牌
    await execute(
      'UPDATE users SET verification_token = ?, verification_token_expires_at = ? WHERE id = ?',
      [verificationToken, expiresAt, user.id]
    );

    // 发送验证邮件
    try {
      await sendVerificationEmail(user.email, user.nickname || user.username, verificationToken);
    } catch (emailError) {
      console.error('发送验证邮件失败:', emailError.message);
      return res.status(500).json({ message: '发送验证邮件失败，请稍后重试' });
    }

    res.status(200).json({ message: '验证邮件已重新发送，请查收' });
  } catch (error) {
    console.error('重新发送验证邮件失败:', error.message);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
