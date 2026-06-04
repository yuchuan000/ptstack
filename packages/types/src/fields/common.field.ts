import * as z from 'zod'

// 全局设置为中文提示词
z.config(z.locales.zhCN())

// ==================请求字段===================

// 排序枚举 ASC升序 从小到大  DESC降序 从大到小
export const sortOrder = z.enum(['asc', 'desc'])

// 软删除标志 0未删除 1已删除
export const isDeleted = z.union([z.literal(0), z.literal(1)])

// 当前页码
export const page = z.number()

// 每页条数
export const pageSize = z.number()

// ==================响应字段===================

// 状态
export const status = z.boolean()

// 消息
export const message = z.string()

// 创建时间
export const createdAt = z.iso.datetime()

// 更新时间
export const updatedAt = z.iso.datetime()

// 删除时间
export const deletedAt = z.union([z.iso.datetime(), z.string().nullable()])

// 总页码
export const total = z.number()
