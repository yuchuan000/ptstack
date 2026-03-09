import express from 'express'
import {
  getHomeStats,
  getUserStats,
  getArticleStats,
  getCommentStats,
  getOnlineStats,
} from '../controllers/statsController.js'
import { auth } from '../middlewares/auth.js'

const router = express.Router()

// 数据统计
router.get('/home', auth, getHomeStats) // 获取首页数据统计
router.get('/users', auth, getUserStats) // 获取用户统计
router.get('/articles', auth, getArticleStats) // 获取文章统计
router.get('/comments', auth, getCommentStats) // 获取评论统计
router.get('/online', auth, getOnlineStats) // 获取在线用户统计

export default router
