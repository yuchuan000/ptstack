import express from 'express';
import { toggleCommentLike, checkCommentLikes } from '../controllers/commentLikesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/:commentId/toggle', authMiddleware, toggleCommentLike);
router.get('/article/:articleId/check', (req, res, next) => {
  if (req.headers.authorization) {
    return authMiddleware(req, res, next);
  }
  req.user = null;
  next();
}, checkCommentLikes);

export default router;
