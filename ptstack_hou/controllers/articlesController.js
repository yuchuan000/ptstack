import { execute } from '../config/db.js';
import { checkAndGrantAchievements } from '../utils/achievementHelper.js';

const ensureShareCountField = async () => {
  try {
    const columns = await execute(`
      SHOW COLUMNS FROM articles LIKE 'share_count'
    `);
    if (columns.length === 0) {
      await execute(`
        ALTER TABLE articles 
        ADD COLUMN share_count INT DEFAULT 0 
        COMMENT '分享次数' 
        AFTER comment_count
      `);
    }
  } catch (error) {
    console.log('检查或添加 share_count 字段:', error.message);
  }
};

export const getArticles = async (req, res) => {
  // 获取文章列表（全部文章）
  try {
    await ensureShareCountField();
    
    const { 
      page = 1, 
      pageSize = 10, 
      category, 
      search,
      sortBy = 'created_at',
      order = 'desc'
    } = req.query;
    const offset = (page - 1) * pageSize;
    
    let whereClause = 'WHERE a.status = 1';
    const params = [];
    
    if (category) {
      whereClause += ' AND a.category_id = ?';
      params.push(category);
    }
    
    if (search) {
      whereClause += ` AND (
        a.title LIKE ? 
        OR a.content LIKE ? 
        OR a.summary LIKE ?
      )`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const validSortBy = ['created_at', 'like_count', 'comment_count', 'view_count', 'share_count'];
    const validOrder = ['asc', 'desc'];
    const finalSortBy = validSortBy.includes(sortBy) ? sortBy : 'created_at';
    const finalOrder = validOrder.includes(order) ? order : 'desc';
    
    const articles = await execute(`
      SELECT a.*, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar, u.is_admin as author_is_admin, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.${finalSortBy} ${finalOrder}, a.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(pageSize), offset]);
    
    const countResult = await execute(`
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `, params);
    
    res.json({
      articles,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getArticleById = async (req, res) => {
  // 获取文章详情，同时增加阅读量
  try {
    await ensureShareCountField();
    const { id } = req.params;
    const currentUserId = req.user?.id;
    
    const articles = await execute(`
      SELECT a.*, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar, u.bio as author_bio, u.is_admin as author_is_admin, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `, [id]);
    
    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }
    
    const article = articles[0];
    
    // 如果是草稿，只有作者可以访问
    if (article.status === 0 && (!currentUserId || currentUserId !== article.author_id)) {
      return res.status(403).json({ message: '无权访问此文章' });
    }
    
    // 只有已发布的文章才增加阅读量
    if (article.status === 1) {
      await execute('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [id]);
    }
    
    const tags = await execute(`
      SELECT t.*
      FROM tags t
      INNER JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `, [id]);
    
    res.json({
      ...articles[0],
      tags: tags.map(t => t.name)
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const createArticle = async (req, res) => {
  // 创建文章（可以是已发布或草稿）
  try {
    const { title, content, summary, cover, category_id, status = 1, tags = [] } = req.body;
    const authorId = req.user.id;
    
    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' });
    }
    
    const result = await execute(
      'INSERT INTO articles (title, content, summary, cover, author_id, category_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content, summary, cover, authorId, category_id, status]
    );
    
    const articleId = result.insertId;
    
    for (const tagName of tags) {
      let tagResult = await execute('SELECT id FROM tags WHERE name = ?', [tagName]);
      let tagId;
      
      if (tagResult.length === 0) {
        const newTag = await execute('INSERT INTO tags (name) VALUES (?)', [tagName]);
        tagId = newTag.insertId;
      } else {
        tagId = tagResult[0].id;
      }
      
      await execute('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)', [articleId, tagId]);
    }

    if (status === 1) {
      const countResult = await execute(
        'SELECT COUNT(*) as count FROM articles WHERE author_id = ? AND status = 1',
        [authorId]
      );
      await checkAndGrantAchievements(authorId, 'article', countResult[0].count);
    }
    
    res.status(201).json({ 
      message: status === 1 ? '文章发布成功' : '草稿保存成功',
      articleId 
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const updateArticle = async (req, res) => {
  // 更新文章（仅限作者）
  try {
    const { id } = req.params;
    const { title, content, summary, cover, category_id, status, tags } = req.body;
    const authorId = req.user.id;
    
    const existingArticles = await execute('SELECT * FROM articles WHERE id = ? AND author_id = ?', [id, authorId]);
    
    if (existingArticles.length === 0) {
      return res.status(404).json({ message: '文章不存在或无权限修改' });
    }
    
    await execute(
      'UPDATE articles SET title = ?, content = ?, summary = ?, cover = ?, category_id = ?, status = ? WHERE id = ?',
      [title, content, summary, cover, category_id, status, id]
    );
    
    if (tags) {
      await execute('DELETE FROM article_tags WHERE article_id = ?', [id]);
      
      for (const tagName of tags) {
        let tagResult = await execute('SELECT id FROM tags WHERE name = ?', [tagName]);
        let tagId;
        
        if (tagResult.length === 0) {
          const newTag = await execute('INSERT INTO tags (name) VALUES (?)', [tagName]);
          tagId = newTag.insertId;
        } else {
          tagId = tagResult[0].id;
        }
        
        await execute('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)', [id, tagId]);
      }
    }
    
    res.json({ message: '文章更新成功' });
  } catch (error) {
    console.error('更新文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const deleteArticle = async (req, res) => {
  // 删除文章（仅限作者）
  try {
    const { id } = req.params;
    const authorId = req.user.id;
    
    const existingArticles = await execute('SELECT * FROM articles WHERE id = ? AND author_id = ?', [id, authorId]);
    
    if (existingArticles.length === 0) {
      return res.status(404).json({ message: '文章不存在或无权限删除' });
    }
    
    await execute('DELETE FROM articles WHERE id = ?', [id]);
    
    res.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getMyArticles = async (req, res) => {
  // 获取当前用户的文章列表
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      status,
      category,
      search,
      sortBy = 'created_at',
      order = 'desc'
    } = req.query;
    const authorId = req.user.id;
    const offset = (page - 1) * pageSize;
    
    let whereClause = 'WHERE a.author_id = ?';
    const params = [authorId];
    
    if (status !== undefined) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }
    
    if (category) {
      whereClause += ' AND a.category_id = ?';
      params.push(category);
    }
    
    if (search) {
      whereClause += ` AND (
        a.title LIKE ? 
        OR a.content LIKE ? 
        OR a.summary LIKE ?
      )`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const validSortBy = ['created_at', 'like_count', 'comment_count', 'view_count', 'share_count'];
    const validOrder = ['asc', 'desc'];
    const finalSortBy = validSortBy.includes(sortBy) ? sortBy : 'created_at';
    const finalOrder = validOrder.includes(order) ? order : 'desc';
    
    const articles = await execute(`
      SELECT a.*, c.name as category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.${finalSortBy} ${finalOrder}, a.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(pageSize), offset]);
    
    const countResult = await execute(`
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `, params);
    
    res.json({
      articles,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取我的文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getCategories = async (req, res) => {
  // 获取所有分类
  try {
    const categories = await execute('SELECT * FROM categories ORDER BY id');
    res.json(categories);
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getTags = async (req, res) => {
  // 获取所有标签及文章数量
  try {
    const tags = await execute('SELECT t.*, COUNT(at.article_id) as article_count FROM tags t LEFT JOIN article_tags at ON t.id = at.tag_id GROUP BY t.id ORDER BY article_count DESC');
    res.json(tags);
  } catch (error) {
    console.error('获取标签失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const createCategory = async (req, res) => {
  // 创建分类（仅管理员）
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.is_admin === 1;
    
    if (!isAdmin) {
      return res.status(403).json({ message: '无权创建分类，请提交申请' });
    }
    
    if (!name) {
      return res.status(400).json({ message: '分类名称不能为空' });
    }
    
    const existing = await execute('SELECT id FROM categories WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ message: '分类名称已存在' });
    }
    
    const result = await execute(
      'INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)',
      [name, description, userId]
    );
    
    res.status(201).json({ 
      message: '分类创建成功', 
      categoryId: result.insertId 
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const applyCategory = async (req, res) => {
  // 申请创建分类（普通用户）
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ message: '分类名称不能为空' });
    }
    
    const existingCategory = await execute('SELECT id FROM categories WHERE name = ?', [name]);
    if (existingCategory.length > 0) {
      return res.status(400).json({ message: '分类已存在' });
    }
    
    const existingApplication = await execute(
      'SELECT id FROM category_applications WHERE name = ? AND status = 0', [name]
    );
    if (existingApplication.length > 0) {
      return res.status(400).json({ message: '该分类已有待审核的申请' });
    }
    
    const result = await execute(
      'INSERT INTO category_applications (user_id, name, description) VALUES (?, ?, ?)',
      [userId, name, description]
    );
    
    res.status(201).json({ 
      message: '分类申请提交成功，请等待审核', 
      applicationId: result.insertId 
    });
  } catch (error) {
    console.error('申请分类失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getCategoryApplications = async (req, res) => {
  // 获取分类申请列表（仅管理员
  try {
    const isAdmin = req.user.is_admin === 1;
    const userId = req.user.id;
    
    let applications;
    if (isAdmin) {
      applications = await execute(`
        SELECT ca.*, u.username, u.nickname, u.avatar, u.is_admin 
        FROM category_applications ca 
        LEFT JOIN users u ON ca.user_id = u.id 
        ORDER BY ca.status ASC, ca.created_at DESC
      `);
    } else {
      applications = await execute(`
        SELECT ca.* 
        FROM category_applications ca 
        WHERE ca.user_id = ? 
        ORDER BY ca.created_at DESC
      `, [userId]);
    }
    
    res.json(applications);
  } catch (error) {
    console.error('获取分类申请失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const reviewCategoryApplication = async (req, res) => {
  // 审核分类申请（仅管理员）
  try {
    const { id } = req.params;
    const { action, review_comment } = req.body;
    const adminId = req.user.id;
    const isAdmin = req.user.is_admin === 1;
    
    if (!isAdmin) {
      return res.status(403).json({ message: '无权审核' });
    }
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: '操作类型错误' });
    }
    
    const applications = await execute('SELECT * FROM category_applications WHERE id = ?', [id]);
    if (applications.length === 0) {
      return res.status(404).json({ message: '申请不存在' });
    }
    
    const application = applications[0];
    
    if (application.status !== 0) {
      return res.status(400).json({ message: '该申请已审核' });
    }
    
    if (action === 'approve') {
      const existing = await execute('SELECT id FROM categories WHERE name = ?', [application.name]);
      if (existing.length > 0) {
        return res.status(400).json({ message: '分类名称已存在' });
      }
      
      const categoryResult = await execute(
        'INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)',
        [application.name, application.description, adminId]
      );
      
      await execute(
        'UPDATE category_applications SET status = 1, reviewed_by = ?, reviewed_at = NOW(), review_comment = ? WHERE id = ?',
        [adminId, review_comment || '审核通过', id]
      );
      
      res.json({ message: '审核通过，分类已创建', categoryId: categoryResult.insertId });
    } else {
      await execute(
        'UPDATE category_applications SET status = 2, reviewed_by = ?, reviewed_at = NOW(), review_comment = ? WHERE id = ?',
        [adminId, review_comment || '审核不通过', id]
      );
      
      res.json({ message: '审核拒绝' });
    }
  } catch (error) {
    console.error('审核分类申请失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const updateCategory = async (req, res) => {
  // 更新分类（仅管理员）
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const isAdmin = req.user.is_admin === 1;
    
    if (!isAdmin) {
      return res.status(403).json({ message: '无权更新分类' });
    }
    
    if (!name) {
      return res.status(400).json({ message: '分类名称不能为空' });
    }
    
    const existing = await execute('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: '分类不存在' });
    }
    
    const duplicate = await execute('SELECT id FROM categories WHERE name = ? AND id != ?', [name, id]);
    if (duplicate.length > 0) {
      return res.status(400).json({ message: '分类名称已存在' });
    }
    
    await execute(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    
    res.json({ message: '分类更新成功' });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const deleteCategory = async (req, res) => {
  // 删除分类（仅管理员，该分类下不能有文章）
  try {
    const { id } = req.params;
    const isAdmin = req.user.is_admin === 1;
    
    if (!isAdmin) {
      return res.status(403).json({ message: '无权删除分类' });
    }
    
    const existing = await execute('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: '分类不存在' });
    }
    
    const articleCount = await execute('SELECT COUNT(*) as count FROM articles WHERE category_id = ?', [id]);
    if (articleCount[0].count > 0) {
      return res.status(400).json({ message: '该分类下还有文章，无法删除' });
    }
    
    await execute('DELETE FROM categories WHERE id = ?', [id]);
    
    res.json({ message: '分类删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const shareArticle = async (req, res) => {
  // 分享文章，增加分享次数
  try {
    await ensureShareCountField();
    const { id } = req.params;
    
    const articles = await execute('SELECT * FROM articles WHERE id = ?', [id]);
    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }
    
    await execute('UPDATE articles SET share_count = share_count + 1 WHERE id = ?', [id]);
    
    const updatedArticles = await execute('SELECT * FROM articles WHERE id = ?', [id]);
    
    res.json({ 
      message: '分享成功', 
      share_count: updatedArticles[0].share_count 
    });
  } catch (error) {
    console.error('分享文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getUserHotArticles = async (req, res) => {
  // 获取用户的热门文章
  try {
    await ensureShareCountField();
    const { userId } = req.params;
    const { excludeId } = req.query;
    
    let whereClause = 'WHERE a.author_id = ? AND a.status = 1';
    const params = [userId];
    
    if (excludeId) {
      whereClause += ' AND a.id != ?';
      params.push(excludeId);
    }
    
    const articles = await execute(`
      SELECT a.*, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar, u.is_admin as author_is_admin, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.like_count DESC, a.view_count DESC, a.share_count DESC
      LIMIT 3
    `, params);
    
    const countResult = await execute(`
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `, params);
    
    res.json({
      articles,
      total: countResult[0].total
    });
  } catch (error) {
    console.error('获取用户热门文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const getUserLatestArticles = async (req, res) => {
  // 获取用户的最新文章
  try {
    await ensureShareCountField();
    const { userId } = req.params;
    const { excludeId } = req.query;
    
    let whereClause = 'WHERE a.author_id = ? AND a.status = 1';
    const params = [userId];
    
    if (excludeId) {
      whereClause += ' AND a.id != ?';
      params.push(excludeId);
    }
    
    const articles = await execute(`
      SELECT a.*, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar, u.is_admin as author_is_admin, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT 3
    `, params);
    
    const countResult = await execute(`
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `, params);
    
    res.json({
      articles,
      total: countResult[0].total
    });
  } catch (error) {
    console.error('获取用户最新文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
