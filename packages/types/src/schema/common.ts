import * as z from 'zod'
import * as String from '../field/string'
import * as Number from '../field/number'
import * as Boolean from '../field/boolean'

// 请求分页器
export const RequestPagination = z.object({
  page: Number.page,
  pageSize: Number.pageSize,
})

// 响应分页器
export const ResponsePagination = z.object({
  ...RequestPagination.shape,
  total: Number.total,
})

// 响应
export const Response = z.object({
  status: Boolean.status,
  message: String.message,
})

// 时间
export const Time = z.object({
  createdAt: String.createdAt,
  updatedAt: String.updatedAt,
  deletedAt: String.deletedAt,
})

// one id
export const OneId = z.object({
  id: Number.id,
})

// some id
export const SomeId = z.object({
  id: Number.idArray,
})
