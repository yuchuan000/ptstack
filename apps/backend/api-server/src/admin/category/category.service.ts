import { prisma } from '../../../prisma/prisma'
import type { Interface } from '@ptstack/types'
import { HttpError } from '../../../utils/HttpError'

/**
 * 获取列表
 * @param query
 */
export const getListService = async (
  query: Interface.Category.Request.GetListQuery,
) => {
  // 分页信息
  const page = query.page || 1
  const pageSize = query.pageSize || 10
  // 状态
  const status = query.status ?? 'all'
  console.log('ces:', query.isDeleted)
  console.log('type:', typeof query.isDeleted)
  // 通用条件
  const commonCondition = {
    where: {
      deletedAt: query.isDeleted ? { not: null } : null, // 是否软删除
      ...(status === 'all' ? {} : { status }), // 状态
    },
  }
  // 进一步封装条件
  const condition = {
    ...commonCondition,
    orderBy: {
      [query.sortField || 'priority']: query.sortOrder || 'desc', // 排序字段及顺序：默认priority和desc
    },
    skip: (page - 1) * pageSize, // 偏移量：从第几条开始
    take: pageSize, // 步幅：多少条
  }
  console.log(commonCondition)
  const [list, total] = await Promise.all([
    prisma.category.findMany(condition), // 查固定条数数据列表
    prisma.category.count(commonCondition), // 查符合条件的总条数
  ])
  // 整合数据
  const pagination = {
    page,
    pageSize,
    total,
  }
  // 返回数据
  return {
    list,
    pagination,
  }
}

/**
 * 获取详情
 * @param params
 */
export const getDetailService = (
  params: Interface.Category.Request.GetDetailParams,
) => {
  return prisma.category.findFirst({
    where: {
      id: params.id,
    },
  })
}

/**
 * 新增
 * @param body
 */
export const addService = async (body: Interface.Category.Request.AddBody) => {
  const data = await prisma.category.findFirst({
    where: {
      name: body.name,
    },
  })
  // 数据已存在
  if (data) throw HttpError.conflict()
  return prisma.category.create({
    data: {
      name: body.name,
      icon: body.icon || null,
      description: body.description || `这是一个名为${body.name}的分类`,
      status: body.status || 'public',
      priority: body.priority || 0,
    },
  })
}

/**
 * 更新
 * @param params
 * @param body
 */
export const updateService = (
  params: Interface.Category.Request.UpdateParams,
  body: Interface.Category.Request.UpdateBody,
) => {
  return prisma.category.update({
    where: {
      id: params.id,
    },
    data: body,
  })
}

/**
 * 批量移入回收站
 * @param body
 */
export const softDeleteManyService = async (
  body: Interface.Category.Request.OperateManyBody,
) => {
  const res = await prisma.category.softDeleteMany({
    id: {
      in: body.id,
    },
  })
  if (res.count === 0) throw HttpError.notFound()
  return res
}

/**
 * 指定移入回收站
 * @param params
 */
export const softDeleteService = (
  params: Interface.Category.Request.OperateParams,
) => {
  return prisma.category.softDelete({
    id: params.id,
  })
}

/**
 * 批量移出回收站
 * @param body
 */
export const restoreManyService = async (
  body: Interface.Category.Request.OperateManyBody,
) => {
  const res = await prisma.category.restoreMany({
    id: {
      in: body.id,
    },
  })
  if (res.count === 0) throw HttpError.notFound()
  return res
}

/**
 * 指定移出回收站
 * @param params
 */
export const restoreService = (
  params: Interface.Category.Request.OperateParams,
) => {
  return prisma.category.restore({
    id: params.id,
  })
}

/**
 * 批量彻底删除
 * @param body
 */
export const deleteManyService = async (
  body: Interface.Category.Request.OperateManyBody,
) => {
  const res = await prisma.category.deleteMany({
    where: {
      deletedAt: {
        not: null,
      },
      id: {
        in: body.id,
      },
    },
  })
  if (res.count === 0) throw HttpError.notFound()
  return res
}

/**
 * 指定彻底删除
 * @param params
 */
export const deleteService = (
  params: Interface.Category.Request.OperateParams,
) => {
  return prisma.category.delete({
    where: {
      deletedAt: {
        not: null,
      },
      id: params.id,
    },
  })
}
