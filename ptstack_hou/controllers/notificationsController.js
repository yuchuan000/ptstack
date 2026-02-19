import { execute } from '../config/db.js'

/**
 * @swagger
 * tags:
 *   name: 消息通知
 *   description: 消息通知相关接口
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: 获取消息列表
 *     tags: [消息通知]
 *     description: 获取当前用户的消息列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 只显示未读消息
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器内部错误
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 20
    const unreadOnly = req.query.unreadOnly === 'true'
    const type = req.query.type
    const offset = (page - 1) * pageSize

    let whereClause = 'WHERE user_id = ?'
    const params = [userId]

    if (unreadOnly) {
      whereClause += ' AND is_read = 0'
    }

    if (type) {
      whereClause += ' AND type = ?'
      params.push(type)
    }

    const notifications = await execute(`
      SELECT * FROM notifications 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, pageSize, offset])

    const countResult = await execute(`
      SELECT COUNT(*) as total FROM notifications ${whereClause}
    `, params)

    const unreadCountResult = await execute(`
      SELECT COUNT(*) as unreadCount FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `, [userId])

    const typeUnreadCounts = {}
    const typeCounts = await execute(`
      SELECT type, COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0 
      GROUP BY type
    `, [userId])
    
    typeCounts.forEach(item => {
      typeUnreadCounts[item.type] = item.count
    })

    res.status(200).json({
      notifications,
      pagination: {
        page,
        pageSize,
        total: countResult[0]?.total || 0,
        totalPages: Math.ceil((countResult[0]?.total || 0) / pageSize)
      },
      unreadCount: unreadCountResult[0]?.unreadCount || 0,
      typeUnreadCounts
    })
  } catch (error) {
    console.error('获取消息列表失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: 获取未读消息数量
 *     tags: [消息通知]
 *     description: 获取当前用户的未读消息数量
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器内部错误
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await execute(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `, [userId])

    res.status(200).json({
      count: result[0]?.count || 0
    })
  } catch (error) {
    console.error('获取未读消息数量失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: 标记消息已读
 *     tags: [消息通知]
 *     description: 标记单条消息为已读
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 消息ID
 *     responses:
 *       200:
 *         description: 标记成功
 *       401:
 *         description: 未登录
 *       404:
 *         description: 消息不存在
 *       500:
 *         description: 服务器内部错误
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id
    const notificationId = parseInt(req.params.id)

    const notifications = await execute(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    )

    if (notifications.length === 0) {
      return res.status(404).json({ message: '消息不存在' })
    }

    await execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [notificationId]
    )

    res.status(200).json({ message: '标记已读成功' })
  } catch (error) {
    console.error('标记已读失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: 标记所有消息已读
 *     tags: [消息通知]
 *     description: 标记所有消息为已读
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 标记成功
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器内部错误
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    await execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    )

    await execute(
      'UPDATE users SET last_read_notifications = NOW() WHERE id = ?',
      [userId]
    )

    res.status(200).json({ message: '全部标记已读成功' })
  } catch (error) {
    console.error('全部标记已读失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: 删除消息
 *     tags: [消息通知]
 *     description: 删除单条消息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 消息ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未登录
 *       404:
 *         description: 消息不存在
 *       500:
 *         description: 服务器内部错误
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id
    const notificationId = parseInt(req.params.id)

    const notifications = await execute(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    )

    if (notifications.length === 0) {
      return res.status(404).json({ message: '消息不存在' })
    }

    await execute(
      'DELETE FROM notifications WHERE id = ?',
      [notificationId]
    )

    res.status(200).json({ message: '删除成功' })
  } catch (error) {
    console.error('删除消息失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}
