import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import GalleryClient from './GalleryClient'
import { getT } from '@/lib/i18n/server'

export default async function ParentGalleryPage() {
  const session = await getSession()
  if (!session || session.role !== 'PARENT') redirect('/login')

  const t = await getT()

  const parentChildren = await prisma.parentChild.findMany({
    where: { parentId: session.id },
    include: { child: { include: { classroom: true } } },
  })

  const classroomId = parentChildren[0]?.child?.classroom?.id

  const activities = classroomId
    ? await prisma.activity.findMany({
        where: { classroomId },
        include: {
          media: {
            where: { filetype: { startsWith: 'image' } },
          },
        },
        orderBy: { activityDate: 'desc' },
      })
    : []

  const media = activities.flatMap((a) =>
    a.media.map((m) => ({
      id: m.id,
      filepath: m.filepath,
      filename: m.filename,
      activityTitle: a.title,
    }))
  )

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {t.parent.gallery.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {media.length} {t.parent.gallery.subtitle}
        </p>
      </div>
      <GalleryClient media={media} />
    </div>
  )
}
