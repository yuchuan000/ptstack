import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function main() {
  const category1 = await prisma.category.upsert({
    where: { name: '工具资源' },
    update: {},
    create: {
      name: '工具资源',
      description: '各类开发工具、在线资源、效率软件、插件推荐',
    },
  })
  const category2 = await prisma.category.upsert({
    where: { name: '日记' },
    update: {},
    create: {
      name: '日记',
      icon: 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
      description: '日常随笔、生活感悟与个人心情记录',
    },
  })
  console.log({ category1, category2 })
}
main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
