import { PrismaClient } from '@prisma/client'

const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma 