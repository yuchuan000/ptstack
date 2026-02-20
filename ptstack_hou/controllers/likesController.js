import { execute } from '../config/db.js';
import { checkAndGrantAchievements } from '../utils/achievementHelper.js';

export const toggleLike = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;
    
    // 检查文章是否存在且已发布
    const articles = await execute('SELECT id, status FROM articles WHERE public_id = ?', [articleId]);
    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }
    if (articles[0].status === 0) {
      return res.status(403).json({ message: '草稿文章不能点赞' });
    }
    
    const internalArticleId = articles[0].id;
    
    const existing = await execute('SELECT * FROM likes WHERE article_id = ? AND user_id = ?', [internalArticleId, userId]);
    
    if (existing.length === 0) {
      await execute('INSERT INTO likes (article_id, user_id) VALUES (?, ?)', [internalArticleId, userId]);
      await execute('UPDATE articles SET like_count = like_count + 1 WHERE id = ?', [internalArticleId]);
      const result = await execute('SELECT like_count, author_id FROM articles WHERE id = ?', [internalArticleId]);
      
      const likeCountResult = await execute(
        'SELECT COUNT(*) as count FROM likes l JOIN articles a ON l.article_id = a.id WHERE a.author_id = ?',
        [result[0].author_id]
      );
      await checkAndGrantAchievements(result[0].author_id, 'like', likeCountResult[0].count);
      
      res.json({ message: '点赞成功', liked: true, like_count: result[0].like_count });
    } else {
      await execute('DELETE FROM likes WHERE article_id = ? AND user_id = ?', [internalArticleId, userId]);
      await execute('UPDATE articles SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [internalArticleId]);
      const result = await execute('SELECT like_count FROM articles WHERE id = ?', [internalArticleId]);
      res.json({ message: '取消点赞成功', liked: false, like_count: result[0].like_count });
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
    
    // 检查文章是否存在且已发布
    const articles = await execute('SELECT id, status, author_id FROM articles WHERE public_id = ?', [articleId]);
    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }
    if (articles[0].status === 0 && (!userId || userId !== articles[0].author_id)) {
      return res.status(403).json({ message: '无权访问此文章的点赞状态' });
    }
    
    if (!userId) {
      return res.json({ liked: false });
    }
    
    const internalArticleId = articles[0].id;
    
    const existing = await execute('SELECT * FROM likes WHERE article_id = ? AND user_id = ?', [internalArticleId, userId]);
    
    res.json({ liked: existing.length > 0 });
  } catch (error) {
    console.error('检查点赞状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
