import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminAnnouncementsClient from './AdminAnnouncementsClient'
import { getServerLanguage } from '@/lib/i18n/server'

export default async function AdminAnnouncementsPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')
  if (!session.kindergartenId) redirect('/admin/dashboard')

  const announcements = await prisma.announcement.findMany({
    where: { kindergartenId: session.kindergartenId },
    orderBy: { createdAt: 'desc' },
    include: { createdBy: true },
  })

  const { t, isRTL } = await getServerLanguage()
  const tr = t.admin.announcements

  const mapped = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    type: a.type,
    createdAt: a.createdAt.toISOString(),
    createdByName: `${a.createdBy.firstName} ${a.createdBy.lastName}`,
  }))

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1000px', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {tr.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {tr.subtitle.replace('{count}', mapped.length.toString())}
        </p>
      </div>
      <AdminAnnouncementsClient
        announcements={mapped}
        kindergartenId={session.kindergartenId}
      />
    </div>
  )
}
