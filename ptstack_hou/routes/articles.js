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
  deleteCategory,
  shareArticle,
  getUserHotArticles,
  getUserLatestArticles,
  applyCategory,
  getCategoryApplications,
  reviewCategoryApplication
} from '../controllers/articlesController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/categories', getCategories);
router.post('/categories', authMiddleware, createCategory);
router.put('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);
router.post('/categories/apply', authMiddleware, applyCategory);
router.get('/categories/applications', authMiddleware, getCategoryApplications);
router.put('/categories/applications/:id/review', authMiddleware, reviewCategoryApplication);
router.get('/tags', getTags);
router.get('/', getArticles);
router.get('/my', authMiddleware, getMyArticles);
router.get('/user/:userId/hot', getUserHotArticles);
router.get('/user/:userId/latest', getUserLatestArticles);
router.get('/:id', optionalAuthMiddleware, getArticleById);
router.post('/:id/share', shareArticle);
router.post('/', authMiddleware, createArticle);
router.put('/:id', authMiddleware, updateArticle);
router.delete('/:id', authMiddleware, deleteArticle);

export default router;
