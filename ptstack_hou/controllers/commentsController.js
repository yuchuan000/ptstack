import { execute } from '../config/db.js';
import { checkAndGrantAchievements } from '../utils/achievementHelper.js';

const ensureReplyToCommentIdField = async () => {
  try {
    const columns = await execute(`
      SHOW COLUMNS FROM comments LIKE 'reply_to_comment_id'
    `);
    if (columns.length === 0) {
      await execute(`
        ALTER TABLE comments 
        ADD COLUMN reply_to_comment_id INT NULL 
        COMMENT '回复的评论ID' 
        AFTER reply_to_user_id
      `);
    }
  } catch (error) {
    console.log('检查或添加 reply_to_comment_id 字段:', error.message);
  }
};

export const getComments = async (req, res) => {
  await ensureReplyToCommentIdField();
  try {
    const { articleId } = req.params;
    const { 
      page = 1, 
      pageSize = 20, 
      sortBy = 'created_at', 
      order = 'desc' 
    } = req.query;
    const currentUserId = req.user?.id;
    
    // 检查文章是否存在且已发布
    const articles = await execute('SELECT id, status, author_id FROM articles WHERE id = ?', [articleId]);
    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }
    if (articles[0].status === 0 && (!currentUserId || currentUserId !== articles[0].author_id)) {
      return res.status(403).json({ message: '无权访问此文章的评论' });
    }
    
    const offset = (page - 1) * pageSize;
    
    const validSortBy = ['created_at', 'like_count'];
    const validOrder = ['asc', 'desc'];
    const finalSortBy = validSortBy.includes(sortBy) ? sortBy : 'created_at';
    const finalOrder = validOrder.includes(order) ? order : 'desc';
    
    const orderClause = finalSortBy === 'like_count' 
      ? `c.like_count ${finalOrder}, c.created_at DESC`
      : `c.created_at ${finalOrder}`;
    
    const topComments = await execute(`
      SELECT c.*, u.username as user_name, u.nickname as user_nickname, u.avatar as user_avatar, u.is_admin as user_is_admin
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
        SELECT c.*, u.username as user_name, u.nickname as user_nickname, u.avatar as user_avatar, u.is_admin as user_is_admin, ru.username as reply_to_user_name, ru.nickname as reply_to_user_nickname
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
  await ensureReplyToCommentIdField();
  try {
    const { articleId } = req.params;
    const { content, parentId, replyToUserId, replyToCommentId } = req.body;
    const userId = req.user.id;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: '评论内容不能为空' });
    }
    
    // 检查文章是否存在且已发布
    const articles = await execute('SELECT id, status, author_id FROM articles WHERE id = ?', [articleId]);
    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }
    if (articles[0].status === 0) {
      return res.status(403).json({ message: '草稿文章不能评论' });
    }
    
    const currentUser = await execute('SELECT id, nickname, username FROM users WHERE id = ?', [userId]);
    const authorId = articles[0].author_id;
    const trimmedContent = content.trim();
    
    const result = await execute(
      'INSERT INTO comments (article_id, user_id, content, parent_id, reply_to_user_id, reply_to_comment_id) VALUES (?, ?, ?, ?, ?, ?)',
      [articleId, userId, trimmedContent, parentId || null, replyToUserId || null, replyToCommentId || null]
    );
    
    await execute(
      'UPDATE articles SET comment_count = comment_count + 1 WHERE id = ?',
      [articleId]
    );
    
    // 提取 @ 用户
    const mentionPattern = /@(\S+)/g;
    const mentions = [];
    let match;
    while ((match = mentionPattern.exec(trimmedContent)) !== null) {
      mentions.push(match[1]);
    }
    
    // 查找被 @ 的用户
    if (mentions.length > 0) {
      const placeholders = mentions.map(() => '?').join(',');
      const mentionedUsers = await execute(
        `SELECT id, nickname, username FROM users 
         WHERE nickname IN (${placeholders}) OR username IN (${placeholders})`,
        [...mentions, ...mentions]
      );
      
      // 去重并排除自己
      const uniqueUserIds = new Set();
      mentionedUsers.forEach(user => {
        if (user.id !== userId) {
          uniqueUserIds.add(user.id);
        }
      });
      
      // 为每个被 @ 的用户创建通知
      for (const mentionedUserId of uniqueUserIds) {
        await execute(
          `INSERT INTO notifications (user_id, type, content, related_id, is_read) 
           VALUES (?, ?, ?, ?, 0)`,
          [
            mentionedUserId,
            'mention',
            `${currentUser[0].nickname || currentUser[0].username} 在评论中提到了你`,
            result.insertId
          ]
        );
      }
    }
    
    // 给文章作者发送评论通知（如果评论者不是作者自己）
    if (authorId !== userId) {
      await execute(
        `INSERT INTO notifications (user_id, type, content, related_id, is_read) 
         VALUES (?, ?, ?, ?, 0)`,
        [
          authorId,
          'comment',
          `${currentUser[0].nickname || currentUser[0].username} 评论了你的文章`,
          articleId
        ]
      );
    }
    
    // 给被回复的用户发送通知（如果有）
    if (replyToUserId && replyToUserId !== userId && replyToUserId !== authorId) {
      await execute(
        `INSERT INTO notifications (user_id, type, content, related_id, is_read) 
         VALUES (?, ?, ?, ?, 0)`,
        [
          replyToUserId,
          'comment',
          `${currentUser[0].nickname || currentUser[0].username} 回复了你的评论`,
          result.insertId
        ]
      );
    }

    const commentCountResult = await execute(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = ?',
      [userId]
    );
    await checkAndGrantAchievements(userId, 'comment', commentCountResult[0].count);
    
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
