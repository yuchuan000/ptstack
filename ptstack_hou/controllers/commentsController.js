import { execute } from '../config/db.js';

export const getComments = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { 
      page = 1, 
      pageSize = 20, 
      sortBy = 'created_at', 
      order = 'desc' 
    } = req.query;
    
    const offset = (page - 1) * pageSize;
    
    const validSortBy = ['created_at', 'like_count'];
    const validOrder = ['asc', 'desc'];
    const finalSortBy = validSortBy.includes(sortBy) ? sortBy : 'created_at';
    const finalOrder = validOrder.includes(order) ? order : 'desc';
    
    const orderClause = finalSortBy === 'like_count' 
      ? `c.like_count ${finalOrder}, c.created_at DESC`
      : `c.created_at ${finalOrder}`;
    
    const topComments = await execute(`
      SELECT c.*, u.username as user_name, u.avatar as user_avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ? AND (c.parent_id IS NULL OR c.parent_id = 0)
      ORDER BY ${orderClause}
      LIMIT ? OFFSET ?
    `, [articleId, parseInt(pageSize), offset]);
    
    const commentIds = topComments.map(c => c.id);
    
    let replies = [];
    if (commentIds.length > 0) {
      const placeholders = commentIds.map(() => '?').join(',');
      replies = await execute(`
        SELECT c.*, u.username as user_name, u.avatar as user_avatar, ru.username as reply_to_user_name
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN users ru ON c.reply_to_user_id = ru.id
        WHERE c.parent_id IN (${placeholders})
        ORDER BY c.created_at ASC
      `, commentIds);
    }
    
    const countResult = await execute(`
      SELECT COUNT(*) as total
      FROM comments
      WHERE article_id = ?
    `, [articleId]);
    
    const comments = topComments.map(comment => ({
      ...comment,
      replies: replies.filter(reply => reply.parent_id === comment.id)
    }));
    
    res.json({
      comments,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content, parentId, replyToUserId } = req.body;
    const userId = req.user.id;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: '评论内容不能为空' });
    }
    
    const result = await execute(
      'INSERT INTO comments (article_id, user_id, content, parent_id, reply_to_user_id) VALUES (?, ?, ?, ?, ?)',
      [articleId, userId, content.trim(), parentId || null, replyToUserId || null]
    );
    
    await execute(
      'UPDATE articles SET comment_count = comment_count + 1 WHERE id = ?',
      [articleId]
    );
    
    res.status(201).json({ 
      message: '评论创建成功', 
      commentId: result.insertId 
    });
  } catch (error) {
    console.error('创建评论失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const existing = await execute('SELECT * FROM comments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: '评论不存在' });
    }
    
    if (existing[0].user_id !== userId) {
      return res.status(403).json({ message: '无权限删除该评论' });
    }
    
    const articleId = existing[0].article_id;
    
    await execute('DELETE FROM comments WHERE id = ?', [id]);
    
    await execute(
      'UPDATE articles SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ?',
      [articleId]
    );
    
    res.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
