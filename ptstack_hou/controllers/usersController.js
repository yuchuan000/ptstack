import { execute } from '../config/db.js'
import bcrypt from 'bcrypt'
import { generateUserId } from '../utils/idGenerator.js'
import { deleteAvatarFile } from './uploadController.js'

export const getUsers = (req, res, next) => {
  res.send('respond with a resource')
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const users = await execute(
      'SELECT id, public_id, username, nickname, email, avatar, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color, show_avatar_badge, profile_completed, bio, created_at, follower_count, following_count, level FROM users WHERE id = ?',
      [userId],
    )

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }

    const [articleCount] = await execute(
      'SELECT COUNT(*) as count FROM articles WHERE author_id = ? AND status = 1',
      [userId],
    )

    const [totalViews] = await execute(
      'SELECT COALESCE(SUM(view_count), 0) as total FROM articles WHERE author_id = ? AND status = 1',
      [userId],
    )

    const [commentCount] = await execute(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = ?',
      [userId],
    )

    // 获取用户权限
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      userId,
    ])

    res.status(200).json({
      message: '获取用户信息成功',
      user: {
        id: users[0].public_id,
        username: users[0].username,
        nickname: users[0].nickname,
        email: users[0].email,
        avatar: users[0].avatar,
        avatarBadge: users[0].avatar_badge,
        avatarBadgeBgColor: users[0].avatar_badge_bg_color,
        avatarBadgeTextColor: users[0].avatar_badge_text_color,
        showAvatarBadge: users[0].show_avatar_badge === 1,
        profileCompleted: users[0].profile_completed === 1,
        bio: users[0].bio,
        createdAt: users[0].created_at,
        article_count: articleCount.count,
        follower_count: users[0].follower_count,
        following_count: users[0].following_count,
        total_views: totalViews.total,
        comment_count: commentCount.count,

        level: users[0].level,
        permissions: permissions.map((p) => p.permission),
      },
    })
  } catch (error) {
    console.error('获取用户信息失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getUserPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user?.id

    const [user] = await execute(
      `
      SELECT id, public_id, username, nickname, email, avatar, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color, show_avatar_badge, bio, follower_count, following_count,
             created_at, level, show_followers, show_following, show_articles, show_comments
      FROM users
      WHERE public_id = ?
    `,
      [userId],
    )

    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    let isSubscribed = false
    if (currentUserId) {
      const [sub] = await execute(
        'SELECT id FROM subscriptions WHERE follower_id = ? AND following_id = ?',
        [currentUserId, user.id],
      )
      isSubscribed = !!sub
    }

    const [articleCount] = await execute(
      'SELECT COUNT(*) as count FROM articles WHERE author_id = ? AND status = 1',
      [user.id],
    )

    const [totalViews] = await execute(
      'SELECT COALESCE(SUM(view_count), 0) as total FROM articles WHERE author_id = ? AND status = 1',
      [user.id],
    )

    const [commentCount] = await execute(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = ?',
      [user.id],
    )

    // 获取用户权限
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      user.id,
    ])

    // 根据隐私设置控制返回的数据
    const isOwnProfile = currentUserId === user.id
    const publicUser = {
      id: user.public_id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      avatarBadge: user.avatar_badge,
      avatarBadgeBgColor: user.avatar_badge_bg_color,
      avatarBadgeTextColor: user.avatar_badge_text_color,
      showAvatarBadge: user.show_avatar_badge === 1,
      bio: user.bio,
      follower_count: isOwnProfile || user.show_followers ? user.follower_count : 0,
      following_count: isOwnProfile || user.show_following ? user.following_count : 0,
      created_at: user.created_at,
      isSubscribed,
      isOwn: isOwnProfile,
      article_count: isOwnProfile || user.show_articles ? articleCount.count : 0,
      total_views: isOwnProfile || user.show_articles ? totalViews.total : 0,
      comment_count: isOwnProfile || user.show_comments ? commentCount.count : 0,

      level: user.level,
      permissions: permissions.map((p) => p.permission),
      // 返回隐私设置（仅对自己可见）
      ...(isOwnProfile && {
        show_followers: user.show_followers === 1,
        show_following: user.show_following === 1,
        show_articles: user.show_articles === 1,
        show_comments: user.show_comments === 1,
      }),
    }

    res.json({ user: publicUser })
  } catch (error) {
    console.error('获取用户公开信息失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      nickname,
      avatar,
      avatarBadge,
      avatarBadgeBgColor,
      avatarBadgeTextColor,
      showAvatarBadge,
      bio,
      show_followers,
      show_following,
      show_articles,
      show_comments,
    } = req.body

    // 如果要更新头像，先获取旧头像URL
    let oldAvatar = null
    if (avatar !== undefined) {
      const [user] = await execute('SELECT avatar FROM users WHERE id = ?', [userId])
      if (user && user.avatar) {
        oldAvatar = user.avatar
      }
    }

    const updateFields = []
    const updateValues = []

    if (nickname !== undefined) {
      if (nickname.length < 1 || nickname.length > 50) {
        return res.status(400).json({ message: '昵称长度应在1-50个字符之间' })
      }
      updateFields.push('nickname = ?')
      updateValues.push(nickname)
    }

    if (avatar !== undefined) {
      updateFields.push('avatar = ?')
      updateValues.push(avatar)
    }

    if (avatarBadge !== undefined) {
      updateFields.push('avatar_badge = ?')
      updateValues.push(avatarBadge || null)
    }

    if (avatarBadgeBgColor !== undefined) {
      updateFields.push('avatar_badge_bg_color = ?')
      updateValues.push(avatarBadgeBgColor || null)
    }

    if (avatarBadgeTextColor !== undefined) {
      updateFields.push('avatar_badge_text_color = ?')
      updateValues.push(avatarBadgeTextColor || null)
    }

    if (showAvatarBadge !== undefined) {
      updateFields.push('show_avatar_badge = ?')
      updateValues.push(showAvatarBadge ? 1 : 0)
    }

    if (bio !== undefined) {
      updateFields.push('bio = ?')
      updateValues.push(bio || null)
    }

    // 处理隐私设置字段
    if (show_followers !== undefined) {
      updateFields.push('show_followers = ?')
      updateValues.push(show_followers ? 1 : 0)
    }

    if (show_following !== undefined) {
      updateFields.push('show_following = ?')
      updateValues.push(show_following ? 1 : 0)
    }

    if (show_articles !== undefined) {
      updateFields.push('show_articles = ?')
      updateValues.push(show_articles ? 1 : 0)
    }

    if (show_comments !== undefined) {
      updateFields.push('show_comments = ?')
      updateValues.push(show_comments ? 1 : 0)
    }

    if (nickname) {
      updateFields.push('profile_completed = 1')
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: '没有提供更新字段' })
    }

    updateValues.push(userId)

    await execute(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues)

    // 删除旧头像文件
    if (oldAvatar && oldAvatar !== avatar) {
      deleteAvatarFile(oldAvatar)
    }

    const users = await execute(
      'SELECT id, public_id, username, nickname, email, avatar, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color, show_avatar_badge, profile_completed, bio, show_followers, show_following, show_articles, show_comments FROM users WHERE id = ?',
      [userId],
    )

    res.json({
      message: '更新成功',
      user: {
        id: users[0].public_id,
        username: users[0].username,
        nickname: users[0].nickname,
        email: users[0].email,
        avatar: users[0].avatar,
        avatarBadge: users[0].avatar_badge,
        avatarBadgeBgColor: users[0].avatar_badge_bg_color,
        avatarBadgeTextColor: users[0].avatar_badge_text_color,
        showAvatarBadge: users[0].show_avatar_badge === 1,
        profileCompleted: users[0].profile_completed === 1,
        bio: users[0].bio,
        show_followers: users[0].show_followers === 1,
        show_following: users[0].show_following === 1,
        show_articles: users[0].show_articles === 1,
        show_comments: users[0].show_comments === 1,
      },
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getUserArticles = async (req, res) => {
  try {
    const { userId } = req.params
    const {
      page = 1,
      pageSize = 10,
      search = '',
      sort = 'created_at',
      sortOrder = 'desc',
    } = req.query
    const offset = (page - 1) * pageSize
    const currentUserId = req.user?.id

    const validSortFields = ['created_at', 'view_count', 'like_count']
    const validOrder = ['asc', 'desc']
    const sortField = validSortFields.includes(sort) ? sort : 'created_at'
    const order = validOrder.includes(sortOrder) ? sortOrder : 'desc'

    const [user] = await execute('SELECT id, show_articles FROM users WHERE public_id = ?', [
      userId,
    ])
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    const authorId = user.id

    // 检查隐私设置
    const isOwnProfile = currentUserId === authorId
    if (!isOwnProfile && !user.show_articles) {
      return res.json({
        articles: [],
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      })
    }

    let whereClause = 'WHERE a.author_id = ? AND a.status = 1'
    let queryParams = [authorId]

    if (search) {
      whereClause += ' AND (a.title LIKE ? OR a.content LIKE ? OR a.summary LIKE ?)'
      const searchPattern = `%${search}%`
      queryParams.push(searchPattern, searchPattern, searchPattern)
    }

    let countWhereClause = 'WHERE author_id = ? AND status = 1'
    let countParams = [authorId]

    if (search) {
      countWhereClause += ' AND (title LIKE ? OR content LIKE ? OR summary LIKE ?)'
      const searchPattern = `%${search}%`
      countParams.push(searchPattern, searchPattern, searchPattern)
    }

    const articles = await execute(
      `
      SELECT a.*, c.name as category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.${sortField} ${order === 'desc' ? 'DESC' : 'ASC'}
      LIMIT ? OFFSET ?
    `,
      [...queryParams, parseInt(pageSize), offset],
    )

    const [countResult] = await execute(
      `SELECT COUNT(*) as total FROM articles ${countWhereClause}`,
      countParams,
    )

    const processedArticles = articles.map((article) => {
      const processed = {
        ...article,
        id: article.public_id,
      }
      delete processed.public_id
      return processed
    })

    res.json({
      articles: processedArticles,
      total: countResult.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    })
  } catch (error) {
    console.error('获取用户文章失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getUserComments = async (req, res) => {
  try {
    const { userId } = req.params
    const {
      page = 1,
      pageSize = 10,
      search = '',
      sort = 'created_at',
      sortOrder = 'desc',
    } = req.query
    const offset = (page - 1) * pageSize
    const currentUserId = req.user?.id

    const validSortFields = ['created_at', 'like_count']
    const validOrder = ['asc', 'desc']
    const sortField = validSortFields.includes(sort) ? sort : 'created_at'
    const order = validOrder.includes(sortOrder) ? sortOrder : 'desc'

    const [user] = await execute('SELECT id, show_comments FROM users WHERE public_id = ?', [
      userId,
    ])
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    const commentUserId = user.id

    // 检查隐私设置
    const isOwnProfile = currentUserId === commentUserId
    if (!isOwnProfile && !user.show_comments) {
      return res.json({
        comments: [],
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      })
    }

    let whereClause = 'WHERE c.user_id = ?'
    let queryParams = [commentUserId]

    if (search) {
      whereClause += ' AND c.content LIKE ?'
      const searchPattern = `%${search}%`
      queryParams.push(searchPattern)
    }

    let countWhereClause = 'WHERE user_id = ?'
    let countParams = [commentUserId]

    if (search) {
      countWhereClause += ' AND content LIKE ?'
      const searchPattern = `%${search}%`
      countParams.push(searchPattern)
    }

    const comments = await execute(
      `
      SELECT c.*, a.title as article_title, a.public_id as article_id
      FROM comments c
      JOIN articles a ON c.article_id = a.id
      ${whereClause}
      ORDER BY c.${sortField} ${order === 'desc' ? 'DESC' : 'ASC'}
      LIMIT ? OFFSET ?
    `,
      [...queryParams, parseInt(pageSize), offset],
    )

    const [countResult] = await execute(
      `SELECT COUNT(*) as total FROM comments ${countWhereClause}`,
      countParams,
    )

    res.json({
      comments,
      total: countResult.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    })
  } catch (error) {
    console.error('获取用户评论失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getRecommendedUsers = async (req, res) => {
  try {
    const userId = req.user?.id
    const { limit = 5 } = req.query

    let query = `
      SELECT u.id, u.public_id, u.username, u.nickname, u.avatar, u.bio, 
             u.follower_count, u.following_count
      FROM users u
    `
    let params = []

    if (userId) {
      query += `
        WHERE u.id != ?
        AND u.id NOT IN (
          SELECT following_id FROM subscriptions WHERE follower_id = ?
        )
      `
      params = [userId, userId]
    }

    query += `
      ORDER BY u.follower_count DESC
      LIMIT ?
    `
    params.push(parseInt(limit))

    const users = await execute(query, params)

    const processedUsers = users.map((user) => {
      const processed = {
        ...user,
        id: user.public_id,
      }
      delete processed.public_id
      return processed
    })

    res.json({ users: processedUsers })
  } catch (error) {
    console.error('获取推荐用户失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getFeed = async (req, res) => {
  try {
    const userId = req.user?.id
    const { page = 1, pageSize = 10 } = req.query
    const offset = (page - 1) * pageSize

    if (!userId) {
      return res.status(401).json({ message: '请先登录' })
    }

    const articles = await execute(
      `
      SELECT a.*, u.public_id as author_id, u.username, u.nickname, u.avatar, u.show_avatar_badge, u.avatar_badge, u.avatar_badge_bg_color, u.avatar_badge_text_color
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.author_id IN (
        SELECT following_id FROM subscriptions WHERE follower_id = ?
      )
      AND a.status = 1
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [userId, parseInt(pageSize), offset],
    )

    const [countResult] = await execute(
      `
      SELECT COUNT(*) as total FROM articles
      WHERE author_id IN (
        SELECT following_id FROM subscriptions WHERE follower_id = ?
      )
      AND status = 1
    `,
      [userId],
    )

    const processedArticles = articles.map((article) => {
      const processed = {
        ...article,
        id: article.public_id,
      }
      delete processed.public_id
      return processed
    })

    res.json({
      articles: processedArticles,
      total: countResult.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    })
  } catch (error) {
    console.error('获取Feed流失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: '请先登录' })
    }

    const [notificationCount] = await execute(
      `
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `,
      [userId],
    )

    const [commentCount] = await execute(
      `
      SELECT COUNT(*) as count
      FROM comments c
      JOIN articles a ON c.article_id = a.id
      WHERE a.author_id = ?
      AND c.user_id != ?
    `,
      [userId, userId],
    )

    const [likeCount] = await execute(
      `
      SELECT COUNT(*) as count
      FROM likes l
      JOIN articles a ON l.article_id = a.id
      WHERE a.author_id = ?
      AND l.user_id != ?
    `,
      [userId, userId],
    )

    const [followerCount] = await execute(
      `
      SELECT COUNT(*) as count
      FROM subscriptions s
      WHERE s.following_id = ?
    `,
      [userId],
    )

    const total =
      notificationCount.count > 0
        ? notificationCount.count
        : commentCount.count + likeCount.count + followerCount.count

    res.json({
      total,
      comments: commentCount.count,
      likes: likeCount.count,
      followers: followerCount.count,
    })
  } catch (error) {
    console.error('获取未读消息数失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getAllUsersAdmin = async (req, res) => {
  try {
    const currentUserLevel = req.user?.level

    // 检查用户等级是否有效
    if (currentUserLevel === undefined || currentUserLevel === null) {
      return res.status(403).json({ message: '无法获取用户等级信息' })
    }

    // 检查用户权限
    let hasPermission = false
    if (currentUserLevel === 1) {
      hasPermission = true
    } else {
      const permissions = await execute(
        'SELECT permission FROM user_permissions WHERE user_id = ?',
        [req.user.id],
      )
      const permissionSet = new Set(permissions.map((p) => p.permission))
      hasPermission = permissionSet.has('user_manage')
    }

    if (!hasPermission) {
      return res.status(403).json({ message: '没有权限查看用户管理' })
    }

    const { page = 1, pageSize = 20, search = '' } = req.query
    const offset = (page - 1) * pageSize

    // 使用参数化查询防止SQL注入
    let whereClause = 'WHERE level > ?'
    let params = [currentUserLevel]

    if (search) {
      whereClause += ' AND (username LIKE ? OR nickname LIKE ? OR email LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    const users = await execute(
      `
      SELECT id, public_id, username, nickname, email, avatar, bio, 
             profile_completed, follower_count, following_count, level, created_at,
             avatar_badge, avatar_badge_bg_color, avatar_badge_text_color, show_avatar_badge
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(pageSize), offset],
    )

    // 查询总数时需要去掉LIMIT和OFFSET参数
    const countParams = search ? params.slice(0, -3) : [currentUserLevel]
    const [countResult] = await execute(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      countParams,
    )

    // 获取每个用户的权限
    const processedUsers = await Promise.all(
      users.map(async (user) => {
        const permissions = await execute(
          'SELECT permission FROM user_permissions WHERE user_id = ?',
          [user.id],
        )
        return {
          ...user,
          id: user.public_id,

          permissions: permissions.map((p) => p.permission),
          avatarBadge: user.avatar_badge,
          avatarBadgeBgColor: user.avatar_badge_bg_color,
          avatarBadgeTextColor: user.avatar_badge_text_color,
          showAvatarBadge: user.show_avatar_badge === 1,
        }
      }),
    )

    res.status(200).json({
      users: processedUsers,
      total: countResult.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    })
  } catch (error) {
    console.error('获取所有用户失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getUserAdmin = async (req, res) => {
  try {
    const currentUserLevel = req.user.level

    // 检查用户权限
    let hasPermission = false
    if (currentUserLevel === 1) {
      hasPermission = true
    } else {
      const permissions = await execute(
        'SELECT permission FROM user_permissions WHERE user_id = ?',
        [req.user.id],
      )
      const permissionSet = new Set(permissions.map((p) => p.permission))
      hasPermission = permissionSet.has('user_manage')
    }

    if (!hasPermission) {
      return res.status(403).json({ message: '没有权限查看用户管理' })
    }

    const { id } = req.params

    const users = await execute(
      `
      SELECT id, public_id, username, nickname, email, avatar, bio,
             profile_completed, follower_count, following_count, level, created_at, updated_at
      FROM users
      WHERE public_id = ?
    `,
      [id],
    )

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }

    const user = users[0]

    // 确保只能查看比自己等级低的用户
    if (user.level <= currentUserLevel) {
      return res.status(403).json({ message: '没有权限查看此用户' })
    }

    // 获取用户权限
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      user.id,
    ])

    res.status(200).json({
      user: {
        ...user,
        id: user.public_id,

        permissions: permissions.map((p) => p.permission),
      },
    })
  } catch (error) {
    console.error('获取用户详情失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const updateUserAdmin = async (req, res) => {
  try {
    const currentUserLevel = req.user.level

    // 检查用户权限
    let hasPermission = false
    if (currentUserLevel === 1) {
      hasPermission = true
    } else {
      const permissions = await execute(
        'SELECT permission FROM user_permissions WHERE user_id = ?',
        [req.user.id],
      )
      const permissionSet = new Set(permissions.map((p) => p.permission))
      hasPermission = permissionSet.has('user_manage')
    }

    if (!hasPermission) {
      return res.status(403).json({ message: '没有权限更新用户信息' })
    }

    const { id } = req.params
    const {
      username,
      nickname,
      password,
      email,
      avatar,
      bio,
      level,
      avatarBadge,
      avatarBadgeBgColor,
      avatarBadgeTextColor,
      showAvatarBadge,
      permissions,
    } = req.body

    const [existingUser] = await execute('SELECT id, level FROM users WHERE public_id = ?', [id])
    if (!existingUser) {
      return res.status(404).json({ message: '用户不存在' })
    }

    const internalId = existingUser.id

    // 确保只能更新比自己等级低的用户
    if (existingUser.level <= currentUserLevel) {
      return res.status(403).json({ message: '没有权限更新此用户' })
    }

    const updates = []
    const params = []

    if (username !== undefined) {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.status(400).json({ message: '用户名只能包含英文、数字和下划线，长度3-20个字符' })
      }
      const [existing] = await execute('SELECT id FROM users WHERE username = ? AND id != ?', [
        username,
        internalId,
      ])
      if (existing) {
        return res.status(400).json({ message: '用户名已存在' })
      }
      updates.push('username = ?')
      params.push(username)
    }

    if (nickname !== undefined) {
      if (nickname && nickname.length > 50) {
        return res.status(400).json({ message: '昵称长度不能超过50个字符' })
      }
      updates.push('nickname = ?')
      params.push(nickname || null)
    }

    if (password !== undefined) {
      if (password && password.length < 6) {
        return res.status(400).json({ message: '密码长度不能少于6个字符' })
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      updates.push('password = ?')
      params.push(hashedPassword)
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '请输入有效的邮箱地址' })
      }
      const [existing] = await execute('SELECT id FROM users WHERE email = ? AND id != ?', [
        email,
        internalId,
      ])
      if (existing) {
        return res.status(400).json({ message: '邮箱已存在' })
      }
      updates.push('email = ?')
      params.push(email)
    }

    if (avatar !== undefined) {
      updates.push('avatar = ?')
      params.push(avatar || null)
    }

    if (bio !== undefined) {
      updates.push('bio = ?')
      params.push(bio || null)
    }

    if (level !== undefined) {
      // 确保等级只能设置为比当前用户等级低的等级
      if (level <= currentUserLevel) {
        return res.status(400).json({ message: '不能设置等级高于或等于自己的用户' })
      }
      updates.push('level = ?')
      params.push(level)
    }

    if (avatarBadge !== undefined) {
      updates.push('avatar_badge = ?')
      params.push(avatarBadge || null)
    }

    if (avatarBadgeBgColor !== undefined) {
      updates.push('avatar_badge_bg_color = ?')
      params.push(avatarBadgeBgColor || null)
    }

    if (avatarBadgeTextColor !== undefined) {
      updates.push('avatar_badge_text_color = ?')
      params.push(avatarBadgeTextColor || null)
    }

    if (showAvatarBadge !== undefined) {
      updates.push('show_avatar_badge = ?')
      params.push(showAvatarBadge ? 1 : 0)
    }

    if (updates.length > 0) {
      params.push(internalId)
      await execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params)
    }

    // 更新用户权限
    if (permissions !== undefined) {
      // 删除旧权限
      await execute('DELETE FROM user_permissions WHERE user_id = ?', [internalId])
      // 添加新权限
      if (permissions && permissions.length > 0) {
        for (const permission of permissions) {
          await execute('INSERT INTO user_permissions (user_id, permission) VALUES (?, ?)', [
            internalId,
            permission,
          ])
        }
        // 如果用户有任何权限，将等级设置为2
        await execute('UPDATE users SET level = 2 WHERE id = ?', [internalId])
      } else {
        // 如果用户没有权限，将等级设置为3
        await execute('UPDATE users SET level = 3 WHERE id = ?', [internalId])
      }
    }

    const [updatedUser] = await execute(
      `
      SELECT id, public_id, username, nickname, email, avatar, bio,
             profile_completed, follower_count, following_count, level, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color, show_avatar_badge, created_at, updated_at
      FROM users
      WHERE id = ?
    `,
      [internalId],
    )

    // 获取用户权限
    const userPermissions = await execute(
      'SELECT permission FROM user_permissions WHERE user_id = ?',
      [internalId],
    )

    res.status(200).json({
      message: '用户信息更新成功',
      user: {
        ...updatedUser,
        id: updatedUser.public_id,

        avatarBadge: updatedUser.avatar_badge,
        avatarBadgeBgColor: updatedUser.avatar_badge_bg_color,
        avatarBadgeTextColor: updatedUser.avatar_badge_text_color,
        showAvatarBadge: updatedUser.show_avatar_badge === 1,
        permissions: userPermissions.map((p) => p.permission),
      },
    })
  } catch (error) {
    console.error('更新用户信息失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const deleteUserAdmin = async (req, res) => {
  try {
    const currentUserLevel = req.user.level

    // 检查用户权限
    let hasPermission = false
    if (currentUserLevel === 1) {
      hasPermission = true
    } else {
      const permissions = await execute(
        'SELECT permission FROM user_permissions WHERE user_id = ?',
        [req.user.id],
      )
      const permissionSet = new Set(permissions.map((p) => p.permission))
      hasPermission = permissionSet.has('user_manage')
    }

    if (!hasPermission) {
      return res.status(403).json({ message: '没有权限删除用户' })
    }

    const { id } = req.params

    const [existingUser] = await execute('SELECT id, level FROM users WHERE public_id = ?', [id])
    if (!existingUser) {
      return res.status(404).json({ message: '用户不存在' })
    }

    if (existingUser.id === req.user.id) {
      return res.status(400).json({ message: '不能删除自己的账号' })
    }

    // 确保只能删除比自己等级低的用户
    if (existingUser.level <= currentUserLevel) {
      return res.status(403).json({ message: '没有权限删除此用户' })
    }

    await execute('DELETE FROM users WHERE public_id = ?', [id])

    res.status(200).json({ message: '用户删除成功' })
  } catch (error) {
    console.error('删除用户失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const createUserAdmin = async (req, res) => {
  try {
    const currentUserLevel = req.user.level

    // 检查用户权限
    let hasPermission = false
    if (currentUserLevel === 1) {
      hasPermission = true
    } else {
      const permissions = await execute(
        'SELECT permission FROM user_permissions WHERE user_id = ?',
        [req.user.id],
      )
      const permissionSet = new Set(permissions.map((p) => p.permission))
      hasPermission = permissionSet.has('user_manage')
    }

    if (!hasPermission) {
      return res.status(403).json({ message: '没有权限创建用户' })
    }

    const {
      username,
      nickname,
      password,
      email,
      bio,
      level,
      avatarBadge,
      avatarBadgeBgColor,
      avatarBadgeTextColor,
      showAvatarBadge,
      permissions,
    } = req.body

    // 验证必填字段
    if (!username || !nickname || !password || !email) {
      return res.status(400).json({ message: '用户名、昵称、密码和邮箱为必填项' })
    }

    // 验证昵称长度
    if (nickname.length < 2 || nickname.length > 20) {
      return res.status(400).json({ message: '昵称长度应在2-20个字符之间' })
    }

    // 验证用户名格式
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ message: '用户名只能包含英文、数字和下划线，长度3-20个字符' })
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({ message: '密码长度不能少于6个字符' })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '请输入有效的邮箱地址' })
    }

    // 验证用户等级
    if (level && level <= currentUserLevel) {
      return res.status(400).json({ message: '不能创建等级高于或等于自己的用户' })
    }

    // 检查用户名是否已存在
    const [existingUsername] = await execute('SELECT id FROM users WHERE username = ?', [username])
    if (existingUsername) {
      return res.status(400).json({ message: '用户名已被使用' })
    }

    // 检查邮箱是否已存在
    const [existingEmail] = await execute('SELECT id FROM users WHERE email = ?', [email])
    if (existingEmail) {
      return res.status(400).json({ message: '邮箱已被使用' })
    }

    // 生成用户ID
    const publicId = generateUserId()

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const [result] = await execute(
      'INSERT INTO users (public_id, username, nickname, password, email, bio, level, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color, show_avatar_badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        publicId,
        username,
        nickname,
        hashedPassword,
        email,
        bio || '',
        level || 3,
        avatarBadge || null,
        avatarBadgeBgColor || null,
        avatarBadgeTextColor || null,
        showAvatarBadge ? 1 : 0,
      ],
    )

    const userId = result.insertId

    // 添加用户权限
    if (permissions && permissions.length > 0) {
      for (const permission of permissions) {
        await execute('INSERT INTO user_permissions (user_id, permission) VALUES (?, ?)', [
          userId,
          permission,
        ])
      }
      // 如果用户有任何权限，将等级设置为2
      await execute('UPDATE users SET level = 2 WHERE id = ?', [userId])
    }

    // 获取新创建的用户信息
    const [newUser] = await execute(
      'SELECT public_id as id, username, nickname, email, bio, level, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color, show_avatar_badge, created_at FROM users WHERE public_id = ?',
      [publicId],
    )

    // 获取用户权限
    const userPermissions = await execute(
      'SELECT permission FROM user_permissions WHERE user_id = ?',
      [userId],
    )

    res.status(201).json({
      message: '用户创建成功',
      user: {
        ...newUser,

        avatarBadge: newUser.avatar_badge,
        avatarBadgeBgColor: newUser.avatar_badge_bg_color,
        avatarBadgeTextColor: newUser.avatar_badge_text_color,
        showAvatarBadge: newUser.show_avatar_badge === 1,
        permissions: userPermissions.map((p) => p.permission),
      },
    })
  } catch (error) {
    console.error('创建用户失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}
