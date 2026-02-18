import express from 'express';
import { 
  toggleSubscription, 
  checkSubscription, 
  getUserFollowers, 
  getUserFollowing 
} from '../controllers/subscriptionsController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/:followingId', authMiddleware, toggleSubscription);
router.get('/check/:followingId', authMiddleware, checkSubscription);
router.get('/followers/:userId', optionalAuthMiddleware, getUserFollowers);
router.get('/following/:userId', optionalAuthMiddleware, getUserFollowing);

export default router;
