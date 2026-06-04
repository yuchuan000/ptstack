import * as z from 'zod'
import * as categoryField from '../../fields/category.field'
import * as commonSchema from './common.schema.request'

// 数据过滤字段表
const DataFilter = commonSchema.makeDataFilter({
  sortField: categoryField.sortField,
  status: z.coerce.number().pipe(categoryField.statusField),
})

// 获取列表请求参数
export const GetListSchema = {
  query: z.object({
    ...commonSchema.Pagination.shape,
    ...DataFilter.shape,
  }),
}
export type GetListQuery = z.infer<typeof GetListSchema.query>

// 获取详情请求参数
export const GetDetailSchema = {
  params: z.object({
    id: z.coerce.number().pipe(categoryField.id),
  }),
}
export type GetDetailParams = z.infer<typeof GetDetailSchema.params>

// 新增请求参数
export const AddSchema = {
  body: z.object({
    name: categoryField.name,
    icon: categoryField.icon.exactOptional(),
    description: categoryField.description.exactOptional(),
    status: z.coerce.number().pipe(categoryField.status).exactOptional(),
    sort: z.coerce.number().pipe(categoryField.sort).exactOptional(),
  }),
}
export type AddBody = z.infer<typeof AddSchema.body>

// 更新请求参数
export const UpdateSchema = {
  params: z.object({
    id: z.coerce.number().pipe(categoryField.id),
  }),
  body: z.object({
    name: categoryField.name.exactOptional(),
    icon: categoryField.icon.exactOptional(),
    description: categoryField.description.exactOptional(),
    status: z.coerce.number().pipe(categoryField.status).exactOptional(),
    sort: z.coerce.number().pipe(categoryField.sort).exactOptional(),
  }),
}
export type UpdateParams = z.infer<typeof UpdateSchema.params>
export type UpdateBody = z.infer<typeof UpdateSchema.body>

/**
 * 批量操作请求参数
 * 适用于：批量软删除、恢复、彻底删除
 */
export const OperateManySchema = {
  body: z.object({
    id: z.array(z.coerce.number().pipe(categoryField.id)),
  }),
}
export type OperateManyBody = z.infer<typeof OperateManySchema.body>

/**
 * 指定操作请求参数
 * 适用于：指定软删除、恢复、彻底删除
 */
export const OperateSchema = {
  params: z.object({
    id: z.coerce.number().pipe(categoryField.id),
  }),
}
export type OperateParams = z.infer<typeof OperateSchema.params>
