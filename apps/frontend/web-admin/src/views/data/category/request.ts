import { request } from '@ptstack/request'
import type {
  Category,
} from '@ptstack/types/src/schema/common'

// 获取列表
export const getListService = async (
  query?: Category.Request.GetListQuery,
): Promise<Category.Return.List> => {
  const { data } = await request.get('/admin/categories', {
    params: query,
    custom: {
      noMessage: true,
    },
  })
  return data
}

// 获取详情
export const getDetailService = (
  params: Category.Request.GetDetailParams,
): Promise<Category.Return.Data> => {
  return request.get(`/admin/categories/${params.id}`)
}

// 新增
export const addService = (body: Category.Request.AddBody) => {
  return request.post('/admin/categories/', body)
}

// 更新
export const updateService = (
  params: Category.Request.UpdateParams,
  body: Category.Request.UpdateBody,
) => {
  return request.put(`/admin/categories/${params.id}`, body)
}

// 批量移入回收站
export const softDeleteManyService = (
  body: Category.Request.OperateManyBody,
) => {
  return request.patch('/admin/categories/delete', body)
}

// 指定移入回收站
export const softDeleteService = (params: Category.Request.OperateParams) => {
  return request.patch(`/admin/categories/delete/${params.id}`)
}

// 批量移出回收站
export const restoreManyService = (body: Category.Request.OperateManyBody) => {
  return request.patch('/admin/categories/restore', body)
}

// 指定移出回收站
export const restoreService = (params: Category.Request.OperateParams) => {
  return request.patch(`/admin/categories/restore/${params.id}`)
}

// 批量移入回收站
export const deleteManyService = (body: Category.Request.OperateManyBody) => {
  return request.delete('/admin/categories', { data: body })
}

// 指定移入回收站
export const deleteService = (params: Category.Request.OperateParams) => {
  return request.delete(`/admin/categories/${params.id}`)
}
