/**
 * 用户关注相关路由
 * 处理用户的关注/取消关注、检查关注状态和获取关注列表
 */
import express from 'express'
import {
  toggleSubscription,
  checkSubscription,
  getUserFollowers,
  getUserFollowing,
} from '../controllers/subscriptionsController.js'
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.js'

const router = express.Router()

/**
 * POST /subscriptions/:followingId
 * 切换关注状态
 * @requires authMiddleware 身份验证
 */
router.post('/:followingId', authMiddleware, toggleSubscription)

/**
 * GET /subscriptions/check/:followingId
 * 检查关注状态
 * @requires authMiddleware 身份验证
 */
router.get('/check/:followingId', authMiddleware, checkSubscription)

/**
 * GET /subscriptions/followers/:userId
 * 获取用户的粉丝列表
 * @requires optionalAuthMiddleware 可选身份验证
 */
router.get('/followers/:userId', optionalAuthMiddleware, getUserFollowers)

/**
 * GET /subscriptions/following/:userId
 * 获取用户关注的人列表
 * @requires optionalAuthMiddleware 可选身份验证
 */
router.get('/following/:userId', optionalAuthMiddleware, getUserFollowing)

export default router
