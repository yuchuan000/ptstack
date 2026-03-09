/**
 * 文章管理路由
 * 处理文章、分类、标签的CRUD操作，以及文章分享和分类申请
 */
import express from 'express'
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
  getCategories,
  getTags,
  createCategory,
  updateCategory,
  deleteCategory,
  shareArticle,
  getUserHotArticles,
  getUserLatestArticles,
  applyCategory,
  getCategoryApplications,
  reviewCategoryApplication,
  updateCategoryOrder,
} from '../controllers/articlesController.js'
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.js'

const router = express.Router()

/**
 * 分类相关路由
 */

/**
 * GET /articles/categories
 * 获取文章分类列表
 */
router.get('/categories', getCategories)

/**
 * POST /articles/categories
 * 创建新的文章分类
 * @requires authMiddleware 身份验证
 */
router.post('/categories', authMiddleware, createCategory)

/**
 * PUT /articles/categories/order
 * 更新分类排序
 * @requires authMiddleware 身份验证
 */
router.put('/categories/order', authMiddleware, updateCategoryOrder)

/**
 * PUT /articles/categories/:id
 * 更新指定分类
 * @requires authMiddleware 身份验证
 */
router.put('/categories/:id', authMiddleware, updateCategory)

/**
 * DELETE /articles/categories/:id
 * 删除指定分类
 * @requires authMiddleware 身份验证
 */
router.delete('/categories/:id', authMiddleware, deleteCategory)

/**
 * POST /articles/categories/apply
 * 申请创建分类
 * @requires authMiddleware 身份验证
 */
router.post('/categories/apply', authMiddleware, applyCategory)

/**
 * GET /articles/categories/applications
 * 获取分类申请列表
 * @requires authMiddleware 身份验证
 */
router.get('/categories/applications', authMiddleware, getCategoryApplications)

/**
 * PUT /articles/categories/applications/:id/review
 * 审核分类申请
 * @requires authMiddleware 身份验证
 */
router.put('/categories/applications/:id/review', authMiddleware, reviewCategoryApplication)

/**
 * GET /articles/tags
 * 获取文章标签列表
 */
router.get('/tags', getTags)

/**
 * GET /articles
 * 获取文章列表
 */
router.get('/', getArticles)

/**
 * GET /articles/my
 * 获取当前用户的文章
 * @requires authMiddleware 身份验证
 */
router.get('/my', authMiddleware, getMyArticles)

/**
 * GET /articles/user/:userId/hot
 * 获取用户热门文章
 */
router.get('/user/:userId/hot', getUserHotArticles)

/**
 * GET /articles/user/:userId/latest
 * 获取用户最新文章
 */
router.get('/user/:userId/latest', getUserLatestArticles)

/**
 * GET /articles/:id
 * 获取指定文章详情
 * @requires optionalAuthMiddleware 可选身份验证
 */
router.get('/:id', optionalAuthMiddleware, getArticleById)

/**
 * POST /articles/:id/share
 * 分享文章
 */
router.post('/:id/share', shareArticle)

/**
 * POST /articles
 * 创建新文章
 * @requires authMiddleware 身份验证
 */
router.post('/', authMiddleware, createArticle)

/**
 * PUT /articles/:id
 * 更新指定文章
 * @requires authMiddleware 身份验证
 */
router.put('/:id', authMiddleware, updateArticle)

/**
 * DELETE /articles/:id
 * 删除指定文章
 * @requires authMiddleware 身份验证
 */
router.delete('/:id', authMiddleware, deleteArticle)

export default router
