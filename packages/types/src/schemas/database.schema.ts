import * as z from 'zod'
import * as commonField from '../fields/common.field'
import * as categoryField from '../fields/category.field'

// 分类表
export const CategorySchema = z.object({
  id: categoryField.id,
  name: categoryField.name,
  icon: categoryField.icon,
  description: categoryField.description,
  status: categoryField.status,
  sort: categoryField.sort,
  createdAt: commonField.createdAt,
  updatedAt: commonField.updatedAt,
  deletedAt: commonField.deletedAt,
})
