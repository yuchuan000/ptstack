import { execute } from '../config/db.js';

export const toggleLike = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;
    
    const existing = await execute('SELECT * FROM likes WHERE article_id = ? AND user_id = ?', [articleId, userId]);
    
    if (existing.length === 0) {
      await execute('INSERT INTO likes (article_id, user_id) VALUES (?, ?)', [articleId, userId]);
      await execute('UPDATE articles SET like_count = like_count + 1 WHERE id = ?', [articleId]);
      res.json({ message: '点赞成功', liked: true });
    } else {
      await execute('DELETE FROM likes WHERE article_id = ? AND user_id = ?', [articleId, userId]);
      await execute('UPDATE articles SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [articleId]);
      res.json({ message: '取消点赞成功', liked: false });
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const checkLike = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.json({ liked: false });
    }
    
    const existing = await execute('SELECT * FROM likes WHERE article_id = ? AND user_id = ?', [articleId, userId]);
    
    res.json({ liked: existing.length > 0 });
  } catch (error) {
    console.error('检查点赞状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
