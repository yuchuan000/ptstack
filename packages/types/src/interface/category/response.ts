import * as z from 'zod'
import * as Schema from '../../schema/index'

// 数据列表（含分页信息）
export const DataList = z.object({
  ...Schema.Common.Response.shape,
  data: z.object({
    list: z.array(Schema.Category.CategoryDatabase),
    pagination: Schema.Common.ResponsePagination,
  }),
})
export type DataList = z.infer<typeof DataList>

// 单份数据
export const Data = z.object({
  ...Schema.Common.Response.shape,
  data: Schema.Category.CategoryDatabase,
})
export type Data = z.infer<typeof Data>
