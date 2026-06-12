import * as z from 'zod'
import * as Schema from '../../schema/index'
import * as Field from '../../field/index'

// 获取列表请求参数
export const GetListSchema = {
  query: z.object({
    ...Schema.Common.RequestPagination.shape,
    sortField: Field.Category.sortField,
    sortOrder: Field.String.sortOrder,
    status: Field.String.statusAll,
    isDeleted: Field.Boolean.isDeleted,
  }),
}
export type GetListQuery = z.infer<typeof GetListSchema.query>

// 获取详情请求参数
export const GetDetailSchema = {
  params: Schema.Common.OneId,
}
export type GetDetailParams = z.infer<typeof GetDetailSchema.params>

// 新增请求参数
export const AddSchema = {
  body: Schema.Category.CategoryInput,
}
export type AddBody = z.infer<typeof AddSchema.body>

// 更新请求参数
export const UpdateSchema = {
  params: Schema.Common.OneId,
  body: Schema.Category.CategoryInputOptional,
}
export type UpdateParams = z.infer<typeof UpdateSchema.params>
export type UpdateBody = z.infer<typeof UpdateSchema.body>

/**
 * 批量操作请求参数
 * 适用于：批量软删除、恢复、彻底删除
 */
export const OperateManySchema = {
  body: Schema.Common.SomeId,
}
export type OperateManyBody = z.infer<typeof OperateManySchema.body>

/**
 * 指定操作请求参数
 * 适用于：指定软删除、恢复、彻底删除
 */
export const OperateSchema = {
  params: Schema.Common.OneId,
}
export type OperateParams = z.infer<typeof OperateSchema.params>
