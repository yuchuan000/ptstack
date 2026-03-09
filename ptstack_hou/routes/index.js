/**
 * 首页路由
 * 处理首页相关的路由
 */
import express from 'express'
import { getIndex } from '../controllers/indexController.js'

/**
 * 路由实例
 */
const router = express.Router()

/**
 * GET 首页
 * @route GET /
 * @description 获取首页页面
 * @returns {void}
 */
router.get('/', getIndex)

export default router
