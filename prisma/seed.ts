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

async function main() {
  const hashedPassword = await bcrypt.hash('admin1234', 10)
  
  const id = 'cuid_' + Math.random().toString(36).substring(2, 15)
  const now = new Date().toISOString()
  
  // Upsert equivalent
  await libsql.execute({
    sql: `DELETE FROM User WHERE email = ?`,
    args: ['admin@gmail.com']
  })

  await libsql.execute({
    sql: `INSERT INTO User (id, firstName, lastName, email, password, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, 'Super', 'Admin', 'admin@gmail.com', hashedPassword, 'SUPER_ADMIN', 1, now, now]
  })

  console.log('✅ Seed terminé !')
  console.log('admin@gmail.com / admin1234')
}

main().catch(console.error)