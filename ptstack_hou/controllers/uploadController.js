import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, '../public/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, uniqueSuffix + ext)
  },
})

// 图片文件过滤器
const imageFileFilter = (req, file, cb) => {
  // 只允许图片文件
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件'))
  }
}

// 附件文件过滤器
const attachmentFileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())

  if (extname) {
    return cb(null, true)
  } else {
    cb(new Error('不支持的文件类型'))
  }
}

// 创建图片上传multer实例
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
  fileFilter: imageFileFilter,
})

// 创建附件上传multer实例
export const uploadAttachment = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB限制
  },
  fileFilter: attachmentFileFilter,
})

// 上传头像
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' })
    }

    // 构建访问URL
    const avatarUrl = `/uploads/${req.file.filename}`

    res.status(200).json({
      message: '上传成功',
      url: avatarUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error('上传头像失败:', error.message)
    res.status(500).json({ message: '上传失败，请稍后重试' })
  }
}

// 删除头像文件
export const deleteAvatarFile = (avatarUrl) => {
  try {
    if (!avatarUrl) return

    // 从URL中提取文件名
    const filename = path.basename(avatarUrl)
    const filePath = path.join(uploadsDir, filename)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`删除旧头像文件: ${filename}`)
    }
  } catch (error) {
    console.error('删除头像文件失败:', error.message)
  }
}

// 上传团队成员头像
export const uploadTeamMemberAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' })
    }

    // 构建访问URL
    const avatarUrl = `/uploads/${req.file.filename}`

    res.status(200).json({
      message: '上传成功',
      url: avatarUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error('上传团队成员头像失败:', error.message)
    res.status(500).json({ message: '上传失败，请稍后重试' })
  }
}

// 上传作品集项目图片
export const uploadPortfolioImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' })
    }

    // 构建访问URL
    const imageUrl = `/uploads/${req.file.filename}`

    res.status(200).json({
      message: '上传成功',
      url: imageUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error('上传作品集图片失败:', error.message)
    res.status(500).json({ message: '上传失败，请稍后重试' })
  }
}

// 上传封面图片
export const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' })
    }

    const { originalCoverUrl } = req.body

    // 如果原始封面是本地文件（以/uploads/开头），则删除旧文件
    if (originalCoverUrl && originalCoverUrl.startsWith('/uploads/')) {
      const oldFilename = originalCoverUrl.replace('/uploads/', '')
      const oldFilePath = path.join(uploadsDir, oldFilename)
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
          console.log(`删除旧封面文件: ${oldFilename}`)
        }
      } catch (error) {
        console.error(`删除旧封面文件失败: ${oldFilename}`, error.message)
      }
    }

    // 构建访问URL
    const imageUrl = `/uploads/${req.file.filename}`

    res.status(200).json({
      message: '上传成功',
      url: imageUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error('上传封面图片失败:', error.message)
    res.status(500).json({ message: '上传失败，请稍后重试' })
  }
}

import { execute } from '../config/db.js'

// 上传文章附件
export const uploadArticleAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的文件' })
    }

    const { articleId } = req.body
    if (!articleId) {
      return res.status(400).json({ message: '缺少文章ID' })
    }

    // 检查文章是否存在
    const articles = await execute('SELECT id FROM articles WHERE public_id = ?', [articleId])
    if (articles.length === 0) {
      return res.status(404).json({ message: '文章不存在' })
    }

    const articleIdInt = articles[0].id

    // 构建访问URL
    const attachmentUrl = `/uploads/${req.file.filename}`

    // 保存到数据库
    await execute(
      'INSERT INTO article_attachments (article_id, filename, original_name, url, size) VALUES (?, ?, ?, ?, ?)',
      [articleIdInt, req.file.filename, req.file.originalname, attachmentUrl, req.file.size],
    )

    res.status(200).json({
      message: '上传成功',
      url: attachmentUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    })
  } catch (error) {
    console.error('上传文章附件失败:', error.message)
    res.status(500).json({ message: '上传失败，请稍后重试' })
  }
}
