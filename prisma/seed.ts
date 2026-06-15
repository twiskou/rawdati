import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import pkg from '@next/env'
const { loadEnvConfig } = pkg
import bcrypt from 'bcryptjs'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./prisma/dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN
})
const adapter = new PrismaLibSql(libsql)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      password: await bcrypt.hash('admin1234', 10),
      role: 'SUPER_ADMIN',
    },
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@gmail.com',
      password: await bcrypt.hash('admin1234', 10),
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ Seed terminé !')
  console.log('admin@gmail.com / admin1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())