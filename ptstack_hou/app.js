import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import logger from 'morgan'
import createError from 'http-errors'
import errorHandler from './middlewares/error-handler.js'
import routes from './config/routes.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载对应环境的.env文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: path.join(__dirname, envFile) })

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// 核心修改：解析.env里的多地址（逗号分隔）
const corsOriginList = (process.env.CORS_ORIGIN || '*')
  .split(',') // 按逗号分割成数组
  .map(origin => origin.trim()) // 去除空格（防止手误加空格）

// 配置CORS：支持多域名白名单
app.use(cors({
  // origin设为函数，动态校验请求来源
  origin: (origin, callback) => {
    // 开发环境允许无origin（比如Postman测试）+ 白名单内的地址
    if (!origin || corsOriginList.includes(origin)) {
      callback(null, true) // 允许访问
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`)) // 拒绝访问
    }
  },
  credentials: true, // 仍支持cookie/token传递
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Token']
}))

app.use(express.static(path.join(__dirname, 'public')))

// routes
app.use(routes)

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use(errorHandler)

export default app