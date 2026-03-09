/**
 * 关于我们页面配置路由
 * 处理团队成员、联系信息和底部信息的CRUD操作
 */
import express from 'express'
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getContactItems,
  createContactItem,
  updateContactItem,
  deleteContactItem,
  updateContactOrder,
  toggleContactVisibility,
  getFooterItems,
  createFooterItem,
  updateFooterItem,
  deleteFooterItem,
} from '../controllers/aboutController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = express.Router()

/**
 * 团队成员相关路由
 */

/**
 * GET /about/team
 * 获取团队成员列表
 */
router.get('/team', getTeamMembers)

/**
 * POST /about/team
 * 创建新的团队成员
 * @requires authMiddleware 身份验证
 */
router.post('/team', authMiddleware, createTeamMember)

/**
 * PUT /about/team/:id
 * 更新指定团队成员信息
 * @requires authMiddleware 身份验证
 */
router.put('/team/:id', authMiddleware, updateTeamMember)

/**
 * DELETE /about/team/:id
 * 删除指定团队成员
 * @requires authMiddleware 身份验证
 */
router.delete('/team/:id', authMiddleware, deleteTeamMember)

/**
 * 联系信息相关路由
 */

/**
 * GET /about/contact
 * 获取联系信息列表
 */
router.get('/contact', getContactItems)

/**
 * POST /about/contact
 * 创建新的联系信息
 * @requires authMiddleware 身份验证
 */
router.post('/contact', authMiddleware, createContactItem)

/**
 * PUT /about/contact/order
 * 更新联系信息排序
 * @requires authMiddleware 身份验证
 */
router.put('/contact/order', authMiddleware, updateContactOrder)

/**
 * PUT /about/contact/:id/hide
 * 切换联系信息可见性
 * @requires authMiddleware 身份验证
 */
router.put('/contact/:id/hide', authMiddleware, toggleContactVisibility)

/**
 * PUT /about/contact/:id
 * 更新指定联系信息
 * @requires authMiddleware 身份验证
 */
router.put('/contact/:id', authMiddleware, updateContactItem)

/**
 * DELETE /about/contact/:id
 * 删除指定联系信息
 * @requires authMiddleware 身份验证
 */
router.delete('/contact/:id', authMiddleware, deleteContactItem)

/**
 * 底部信息相关路由
 */

/**
 * GET /about/footer
 * 获取底部信息列表
 */
router.get('/footer', getFooterItems)

/**
 * POST /about/footer
 * 创建新的底部信息
 * @requires authMiddleware 身份验证
 */
router.post('/footer', authMiddleware, createFooterItem)

/**
 * PUT /about/footer/:id
 * 更新指定底部信息
 * @requires authMiddleware 身份验证
 */
router.put('/footer/:id', authMiddleware, updateFooterItem)

/**
 * DELETE /about/footer/:id
 * 删除指定底部信息
 * @requires authMiddleware 身份验证
 */
router.delete('/footer/:id', authMiddleware, deleteFooterItem)

export default router
