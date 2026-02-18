import express from 'express';
import { 
  getArticles, 
  getArticleById, 
  createArticle, 
  updateArticle, 
  deleteArticle,
  getMyArticles,
  getCategories,
  getTags,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/articlesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/categories', getCategories);
router.post('/categories', authMiddleware, createCategory);
router.put('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);
router.get('/tags', getTags);
router.get('/', getArticles);
router.get('/my', authMiddleware, getMyArticles);
router.get('/:id', getArticleById);
router.post('/', authMiddleware, createArticle);
router.put('/:id', authMiddleware, updateArticle);
router.delete('/:id', authMiddleware, deleteArticle);

export default router;
