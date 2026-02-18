import express from 'express';
import { 
  getComments, 
  createComment, 
  deleteComment 
} from '../controllers/commentsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/:articleId', getComments);
router.post('/:articleId', authMiddleware, createComment);
router.delete('/:id', authMiddleware, deleteComment);

export default router;
