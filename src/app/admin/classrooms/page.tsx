import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ClassroomsClient from './ClassroomsClient'

export default async function AdminClassroomsPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')
  if (!session.kindergartenId) redirect('/admin/dashboard')

  const [classrooms, teachers] = await Promise.all([
    prisma.classroom.findMany({
      where: { kindergartenId: session.kindergartenId },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
        children: {
          select: { id: true, firstName: true, lastName: true, gender: true, birthDate: true, photo: true },
        },
        activities: { orderBy: { activityDate: 'desc' }, take: 1, select: { activityDate: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { kindergartenId: session.kindergartenId, role: 'TEACHER', isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: 'asc' },
    }),
  ])

  return (
    <ClassroomsClient
      classrooms={classrooms.map(c => ({
        ...c,
        children: c.children.map(ch => ({
          ...ch,
          birthDate: ch.birthDate.toISOString(),
        })),
        activities: c.activities.map(a => ({
          activityDate: a.activityDate.toISOString(),
        })),
      }))}
      teachers={teachers}
    />
  )
}
