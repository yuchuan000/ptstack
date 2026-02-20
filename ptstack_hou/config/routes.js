import express from 'express'
import indexRouter from '../routes/index.js'
import usersRouter from '../routes/users.js'
import authRouter from '../routes/auth.js'
import articlesRouter from '../routes/articles.js'
import commentsRouter from '../routes/comments.js'
import likesRouter from '../routes/likes.js'
import commentLikesRouter from '../routes/commentLikes.js'
import subscriptionsRouter from '../routes/subscriptions.js'
import uploadRouter from '../routes/upload.js'
import notificationsRouter from '../routes/notifications.js'
import announcementsRouter from '../routes/announcements.js'
import achievementsRouter from '../routes/achievements.js'

const router = express.Router()

router.use('/', indexRouter)
router.use('/users', usersRouter)
router.use('/auth', authRouter)
router.use('/articles', articlesRouter)
router.use('/comments', commentsRouter)
router.use('/likes', likesRouter)
router.use('/comment-likes', commentLikesRouter)
router.use('/subscriptions', subscriptionsRouter)
router.use('/upload', uploadRouter)
router.use('/notifications', notificationsRouter)
router.use('/announcements', announcementsRouter)
router.use('/achievements', achievementsRouter)

export default router
