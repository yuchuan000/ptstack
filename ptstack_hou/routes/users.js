/**
 * 用户相关路由
 * 处理用户列表、个人资料、推荐用户、动态 feed 和管理员操作
 */
import express from 'express'
import {
  getUsers,
  getProfile,
  getUserPublicProfile,
  updateProfile,
  getUserArticles,
  getUserComments,
  getRecommendedUsers,
  getFeed,
  getUnreadCount,
  getAllUsersAdmin,
  getUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  createUserAdmin,
} from '../controllers/usersController.js'
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.js'

const router = express.Router()

/**
 * GET /users
 * 获取用户列表
 */
router.get('/', getUsers)

/**
 * GET /users/profile
 * 获取当前用户个人资料
 * @requires authMiddleware 身份验证
 */
router.get('/profile', authMiddleware, getProfile)

/**
 * GET /users/recommended
 * 获取推荐用户
 * @requires optionalAuthMiddleware 可选身份验证
 */
router.get('/recommended', optionalAuthMiddleware, getRecommendedUsers)

/**
 * GET /users/feed
 * 获取用户动态 feed
 * @requires authMiddleware 身份验证
 */
router.get('/feed', authMiddleware, getFeed)

/**
 * GET /users/unread-count
 * 获取未读消息数量
 * @requires authMiddleware 身份验证
 */
router.get('/unread-count', authMiddleware, getUnreadCount)

/**
 * 管理员相关路由
 */

/**
 * GET /users/admin/all
 * 获取所有用户（管理员）
 * @requires authMiddleware 身份验证
 */
router.get('/admin/all', authMiddleware, getAllUsersAdmin)

/**
 * GET /users/admin/:id
 * 获取指定用户详情（管理员）
 * @requires authMiddleware 身份验证
 */
router.get('/admin/:id', authMiddleware, getUserAdmin)

/**
 * PUT /users/admin/:id
 * 更新指定用户信息（管理员）
 * @requires authMiddleware 身份验证
 */
router.put('/admin/:id', authMiddleware, updateUserAdmin)

/**
 * DELETE /users/admin/:id
 * 删除指定用户（管理员）
 * @requires authMiddleware 身份验证
 */
router.delete('/admin/:id', authMiddleware, deleteUserAdmin)

/**
 * POST /users/admin
 * 创建用户（管理员）
 * @requires authMiddleware 身份验证
 */
router.post('/admin', authMiddleware, createUserAdmin)

/**
 * GET /users/:userId
 * 获取用户公开资料
 * @requires optionalAuthMiddleware 可选身份验证
 */
router.get('/:userId', optionalAuthMiddleware, getUserPublicProfile)

/**
 * PUT /users/profile
 * 更新当前用户个人资料
 * @requires authMiddleware 身份验证
 */
router.put('/profile', authMiddleware, updateProfile)

/**
 * GET /users/:userId/articles
 * 获取用户文章列表
 * @requires optionalAuthMiddleware 可选身份验证
 */
router.get('/:userId/articles', optionalAuthMiddleware, getUserArticles)

/**
 * GET /users/:userId/comments
 * 获取用户评论列表
 * @requires optionalAuthMiddleware 可选身份验证
 */
router.get('/:userId/comments', optionalAuthMiddleware, getUserComments)

export default router
