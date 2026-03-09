/**
 * 后端应用主入口文件
 * 负责初始化Express应用、配置中间件、注册路由等
 */
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import logger from 'morgan'
import createError from 'http-errors'
import errorHandler from './middlewares/error-handler.js' // 错误处理中间件
import routes from './config/routes.js' // 路由配置
import swaggerUi from 'swagger-ui-express' // Swagger UI
import swaggerSpec from './config/swagger.js' // Swagger配置

/**
 * 当前文件路径
 */
const __filename = fileURLToPath(import.meta.url)

/**
 * 当前目录路径
 */
const __dirname = path.dirname(__filename)

/**
 * 根据环境选择配置文件
 */
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'

// 加载环境变量
dotenv.config({ path: path.join(__dirname, envFile) })

/**
 * Express应用实例
 */
const app = express()

/**
 * 视图引擎设置
 */
app.set('views', path.join(__dirname, 'views')) // 设置视图目录
app.set('view engine', 'ejs') // 设置视图引擎为EJS

/**
 * 中间件配置
 */
app.use(logger('dev')) // 日志中间件
app.use(express.json()) // JSON解析中间件
app.use(express.urlencoded({ extended: false })) // URL编码解析中间件
app.use(cookieParser()) // Cookie解析中间件

/**
 * 解析CORS源地址列表
 * 支持从环境变量中读取多个地址（逗号分隔）
 */
const corsOriginList = (process.env.CORS_ORIGIN || '*')
  .split(',') // 按逗号分割成数组
  .map((origin) => origin.trim()) // 去除空格（防止手误加空格）

/**
 * 配置CORS：支持多域名白名单
 */
app.use(
  cors({
    // origin设为函数，动态校验请求来源
    origin: (origin, callback) => {
      // 开发环境允许无origin（比如Postman测试）+ 白名单内的地址
      if (!origin || corsOriginList.includes(origin)) {
        callback(null, true) // 允许访问
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`)) // 拒绝访问
      }
    },
    credentials: true, // 支持cookie/token传递
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的HTTP方法
    allowedHeaders: ['Content-Type', 'Authorization', 'Token'], // 允许的请求头
  }),
)

/**
 * 静态文件服务
 */
app.use(express.static(path.join(__dirname, 'public')))

/**
 * 注册路由
 */
app.use(routes)

/**
 * Swagger UI配置
 * 访问路径: /api-docs
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

/**
 * 404错误处理
 * 捕获未匹配的路由，转发给错误处理中间件
 */
app.use((req, res, next) => {
  next(createError(404))
})

/**
 * 错误处理中间件
 */
app.use(errorHandler)

/**
 * 导出Express应用实例
 */
export default app
