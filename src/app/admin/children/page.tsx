import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ChildrenClient from './ChildrenClient'

export default async function AdminChildrenPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')
  if (!session.kindergartenId) redirect('/admin/dashboard')

  // Fetch children assigned to a classroom in this kindergarten
  const childrenInClass = await prisma.child.findMany({
    where: { classroom: { kindergartenId: session.kindergartenId } },
    include: {
      classroom: { select: { id: true, name: true } },
      parents: {
        include: {
          parent: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: { firstName: 'asc' },
  })

  // Fetch children not assigned to a classroom but whose parents belong to this kindergarten
  const orphans = await prisma.child.findMany({
    where: {
      classroomId: null,
      parents: {
        some: {
          parent: { kindergartenId: session.kindergartenId },
        },
      },
    },
    include: {
      classroom: { select: { id: true, name: true } },
      parents: {
        include: {
          parent: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  })

  const children = [...childrenInClass, ...orphans.filter(o => !childrenInClass.find(c => c.id === o.id))]

  const classrooms = await prisma.classroom.findMany({
    where: { kindergartenId: session.kindergartenId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  const parents = await prisma.user.findMany({
    where: { kindergartenId: session.kindergartenId, role: 'PARENT', isActive: true },
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: { firstName: 'asc' },
  })

  return (
    <ChildrenClient
      children={children.map(c => ({
        ...c,
        birthDate: c.birthDate.toISOString(),
      }))}
      classrooms={classrooms}
      parents={parents}
    />
  )
}
