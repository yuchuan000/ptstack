import { execute } from '../config/db.js';

export const toggleSubscription = async (req, res) => {
  try {
    const { followingId } = req.params;
    const followerId = req.user.id;
    
    if (parseInt(followingId) === followerId) {
      return res.status(400).json({ message: '不能订阅自己' });
    }
    
    const [existing] = await execute(
      'SELECT * FROM subscriptions WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    
    if (existing) {
      await execute(
        'DELETE FROM subscriptions WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId]
      );
      
      await execute(
        'UPDATE users SET follower_count = follower_count - 1 WHERE id = ?',
        [followingId]
      );
      await execute(
        'UPDATE users SET following_count = following_count - 1 WHERE id = ?',
        [followerId]
      );
      
      res.json({ message: '已取消订阅', isSubscribed: false });
    } else {
      await execute(
        'INSERT INTO subscriptions (follower_id, following_id) VALUES (?, ?)',
        [followerId, followingId]
      );
      
      await execute(
        'UPDATE users SET follower_count = follower_count + 1 WHERE id = ?',
        [followingId]
      );
      await execute(
        'UPDATE users SET following_count = following_count + 1 WHERE id = ?',
        [followerId]
      );
      
      res.json({ message: '订阅成功', isSubscribed: true });
    }
  } catch (error) {
    console.error('订阅操作失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const checkSubscription = async (req, res) => {
  try {
    const { followingId } = req.params;
    const followerId = req.user.id;
    
    const [existing] = await execute(
      'SELECT * FROM subscriptions WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    
    res.json({ isSubscribed: !!existing });
  } catch (error) {
    console.error('检查订阅状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 20, search = '' } = req.query;
    const offset = (page - 1) * pageSize;
    const currentUserId = req.user?.id;
    
    const [user] = await execute('SELECT show_followers FROM users WHERE id = ?', [userId]);
    
    if (!user.show_followers && parseInt(userId) !== currentUserId) {
      return res.status(403).json({ message: '该用户未公开订阅者列表' });
    }
    
    let whereClause = 'WHERE s.following_id = ?';
    let queryParams = [userId];
    let countWhereClause = 'WHERE following_id = ?';
    let countParams = [userId];
    
    if (search) {
      whereClause += ' AND u.username LIKE ?';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern);
      countWhereClause += ' AND EXISTS (SELECT 1 FROM users u2 WHERE u2.id = s.follower_id AND u2.username LIKE ?)';
      countParams.push(searchPattern);
    }
    
    const followers = await execute(`
      SELECT u.id, u.username, u.nickname, u.avatar, u.bio, u.website, u.created_at,
             (SELECT COUNT(*) FROM articles WHERE author_id = u.id) as article_count
      FROM subscriptions s
      JOIN users u ON s.follower_id = u.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(pageSize), offset]);
    
    const [countResult] = await execute(
      `SELECT COUNT(*) as total FROM subscriptions ${countWhereClause}`,
      countParams
    );
    
    const usersWithSubscriptionStatus = await Promise.all(followers.map(async (follower) => {
      let isSubscribed = false;
      if (currentUserId) {
        const [sub] = await execute(
          'SELECT id FROM subscriptions WHERE follower_id = ? AND following_id = ?',
          [currentUserId, follower.id]
        );
        isSubscribed = !!sub;
      }
      return { ...follower, isSubscribed };
    }));
    
    res.json({
      users: usersWithSubscriptionStatus,
      total: countResult.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取订阅者列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 20, search = '' } = req.query;
    const offset = (page - 1) * pageSize;
    const currentUserId = req.user?.id;
    
    const [user] = await execute('SELECT show_following FROM users WHERE id = ?', [userId]);
    
    if (!user.show_following && parseInt(userId) !== currentUserId) {
      return res.status(403).json({ message: '该用户未公开订阅列表' });
    }
    
    let whereClause = 'WHERE s.follower_id = ?';
    let queryParams = [userId];
    let countWhereClause = 'WHERE follower_id = ?';
    let countParams = [userId];
    
    if (search) {
      whereClause += ' AND u.username LIKE ?';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern);
      countWhereClause += ' AND EXISTS (SELECT 1 FROM users u2 WHERE u2.id = s.following_id AND u2.username LIKE ?)';
      countParams.push(searchPattern);
    }
    
    const following = await execute(`
      SELECT u.id, u.username, u.nickname, u.avatar, u.bio, u.website, u.created_at,
             (SELECT COUNT(*) FROM articles WHERE author_id = u.id) as article_count
      FROM subscriptions s
      JOIN users u ON s.following_id = u.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(pageSize), offset]);
    
    const [countResult] = await execute(
      `SELECT COUNT(*) as total FROM subscriptions ${countWhereClause}`,
      countParams
    );
    
    const usersWithSubscriptionStatus = await Promise.all(following.map(async (followingUser) => {
      let isSubscribed = false;
      if (currentUserId) {
        const [sub] = await execute(
          'SELECT id FROM subscriptions WHERE follower_id = ? AND following_id = ?',
          [currentUserId, followingUser.id]
        );
        isSubscribed = !!sub;
      }
      return { ...followingUser, isSubscribed };
    }));
    
    res.json({
      users: usersWithSubscriptionStatus,
      total: countResult.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取订阅列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
