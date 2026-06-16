import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerLanguage } from '@/lib/i18n/server'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1 // Monday = 0
}

export default async function ParentAttendancePage() {
  const session = await getSession()
  if (!session || session.role !== 'PARENT') redirect('/login')

  const { t } = await getServerLanguage()

  const parentChildren = await prisma.parentChild.findMany({
    where: { parentId: session.id },
    include: { child: true },
  })
  const child = parentChildren[0]?.child ?? null

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const attendances = child
    ? await prisma.attendance.findMany({
        where: {
          childId: child.id,
          date: {
            gte: new Date(year, month, 1),
            lt: new Date(year, month + 1, 1),
          },
        },
      })
    : []

  const presentCount = attendances.filter((a) => a.status === 'PRESENT').length
  const absentCount = attendances.filter((a) => a.status === 'ABSENT').length
  const lateCount = attendances.filter((a) => a.status === 'LATE').length
  const totalCount = attendances.length
  const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  const attendanceMap = new Map(
    attendances.map((a) => [new Date(a.date).getDate(), a.status])
  )

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthName = new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const statusColors: Record<string, { bg: string; color: string; emoji: string }> = {
    PRESENT: { bg: '#d1fae5', color: '#059669', emoji: '✓' },
    ABSENT: { bg: '#fee2e2', color: '#dc2626', emoji: '✗' },
    LATE: { bg: '#fef3c7', color: '#d97706', emoji: '~' },
  }

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {t.parent.attendance.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {child ? t.parent.attendance.subtitle : t.parent.dashboard.noChildren}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: '%', value: `${rate}%`, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          { label: t.parent.dashboard.present, value: presentCount, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          { label: t.parent.dashboard.absent, value: absentCount, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
          { label: t.parent.dashboard.late, value: lateCount, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
          📅 {monthName}
        </h2>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {dayNames.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#94a3b8', padding: '6px 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const status = attendanceMap.get(day)
            const sc = status ? statusColors[status] : null
            const isToday = day === now.getDate()

            return (
              <div
                key={day}
                style={{
                  aspectRatio: '1',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  background: sc ? sc.bg : isToday ? '#f8fafc' : 'transparent',
                  color: sc ? sc.color : isToday ? '#4361EE' : '#374151',
                  border: isToday ? '2px solid #4361EE' : '2px solid transparent',
                  position: 'relative',
                }}
                title={status ?? ''}
              >
                {day}
                {sc && (
                  <span style={{ position: 'absolute', top: '2px', insetInlineEnd: '3px', fontSize: '8px' }}>
                    {sc.emoji}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
          {Object.entries(statusColors).map(([status, sc]) => {
            const labels: Record<string, string> = { PRESENT: t.parent.dashboard.present, ABSENT: t.parent.dashboard.absent, LATE: t.parent.dashboard.late }
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: sc.bg, border: `2px solid ${sc.color}` }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>{labels[status]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* History list */}
      {attendances.length > 0 && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
            {t.parent.attendance.title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...attendances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((att) => {
              const sc = statusColors[att.status]
              const labels: Record<string, string> = { PRESENT: t.parent.dashboard.present, ABSENT: t.parent.dashboard.absent, LATE: t.parent.dashboard.late }
              return (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    {new Date(att.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: sc.bg,
                      color: sc.color,
                    }}
                  >
                    {labels[att.status]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
