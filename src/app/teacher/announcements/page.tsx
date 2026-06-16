import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerLanguage } from '@/lib/i18n/server'
import TeacherAnnouncementsClient from './TeacherAnnouncementsClient'

export default async function TeacherAnnouncementsPage() {
  const session = await getSession()
  if (!session || session.role !== 'TEACHER') redirect('/login')

  const { t, isRTL } = await getServerLanguage()
  const tr = t.teacher.announcements

  const classroom = await prisma.classroom.findFirst({
    where: { teacherId: session.id },
    include: { kindergarten: true },
  })

  const kindergartenId = classroom?.kindergartenId ?? null

  const announcements = kindergartenId
    ? await prisma.announcement.findMany({
        where: { kindergartenId },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div
      style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        maxWidth: '900px',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <div style={{ marginBottom: '28px' }}>
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
          {announcements.length} {isRTL ? 'إعلان' : 'annonce(s)'}
        </p>
      </div>
      <TeacherAnnouncementsClient
        announcements={announcements.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          type: a.type,
          createdAt: a.createdAt.toISOString(),
        }))}
        kindergartenId={kindergartenId}
      />
    </div>
  )
}
