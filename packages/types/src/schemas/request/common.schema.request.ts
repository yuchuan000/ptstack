import * as z from 'zod'
import * as commonField from '../../fields/common.field'

// 分页器字段
export const Pagination = z.object({
  page: z.coerce.number().pipe(commonField.page).exactOptional(),
  pageSize: z.coerce.number().pipe(commonField.pageSize).exactOptional(),
})
export type Pagination = z.infer<typeof Pagination>

// 工厂函数：数据过滤字段表
export const makeDataFilter = <
  sortField extends z.ZodType,
  status extends z.ZodType,
>(args: {
  sortField: sortField
  status: status
}) =>
  z.object({
    // 排序字段
    sortField: args.sortField.exactOptional(),
    // 排序方式
    sortOrder: commonField.sortOrder.exactOptional(),
    // 状态
    status: args.status.exactOptional(),
    // 删除标志
    isDeleted: z.coerce.number().pipe(commonField.isDeleted).exactOptional(),
  })
