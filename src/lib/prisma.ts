import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const envUrlKey = 'TURSO_DATABASE_URL';
  const envTokenKey = 'TURSO_AUTH_TOKEN';
  const dbUrl = process.env[envUrlKey];
  const dbToken = process.env[envTokenKey];

  const adapter = new PrismaLibSql({
    url: dbUrl!,
    authToken: dbToken!,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;