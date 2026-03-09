/**
 * 路由配置文件
 * 集中注册所有API路由
 */
import express from 'express'
// 导入各个模块的路由
import indexRouter from '../routes/index.js' // 首页路由
import usersRouter from '../routes/users.js' // 用户相关路由
import authRouter from '../routes/auth.js' // 认证相关路由
import articlesRouter from '../routes/articles.js' // 文章相关路由
import commentsRouter from '../routes/comments.js' // 评论相关路由
import likesRouter from '../routes/likes.js' // 点赞相关路由
import commentLikesRouter from '../routes/commentLikes.js' // 评论点赞相关路由
import subscriptionsRouter from '../routes/subscriptions.js' // 订阅相关路由
import uploadRouter from '../routes/upload.js' // 上传相关路由
import notificationsRouter from '../routes/notifications.js' // 通知相关路由
import announcementsRouter from '../routes/announcements.js' // 公告相关路由
import aiRouter from '../routes/ai.js' // AI相关路由
import aiConfigRouter from '../routes/aiConfig.js' // AI配置相关路由
import aboutRouter from '../routes/about.js' // 关于相关路由

import statsRouter from '../routes/stats.js' // 统计相关路由

// 创建路由实例
const router = express.Router()

// 注册路由
router.use('/', indexRouter) // 首页路由
router.use('/users', usersRouter) // 用户相关路由
router.use('/auth', authRouter) // 认证相关路由
router.use('/articles', articlesRouter) // 文章相关路由
router.use('/comments', commentsRouter) // 评论相关路由
router.use('/likes', likesRouter) // 点赞相关路由
router.use('/comment-likes', commentLikesRouter) // 评论点赞相关路由
router.use('/subscriptions', subscriptionsRouter) // 订阅相关路由
router.use('/upload', uploadRouter) // 上传相关路由
router.use('/notifications', notificationsRouter) // 通知相关路由
router.use('/announcements', announcementsRouter) // 公告相关路由
router.use('/ai', aiRouter) // AI相关路由
router.use('/ai-config', aiConfigRouter) // AI配置相关路由
router.use('/about', aboutRouter) // 关于相关路由
router.use('/stats', statsRouter) // 统计相关路由

export default router
