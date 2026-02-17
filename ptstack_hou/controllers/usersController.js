// 用户控制器
export const getUsers = (req, res, next) => {
  res.send('respond with a resource')
}

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: 获取用户信息（需要token）
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - 用户
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
export const getProfile = (req, res, next) => {
  res.status(200).json({
    message: '获取用户信息成功',
    user: req.user
  })
}
