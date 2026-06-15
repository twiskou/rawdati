import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')
  if (!session.kindergartenId) redirect('/admin/dashboard')

  const [users, classrooms] = await Promise.all([
    prisma.user.findMany({
      where: {
        kindergartenId: session.kindergartenId,
        role: { in: ['PARENT', 'TEACHER'] },
      },
      include: {
        taughtClasses: { select: { id: true, name: true } },
        parentChildren: {
          include: {
            child: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.classroom.findMany({
      where: { kindergartenId: session.kindergartenId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <UsersClient
      users={users.map(u => ({
        ...u,
        role: u.role as 'TEACHER' | 'PARENT',
        createdAt: u.createdAt.toISOString(),
      }))}
      classrooms={classrooms}
    />
  )
}
