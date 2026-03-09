/**
 * 公告控制器
 * 处理公告的创建、获取、更新、删除和标记已读等功能
 */
import { execute } from '../config/db.js'
import { generateAnnouncementId } from '../utils/idGenerator.js'

/**
 * 获取用户可见的公告列表
 * @param {Object} req - Express请求对象
 * @param {Object} req.user - 用户信息，包含id
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回公告列表
 */
export const getAnnouncements = async (req, res) => {
  try {
    const userId = req.user.id

    const whereClause = `WHERE a.is_active = 1
      AND a.created_by != ?
      AND (JSON_CONTAINS(a.delivery_methods, '"notification"') OR JSON_CONTAINS(a.delivery_methods, '"message"'))
      AND (
        a.target_type = 'all' OR
        (a.target_type = 'specific' AND JSON_CONTAINS(a.target_user_ids, ?))
      )
      AND (
        a.start_time IS NULL OR a.start_time <= NOW()
      ) AND (
        a.end_time IS NULL OR a.end_time >= NOW()
      )`

    const announcements = await execute(
      `
      SELECT a.*, 
             u.nickname as creator_nickname,
             u.username as creator_username,
             u.avatar as creator_avatar,
             CASE WHEN ar.id IS NOT NULL THEN 1 ELSE 0 END as is_read
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = ?
      ${whereClause}
      ORDER BY a.priority DESC, a.created_at DESC
    `,
      [userId, userId, userId.toString()],
    )

    const processedAnnouncements = announcements.map((announcement) => {
      const processed = {
        ...announcement,
        id: announcement.public_id,
      }
      delete processed.public_id
      return processed
    })

    res.status(200).json({
      announcements: processedAnnouncements,
    })
  } catch (error) {
    console.error('获取公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * 获取首页顶部滚动公告
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回滚动公告列表
 */
export const getMarqueeAnnouncements = async (req, res) => {
  try {
    console.log('开始获取首页顶部通告...')

    const announcements = await execute(`
      SELECT id, public_id, title, content, summary, priority, is_active, is_marquee, start_time, end_time
      FROM announcements 
      WHERE is_active = 1 
        AND is_marquee = 1
      ORDER BY priority DESC, created_at DESC
    `)

    console.log('查询到的公告数量:', announcements.length)
    console.log('查询到的公告:', announcements)

    const processedAnnouncements = announcements.map((announcement) => {
      const processed = {
        ...announcement,
        id: announcement.public_id,
      }
      delete processed.public_id
      return processed
    })

    console.log('处理后的公告:', processedAnnouncements)

    res.status(200).json({
      announcements: processedAnnouncements,
    })
  } catch (error) {
    console.error('获取首页顶部通告失败:', error.message)
    console.error('错误详情:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * 创建公告
 * @param {Object} req - Express请求对象
 * @param {Object} req.user - 用户信息，包含id和level
 * @param {Object} req.body - 请求体，包含title, content, summary, priority, is_marquee, target_type, target_user_ids, delivery_methods, start_time, end_time
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回创建结果
 */
export const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      summary,
      priority = 0,
      is_marquee = 0,
      target_type = 'all',
      target_user_ids = [],
      delivery_methods = [],
      start_time,
      end_time,
    } = req.body
    const createdBy = req.user.id

    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' })
    }

    // 检查用户权限
    const userId = req.user.id
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      userId,
    ])
    const permissionSet = new Set(permissions.map((p) => p.permission))

    // 一级用户或有announcement_manage权限的用户可以操作公告
    const canManageAnnouncements = req.user.level === 1 || permissionSet.has('announcement_manage')

    if (!canManageAnnouncements) {
      return res.status(403).json({ message: '只有管理员可以创建公告' })
    }

    const publicId = generateAnnouncementId()

    const result = await execute(
      `INSERT INTO announcements (public_id, title, content, summary, priority, is_marquee, target_type, target_user_ids, delivery_methods, created_by, start_time, end_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        publicId,
        title,
        content,
        summary || '',
        priority,
        is_marquee,
        target_type,
        JSON.stringify(target_user_ids),
        JSON.stringify(delivery_methods),
        createdBy,
        start_time || null,
        end_time || null,
      ],
    )

    const announcementId = result.insertId

    console.log('创建公告成功，ID:', announcementId)
    console.log('发送方式:', delivery_methods)
    console.log('目标类型:', target_type)
    console.log('目标用户ID:', target_user_ids)

    // 由于邮件服务已移除，不再发送邮件通知
    if (Array.isArray(delivery_methods) && delivery_methods.includes('email')) {
      console.log('邮件服务已移除，无法发送邮件通知')
    }

    res.status(201).json({
      message: '公告创建成功',
      announcementId: publicId,
    })
  } catch (error) {
    console.error('创建公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * 更新公告
 * @param {Object} req - Express请求对象
 * @param {Object} req.user - 用户信息，包含is_admin
 * @param {Object} req.params - 路径参数，包含id
 * @param {Object} req.body - 请求体，包含需要更新的字段
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回更新结果
 */
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      content,
      summary,
      priority,
      is_marquee,
      is_active,
      target_type,
      target_user_ids,
      delivery_methods,
      start_time,
      end_time,
    } = req.body

    // 检查用户权限
    const userId = req.user.id
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      userId,
    ])
    const permissionSet = new Set(permissions.map((p) => p.permission))

    // 一级用户或有announcement_manage权限的用户可以操作公告
    const canManageAnnouncements = req.user.level === 1 || permissionSet.has('announcement_manage')

    if (!canManageAnnouncements) {
      return res.status(403).json({ message: '只有管理员可以更新公告' })
    }

    const updates = []
    const params = []

    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }
    if (content !== undefined) {
      updates.push('content = ?')
      params.push(content)
    }
    if (summary !== undefined) {
      updates.push('summary = ?')
      params.push(summary)
    }
    if (priority !== undefined) {
      updates.push('priority = ?')
      params.push(priority)
    }
    if (is_marquee !== undefined) {
      updates.push('is_marquee = ?')
      params.push(is_marquee)
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?')
      params.push(is_active)
    }
    if (target_type !== undefined) {
      updates.push('target_type = ?')
      params.push(target_type)
    }
    if (target_user_ids !== undefined) {
      updates.push('target_user_ids = ?')
      params.push(JSON.stringify(target_user_ids))
    }
    if (delivery_methods !== undefined) {
      updates.push('delivery_methods = ?')
      params.push(JSON.stringify(delivery_methods))
    }
    if (start_time !== undefined) {
      updates.push('start_time = ?')
      params.push(start_time || null)
    }
    if (end_time !== undefined) {
      updates.push('end_time = ?')
      params.push(end_time || null)
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: '没有需要更新的字段' })
    }

    params.push(id)

    await execute(`UPDATE announcements SET ${updates.join(', ')} WHERE public_id = ?`, params)

    res.status(200).json({ message: '公告更新成功' })
  } catch (error) {
    console.error('更新公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * 删除公告
 * @param {Object} req - Express请求对象
 * @param {Object} req.user - 用户信息，包含is_admin
 * @param {Object} req.params - 路径参数，包含id
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回删除结果
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params

    // 检查用户权限
    const userId = req.user.id
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      userId,
    ])
    const permissionSet = new Set(permissions.map((p) => p.permission))

    // 一级用户或有announcement_manage权限的用户可以操作公告
    const canManageAnnouncements = req.user.level === 1 || permissionSet.has('announcement_manage')

    if (!canManageAnnouncements) {
      return res.status(403).json({ message: '只有管理员可以删除公告' })
    }

    await execute('DELETE FROM announcements WHERE public_id = ?', [id])

    res.status(200).json({ message: '公告删除成功' })
  } catch (error) {
    console.error('删除公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * 标记公告为已读
 * @param {Object} req - Express请求对象
 * @param {Object} req.user - 用户信息，包含id
 * @param {Object} req.params - 路径参数，包含id
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回标记结果
 */
export const markAnnouncementRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const announcements = await execute('SELECT id FROM announcements WHERE public_id = ?', [id])
    if (announcements.length === 0) {
      return res.status(404).json({ message: '公告不存在' })
    }

    const internalId = announcements[0].id

    await execute(
      'INSERT IGNORE INTO announcement_reads (announcement_id, user_id) VALUES (?, ?)',
      [internalId, userId],
    )

    res.status(200).json({ message: '标记已读成功' })
  } catch (error) {
    console.error('标记公告已读失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * 获取未读弹窗公告
 * @param {Object} req - Express请求对象
 * @param {Object} req.user - 用户信息，包含id
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回未读弹窗公告列表
 */
export const getUnreadPopupAnnouncements = async (req, res) => {
  try {
    const userId = req.user.id

    const announcements = await execute(
      `
      SELECT a.*
      FROM announcements a
      LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = ?
      WHERE a.is_active = 1
        AND a.created_by != ?
        AND JSON_CONTAINS(a.delivery_methods, '"popup"')
        AND ar.id IS NULL
        AND (a.target_type = 'all' OR (a.target_type = 'specific' AND JSON_CONTAINS(a.target_user_ids, ?)))
        AND (a.start_time IS NULL OR a.start_time <= NOW())
        AND (a.end_time IS NULL OR a.end_time >= NOW())
      ORDER BY a.priority DESC, a.created_at DESC
      LIMIT 5
    `,
      [userId, userId, userId.toString()],
    )

    const processedAnnouncements = announcements.map((announcement) => {
      const processed = {
        ...announcement,
        id: announcement.public_id,
      }
      delete processed.public_id
      return processed
    })

    res.status(200).json({
      announcements: processedAnnouncements,
    })
  } catch (error) {
    console.error('获取未读弹窗公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * 管理员获取所有公告
 * @param {Object} req - Express请求对象
 * @param {Object} req.user - 用户信息，包含is_admin
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回所有公告列表
 */
export const getAllAnnouncementsAdmin = async (req, res) => {
  try {
    // 检查用户权限
    const userId = req.user.id
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      userId,
    ])
    const permissionSet = new Set(permissions.map((p) => p.permission))

    // 一级用户或有announcement_manage权限的用户可以操作公告
    const canManageAnnouncements = req.user.level === 1 || permissionSet.has('announcement_manage')

    if (!canManageAnnouncements) {
      return res.status(403).json({ message: '只有管理员可以查看所有公告' })
    }

    const announcements = await execute(`
      SELECT a.*, u.nickname as creator_nickname, u.username as creator_username
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `)

    const processedAnnouncements = announcements.map((announcement) => {
      const processed = {
        ...announcement,
        id: announcement.public_id,
      }
      delete processed.public_id
      return processed
    })

    res.status(200).json({
      announcements: processedAnnouncements,
    })
  } catch (error) {
    console.error('获取所有公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * 获取公告详情
 * @param {Object} req - Express请求对象
 * @param {Object} req.user - 用户信息，包含id
 * @param {Object} req.params - 路径参数，包含id
 * @param {Object} res - Express响应对象
 * @returns {Promise<void>} - 返回公告详情
 */
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const announcement = await execute(
      `
      SELECT a.*, 
             u.nickname as creator_nickname,
             u.username as creator_username,
             u.avatar as creator_avatar,
             CASE WHEN ar.id IS NOT NULL THEN 1 ELSE 0 END as is_read
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = ?
      WHERE a.public_id = ?
    `,
      [userId, id],
    )

    if (announcement.length === 0) {
      return res.status(404).json({ message: '公告不存在' })
    }

    const processedAnnouncement = {
      ...announcement[0],
      id: announcement[0].public_id,
    }
    delete processedAnnouncement.public_id

    res.status(200).json({
      announcement: processedAnnouncement,
    })
  } catch (error) {
    console.error('获取公告详情失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}
