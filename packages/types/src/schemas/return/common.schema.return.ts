import * as z from 'zod'
import * as commonField from '../../fields/common.field'

export const Base = z.object({
  status: commonField.status,
  message: commonField.message,
})
export type Base = z.infer<typeof Base>

// 分页器字段
export const Pagination = z.object({
  page: commonField.page,
  pageSize: commonField.pageSize,
  total: commonField.page,
})

// 工厂函数
export const makeReturnFormat = <T>(data: T) =>
  z.object({
    ...Base.shape,
    data,
  })
