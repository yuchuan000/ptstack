import { execute } from '../config/db.js'

export const getAchievements = async (req, res) => {
  try {
    const achievements = await execute('SELECT * FROM achievements ORDER BY type, condition_value')
    res.status(200).json({ achievements })
  } catch (error) {
    console.error('获取成就列表失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getAchievementById = async (req, res) => {
  try {
    const { id } = req.params
    
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以查看' })
    }
    
    const achievement = await execute('SELECT * FROM achievements WHERE id = ?', [id])
    if (achievement.length === 0) {
      return res.status(404).json({ message: '成就不存在' })
    }
    
    res.status(200).json({ achievement: achievement[0] })
  } catch (error) {
    console.error('获取成就详情失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getMyAchievements = async (req, res) => {
  try {
    const userId = req.user.id
    
    const allAchievements = await execute('SELECT * FROM achievements ORDER BY type, condition_value')
    
    const userAchievements = await execute(
      'SELECT achievement_id, created_at FROM user_achievements WHERE user_id = ?',
      [userId]
    )
    
    const userAchievementMap = {}
    userAchievements.forEach(ua => {
      userAchievementMap[ua.achievement_id] = ua.created_at
    })
    
    const achievementsWithProgress = allAchievements.map(achievement => {
      const unlocked = !!userAchievementMap[achievement.id]
      const unlockedAt = userAchievementMap[achievement.id] || null
      
      return {
        ...achievement,
        unlocked,
        unlocked_at: unlockedAt
      }
    })
    
    const typeStats = {}
    allAchievements.forEach(a => {
      // 统计常规类型
      if (a.type) {
        if (!typeStats[a.type]) {
          typeStats[a.type] = { total: 0, unlocked: 0 }
        }
        typeStats[a.type].total++
      }
      
      // 统计活动成就
      if (a.is_event === 1 || a.is_event === true) {
        if (!typeStats['event']) {
          typeStats['event'] = { total: 0, unlocked: 0 }
        }
        typeStats['event'].total++
      }
      
      // 统计限定成就
      if (a.is_limited === 1 || a.is_limited === true) {
        if (!typeStats['limited']) {
          typeStats['limited'] = { total: 0, unlocked: 0 }
        }
        typeStats['limited'].total++
      }
    })
    
    achievementsWithProgress.forEach(a => {
      if (a.unlocked) {
        // 统计常规类型的解锁
        if (a.type && typeStats[a.type]) {
          typeStats[a.type].unlocked++
        }
        // 统计活动成就的解锁
        if ((a.is_event === 1 || a.is_event === true) && typeStats['event']) {
          typeStats['event'].unlocked++
        }
        // 统计限定成就的解锁
        if ((a.is_limited === 1 || a.is_limited === true) && typeStats['limited']) {
          typeStats['limited'].unlocked++
        }
      }
    })
    
    const totalStats = {
      total: allAchievements.length,
      unlocked: userAchievements.length
    }
    
    res.status(200).json({ 
      achievements: achievementsWithProgress,
      typeStats,
      totalStats
    })
  } catch (error) {
    console.error('获取我的成就失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const createAchievement = async (req, res) => {
  try {
    console.log('🎯 接收到创建成就请求，请求体:', req.body)
    
    const { 
      name, 
      description, 
      type, 
      condition_value, 
      icon, 
      category, 
      start_time, 
      end_time,
      is_event,
      is_limited,
      is_unconditional,
      custom_tag
    } = req.body
    
    console.log('📝 解析后的字段:')
    console.log('  - name:', name)
    console.log('  - description:', description)
    console.log('  - type:', type)
    console.log('  - condition_value:', condition_value)
    console.log('  - is_unconditional:', is_unconditional)
    
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以创建成就' })
    }
    
    if (!name || !description) {
      console.log('❌ 验证失败: name 或 description 为空')
      return res.status(400).json({ message: '请填写完整的成就信息' })
    }
    
    console.log('✅ 验证通过，准备创建成就...')
    
    const result = await execute(
      'INSERT INTO achievements (name, description, type, condition_value, icon, category, start_time, end_time, is_event, is_limited, is_unconditional, custom_tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name, 
        description, 
        type || null, 
        condition_value || null, 
        icon || null, 
        category || 'regular', 
        start_time || null, 
        end_time || null,
        is_event ? 1 : 0,
        is_limited ? 1 : 0,
        is_unconditional ? 1 : 0,
        custom_tag || null
      ]
    )
    
    res.status(201).json({ 
      message: '成就创建成功', 
      achievementId: result.insertId 
    })
  } catch (error) {
    console.error('创建成就失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params
    const { 
      name, 
      description, 
      type, 
      condition_value, 
      icon, 
      category, 
      start_time, 
      end_time,
      is_event,
      is_limited,
      is_unconditional,
      custom_tag
    } = req.body
    
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以更新成就' })
    }
    
    const existing = await execute('SELECT * FROM achievements WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '成就不存在' })
    }
    
    await execute(
      'UPDATE achievements SET name = ?, description = ?, type = ?, condition_value = ?, icon = ?, category = ?, start_time = ?, end_time = ?, is_event = ?, is_limited = ?, is_unconditional = ?, custom_tag = ? WHERE id = ?',
      [
        name, 
        description, 
        type || null, 
        condition_value || null, 
        icon, 
        category || 'regular', 
        start_time || null, 
        end_time || null,
        is_event ? 1 : 0,
        is_limited ? 1 : 0,
        is_unconditional ? 1 : 0,
        custom_tag || null,
        id
      ]
    )
    
    res.status(200).json({ message: '成就更新成功' })
  } catch (error) {
    console.error('更新成就失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params
    
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以删除成就' })
    }
    
    const existing = await execute('SELECT * FROM achievements WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '成就不存在' })
    }
    
    await execute('DELETE FROM achievements WHERE id = ?', [id])
    
    res.status(200).json({ message: '成就删除成功' })
  } catch (error) {
    console.error('删除成就失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const grantAchievement = async (req, res) => {
  console.log('🎁 进入 grantAchievement 函数')
  console.log('📦 请求体:', req.body)
  
  try {
    const { achievementId, userId } = req.body
    
    console.log('🔍 achievementId:', achievementId, 'userId (public_id):', userId)
    
    if (req.user.is_admin !== 1) {
      console.log('❌ 无权限')
      return res.status(403).json({ message: '只有管理员可以颁发成就' })
    }
    
    if (!achievementId || !userId) {
      console.log('❌ 参数缺失')
      return res.status(400).json({ message: '请提供成就ID和用户ID' })
    }
    
    const achievement = await execute('SELECT * FROM achievements WHERE id = ?', [achievementId])
    console.log('🏆 成就查询结果:', achievement)
    if (achievement.length === 0) {
      return res.status(404).json({ message: '成就不存在' })
    }
    
    const user = await execute('SELECT * FROM users WHERE public_id = ?', [userId])
    console.log('👤 用户查询结果:', user)
    if (user.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    const internalUserId = user[0].id
    console.log('🔄 内部用户ID:', internalUserId)
    
    const existing = await execute(
      'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
      [internalUserId, achievementId]
    )
    if (existing.length > 0) {
      return res.status(400).json({ message: '该用户已经获得了此成就' })
    }
    
    console.log('✅ 开始插入成就记录')
    await execute(
      'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
      [internalUserId, achievementId]
    )
    
    await execute(
      'INSERT INTO notifications (user_id, type, content, related_id, is_read) VALUES (?, ?, ?, ?, 0)',
      [
        internalUserId,
        'achievement',
        `恭喜！您获得了成就「${achievement[0].name}」`,
        achievementId
      ]
    )
    
    console.log('🎉 成就颁发成功')
    res.status(201).json({ message: '成就颁发成功' })
  } catch (error) {
    console.error('❌ 颁发成就失败:', error.message)
    console.error('错误堆栈:', error.stack)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getAchievementUsers = async (req, res) => {
  try {
    const { id } = req.params
    
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以查看' })
    }
    
    const achievement = await execute('SELECT * FROM achievements WHERE id = ?', [id])
    if (achievement.length === 0) {
      return res.status(404).json({ message: '成就不存在' })
    }
    
    const users = await execute(`
      SELECT 
        u.id,
        u.public_id,
        u.username,
        u.nickname,
        u.avatar,
        ua.created_at as earned_at
      FROM user_achievements ua
      JOIN users u ON ua.user_id = u.id
      WHERE ua.achievement_id = ?
      ORDER BY ua.created_at DESC
    `, [id])
    
    res.status(200).json({ 
      achievement: achievement[0],
      users 
    })
  } catch (error) {
    console.error('获取成就用户列表失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const removeAchievementFromUser = async (req, res) => {
  try {
    const { achievementId, userId } = req.body
    
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以移除成就' })
    }
    
    if (!achievementId || !userId) {
      return res.status(400).json({ message: '请提供成就ID和用户ID' })
    }
    
    const achievement = await execute('SELECT * FROM achievements WHERE id = ?', [achievementId])
    if (achievement.length === 0) {
      return res.status(404).json({ message: '成就不存在' })
    }
    
    const user = await execute('SELECT * FROM users WHERE public_id = ?', [userId])
    if (user.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    const internalUserId = user[0].id
    
    const existing = await execute(
      'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
      [internalUserId, achievementId]
    )
    if (existing.length === 0) {
      return res.status(400).json({ message: '该用户未获得此成就' })
    }
    
    await execute(
      'DELETE FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
      [internalUserId, achievementId]
    )
    
    res.status(200).json({ message: '成就移除成功' })
  } catch (error) {
    console.error('移除成就失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const batchGrantAchievements = async (req, res) => {
  try {
    const { achievementIds, userIds } = req.body
    
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以批量颁发成就' })
    }
    
    if (!achievementIds || !Array.isArray(achievementIds) || achievementIds.length === 0) {
      return res.status(400).json({ message: '请选择要颁发的成就' })
    }
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: '请选择要颁发给的用户' })
    }
    
    const achievements = await execute(
      `SELECT * FROM achievements WHERE id IN (${achievementIds.map(() => '?').join(',')})`,
      achievementIds
    )
    if (achievements.length !== achievementIds.length) {
      return res.status(404).json({ message: '部分成就不存在' })
    }
    
    const users = await execute(
      `SELECT * FROM users WHERE public_id IN (${userIds.map(() => '?').join(',')})`,
      userIds
    )
    if (users.length !== userIds.length) {
      return res.status(404).json({ message: '部分用户不存在' })
    }
    
    let successCount = 0
    let alreadyHaveCount = 0
    
    for (const achievement of achievements) {
      for (const user of users) {
        const existing = await execute(
          'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
          [user.id, achievement.id]
        )
        
        if (existing.length > 0) {
          alreadyHaveCount++
          continue
        }
        
        await execute(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [user.id, achievement.id]
        )
        
        await execute(
          'INSERT INTO notifications (user_id, type, content, related_id, is_read) VALUES (?, ?, ?, ?, 0)',
          [
            user.id,
            'achievement',
            `恭喜！您获得了成就「${achievement.name}」`,
            achievement.id
          ]
        )
        
        successCount++
      }
    }
    
    res.status(200).json({ 
      message: '批量颁发完成',
      successCount,
      alreadyHaveCount
    })
  } catch (error) {
    console.error('批量颁发成就失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const batchRemoveAchievements = async (req, res) => {
  try {
    const { achievement_id, userIds } = req.body
    
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: '只有管理员可以批量移除成就' })
    }
    
    if (!achievement_id) {
      return res.status(400).json({ message: '请提供成就ID' })
    }
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: '请选择要移除的用户' })
    }
    
    const achievement = await execute('SELECT * FROM achievements WHERE id = ?', [achievement_id])
    if (achievement.length === 0) {
      return res.status(404).json({ message: '成就不存在' })
    }
    
    const users = await execute(
      `SELECT * FROM users WHERE public_id IN (${userIds.map(() => '?').join(',')})`,
      userIds
    )
    
    let successCount = 0
    
    for (const user of users) {
      const existing = await execute(
        'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
        [user.id, achievement_id]
      )
      
      if (existing.length === 0) {
        continue
      }
      
      await execute(
        'DELETE FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
        [user.id, achievement_id]
      )
      
      successCount++
    }
    
    res.status(200).json({ 
      message: '批量移除完成',
      successCount
    })
  } catch (error) {
    console.error('批量移除成就失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}
