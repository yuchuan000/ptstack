import { type RequestHandler } from 'express'
import * as categoryService from './category.service'
import type { Interface } from '@ptstack/types'
import { success } from '../../../utils/response'

// 获取列表
export const getListController: RequestHandler = async (req, res) => {
  const query = req.validated?.query as Interface.Category.Request.GetListQuery
  const data = await categoryService.getListService(query)
  success(res, '获取分类列表成功！', data)
}

// 获取详情
export const getDetailController: RequestHandler = async (req, res) => {
  const params = req.validated
    ?.params as Interface.Category.Request.GetDetailParams
  const data = await categoryService.getDetailService(params)
  success(res, '获取分类详情成功！', data)
}

// 新增
export const addController: RequestHandler = async (req, res) => {
  const body = req.validated?.body as Interface.Category.Request.AddBody
  const data = await categoryService.addService(body)
  success(res, '新增分类成功！', data, 201)
}

// 更新
export const updateController: RequestHandler = async (req, res) => {
  const params = req.validated
    ?.params as Interface.Category.Request.UpdateParams
  const body = req.validated?.body as Interface.Category.Request.UpdateBody
  const data = await categoryService.updateService(params, body)
  success(res, '更新分类成功！', data)
}

// 批量移入回收站
export const softDeleteManyController: RequestHandler = async (req, res) => {
  const body = req.validated?.body as Interface.Category.Request.OperateManyBody
  const data = await categoryService.softDeleteManyService(body)
  success(res, '批量移入回收站成功！', data)
}

// 指定移入回收站
export const softDeleteController: RequestHandler = async (req, res) => {
  const params = req.validated
    ?.params as Interface.Category.Request.OperateParams
  const data = await categoryService.softDeleteService(params)
  success(res, '指定移入回收站成功！', data)
}

// 批量移出回收站
export const restoreManyController: RequestHandler = async (req, res) => {
  const body = req.validated?.body as Interface.Category.Request.OperateManyBody
  const data = await categoryService.restoreManyService(body)
  success(res, '批量移出回收站成功！', data)
}

// 指定移出回收站
export const restoreController: RequestHandler = async (req, res) => {
  const params = req.validated
    ?.params as Interface.Category.Request.OperateParams
  const data = await categoryService.restoreService(params)
  success(res, '指定移出回收站成功！', data)
}

// 批量移入回收站
export const deleteManyController: RequestHandler = async (req, res) => {
  const body = req.validated?.body as Interface.Category.Request.OperateManyBody
  const data = await categoryService.deleteManyService(body)
  success(res, '批量彻底删除成功！', data)
}

// 指定移入回收站
export const deleteController: RequestHandler = async (req, res) => {
  const params = req.validated
    ?.params as Interface.Category.Request.OperateParams
  const data = await categoryService.deleteService(params)
  success(res, '指定彻底删除成功！', data)
}
