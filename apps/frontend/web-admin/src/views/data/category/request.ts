import { request } from '@ptstack/request'
import type {
  requestCategorySchemas as requestCategory,
  returnCategorySchemas as returnCategory,
} from '@ptstack/types'

// 获取列表
export const getListService = async (
  query?: requestCategory.GetListQuery,
): Promise<returnCategory.List> => {
  const { data } = await request.get('/admin/categories', {
    params: query,
  })
  return data
}

// 获取详情
export const getDetailService = (
  params: requestCategory.GetDetailParams,
): Promise<returnCategory.Data> => {
  return request.get(`/admin/categories/${params.id}`)
}

// 新增
export const addService = (body: requestCategory.AddBody) => {
  return request.post('/admin/categories/', body)
}

// 更新
export const updateService = (
  params: requestCategory.UpdateParams,
  body: requestCategory.UpdateBody,
) => {
  return request.put(`/admin/categories/${params.id}`, body)
}

// 批量移入回收站
export const softDeleteManyService = (
  body: requestCategory.OperateManyBody,
) => {
  return request.patch('/admin/categories/delete', body)
}

// 指定移入回收站
export const softDeleteService = (params: requestCategory.OperateParams) => {
  return request.patch(`/admin/categories/delete/${params.id}`)
}

// 批量移出回收站
export const restoreManyService = (body: requestCategory.OperateManyBody) => {
  return request.patch('/admin/categories/restore', body)
}

// 指定移出回收站
export const restoreService = (params: requestCategory.OperateParams) => {
  return request.patch(`/admin/categories/restore/${params.id}`)
}

// 批量移入回收站
export const deleteManyService = (body: requestCategory.OperateManyBody) => {
  return request.delete('/admin/categories', { data: body })
}

// 指定移入回收站
export const deleteService = (params: requestCategory.OperateParams) => {
  return request.delete(`/admin/categories/${params.id}`)
}
