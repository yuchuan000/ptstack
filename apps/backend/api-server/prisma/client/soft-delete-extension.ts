import { Prisma } from '@prisma/client/extension'

export const softDeleteExtension = Prisma.defineExtension({
  name: 'soft-delete-extension',
  query: {
    $allModels: {
      $allOperations({ operation, args, query }) {
        // 查询未软删除的数据，若用户传递了deletedAt，则以用户传递为准
        const notAllow = ['create', 'createMany']
        if (!notAllow.includes(operation)) {
          args = {
            where: {
              deletedAt: null,
            },
            ...args,
          }
        }
        return query(args)
      },
    },
  },
  model: {
    $allModels: {
      async softDelete<T>(this: T, where: Prisma.Args<T, 'update'>['where']) {
        const context = Prisma.getExtensionContext(this)
        return (context as any).update({
          where: {
            deletedAt: null,
            ...where,
          },
          data: {
            deletedAt: new Date(),
          },
        })
      },
      async softDeleteMany<T>(
        this: T,
        where: Prisma.Args<T, 'updateMany'>['where'],
      ) {
        const context = Prisma.getExtensionContext(this)
        return (context as any).updateMany({
          where: {
            deletedAt: null, // 恢复执行的更新需要带上删除标识为空的条件，因为只软删除未软删除的数据
            ...where,
          },
          data: {
            deletedAt: new Date(),
          },
        })
      },
      async restore<T>(this: T, where: Prisma.Args<T, 'update'>['where']) {
        const context = Prisma.getExtensionContext(this)
        return (context as any).update({
          where: {
            deletedAt: {
              not: null,
            },
            ...where,
          },
          data: {
            deletedAt: null,
          },
        })
      },
      async restoreMany<T>(
        this: T,
        where: Prisma.Args<T, 'updateMany'>['where'],
      ) {
        const context = Prisma.getExtensionContext(this)
        return (context as any).updateMany({
          where: {
            deletedAt: {
              not: null,
            },
            ...where,
          },
          data: {
            deletedAt: null,
          },
        })
      },
    },
  },
})
