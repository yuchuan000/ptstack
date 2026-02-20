import { execute } from '../config/db.js';

export const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    const existing = await execute(
      'SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );
    
    if (existing.length === 0) {
      await execute(
        'INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)',
        [commentId, userId]
      );
      await execute(
        'UPDATE comments SET like_count = like_count + 1 WHERE id = ?',
        [commentId]
      );
      const result = await execute('SELECT like_count FROM comments WHERE id = ?', [commentId]);
      res.json({ message: '点赞成功', liked: true, like_count: result[0].like_count });
    } else {
      await execute(
        'DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?',
        [commentId, userId]
      );
      await execute(
        'UPDATE comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?',
        [commentId]
      );
      const result = await execute('SELECT like_count FROM comments WHERE id = ?', [commentId]);
      res.json({ message: '取消点赞成功', liked: false, like_count: result[0].like_count });
    }
  } catch (error) {
    console.error('评论点赞失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const checkCommentLikes = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.json({ likedComments: [] });
    }
    
    // 转换articleId为内部id
    const articles = await execute('SELECT id FROM articles WHERE public_id = ?', [articleId]);
    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }
    
    const internalArticleId = articles[0].id;
    
    const likes = await execute(
      `SELECT cl.comment_id 
       FROM comment_likes cl
       INNER JOIN comments c ON cl.comment_id = c.id
       WHERE c.article_id = ? AND cl.user_id = ?`,
      [internalArticleId, userId]
    );
    
    res.json({ 
      likedComments: likes.map(l => l.comment_id) 
    });
  } catch (error) {
    console.error('检查评论点赞失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
