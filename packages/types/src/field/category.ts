import * as z from 'zod'

// ==============ORDER==============

// 排序字段
export const sortField = z.enum(['createdAt', 'updatedAt', 'priority'])
