import { PrismaClient } from '@prisma/client'


// APRÈS
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({ url: './prisma/dev.db' })

const prisma = new PrismaClient({ adapter })

async function main() {
  const kindergarten = await prisma.kindergarten.create({
    data: {
      name: 'Crèche Les Petits Anges',
      address: 'Annaba, Algérie',
      phone: '+213 38 000 000',
      whatsappNumber: '+213 770 000 000',
      email: 'contact@lespetitsanges.dz',
    },
  })

  await prisma.user.create({
    data: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@allomama.com',
      password: await bcrypt.hash('Admin@123', 10),
      role: 'SUPER_ADMIN',
    },
  })

  const teacher = await prisma.user.create({
    data: {
      firstName: 'Sara',
      lastName: 'Meziane',
      email: 'teacher@allomama.com',
      password: await bcrypt.hash('Teacher@123', 10),
      role: 'TEACHER',
      kindergartenId: kindergarten.id,
    },
  })

  const classroom = await prisma.classroom.create({
    data: {
      name: 'Les Papillons',
      description: 'Classe des 3-4 ans',
      kindergartenId: kindergarten.id,
      teacherId: teacher.id,
    },
  })

  const parent = await prisma.user.create({
    data: {
      firstName: 'Mohamed',
      lastName: 'Khelifi',
      email: 'parent@allomama.com',
      password: await bcrypt.hash('Parent@123', 10),
      role: 'PARENT',
      kindergartenId: kindergarten.id,
    },
  })

  const child = await prisma.child.create({
    data: {
      firstName: 'Yasmine',
      lastName: 'Khelifi',
      birthDate: new Date('2020-05-15'),
      gender: 'FEMALE',
      classroomId: classroom.id,
    },
  })

  await prisma.parentChild.create({
    data: { parentId: parent.id, childId: child.id },
  })

  console.log('✅ Seed terminé !')
  console.log('superadmin@allomama.com / Admin@123')
  console.log('teacher@allomama.com / Teacher@123')
  console.log('parent@allomama.com / Parent@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())