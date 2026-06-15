const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const classrooms = await prisma.classroom.findMany({
    include: { teacher: true, children: true }
  })
  console.log("Classrooms:", JSON.stringify(classrooms, null, 2))

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    include: { taughtClasses: true }
  })
  console.log("Teachers:", JSON.stringify(teachers, null, 2))

  const children = await prisma.child.findMany({
    include: { classroom: true }
  })
  console.log("Children:", JSON.stringify(children, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
