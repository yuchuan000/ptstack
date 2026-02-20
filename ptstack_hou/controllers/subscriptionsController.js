import { execute } from '../config/db.js';
import { checkAndGrantAchievements } from '../utils/achievementHelper.js';

export const toggleSubscription = async (req, res) => {
  try {
    const { followingId } = req.params;
    const followerId = req.user.id;
    
    // 转换followingId为内部id
    const [followingUser] = await execute('SELECT id FROM users WHERE public_id = ?', [followingId]);
    if (!followingUser) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const internalFollowingId = followingUser.id;
    
    if (internalFollowingId === followerId) {
      return res.status(400).json({ message: '不能订阅自己' });
    }
    
    const [existing] = await execute(
      'SELECT * FROM subscriptions WHERE follower_id = ? AND following_id = ?',
      [followerId, internalFollowingId]
    );
    
    if (existing) {
      await execute(
        'DELETE FROM subscriptions WHERE follower_id = ? AND following_id = ?',
        [followerId, internalFollowingId]
      );
      
      await execute(
        'UPDATE users SET follower_count = follower_count - 1 WHERE id = ?',
        [internalFollowingId]
      );
      await execute(
        'UPDATE users SET following_count = following_count - 1 WHERE id = ?',
        [followerId]
      );
      
      res.json({ message: '已取消订阅', isSubscribed: false });
    } else {
      await execute(
        'INSERT INTO subscriptions (follower_id, following_id) VALUES (?, ?)',
        [followerId, internalFollowingId]
      );
      
      await execute(
        'UPDATE users SET follower_count = follower_count + 1 WHERE id = ?',
        [internalFollowingId]
      );
      await execute(
        'UPDATE users SET following_count = following_count + 1 WHERE id = ?',
        [followerId]
      );

      const followingCountResult = await execute(
        'SELECT COUNT(*) as count FROM subscriptions WHERE follower_id = ?',
        [followerId]
      );
      await checkAndGrantAchievements(followerId, 'follow', followingCountResult[0].count);

      const followerCountResult = await execute(
        'SELECT COUNT(*) as count FROM subscriptions WHERE following_id = ?',
        [internalFollowingId]
      );
      await checkAndGrantAchievements(internalFollowingId, 'follower', followerCountResult[0].count);
      
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
    
    // 转换followingId为内部id
    const [followingUser] = await execute('SELECT id FROM users WHERE public_id = ?', [followingId]);
    if (!followingUser) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const internalFollowingId = followingUser.id;
    
    const [existing] = await execute(
      'SELECT * FROM subscriptions WHERE follower_id = ? AND following_id = ?',
      [followerId, internalFollowingId]
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
    
    // 转换userId为内部id
    const [user] = await execute('SELECT id FROM users WHERE public_id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const internalUserId = user.id;
    
    let whereClause = 'WHERE s.following_id = ?';
    let queryParams = [internalUserId];
    let countWhereClause = 'WHERE following_id = ?';
    let countParams = [internalUserId];
    
    if (search) {
      whereClause += ' AND u.username LIKE ?';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern);
      countWhereClause += ' AND EXISTS (SELECT 1 FROM users u2 WHERE u2.id = s.follower_id AND u2.username LIKE ?)';
      countParams.push(searchPattern);
    }
    
    const followers = await execute(`
      SELECT u.public_id as id, u.username, u.nickname, u.avatar, u.bio, u.created_at, u.is_admin,
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
        const [followerUser] = await execute('SELECT id FROM users WHERE public_id = ?', [follower.id]);
        if (followerUser) {
          const [sub] = await execute(
            'SELECT id FROM subscriptions WHERE follower_id = ? AND following_id = ?',
            [currentUserId, followerUser.id]
          );
          isSubscribed = !!sub;
        }
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
    
    // 转换userId为内部id
    const [user] = await execute('SELECT id FROM users WHERE public_id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const internalUserId = user.id;
    
    let whereClause = 'WHERE s.follower_id = ?';
    let queryParams = [internalUserId];
    let countWhereClause = 'WHERE follower_id = ?';
    let countParams = [internalUserId];
    
    if (search) {
      whereClause += ' AND u.username LIKE ?';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern);
      countWhereClause += ' AND EXISTS (SELECT 1 FROM users u2 WHERE u2.id = s.following_id AND u2.username LIKE ?)';
      countParams.push(searchPattern);
    }
    
    const following = await execute(`
      SELECT u.public_id as id, u.username, u.nickname, u.avatar, u.bio, u.created_at, u.is_admin,
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
        const [followingUserInternal] = await execute('SELECT id FROM users WHERE public_id = ?', [followingUser.id]);
        if (followingUserInternal) {
          const [sub] = await execute(
            'SELECT id FROM subscriptions WHERE follower_id = ? AND following_id = ?',
            [currentUserId, followingUserInternal.id]
          );
          isSubscribed = !!sub;
        }
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
