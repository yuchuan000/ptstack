import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只允许图片文件
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'));
  }
};

// 创建multer实例
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB限制
  },
  fileFilter: fileFilter
});

// 上传头像
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' });
    }

    // 构建访问URL
    const avatarUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      message: '上传成功',
      url: avatarUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('上传头像失败:', error.message);
    res.status(500).json({ message: '上传失败，请稍后重试' });
  }
};
