// 文章相关API服务
import request from '@/utils/request'

/**
 * 获取文章列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number|string} params.category - 分类ID
 * @param {string} params.search - 搜索关键词
 * @param {string} params.sortBy - 排序字段（created_at/like_count/comment_count/view_count）
 * @param {string} params.order - 排序顺序（asc/desc）
 * @returns {Promise<{articles: Array, total: number, page: number, pageSize: number}>}
 */
export function getArticles(params) {
  return request({
    url: '/articles',
    method: 'get',
    params
  })
}

/**
 * 根据ID获取文章详情（会增加阅读量）
 * @param {number|string} id - 文章ID
 * @returns {Promise<{id: number, title: string, content: string, summary: string, cover: string, author_id: number, author_name: string, category_id: number, category_name: string, status: number, view_count: number, like_count: number, comment_count: number, created_at: string, tags: Array<string>}>}
 */
export function getArticleById(id) {
  return request({
    url: `/articles/${id}`,
    method: 'get'
  })
}

/**
 * 创建新文章
 * @param {object} data - 文章数据
 * @param {string} data.title - 文章标题
 * @param {string} data.content - 文章内容
 * @param {string} data.summary - 文章摘要
 * @param {string} data.cover - 封面图片
 * @param {number} data.category_id - 分类ID
 * @param {number} data.status - 状态（0草稿/1已发布）
 * @param {Array<string>} data.tags - 标签列表
 * @returns {Promise<{message: string, articleId: number}>}
 */
export function createArticle(data) {
  return request({
    url: '/articles',
    method: 'post',
    data
  })
}

/**
 * 更新文章
 * @param {number|string} id - 文章ID
 * @param {object} data - 文章数据
 * @param {string} data.title - 文章标题
 * @param {string} data.content - 文章内容
 * @param {string} data.summary - 文章摘要
 * @param {string} data.cover - 封面图片
 * @param {number} data.category_id - 分类ID
 * @param {number} data.status - 状态（0草稿/1已发布）
 * @param {Array<string>} data.tags - 标签列表
 * @returns {Promise<{message: string}>}
 */
export function updateArticle(id, data) {
  return request({
    url: `/articles/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除文章
 * @param {number|string} id - 文章ID
 * @returns {Promise<{message: string}>}
 */
export function deleteArticle(id) {
  return request({
    url: `/articles/${id}`,
    method: 'delete'
  })
}

/**
 * 获取我的文章列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.status - 状态（0草稿/1已发布）
 * @param {number|string} params.category - 分类ID
 * @param {string} params.search - 搜索关键词
 * @param {string} params.sortBy - 排序字段
 * @param {string} params.order - 排序顺序
 * @returns {Promise<{articles: Array, total: number, page: number, pageSize: number}>}
 */
export function getMyArticles(params) {
  return request({
    url: '/articles/my',
    method: 'get',
    params
  })
}

/**
 * 获取分类列表
 * @returns {Promise<Array<{id: number, name: string, description: string}>>}
 */
export function getCategories() {
  return request({
    url: '/articles/categories',
    method: 'get'
  })
}

/**
 * 获取标签列表
 * @returns {Promise<Array<{id: number, name: string, article_count: number}>>}
 */
export function getTags() {
  return request({
    url: '/articles/tags',
    method: 'get'
  })
}

/**
 * 创建分类
 * @param {object} data - 分类数据
 * @param {string} data.name - 分类名称
 * @param {string} data.description - 分类描述
 * @returns {Promise<{message: string, categoryId: number}>}
 */
export function createCategory(data) {
  return request({
    url: '/articles/categories',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 * @param {number|string} id - 分类ID
 * @param {object} data - 分类数据
 * @param {string} data.name - 分类名称
 * @param {string} data.description - 分类描述
 * @returns {Promise<{message: string}>}
 */
export function updateCategory(id, data) {
  return request({
    url: `/articles/categories/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除分类（该分类下不能有文章）
 * @param {number|string} id - 分类ID
 * @returns {Promise<{message: string}>}
 */
export function deleteCategory(id) {
  return request({
    url: `/articles/categories/${id}`,
    method: 'delete'
  })
}

/**
 * 申请创建分类
 * @param {object} data - 分类数据
 * @param {string} data.name - 分类名称
 * @param {string} data.description - 分类描述
 * @returns {Promise<{message: string, applicationId: number}>}
 */
export function applyCategory(data) {
  return request({
    url: '/articles/categories/apply',
    method: 'post',
    data
  })
}

/**
 * 获取分类申请列表
 * @returns {Promise<Array>}
 */
export function getCategoryApplications() {
  return request({
    url: '/articles/categories/applications',
    method: 'get'
  })
}

/**
 * 审核分类申请
 * @param {number|string} id - 申请ID
 * @param {object} data - 审核数据
 * @param {string} data.action - 操作类型 approve/reject
 * @param {string} data.review_comment - 审核意见
 * @returns {Promise<{message: string}>}
 */
export function reviewCategoryApplication(id, data) {
  return request({
    url: `/articles/categories/applications/${id}/review`,
    method: 'put',
    data
  })
}

/**
 * 获取文章评论列表
 * @param {number|string} articleId - 文章ID
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.sortBy - 排序字段（created_at/like_count）
 * @param {string} params.order - 排序顺序（asc/desc）
 * @returns {Promise<{comments: Array, total: number, page: number, pageSize: number}>}
 */
export function getComments(articleId, params) {
  return request({
    url: `/comments/${articleId}`,
    method: 'get',
    params
  })
}

/**
 * 创建评论
 * @param {number|string} articleId - 文章ID
 * @param {object} data - 评论数据
 * @param {string} data.content - 评论内容
 * @param {number} data.parentId - 父评论ID（回复时使用）
 * @param {number} data.replyToUserId - 回复的用户ID
 * @returns {Promise<{message: string, commentId: number}>}
 */
export function createComment(articleId, data) {
  return request({
    url: `/comments/${articleId}`,
    method: 'post',
    data
  })
}

/**
 * 删除评论
 * @param {number|string} id - 评论ID
 * @returns {Promise<{message: string}>}
 */
export function deleteComment(id) {
  return request({
    url: `/comments/${id}`,
    method: 'delete'
  })
}

/**
 * 切换文章点赞状态
 * @param {number|string} articleId - 文章ID
 * @returns {Promise<{message: string, liked: boolean}>}
 */
export function toggleLike(articleId) {
  return request({
    url: `/likes/${articleId}/toggle`,
    method: 'post'
  })
}

/**
 * 检查是否已点赞文章
 * @param {number|string} articleId - 文章ID
 * @returns {Promise<{liked: boolean}>}
 */
export function checkLike(articleId) {
  return request({
    url: `/likes/${articleId}/check`,
    method: 'get'
  })
}

/**
 * 切换评论点赞状态
 * @param {number|string} commentId - 评论ID
 * @returns {Promise<{message: string, liked: boolean}>}
 */
export function toggleCommentLike(commentId) {
  return request({
    url: `/comment-likes/${commentId}/toggle`,
    method: 'post'
  })
}

/**
 * 检查文章下的评论点赞状态
 * @param {number|string} articleId - 文章ID
 * @returns {Promise<{likedComments: Array<number>}>}
 */
export function checkCommentLikes(articleId) {
  return request({
    url: `/comment-likes/article/${articleId}/check`,
    method: 'get'
  })
}

/**
 * 分享文章
 * @param {number|string} articleId - 文章ID
 * @returns {Promise<{message: string, share_count: number}>}
 */
export function shareArticle(articleId) {
  return request({
    url: `/articles/${articleId}/share`,
    method: 'post'
  })
}

/**
 * 获取用户的热门文章
 * @param {number|string} userId - 用户ID
 * @param {object} params - 查询参数
 * @param {number|string} params.excludeId - 排除的文章ID
 * @returns {Promise<{articles: Array, total: number}>}
 */
export function getUserHotArticles(userId, params) {
  return request({
    url: `/articles/user/${userId}/hot`,
    method: 'get',
    params
  })
}

/**
 * 获取用户的最新文章
 * @param {number|string} userId - 用户ID
 * @param {object} params - 查询参数
 * @param {number|string} params.excludeId - 排除的文章ID
 * @returns {Promise<{articles: Array, total: number}>}
 */
export function getUserLatestArticles(userId, params) {
  return request({
    url: `/articles/user/${userId}/latest`,
    method: 'get',
    params
  })
}
