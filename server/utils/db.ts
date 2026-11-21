import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
  return globalForPrisma.prisma
}

// Prisma usa los mismos placeholders posicionales ($1, $2, ...) que pg para PostgreSQL.
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  return getPrisma().$queryRawUnsafe<T[]>(text, ...params)
}
