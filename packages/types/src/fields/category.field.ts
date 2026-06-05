import * as z from 'zod'

// ===================数据库字段=======================
// id
export const id = z.number().min(1)
// 分类名
export const name = z.string()
// 图标url
export const icon = z.union([z.string(), z.string().nullable()])
// 描述
export const description = z.union([z.string(), z.string().nullable()])
// 状态： 0私密/1正常
export const status = z.union([z.literal(0), z.literal(1)])
// 优先级（数字越大越靠前）
export const sort = z.number()

// ====================衍生字段=========================
// 排序字段
export const sortField = z.enum(['createdAt', 'updatedAt', 'sort'])
// 状态字段（含 2全部）
export const statusField = z.union([status, z.literal(2)])
