import * as z from 'zod'

const zc = z.coerce

// ==============SPECIAL==============

// 优先级（数字越大越靠前）
export const priority = zc.number().min(0).max(99)
export type Priority = z.infer<typeof priority>

// 大小
export const size = zc.number().min(0)

// 下载量
export const downloads = zc.number().min(0)

// 引用次数
export const refCount = zc.number().min(0)

// ==============PAGINATION==============

// 当前页码
export const page = zc.number()

// 每页条数
export const pageSize = zc.number()

// 总条数
export const total = zc.number()

// ==============ID==============

// id
export const id = zc.number().min(1)

// id array
export const idArray = z.array(id)

// 分类id
export const categoryId = zc.number()
