import express from 'express';
import { toggleLike, checkLike } from '../controllers/likesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/:articleId/toggle', authMiddleware, toggleLike);
router.get('/:articleId/check', (req, res, next) => {
  if (req.headers.authorization) {
    return authMiddleware(req, res, next);
  }
  req.user = null;
  next();
}, checkLike);

export default router;
