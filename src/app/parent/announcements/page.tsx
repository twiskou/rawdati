import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getT } from '@/lib/i18n/server'

const badgeColors: Record<string, { bg: string; color: string }> = {
  MEETING: { bg: '#ede9fe', color: '#7c3aed' },
  OUTING: { bg: '#d1fae5', color: '#059669' },
  EVENT: { bg: '#fef3c7', color: '#d97706' },
  INFO: { bg: '#dbeafe', color: '#2563eb' },
}

const typeLabels: Record<string, string> = {
  MEETING: 'Réunion',
  OUTING: 'Sortie',
  EVENT: 'Événement',
  INFO: 'Info',
}

export default async function ParentAnnouncementsPage() {
  const session = await getSession()
  if (!session || session.role !== 'PARENT') redirect('/login')

  const t = await getT()

  const parentChildren = await prisma.parentChild.findMany({
    where: { parentId: session.id },
    include: { child: { include: { classroom: true } } },
  })

  const kindergartenId = parentChildren[0]?.child?.classroom?.kindergartenId

  const announcements = kindergartenId
    ? await prisma.announcement.findMany({
        where: { kindergartenId },
        orderBy: { createdAt: 'desc' },
        include: { createdBy: true },
      })
    : []

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {t.parent.announcements.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {announcements.length} {t.parent.announcements.title.toLowerCase()}
        </p>
      </div>

      {announcements.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: '64px', margin: '0 0 16px' }}>📢</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>{t.parent.announcements.noAnnouncements}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map((ann, index) => {
            const badge = badgeColors[ann.type] ?? { bg: '#f1f5f9', color: '#475569' }
            const label = typeLabels[ann.type] ?? ann.type
            const isRecent = index < 3

            return (
              <div
                key={ann.id}
                style={{
                  background: isRecent
                    ? 'linear-gradient(135deg, rgba(247,37,133,0.02), rgba(67,97,238,0.02))'
                    : 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: isRecent ? '1px solid rgba(67,97,238,0.12)' : '1px solid #f1f5f9',
                  transition: 'transform 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: badge.bg,
                        color: badge.color,
                      }}
                    >
                      {label}
                    </span>
                    {isRecent && (
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: 'rgba(247,37,133,0.1)',
                          color: '#F72585',
                        }}
                      >
                        Nouveau
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(ann.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                  {ann.title}
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                  {ann.content}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Publié par {ann.createdBy.firstName} {ann.createdBy.lastName}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
