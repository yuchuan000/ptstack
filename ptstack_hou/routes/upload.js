import express from 'express';
import { upload, uploadAvatar } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 上传头像（需要认证）
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

export default router;
