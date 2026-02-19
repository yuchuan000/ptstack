import { execute } from '../config/db.js';

export const getUsers = (req, res, next) => {
  res.send('respond with a resource')
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const users = await execute(
      'SELECT id, username, nickname, email, avatar, profile_completed, bio, created_at, follower_count, following_count, is_admin FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 获取用户的文章数量
    const [articleCount] = await execute(
      'SELECT COUNT(*) as count FROM articles WHERE author_id = ? AND status = 1',
      [userId]
    )

    // 获取用户的总阅读量
    const [totalViews] = await execute(
      'SELECT COALESCE(SUM(view_count), 0) as total FROM articles WHERE author_id = ? AND status = 1',
      [userId]
    )

    // 获取用户的评论数量
    const [commentCount] = await execute(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = ?',
      [userId]
    )

    res.status(200).json({
      message: '获取用户信息成功',
      user: {
        id: users[0].id,
        username: users[0].username,
        nickname: users[0].nickname,
        email: users[0].email,
        avatar: users[0].avatar,
        profileCompleted: users[0].profile_completed === 1,
        bio: users[0].bio,
        createdAt: users[0].created_at,
        article_count: articleCount.count,
        follower_count: users[0].follower_count,
        following_count: users[0].following_count,
        total_views: totalViews.total,
        comment_count: commentCount.count,
        isAdmin: users[0].is_admin === 1
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getUserPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;
    
    const [user] = await execute(`
      SELECT id, username, nickname, email, avatar, bio, follower_count, following_count,
             created_at, is_admin
      FROM users
      WHERE id = ?
    `, [userId]);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    let isSubscribed = false;
    if (currentUserId) {
      const [sub] = await execute(
        'SELECT id FROM subscriptions WHERE follower_id = ? AND following_id = ?',
        [currentUserId, userId]
      );
      isSubscribed = !!sub;
    }
    
    // 获取用户的文章数量
    const [articleCount] = await execute(
      'SELECT COUNT(*) as count FROM articles WHERE author_id = ? AND status = 1',
      [userId]
    )

    // 获取用户的总阅读量
    const [totalViews] = await execute(
      'SELECT COALESCE(SUM(view_count), 0) as total FROM articles WHERE author_id = ? AND status = 1',
      [userId]
    )

    // 获取用户的评论数量
    const [commentCount] = await execute(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = ?',
      [userId]
    )
    
    const publicUser = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      follower_count: user.follower_count,
      following_count: user.following_count,
      created_at: user.created_at,
      isSubscribed,
      isOwn: currentUserId === parseInt(userId),
      article_count: articleCount.count,
      total_views: totalViews.total,
      comment_count: commentCount.count,
      isAdmin: user.is_admin === 1
    };
    
    res.json({ user: publicUser });
  } catch (error) {
    console.error('获取用户公开信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, avatar, bio } = req.body;
    
    // 构建更新语句
    const updateFields = [];
    const updateValues = [];
    
    if (nickname !== undefined) {
      if (nickname.length < 1 || nickname.length > 50) {
        return res.status(400).json({ message: '昵称长度应在1-50个字符之间' })
      }
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    
    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }
    
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio || null);
    }
    
    // 如果有昵称，设置为资料已完成
    if (nickname) {
      updateFields.push('profile_completed = 1');
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: '没有提供更新字段' })
    }
    
    updateValues.push(userId);
    
    await execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    const users = await execute(
      'SELECT id, username, nickname, email, avatar, profile_completed, bio FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({ 
      message: '更新成功', 
      user: {
        id: users[0].id,
        username: users[0].username,
        nickname: users[0].nickname,
        email: users[0].email,
        avatar: users[0].avatar,
        profileCompleted: users[0].profile_completed === 1,
        bio: users[0].bio
      }
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};



export const getUserArticles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 10, search = '', sort = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * pageSize;
    
    const validSortFields = ['created_at', 'view_count', 'like_count'];
    const validOrder = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const order = validOrder.includes(sortOrder) ? sortOrder : 'desc';
    
    let whereClause = 'WHERE a.author_id = ? AND a.status = 1';
    let queryParams = [userId];
    
    if (search) {
      whereClause += ' AND (a.title LIKE ? OR a.content LIKE ? OR a.summary LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    let countWhereClause = 'WHERE author_id = ? AND status = 1';
    let countParams = [userId];
    
    if (search) {
      countWhereClause += ' AND (title LIKE ? OR content LIKE ? OR summary LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    const articles = await execute(`
      SELECT a.*, c.name as category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.${sortField} ${order === 'desc' ? 'DESC' : 'ASC'}
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(pageSize), offset]);
    
    const [countResult] = await execute(
      `SELECT COUNT(*) as total FROM articles ${countWhereClause}`,
      countParams
    );
    
    res.json({
      articles,
      total: countResult.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取用户文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 10, search = '', sort = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * pageSize;
    
    const validSortFields = ['created_at', 'like_count'];
    const validOrder = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const order = validOrder.includes(sortOrder) ? sortOrder : 'desc';
    
    let whereClause = 'WHERE c.user_id = ?';
    let queryParams = [userId];
    
    if (search) {
      whereClause += ' AND c.content LIKE ?';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern);
    }
    
    let countWhereClause = 'WHERE user_id = ?';
    let countParams = [userId];
    
    if (search) {
      countWhereClause += ' AND content LIKE ?';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern);
    }
    
    const comments = await execute(`
      SELECT c.*, a.title as article_title, a.id as article_id
      FROM comments c
      JOIN articles a ON c.article_id = a.id
      ${whereClause}
      ORDER BY c.${sortField} ${order === 'desc' ? 'DESC' : 'ASC'}
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(pageSize), offset]);
    
    const [countResult] = await execute(
      `SELECT COUNT(*) as total FROM comments ${countWhereClause}`,
      countParams
    );
    
    res.json({
      comments,
      total: countResult.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取用户评论失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getRecommendedUsers = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 5 } = req.query;

    let query = `
      SELECT u.id, u.username, u.nickname, u.avatar, u.bio, 
             u.follower_count, u.following_count, u.is_admin
      FROM users u
    `;
    let params = [];

    if (userId) {
      query += `
        WHERE u.id != ?
        AND u.id NOT IN (
          SELECT following_id FROM subscriptions WHERE follower_id = ?
        )
      `;
      params = [userId, userId];
    }

    query += `
      ORDER BY u.follower_count DESC
      LIMIT ?
    `;
    params.push(parseInt(limit));

    const users = await execute(query, params);

    res.json({ users });
  } catch (error) {
    console.error('获取推荐用户失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getFeed = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    if (!userId) {
      return res.status(401).json({ message: '请先登录' });
    }

    const articles = await execute(`
      SELECT a.*, u.username, u.nickname, u.avatar, u.is_admin
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.author_id IN (
        SELECT following_id FROM subscriptions WHERE follower_id = ?
      )
      AND a.status = 1
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(pageSize), offset]);

    const [countResult] = await execute(`
      SELECT COUNT(*) as total FROM articles
      WHERE author_id IN (
        SELECT following_id FROM subscriptions WHERE follower_id = ?
      )
      AND status = 1
    `, [userId]);

    res.json({
      articles,
      total: countResult.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取Feed流失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '请先登录' });
    }

    const [notificationCount] = await execute(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `, [userId]);

    const [commentCount] = await execute(`
      SELECT COUNT(*) as count
      FROM comments c
      JOIN articles a ON c.article_id = a.id
      WHERE a.author_id = ?
      AND c.user_id != ?
    `, [userId, userId]);

    const [likeCount] = await execute(`
      SELECT COUNT(*) as count
      FROM likes l
      JOIN articles a ON l.article_id = a.id
      WHERE a.author_id = ?
      AND l.user_id != ?
    `, [userId, userId]);

    const [followerCount] = await execute(`
      SELECT COUNT(*) as count
      FROM subscriptions s
      WHERE s.following_id = ?
    `, [userId]);

    const total = notificationCount.count > 0 ? notificationCount.count : (commentCount.count + likeCount.count + followerCount.count);

    res.json({
      total,
      comments: commentCount.count,
      likes: likeCount.count,
      followers: followerCount.count
    });
  } catch (error) {
    console.error('获取未读消息数失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
