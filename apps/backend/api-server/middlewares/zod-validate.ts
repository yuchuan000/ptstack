import type { Request, Response, NextFunction } from 'express'
import * as z from 'zod'
import { failure } from '../utils/response'

export interface Schema {
  params?: z.ZodType
  query?: z.ZodType
  body?: z.ZodType
}

declare global {
  namespace Express {
    interface Request {
      validated?: {
        params?: unknown
        query?: unknown
        body?: unknown
      }
    }
  }
}

export const validate =
  (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
    // 没有 schema 直接放行
    if (!schema) return next()

    // 只遍历已知的三个字段，类型安全，避开 for...in 问题
    const sources: Array<keyof Schema> = ['params', 'query', 'body']

    for (const key of sources) {
      const zodSchema = schema[key]
      if (!zodSchema) continue

      // 对应 req 的位置
      const data = req[key]
      const result = zodSchema.safeParse(data)

      // 校验失败：直接返回 400，中断请求
      if (!result.success) {
        return failure(res, {
          message: z.prettifyError(result.error),
          code: 400,
        })
      }

      // 把校验后的数据（自动转化）写回 req（后续路由用 req.validated）
      ;(req as any).validated = {
        ...(req as any).validated,
        [key]: result.data,
      }
    }

    // 全部校验通过
    next()
  }
