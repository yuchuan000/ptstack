import express from 'express'
import indexRouter from '../routes/index.js'
import usersRouter from '../routes/users.js'
import authRouter from '../routes/auth.js'

const router = express.Router()

router.use('/', indexRouter)
router.use('/users', usersRouter)
router.use('/auth', authRouter)

export default router
