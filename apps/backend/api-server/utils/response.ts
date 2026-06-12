import { type Response } from 'express'
import { HttpError } from './HttpError'
import { Prisma } from '../generated/prisma/client'

export const success = (
  res: Response,
  message: string,
  data: unknown = 'noData',
  code: number = 200,
) => {
  interface ResData {
    status: boolean
    message: string
    data?: unknown
  }
  const resData: ResData = {
    status: true,
    message,
  }
  // 传数据才增加data字段
  if (data !== 'noData') {
    resData.data = data
  }
  res.status(code).json(resData)
}

interface Params {
  error?: unknown
  message?: string
  code?: number
}

export const failure = (res: Response, params: Params) => {
  let code = params.code || 500
  let message = params.message || '服务器错误'
  if (params.error) {
    // HttpError错误统一响应
    if (params.error instanceof HttpError) {
      code = params.error.code || code
      message = params.error.message || message
    }
    // prisma 报错
    if (params.error instanceof Prisma.PrismaClientKnownRequestError) {
      // 专属报错字段
      if (params.error.code === 'P2002') {
        code = 409
        message = '数据已存在'
      } else if (params.error.code === 'P2025') {
        code = 404
        message = '数据不存在'
      }
    } else if (params.error instanceof Prisma.PrismaClientValidationError) {
      code = 400
      message = '参数错误'
    } else if (params.error instanceof Prisma.PrismaClientUnknownRequestError) {
      code = 500
      message = '数据库操作未知错误'
      console.log(params.error)
      console.log('请检查Prisma的generate文件')
    }
  }
  res.status(code).json({
    status: false,
    message,
  })
}
