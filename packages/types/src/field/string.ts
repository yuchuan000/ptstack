import * as z from 'zod'

// 全局设置为中文提示词
z.config(z.locales.zhCN())

// ==============SPECIAL==============

// 名称
export const name = z.string()

// 标题
export const title = z.string()

// 描述
export const description = z.string()

// 摘要
export const summary = z.string()

// 正文
export const content = z.string()

// 消息
export const message = z.string()

// 文件类型
export const type = z.enum(['image', 'document', 'video', 'audio', 'other'])

// ==============TIME==============

// 创建时间
export const createdAt = z.iso.datetime()

// 更新时间
export const updatedAt = z.iso.datetime()

// 删除时间
export const deletedAt = z.union([z.iso.datetime(), z.string().nullable()])

// ==============STATUS==============

// 状态
export const status = z.enum(['private', 'public'])

// 状态（含草稿）
export const statusDraft = z.enum(['private', 'public', 'draft'])

// 含全部的状态
export const statusAll = z.union([status, z.enum(['all'])])
export type StatusAll = z.infer<typeof statusAll>

// 含全部的状态（含草稿）
export const statusDraftAll = z.union([status, z.enum(['all'])])
export type statusDraftAll = z.infer<typeof statusDraftAll>

// ==============URL==============

// 图标
export const icon = z.url()

// 链接
export const Url = z.url()

// 封面
export const cover = z.url()

// ==============ORDER==============

// 排序方式 ASC升序 从小到大  DESC降序 从大到小
export const sortOrder = z.enum(['asc', 'desc'])
