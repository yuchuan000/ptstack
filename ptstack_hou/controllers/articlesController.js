import { execute, pool } from '../config/db.js'
import { generateArticleId } from '../utils/idGenerator.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, '../public/uploads')

const ensureShareCountField = async () => {
  try {
    const columns = await execute(`
      SHOW COLUMNS FROM articles LIKE 'share_count'
    `)
    if (columns.length === 0) {
      await execute(`
        ALTER TABLE articles 
        ADD COLUMN share_count INT DEFAULT 0 
        COMMENT '分享次数' 
        AFTER comment_count
      `)
    }
  } catch (error) {
    console.log('检查或添加 share_count 字段:', error.message)
  }
}

export const getArticles = async (req, res) => {
  try {
    await ensureShareCountField()

    const {
      page = 1,
      pageSize = 10,
      category,
      search,
      sortBy = 'created_at',
      order = 'desc',
    } = req.query
    const offset = (page - 1) * pageSize
    const currentUserId = req.user?.id

    let whereClause = 'WHERE a.status = 1'
    const params = []

    if (currentUserId) {
      whereClause = `WHERE (a.status = 1 OR (a.status = 2 AND a.author_id = ?))`
      params.push(currentUserId)
    }

    if (category) {
      whereClause += ' AND a.category_id = ?'
      params.push(category)
    }

    if (search) {
      whereClause += ` AND (
        a.title LIKE ? 
        OR a.content LIKE ? 
        OR a.summary LIKE ?
      )`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const validSortBy = ['created_at', 'like_count', 'comment_count', 'view_count', 'share_count']
    const validOrder = ['asc', 'desc']
    const finalSortBy = validSortBy.includes(sortBy) ? sortBy : 'created_at'
    const finalOrder = validOrder.includes(order) ? order : 'desc'

    const articles = await execute(
      `
      SELECT a.*, u.public_id as author_id, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar, u.show_avatar_badge as author_show_avatar_badge, u.avatar_badge as author_avatar_badge, u.avatar_badge_bg_color as author_avatar_badge_bg_color, u.avatar_badge_text_color as author_avatar_badge_text_color, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.${finalSortBy} ${finalOrder}, a.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(pageSize), offset],
    )

    const countResult = await execute(
      `
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `,
      params,
    )

    const processedArticles = articles.map((article) => {
      const processed = {
        ...article,
        id: article.public_id,
      }
      delete processed.public_id
      return processed
    })

    res.json({
      articles: processedArticles,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getArticleById = async (req, res) => {
  try {
    await ensureShareCountField()
    const { id } = req.params
    const currentUserId = req.user?.id

    const articles = await execute(
      `
      SELECT a.*, a.author_id as original_author_id, u.public_id as author_id, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar, u.bio as author_bio, u.show_avatar_badge as author_show_avatar_badge, u.avatar_badge as author_avatar_badge, u.avatar_badge_bg_color as author_avatar_badge_bg_color, u.avatar_badge_text_color as author_avatar_badge_text_color, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.public_id = ?
    `,
      [id],
    )

    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' })
    }

    const article = articles[0]

    if (article.status === 0 && (!currentUserId || currentUserId !== article.original_author_id)) {
      return res.status(403).json({ message: '无权访问此文章' })
    }

    if (article.status === 2 && (!currentUserId || currentUserId !== article.original_author_id)) {
      return res.status(403).json({ message: '无权访问此私密文章' })
    }

    if (article.status === 1) {
      await execute('UPDATE articles SET view_count = view_count + 1 WHERE public_id = ?', [id])
    }

    const tags = await execute(
      `
      SELECT t.*
      FROM tags t
      INNER JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `,
      [article.id],
    )

    const attachments = await execute(
      `
      SELECT *
      FROM article_attachments
      WHERE article_id = ?
      ORDER BY created_at DESC
    `,
      [article.id],
    )

    const resultArticle = {
      ...article,
      id: article.public_id,
    }
    delete resultArticle.public_id

    res.json({
      ...resultArticle,
      tags: tags.map((t) => t.name),
      attachments: attachments.map((attach) => ({
        id: attach.id,
        filename: attach.filename,
        originalName: attach.original_name,
        url: attach.url,
        size: attach.size,
        createdAt: attach.created_at,
      })),
    })
  } catch (error) {
    console.error('获取文章详情失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const createArticle = async (req, res) => {
  try {
    const { title, content, summary, cover, category_id, status = 1, tags = [] } = req.body
    const authorId = req.user.id

    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' })
    }

    if (!category_id) {
      return res.status(400).json({ message: '请选择文章分类' })
    }

    const publicId = generateArticleId()

    const result = await execute(
      'INSERT INTO articles (public_id, title, content, summary, cover, author_id, category_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [publicId, title, content, summary, cover, authorId, category_id, status],
    )

    const articleId = result.insertId

    for (const tagName of tags) {
      let tagResult = await execute('SELECT id FROM tags WHERE name = ?', [tagName])
      let tagId

      if (tagResult.length === 0) {
        const newTag = await execute('INSERT INTO tags (name) VALUES (?)', [tagName])
        tagId = newTag.insertId
      } else {
        tagId = tagResult[0].id
      }

      await execute('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)', [
        articleId,
        tagId,
      ])
    }

    res.status(201).json({
      message: status === 0 ? '草稿保存成功' : status === 2 ? '私密文章创建成功' : '文章发布成功',
      articleId: publicId,
    })
  } catch (error) {
    console.error('创建文章失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, summary, cover, category_id, status, tags } = req.body
    const authorId = req.user.id

    if (!category_id) {
      return res.status(400).json({ message: '请选择文章分类' })
    }

    const existingArticles = await execute(
      'SELECT * FROM articles WHERE public_id = ? AND author_id = ?',
      [id, authorId],
    )

    if (existingArticles.length === 0) {
      return res.status(404).json({ message: '文章不存在或无权限修改' })
    }

    const article = existingArticles[0]

    await execute(
      'UPDATE articles SET title = ?, content = ?, summary = ?, cover = ?, category_id = ?, status = ? WHERE public_id = ?',
      [title, content, summary, cover, category_id, status, id],
    )

    if (tags) {
      await execute('DELETE FROM article_tags WHERE article_id = ?', [article.id])

      for (const tagName of tags) {
        let tagResult = await execute('SELECT id FROM tags WHERE name = ?', [tagName])
        let tagId

        if (tagResult.length === 0) {
          const newTag = await execute('INSERT INTO tags (name) VALUES (?)', [tagName])
          tagId = newTag.insertId
        } else {
          tagId = tagResult[0].id
        }

        await execute('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)', [
          article.id,
          tagId,
        ])
      }
    }

    res.json({ message: '文章更新成功' })
  } catch (error) {
    console.error('更新文章失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params
    const authorId = req.user.id

    const existingArticles = await execute(
      'SELECT * FROM articles WHERE public_id = ? AND author_id = ?',
      [id, authorId],
    )

    if (existingArticles.length === 0) {
      return res.status(404).json({ message: '文章不存在或无权限删除' })
    }

    const article = existingArticles[0]

    // 获取文章的附件列表
    const attachments = await execute('SELECT * FROM article_attachments WHERE article_id = ?', [
      article.id,
    ])

    // 删除附件文件
    for (const attachment of attachments) {
      if (attachment.filename) {
        const filePath = path.join(uploadsDir, attachment.filename)
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            console.log(`删除附件文件: ${attachment.filename}`)
          }
        } catch (error) {
          console.error(`删除附件文件失败: ${attachment.filename}`, error.message)
        }
      }
    }

    // 删除数据库中的附件记录
    await execute('DELETE FROM article_attachments WHERE article_id = ?', [article.id])

    // 删除文章
    await execute('DELETE FROM articles WHERE public_id = ?', [id])

    res.json({ message: '文章删除成功' })
  } catch (error) {
    console.error('删除文章失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getMyArticles = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      category,
      search,
      sortBy = 'created_at',
      order = 'desc',
    } = req.query
    const authorId = req.user.id
    const offset = (page - 1) * pageSize

    let whereClause = 'WHERE a.author_id = ?'
    const params = [authorId]

    if (status !== undefined) {
      whereClause += ' AND a.status = ?'
      params.push(status)
    }

    if (category) {
      whereClause += ' AND a.category_id = ?'
      params.push(category)
    }

    if (search) {
      whereClause += ` AND (
        a.title LIKE ? 
        OR a.content LIKE ? 
        OR a.summary LIKE ?
      )`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const validSortBy = ['created_at', 'like_count', 'comment_count', 'view_count', 'share_count']
    const validOrder = ['asc', 'desc']
    const finalSortBy = validSortBy.includes(sortBy) ? sortBy : 'created_at'
    const finalOrder = validOrder.includes(order) ? order : 'desc'

    const articles = await execute(
      `
      SELECT a.*, c.name as category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.${finalSortBy} ${finalOrder}, a.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(pageSize), offset],
    )

    const countResult = await execute(
      `
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `,
      params,
    )

    const processedArticles = articles.map((article) => {
      const processed = {
        ...article,
        id: article.public_id,
      }
      delete processed.public_id
      return processed
    })

    res.json({
      articles: processedArticles,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    })
  } catch (error) {
    console.error('获取我的文章失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getCategories = async (req, res) => {
  try {
    const categories = await execute(
      'SELECT c.*, COUNT(a.id) as article_count FROM categories c LEFT JOIN articles a ON c.id = a.category_id AND a.status = 1 GROUP BY c.id ORDER BY c.`order`, c.id',
    )
    res.json(categories)
  } catch (error) {
    console.error('获取分类失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getTags = async (req, res) => {
  // 获取所有标签及文章数量
  try {
    const tags = await execute(
      'SELECT t.*, COUNT(at.article_id) as article_count FROM tags t LEFT JOIN article_tags at ON t.id = at.tag_id GROUP BY t.id ORDER BY article_count DESC',
    )
    res.json(tags)
  } catch (error) {
    console.error('获取标签失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const createCategory = async (req, res) => {
  // 创建分类（仅管理员）
  try {
    const { name, description } = req.body
    const userId = req.user.id

    // 检查用户权限
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      userId,
    ])
    const permissionSet = new Set(permissions.map((p) => p.permission))

    // 一级用户或有category_manage权限的用户可以创建分类
    const canCreateCategory = req.user.level === 1 || permissionSet.has('category_manage')

    if (!canCreateCategory) {
      return res.status(403).json({ message: '无权创建分类，请提交申请' })
    }

    if (!name) {
      return res.status(400).json({ message: '分类名称不能为空' })
    }

    const existing = await execute('SELECT id FROM categories WHERE name = ?', [name])
    if (existing.length > 0) {
      return res.status(400).json({ message: '分类名称已存在' })
    }

    const result = await execute(
      'INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)',
      [name, description, userId],
    )

    res.status(201).json({
      message: '分类创建成功',
      categoryId: result.insertId,
    })
  } catch (error) {
    console.error('创建分类失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const applyCategory = async (req, res) => {
  // 申请创建分类（普通用户）
  try {
    const { name, description } = req.body
    const userId = req.user.id

    if (!name) {
      return res.status(400).json({ message: '分类名称不能为空' })
    }

    const existingCategory = await execute('SELECT id FROM categories WHERE name = ?', [name])
    if (existingCategory.length > 0) {
      return res.status(400).json({ message: '分类已存在' })
    }

    const existingApplication = await execute(
      'SELECT id FROM category_applications WHERE name = ? AND status = 0',
      [name],
    )
    if (existingApplication.length > 0) {
      return res.status(400).json({ message: '该分类已有待审核的申请' })
    }

    const result = await execute(
      'INSERT INTO category_applications (user_id, name, description) VALUES (?, ?, ?)',
      [userId, name, description],
    )

    const applicant = await execute('SELECT id, nickname, username FROM users WHERE id = ?', [
      userId,
    ])
    const applicantName = applicant[0]?.nickname || applicant[0]?.username || '用户'

    const admins = await execute(
      'SELECT id, email, nickname, username FROM users WHERE level <= 2 AND email IS NOT NULL AND email != ""',
    )

    for (const admin of admins) {
      try {
        await execute(
          `INSERT INTO notifications (user_id, type, content, related_id, is_read) 
           VALUES (?, ?, ?, ?, 0)`,
          [
            admin.id,
            'category_application',
            `${applicantName} 申请创建新分类：${name}`,
            result.insertId,
          ],
        )
      } catch (notificationError) {
        console.error('给管理员发送通知失败:', notificationError.message)
      }
    }

    res.status(201).json({
      message: '分类申请提交成功，请等待审核',
      applicationId: result.insertId,
    })
  } catch (error) {
    console.error('申请分类失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getCategoryApplications = async (req, res) => {
  // 获取分类申请列表（仅管理员）
  try {
    const userId = req.user.id

    // 检查用户权限
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      userId,
    ])
    const permissionSet = new Set(permissions.map((p) => p.permission))

    // 一级用户或有category_manage权限的用户可以查看所有申请
    const canViewAllApplications = req.user.level === 1 || permissionSet.has('category_manage')

    let applications
    if (canViewAllApplications) {
      applications = await execute(`
        SELECT ca.*, u.public_id, u.username, u.nickname, u.avatar, u.show_avatar_badge, u.avatar_badge, u.avatar_badge_bg_color, u.avatar_badge_text_color 
        FROM category_applications ca 
        LEFT JOIN users u ON ca.user_id = u.id 
        ORDER BY ca.status ASC, ca.created_at DESC
      `)
    } else {
      applications = await execute(
        `
        SELECT ca.* 
        FROM category_applications ca 
        WHERE ca.user_id = ? 
        ORDER BY ca.created_at DESC
      `,
        [userId],
      )
    }

    res.json(applications)
  } catch (error) {
    console.error('获取分类申请失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const reviewCategoryApplication = async (req, res) => {
  // 审核分类申请（仅管理员）
  try {
    const { id } = req.params
    const { action, review_comment } = req.body
    const adminId = req.user.id

    // 检查用户权限
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      adminId,
    ])
    const permissionSet = new Set(permissions.map((p) => p.permission))

    // 一级用户或有category_manage权限的用户可以审核申请
    const canReviewApplications = req.user.level === 1 || permissionSet.has('category_manage')

    if (!canReviewApplications) {
      return res.status(403).json({ message: '无权审核' })
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: '操作类型错误' })
    }

    const applications = await execute('SELECT * FROM category_applications WHERE id = ?', [id])
    if (applications.length === 0) {
      return res.status(404).json({ message: '申请不存在' })
    }

    const application = applications[0]

    if (application.status !== 0) {
      return res.status(400).json({ message: '该申请已审核' })
    }

    if (action === 'approve') {
      const existing = await execute('SELECT id FROM categories WHERE name = ?', [application.name])
      if (existing.length > 0) {
        return res.status(400).json({ message: '分类名称已存在' })
      }

      const categoryResult = await execute(
        'INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)',
        [application.name, application.description, adminId],
      )

      await execute(
        'UPDATE category_applications SET status = 1, reviewed_by = ?, reviewed_at = NOW(), review_comment = ? WHERE id = ?',
        [adminId, review_comment || '审核通过', id],
      )

      const applicant = await execute(
        'SELECT id, email, nickname, username FROM users WHERE id = ?',
        [application.user_id],
      )
      if (applicant.length > 0) {
        const user = applicant[0]
        try {
          await execute(
            `INSERT INTO notifications (user_id, type, content, related_id, is_read) 
             VALUES (?, ?, ?, ?, 0)`,
            [
              user.id,
              'category_review',
              `您申请的分类「${application.name}」已审核通过`,
              categoryResult.insertId,
            ],
          )
        } catch (notificationError) {
          console.error('给申请者发送通知失败:', notificationError.message)
        }
      }

      res.json({ message: '审核通过，分类已创建', categoryId: categoryResult.insertId })
    } else {
      await execute(
        'UPDATE category_applications SET status = 2, reviewed_by = ?, reviewed_at = NOW(), review_comment = ? WHERE id = ?',
        [adminId, review_comment || '审核不通过', id],
      )

      const applicant = await execute(
        'SELECT id, email, nickname, username FROM users WHERE id = ?',
        [application.user_id],
      )
      if (applicant.length > 0) {
        const user = applicant[0]
        try {
          await execute(
            `INSERT INTO notifications (user_id, type, content, related_id, is_read) 
             VALUES (?, ?, ?, ?, 0)`,
            [
              user.id,
              'category_review',
              `您申请的分类「${application.name}」审核未通过`,
              application.id,
            ],
          )
        } catch (notificationError) {
          console.error('给申请者发送通知失败:', notificationError.message)
        }
      }

      res.json({ message: '审核拒绝' })
    }
  } catch (error) {
    console.error('审核分类申请失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const updateCategory = async (req, res) => {
  // 更新分类（仅管理员）
  try {
    const { id } = req.params
    const { name, description } = req.body
    const userId = req.user.id

    // 检查用户权限
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      userId,
    ])
    const permissionSet = new Set(permissions.map((p) => p.permission))

    // 一级用户或有category_manage权限的用户可以更新分类
    const canUpdateCategory = req.user.level === 1 || permissionSet.has('category_manage')

    if (!canUpdateCategory) {
      return res.status(403).json({ message: '无权更新分类' })
    }

    if (!name) {
      return res.status(400).json({ message: '分类名称不能为空' })
    }

    const existing = await execute('SELECT id FROM categories WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '分类不存在' })
    }

    const duplicate = await execute('SELECT id FROM categories WHERE name = ? AND id != ?', [
      name,
      id,
    ])
    if (duplicate.length > 0) {
      return res.status(400).json({ message: '分类名称已存在' })
    }

    await execute('UPDATE categories SET name = ?, description = ? WHERE id = ?', [
      name,
      description,
      id,
    ])

    res.json({ message: '分类更新成功' })
  } catch (error) {
    console.error('更新分类失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const deleteCategory = async (req, res) => {
  // 删除分类（仅管理员，该分类下不能有文章）
  try {
    const { id } = req.params
    const userId = req.user.id

    // 检查用户权限
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      userId,
    ])
    const permissionSet = new Set(permissions.map((p) => p.permission))

    // 一级用户或有category_manage权限的用户可以删除分类
    const canDeleteCategory = req.user.level === 1 || permissionSet.has('category_manage')

    if (!canDeleteCategory) {
      return res.status(403).json({ message: '无权删除分类' })
    }

    const existing = await execute('SELECT id FROM categories WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: '分类不存在' })
    }

    const articleCount = await execute(
      'SELECT COUNT(*) as count FROM articles WHERE category_id = ?',
      [id],
    )
    if (articleCount[0].count > 0) {
      return res.status(400).json({ message: '该分类下还有文章，无法删除' })
    }

    await execute('DELETE FROM categories WHERE id = ?', [id])

    res.json({ message: '分类删除成功' })
  } catch (error) {
    console.error('删除分类失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const updateCategoryOrder = async (req, res) => {
  // 更新分类排序（仅管理员）
  try {
    const { categoryIds } = req.body

    console.log('收到排序请求:', { categoryIds, user: req.user })

    // 检查是否有用户信息
    if (!req.user) {
      console.log('错误: 未登录')
      return res.status(401).json({ message: '未登录' })
    }

    // 检查用户权限
    const userId = req.user.id
    const permissions = await execute('SELECT permission FROM user_permissions WHERE user_id = ?', [
      userId,
    ])
    const permissionSet = new Set(permissions.map((p) => p.permission))

    // 一级用户或有category_manage权限的用户可以更新分类排序
    const canUpdateCategoryOrder = req.user.level === 1 || permissionSet.has('category_manage')

    if (!canUpdateCategoryOrder) {
      console.log(
        '错误: 无权更新分类排序, level:',
        req.user.level,
        'permissions:',
        Array.from(permissionSet),
      )
      return res.status(403).json({ message: '无权更新分类排序' })
    }

    if (!Array.isArray(categoryIds)) {
      console.log('错误: 分类ID列表必须是数组, 实际类型:', typeof categoryIds)
      return res.status(400).json({ message: '分类ID列表必须是数组' })
    }

    if (categoryIds.length === 0) {
      console.log('错误: 分类ID列表不能为空')
      return res.status(400).json({ message: '分类ID列表不能为空' })
    }

    // 开启事务
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      for (let i = 0; i < categoryIds.length; i++) {
        console.log(`更新分类 ${categoryIds[i]} 的排序为 ${i}`)
        await connection.execute('UPDATE categories SET `order` = ? WHERE id = ?', [
          i,
          categoryIds[i],
        ])
      }
      await connection.commit()
      console.log('分类排序更新成功')
      res.json({ message: '分类排序更新成功' })
    } catch (error) {
      await connection.rollback()
      console.error('事务执行失败:', error)
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('更新分类排序失败:', error)
    res.status(500).json({ message: '服务器内部错误: ' + error.message })
  }
}

export const shareArticle = async (req, res) => {
  try {
    await ensureShareCountField()
    const { id } = req.params

    const articles = await execute('SELECT * FROM articles WHERE public_id = ?', [id])
    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' })
    }

    await execute('UPDATE articles SET share_count = share_count + 1 WHERE public_id = ?', [id])

    const updatedArticles = await execute('SELECT * FROM articles WHERE public_id = ?', [id])

    const resultArticle = {
      ...updatedArticles[0],
      id: updatedArticles[0].public_id,
    }
    delete resultArticle.public_id

    res.json({
      message: '分享成功',
      share_count: resultArticle.share_count,
    })
  } catch (error) {
    console.error('分享文章失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getUserHotArticles = async (req, res) => {
  try {
    await ensureShareCountField()
    const { userId } = req.params
    const { excludeId } = req.query

    const users = await execute('SELECT id FROM users WHERE public_id = ?', [userId])
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    const authorId = users[0].id

    let whereClause = 'WHERE a.author_id = ? AND a.status = 1'
    const params = [authorId]

    if (excludeId) {
      whereClause += ' AND a.public_id != ?'
      params.push(excludeId)
    }

    const articles = await execute(
      `
      SELECT a.*, u.public_id as author_id, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar, u.show_avatar_badge as author_show_avatar_badge, u.avatar_badge as author_avatar_badge, u.avatar_badge_bg_color as author_avatar_badge_bg_color, u.avatar_badge_text_color as author_avatar_badge_text_color, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.like_count DESC, a.view_count DESC, a.share_count DESC
      LIMIT 3
    `,
      params,
    )

    const countResult = await execute(
      `
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `,
      params,
    )

    const processedArticles = articles.map((article) => {
      const processed = {
        ...article,
        id: article.public_id,
      }
      delete processed.public_id
      return processed
    })

    res.json({
      articles: processedArticles,
      total: countResult[0].total,
    })
  } catch (error) {
    console.error('获取用户热门文章失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

export const getUserLatestArticles = async (req, res) => {
  try {
    await ensureShareCountField()
    const { userId } = req.params
    const { excludeId } = req.query

    const users = await execute('SELECT id FROM users WHERE public_id = ?', [userId])
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    const authorId = users[0].id

    let whereClause = 'WHERE a.author_id = ? AND a.status = 1'
    const params = [authorId]

    if (excludeId) {
      whereClause += ' AND a.public_id != ?'
      params.push(excludeId)
    }

    const articles = await execute(
      `
      SELECT a.*, u.public_id as author_id, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar, u.show_avatar_badge as author_show_avatar_badge, u.avatar_badge as author_avatar_badge, u.avatar_badge_bg_color as author_avatar_badge_bg_color, u.avatar_badge_text_color as author_avatar_badge_text_color, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT 3
    `,
      params,
    )

    const countResult = await execute(
      `
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `,
      params,
    )

    const processedArticles = articles.map((article) => {
      const processed = {
        ...article,
        id: article.public_id,
      }
      delete processed.public_id
      return processed
    })

    res.json({
      articles: processedArticles,
      total: countResult[0].total,
    })
  } catch (error) {
    console.error('获取用户最新文章失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}
