import { prisma } from '../../../prisma/prisma'
import type { requestCategorySchemas as category } from '@ptstack/types'
import { HttpError } from '../../../utils/HttpError'

// 获取列表
export const getListService = async (query: category.GetListQuery) => {
  // 分页信息
  const page = query.page || 1
  const pageSize = query.pageSize || 10
  // 状态
  const status =
    Number.isNaN(query.status) || query.status == null ? 2 : query.status
  const commonCondition = {
    where: {
      deletedAt: query.isDeleted ? { not: null } : null, // 1：查非空，即已删除 其他情况：空，即未删除
      ...(status === 2 ? {} : { status }),
    },
    orderBy: {
      [query.sortField || 'sort']: query.sortOrder || 'desc',
    },
  }
  const condition = {
    ...commonCondition,
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
  const [list, total] = await Promise.all([
    prisma.category.findMany(condition),
    prisma.category.count(commonCondition),
  ])
  const pagination = {
    page,
    pageSize,
    total,
  }
  return {
    list,
    pagination,
  }
}

// 获取详情
export const getDetailService = (params: category.GetDetailParams) => {
  return prisma.category.findFirst({
    where: {
      id: params.id,
    },
  })
}

// 新增
export const addService = async (body: category.AddBody) => {
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
      status: body.status || 1,
      sort: body.sort || 0,
    },
  })
}

// 更新
export const updateService = (
  params: category.UpdateParams,
  body: category.UpdateBody,
) => {
  return prisma.category.update({
    where: {
      id: params.id,
    },
    data: body,
  })
}

// 批量移入回收站
export const softDeleteManyService = (body: category.OperateManyBody) => {
  return prisma.category.softDeleteMany({
    id: {
      in: body.id,
    },
  })
}

// 指定移入回收站
export const softDeleteService = (params: category.OperateParams) => {
  return prisma.category.softDelete({
    id: params.id,
  })
}

// 批量移出回收站
export const restoreManyService = (body: category.OperateManyBody) => {
  return prisma.category.restoreMany({
    id: {
      in: body.id,
    },
  })
}

// 指定移出回收站
export const restoreService = (params: category.OperateParams) => {
  return prisma.category.restore({
    id: params.id,
  })
}

// 批量彻底删除
export const deleteManyService = (body: category.OperateManyBody) => {
  return prisma.category.deleteMany({
    where: {
      deletedAt: {
        not: null,
      },
      id: {
        in: body.id,
      },
    },
  })
}

// 指定彻底删除
export const deleteService = (params: category.OperateParams) => {
  return prisma.category.delete({
    where: {
      deletedAt: {
        not: null,
      },
      id: params.id,
    },
  })
}
