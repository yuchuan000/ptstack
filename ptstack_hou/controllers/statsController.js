import { execute } from '../config/db.js'

// 统计数据缓存
const statsCache = {
  homeStats: null,
  userStats: null,
  articleStats: null,
  commentStats: null,
  onlineStats: null,
  lastUpdated: 0
}

// 缓存有效期（毫秒）
const CACHE_DURATION = 3600000 // 1小时

// 获取首页数据统计
export const getHomeStats = async (req, res) => {
  try {
    const currentUserLevel = req.user.level

    // 只有等级为1的用户可以查看数据统计
    if (currentUserLevel > 1) {
      return res.status(403).json({ message: '没有权限查看数据统计' })
    }

    // 检查缓存是否有效
    const now = Date.now()
    if (statsCache.homeStats && (now - statsCache.lastUpdated) < CACHE_DURATION) {
      return res.status(200).json(statsCache.homeStats)
    }

    // 获取总用户数
    const [totalUsers] = await execute('SELECT COUNT(*) as count FROM users')

    // 获取今日注册用户数
    const [todayUsers] = await execute(
      'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE(NOW())',
    )

    // 获取总文章数
    const [totalArticles] = await execute('SELECT COUNT(*) as count FROM articles WHERE status = 1')

    // 获取今日发布文章数
    const [todayArticles] = await execute(
      'SELECT COUNT(*) as count FROM articles WHERE status = 1 AND DATE(created_at) = DATE(NOW())',
    )

    // 获取总评论数
    const [totalComments] = await execute('SELECT COUNT(*) as count FROM comments')

    // 获取今日评论数
    const [todayComments] = await execute(
      'SELECT COUNT(*) as count FROM comments WHERE DATE(created_at) = DATE(NOW())',
    )

    // 获取总浏览量
    const [totalViews] = await execute(
      'SELECT COALESCE(SUM(view_count), 0) as count FROM articles WHERE status = 1',
    )

    // 获取用户等级分布
    const userLevelStats = await execute(
      'SELECT level, COUNT(*) as count FROM users GROUP BY level ORDER BY level ASC',
    )

    // 获取最近7天的用户注册趋势
    const userTrend = await execute(
      `
      SELECT date, value as count
      FROM stats
      WHERE metric_type = 'user_growth' AND date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY date ASC
    `,
    )

    // 获取最近7天的文章发布趋势
    const articleTrend = await execute(
      `
      SELECT date, value as count
      FROM stats
      WHERE metric_type = 'article_publishing' AND date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY date ASC
    `,
    )

    // 获取最近7天的评论趋势
    const commentTrend = await execute(
      `
      SELECT date, value as count
      FROM stats
      WHERE metric_type = 'comment_trend' AND date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY date ASC
    `,
    )

    // 获取分类文章数量统计
    const categoryStats = await execute(
      `
      SELECT c.name as category, COUNT(a.id) as count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = 1
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 10
    `,
    )

    const statsData = {
      totalUsers: totalUsers.count,
      todayUsers: todayUsers.count,
      totalArticles: totalArticles.count,
      todayArticles: todayArticles.count,
      totalComments: totalComments.count,
      todayComments: todayComments.count,
      totalViews: totalViews.count,
      userLevelStats,
      userTrend,
      articleTrend,
      commentTrend,
      categoryStats,
    }

    // 更新缓存
    statsCache.homeStats = statsData
    statsCache.lastUpdated = now

    res.status(200).json(statsData)
  } catch (error) {
    console.error('获取首页数据统计失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

// 获取用户统计
export const getUserStats = async (req, res) => {
  try {
    const currentUserLevel = req.user.level

    // 只有等级为1的用户可以查看用户统计
    if (currentUserLevel > 1) {
      return res.status(403).json({ message: '没有权限查看用户统计' })
    }

    // 检查缓存是否有效
    const now = Date.now()
    if (statsCache.userStats && (now - statsCache.lastUpdated) < CACHE_DURATION) {
      return res.status(200).json(statsCache.userStats)
    }

    // 获取用户等级分布
    const levelStats = await execute(
      'SELECT level, COUNT(*) as count FROM users GROUP BY level ORDER BY level ASC',
    )

    // 获取用户注册趋势（最近30天）
    const registerTrend = await execute(
      `
      SELECT date, value as count
      FROM stats
      WHERE metric_type = 'user_growth' AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY date ASC
    `,
    )

    // 获取活跃用户（最近7天有活动）
    const activeUsers = await execute(
      `
      SELECT u.public_id, u.username, u.nickname, u.avatar, COUNT(a.id) as article_count, COUNT(c.id) as comment_count
      FROM users u
      LEFT JOIN articles a ON u.id = a.author_id AND a.status = 1 AND a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      LEFT JOIN comments c ON u.id = c.user_id AND c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY u.id, u.public_id, u.username, u.nickname, u.avatar
      ORDER BY (COUNT(a.id) + COUNT(c.id)) DESC
      LIMIT 10
    `,
    )

    const statsData = {
      levelStats,
      registerTrend,
      activeUsers,
    }

    // 更新缓存
    statsCache.userStats = statsData
    statsCache.lastUpdated = now

    res.status(200).json(statsData)
  } catch (error) {
    console.error('获取用户统计失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

// 获取文章统计
export const getArticleStats = async (req, res) => {
  try {
    const currentUserLevel = req.user.level

    // 只有等级为1的用户可以查看文章统计
    if (currentUserLevel > 1) {
      return res.status(403).json({ message: '没有权限查看文章统计' })
    }

    // 检查缓存是否有效
    const now = Date.now()
    if (statsCache.articleStats && (now - statsCache.lastUpdated) < CACHE_DURATION) {
      return res.status(200).json(statsCache.articleStats)
    }

    // 获取文章状态分布
    const statusStats = await execute(
      'SELECT status, COUNT(*) as count FROM articles GROUP BY status ORDER BY status ASC',
    )

    // 获取文章发布趋势（最近30天）
    const publishTrend = await execute(
      `
      SELECT date, value as count
      FROM stats
      WHERE metric_type = 'article_publishing' AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY date ASC
    `,
    )

    // 获取热门文章（按浏览量）
    const hotArticles = await execute(
      `
      SELECT a.public_id, a.title, a.view_count, a.like_count, a.comment_count, u.username, u.nickname, u.avatar
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.status = 1
      ORDER BY a.view_count DESC
      LIMIT 10
    `,
    )

    // 获取分类文章数量统计
    const categoryStats = await execute(
      `
      SELECT c.name as category, COUNT(a.id) as count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = 1
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `,
    )

    const statsData = {
      statusStats,
      publishTrend,
      hotArticles,
      categoryStats,
    }

    // 更新缓存
    statsCache.articleStats = statsData
    statsCache.lastUpdated = now

    res.status(200).json(statsData)
  } catch (error) {
    console.error('获取文章统计失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

// 获取评论统计
export const getCommentStats = async (req, res) => {
  try {
    const currentUserLevel = req.user.level

    // 只有等级为1的用户可以查看评论统计
    if (currentUserLevel > 1) {
      return res.status(403).json({ message: '没有权限查看评论统计' })
    }

    // 检查缓存是否有效
    const now = Date.now()
    if (statsCache.commentStats && (now - statsCache.lastUpdated) < CACHE_DURATION) {
      return res.status(200).json(statsCache.commentStats)
    }

    // 获取评论趋势（最近30天）
    const commentTrend = await execute(
      `
      SELECT date, value as count
      FROM stats
      WHERE metric_type = 'comment_trend' AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY date ASC
    `,
    )

    // 获取评论活跃用户
    const activeCommenters = await execute(
      `
      SELECT u.public_id, u.username, u.nickname, u.avatar, COUNT(c.id) as comment_count
      FROM users u
      JOIN comments c ON u.id = c.user_id
      WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY u.id, u.public_id, u.username, u.nickname, u.avatar
      ORDER BY comment_count DESC
      LIMIT 10
    `,
    )

    // 获取热门评论文章
    const hotCommentArticles = await execute(
      `
      SELECT a.public_id, a.title, COUNT(c.id) as comment_count, u.username, u.nickname, u.avatar
      FROM articles a
      JOIN users u ON a.author_id = u.id
      LEFT JOIN comments c ON a.id = c.article_id
      WHERE a.status = 1
      GROUP BY a.id, a.public_id, a.title, u.username, u.nickname, u.avatar
      ORDER BY comment_count DESC
      LIMIT 10
    `,
    )

    const statsData = {
      commentTrend,
      activeCommenters,
      hotCommentArticles,
    }

    // 更新缓存
    statsCache.commentStats = statsData
    statsCache.lastUpdated = now

    res.status(200).json(statsData)
  } catch (error) {
    console.error('获取评论统计失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

// 获取在线用户统计
export const getOnlineStats = async (req, res) => {
  try {
    const currentUserLevel = req.user.level

    // 只有等级为1的用户可以查看在线用户统计
    if (currentUserLevel > 1) {
      return res.status(403).json({ message: '没有权限查看在线用户统计' })
    }

    // 检查缓存是否有效
    const now = Date.now()
    if (statsCache.onlineStats && (now - statsCache.lastUpdated) < CACHE_DURATION) {
      return res.status(200).json(statsCache.onlineStats)
    }

    // 获取最近24小时的在线用户数趋势
    const onlineTrend = await execute(
      `
      SELECT CONCAT(date, ' ', LPAD(hour, 2, '0'), ':00') as time, value as count
      FROM stats
      WHERE metric_type = 'online_users' AND date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
      ORDER BY date ASC, hour ASC
    `,
    )

    // 获取当前在线用户数
    const [currentOnline] = await execute(
      `SELECT COUNT(*) as count FROM users WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)`
    )

    const statsData = {
      onlineTrend,
      currentOnline: currentOnline.count,
    }

    // 更新缓存
    statsCache.onlineStats = statsData
    statsCache.lastUpdated = now

    res.status(200).json(statsData)
  } catch (error) {
    console.error('获取在线用户统计失败:', error.message)
    res.status(500).json({ message: '服务器内部错误' })
  }
}
