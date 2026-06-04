import * as z from 'zod'
import * as commonSchema from './common.schema.return'
import { CategorySchema } from '../database.schema'

// 列表
export const List = commonSchema.makeReturnFormat(
  z.object({
    list: z.array(CategorySchema),
    pagination: commonSchema.Pagination,
  }),
)
export type List = z.infer<typeof List>

// 含数据
export const Data = commonSchema.makeReturnFormat(CategorySchema)
export type Data = z.infer<typeof Data>
