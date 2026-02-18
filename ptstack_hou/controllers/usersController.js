import { execute } from '../config/db.js';

export const getUsers = (req, res, next) => {
  res.send('respond with a resource')
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const users = await execute(
      'SELECT id, username, nickname, email, avatar, profile_completed, bio, website, created_at FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }

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
        website: users[0].website,
        createdAt: users[0].created_at
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
      SELECT id, username, nickname, email, avatar, bio, website, follower_count, following_count,
             show_followers, show_following, show_articles, show_comments,
             created_at
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
    
    const publicUser = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      website: user.website,
      follower_count: user.show_followers || currentUserId === parseInt(userId) ? user.follower_count : null,
      following_count: user.show_following || currentUserId === parseInt(userId) ? user.following_count : null,
      show_followers: user.show_followers,
      show_following: user.show_following,
      show_articles: user.show_articles,
      show_comments: user.show_comments,
      created_at: user.created_at,
      isSubscribed,
      isOwn: currentUserId === parseInt(userId)
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
    const { nickname, avatar, bio, website } = req.body;
    
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
    
    if (website !== undefined) {
      updateFields.push('website = ?');
      updateValues.push(website || null);
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
      'SELECT id, username, nickname, email, avatar, profile_completed, bio, website FROM users WHERE id = ?',
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
        bio: users[0].bio,
        website: users[0].website
      }
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      show_followers, 
      show_following, 
      show_articles, 
      show_comments 
    } = req.body;
    
    await execute(
      'UPDATE users SET show_followers = ?, show_following = ?, show_articles = ?, show_comments = ? WHERE id = ?',
      [
        show_followers !== undefined ? show_followers : true,
        show_following !== undefined ? show_following : true,
        show_articles !== undefined ? show_articles : true,
        show_comments !== undefined ? show_comments : true,
        userId
      ]
    );
    
    const [updatedUser] = await execute(
      'SELECT id, username, email, show_followers, show_following, show_articles, show_comments FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({ 
      message: '隐私设置更新成功', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('更新隐私设置失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getUserArticles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 10, search = '', sort = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * pageSize;
    const currentUserId = req.user?.id;
    
    const [user] = await execute('SELECT show_articles FROM users WHERE id = ?', [userId]);
    
    if (!user.show_articles && parseInt(userId) !== currentUserId) {
      return res.status(403).json({ message: '该用户未公开文章' });
    }
    
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
    const currentUserId = req.user?.id;
    
    const [user] = await execute('SELECT show_comments FROM users WHERE id = ?', [userId]);
    
    if (!user.show_comments && parseInt(userId) !== currentUserId) {
      return res.status(403).json({ message: '该用户未公开评论' });
    }
    
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
