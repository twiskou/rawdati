import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TeacherGalleryClient from './TeacherGalleryClient'

export default async function TeacherGalleryPage() {
  const session = await getSession()
  if (!session || !['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) redirect('/login')

  const classrooms = await prisma.classroom.findMany({
    where: session.role === 'TEACHER' ? { teacherId: session.id } : { kindergartenId: session.kindergartenId },
    include: {
      activities: {
        include: { media: true },
        orderBy: { activityDate: 'desc' },
      },
    },
  })

  const allMedia = classrooms
    .flatMap((c) =>
      c.activities.flatMap((a) =>
        a.media.map((m) => ({
          id: m.id,
          filepath: m.filepath,
          filename: m.filename,
          activityTitle: a.title,
          activityDate: a.activityDate.toISOString(),
          className: c.name,
        }))
      )
    )
    .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime())

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Galerie
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            {allMedia.length} photo(s) publiées dans vos classes
          </p>
        </div>
      </div>

      <TeacherGalleryClient initialMedia={allMedia} />
    </div>
  )
}
