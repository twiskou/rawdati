import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerLanguage } from '@/lib/i18n/server'
import TeacherActivitiesClient from './TeacherActivitiesClient'

export default async function TeacherActivitiesPage() {
  const session = await getSession()
  if (!session || !['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) redirect('/login')

  const { t, isRTL } = await getServerLanguage()
  const tr = t.teacher.activities

  const classrooms = await prisma.classroom.findMany({
    where: session.role === 'TEACHER' ? { teacherId: session.id } : { kindergartenId: session.kindergartenId },
    include: {
      activities: {
        orderBy: { activityDate: 'desc' },
        include: { media: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const activities = classrooms
    .flatMap((c) =>
      c.activities.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        activityDate: a.activityDate.toISOString(),
        mediaCount: a.media.length,
        classroomId: c.id,
        className: c.name,
      }))
    )
    .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime())

  const classroomOptions = classrooms.map((c) => ({ id: c.id, name: c.name }))

  return (
    <div
      style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        maxWidth: '1000px',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <div
        style={{
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 6px',
              letterSpacing: '-0.5px',
            }}
          >
            {tr.title}
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            {activities.length} {isRTL ? 'نشاط في قسمك' : 'activité(s) publiée(s) dans vos classes'}
          </p>
        </div>
      </div>
      <TeacherActivitiesClient activities={activities} classrooms={classroomOptions} />
    </div>
  )
}
