import * as z from 'zod'
import * as String from '../field/string'
import * as Number from '../field/number'
import * as Common from './common'
// 分类可输入字段表
export const CategoryInput = z.object({
  name: String.name,
  icon: String.icon,
  description: String.description,
  priority: Number.priority,
  status: String.status,
})
export type CategoryInput = z.infer<typeof CategoryInput>

// 分类可输入字段表（可选）
export const CategoryInputOptional = z.object({
  name: String.name.exactOptional(),
  icon: String.icon.exactOptional(),
  description: String.description.exactOptional(),
  priority: Number.priority.exactOptional(),
  status: String.status.exactOptional(),
})
export type CategoryInputOptional = z.infer<typeof CategoryInputOptional>

// 分类完整字段表
export const CategoryDatabase = z.object({
  id: Number.id,
  ...CategoryInput.shape,
  ...Common.Time.shape,
})
export type CategoryDatabase = z.infer<typeof CategoryDatabase>
