import { execute } from '../config/db.js'
import { sendAnnouncementEmail } from '../services/emailService.js'
import { generateAnnouncementId } from '../utils/idGenerator.js'

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
    
    const announcements = await execute(`
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
    `, [userId, userId, userId.toString()])
    
    const processedAnnouncements = announcements.map(announcement => {
      const processed = {
        ...announcement,
        id: announcement.public_id
      };
      delete processed.public_id;
      return processed;
    });
    
    res.status(200).json({
      announcements: processedAnnouncements
    })
  } catch (error) {
    console.error('获取公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getMarqueeAnnouncements = async (req, res) => {
  try {
    const announcements = await execute(`
      SELECT id, public_id, title, content, priority
      FROM announcements 
      WHERE is_active = 1 
        AND is_marquee = 1
        AND (start_time IS NULL OR start_time <= NOW())
        AND (end_time IS NULL OR end_time >= NOW())
      ORDER BY priority DESC, created_at DESC
    `)
    
    const processedAnnouncements = announcements.map(announcement => {
      const processed = {
        ...announcement,
        id: announcement.public_id
      };
      delete processed.public_id;
      return processed;
    });
    
    res.status(200).json({
      announcements: processedAnnouncements
    })
  } catch (error) {
    console.error('获取跑马灯公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority = 0, is_marquee = 0, target_type = 'all', target_user_ids = [], delivery_methods = [], start_time, end_time } = req.body
    const createdBy = req.user.id
    
    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' })
    }
    
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以创建公告' })
    }
    
    const publicId = generateAnnouncementId()
    
    const result = await execute(
      `INSERT INTO announcements (public_id, title, content, priority, is_marquee, target_type, target_user_ids, delivery_methods, created_by, start_time, end_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        publicId,
        title, 
        content, 
        priority, 
        is_marquee, 
        target_type, 
        JSON.stringify(target_user_ids), 
        JSON.stringify(delivery_methods),
        createdBy,
        start_time || null,
        end_time || null
      ]
    )
    
    const announcementId = result.insertId
    
    console.log('创建公告成功，ID:', announcementId)
    console.log('发送方式:', delivery_methods)
    console.log('目标类型:', target_type)
    console.log('目标用户ID:', target_user_ids)
    
    if (Array.isArray(delivery_methods) && delivery_methods.includes('email')) {
      console.log('准备发送邮件...')
      let users = []
      
      if (target_type === 'all') {
        console.log('目标：全部用户')
        users = await execute(
          'SELECT id, email, nickname, username FROM users WHERE id != ? AND email IS NOT NULL AND email != ""',
          [createdBy]
        )
        console.log('找到用户数量:', users.length)
      } else if (target_type === 'specific' && target_user_ids && target_user_ids.length > 0) {
        console.log('目标：指定用户')
        const placeholders = target_user_ids.map(() => '?').join(',')
        users = await execute(
          `SELECT id, email, nickname, username FROM users WHERE id IN (${placeholders}) AND id != ? AND email IS NOT NULL AND email != ""`,
          [...target_user_ids, createdBy]
        )
        console.log('找到用户数量:', users.length)
      }
      
      if (users.length > 0) {
        console.log('开始发送邮件...')
        for (const user of users) {
          try {
            console.log(`正在给用户 ${user.id} (${user.email}) 发送邮件...`)
            await sendAnnouncementEmail(
              user.email,
              user.nickname || user.username,
              title,
              content
            )
            console.log(`用户 ${user.id} 邮件发送成功`)
          } catch (emailError) {
            console.error(`给用户 ${user.id} 发送邮件失败:`, emailError.message)
          }
        }
      } else {
        console.log('没有找到需要发送邮件的用户')
      }
    } else {
      console.log('不发送邮件，delivery_methods不包含email')
    }
    
    res.status(201).json({
      message: '公告创建成功',
      announcementId: publicId
    })
  } catch (error) {
    console.error('创建公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, priority, is_marquee, is_active, target_type, target_user_ids, delivery_methods, start_time, end_time } = req.body
    
    if (req.user.is_admin !== 1) {
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
    
    await execute(
      `UPDATE announcements SET ${updates.join(', ')} WHERE public_id = ?`,
      params
    )
    
    res.status(200).json({ message: '公告更新成功' })
  } catch (error) {
    console.error('更新公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params
    
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以删除公告' })
    }
    
    await execute('DELETE FROM announcements WHERE public_id = ?', [id])
    
    res.status(200).json({ message: '公告删除成功' })
  } catch (error) {
    console.error('删除公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

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
      [internalId, userId]
    )
    
    res.status(200).json({ message: '标记已读成功' })
  } catch (error) {
    console.error('标记公告已读失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getUnreadPopupAnnouncements = async (req, res) => {
  try {
    const userId = req.user.id
    
    const announcements = await execute(`
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
    `, [userId, userId, userId.toString()])
    
    const processedAnnouncements = announcements.map(announcement => {
      const processed = {
        ...announcement,
        id: announcement.public_id
      };
      delete processed.public_id;
      return processed;
    });
    
    res.status(200).json({
      announcements: processedAnnouncements
    })
  } catch (error) {
    console.error('获取未读弹窗公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getAllAnnouncementsAdmin = async (req, res) => {
  try {
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以查看所有公告' })
    }
    
    const announcements = await execute(`
      SELECT a.*, u.nickname as creator_nickname, u.username as creator_username
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `)
    
    const processedAnnouncements = announcements.map(announcement => {
      const processed = {
        ...announcement,
        id: announcement.public_id
      };
      delete processed.public_id;
      return processed;
    });
    
    res.status(200).json({
      announcements: processedAnnouncements
    })
  } catch (error) {
    console.error('获取所有公告失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    const announcement = await execute(`
      SELECT a.*, 
             u.nickname as creator_nickname,
             u.username as creator_username,
             u.avatar as creator_avatar,
             CASE WHEN ar.id IS NOT NULL THEN 1 ELSE 0 END as is_read
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = ?
      WHERE a.public_id = ?
    `, [userId, id])
    
    if (announcement.length === 0) {
      return res.status(404).json({ message: '公告不存在' })
    }
    
    const processedAnnouncement = {
      ...announcement[0],
      id: announcement[0].public_id
    };
    delete processedAnnouncement.public_id;
    
    res.status(200).json({
      announcement: processedAnnouncement
    })
  } catch (error) {
    console.error('获取公告详情失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}
