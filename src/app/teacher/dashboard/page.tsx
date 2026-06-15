import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TeacherDashboardClient from './TeacherDashboardClient'

export default async function TeacherDashboardPage() {
  const session = await getSession()
  if (!session || !['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) redirect('/login')

  // Fetch all classrooms for this teacher (or all for admin testing)
  const classrooms = await prisma.classroom.findMany({
    where: session.role === 'TEACHER' ? { teacherId: session.id } : { kindergartenId: session.kindergartenId },
    include: {
      children: {
        include: {
          attendances: {
            where: {
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          },
        },
      },
      activities: {
        orderBy: { activityDate: 'desc' },
        take: 5,
        include: { media: true },
      },
    },
  })

  // Aggregate stats across all classrooms
  const totalChildren = classrooms.reduce((acc, cls) => acc + cls.children.length, 0)
  
  let presentToday = 0
  let absentToday = 0
  
  classrooms.forEach(cls => {
    cls.children.forEach(c => {
      const isPresent = c.attendances.some(a => a.status === 'PRESENT')
      const isAbsent = c.attendances.some(a => a.status === 'ABSENT')
      if (isPresent) presentToday++
      if (isAbsent) absentToday++
    })
  })
  
  const notMarked = totalChildren - presentToday - absentToday

  const totalActivities = classrooms.reduce((acc, cls) => acc + cls.activities.length, 0)
  const totalPhotos = classrooms.reduce((acc, cls) => acc + cls.activities.reduce((a, act) => a + act.media.length, 0), 0)

  // Merge children for the attendance list, just take the first 15 to avoid massive lists
  const allChildren = classrooms.flatMap(cls => 
    cls.children.map(c => ({ ...c, className: cls.name }))
  ).slice(0, 15)

  // Merge activities
  const allActivities = classrooms.flatMap(cls => cls.activities)
    .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime())
    .slice(0, 5)

  const classNames = classrooms.map(c => c.name).join(', ')

  return (
    <TeacherDashboardClient 
      firstName={session.firstName}
      classNames={classNames}
      stats={{ totalChildren, presentToday, absentToday, notMarked, totalActivities, totalPhotos }}
      childrenList={allChildren}
      activitiesList={allActivities}
    />
  )
}
