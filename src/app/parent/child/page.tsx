import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Baby, Heart, BookOpen, AlertTriangle } from 'lucide-react'
import { getServerLanguage } from '@/lib/i18n/server'

function calculateAge(birthDate: Date): string {
  const now = new Date()
  const years = now.getFullYear() - birthDate.getFullYear()
  const months = now.getMonth() - birthDate.getMonth()
  const totalMonths = years * 12 + months
  if (totalMonths < 12) return `${totalMonths} mois`
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  return m > 0 ? `${y} an(s) et ${m} mois` : `${y} an(s)`
}

export default async function ParentChildPage() {
  const session = await getSession()
  if (!session || session.role !== 'PARENT') redirect('/login')

  const { t } = await getServerLanguage()

  const parentChildren = await prisma.parentChild.findMany({
    where: { parentId: session.id },
    include: {
      child: {
        include: {
          classroom: {
            include: { teacher: true },
          },
          attendances: {
            where: {
              date: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
          },
        },
      },
    },
  })

  if (parentChildren.length === 0) {
    return (
      <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 32px', letterSpacing: '-0.5px' }}>
          {t.parent.child.title}
        </h1>
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: '64px', margin: '0 0 16px' }}>👶</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>
            {t.parent.dashboard.noChildren}
          </p>
          <p style={{ color: '#64748b', margin: 0 }}>{t.parent.dashboard.noChildrenDesc}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '900px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 28px', letterSpacing: '-0.5px' }}>
        {t.parent.child.title}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {parentChildren.map(({ child }) => {
          const presentCount = child.attendances.filter((a) => a.status === 'PRESENT').length
          const absentCount = child.attendances.filter((a) => a.status === 'ABSENT').length
          const lateCount = child.attendances.filter((a) => a.status === 'LATE').length
          const totalDays = child.attendances.length
          const rate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0

          return (
            <div key={child.id}>
              {/* Profile card */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '40px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  marginBottom: '24px',
                  display: 'flex',
                  gap: '40px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F72585, #4361EE)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    fontWeight: '700',
                    color: 'white',
                    flexShrink: 0,
                    overflow: 'hidden',
                    boxShadow: '0 6px 24px rgba(247,37,133,0.25)',
                  }}
                >
                  {child.photo ? (
                    <img src={child.photo} alt={child.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    `${child.firstName[0]}${child.lastName[0]}`
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.3px' }}>
                    {child.firstName} {child.lastName}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    {[
                      { label: t.parent.child.birthDate, value: new Date(child.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
                      { label: 'Âge', value: calculateAge(new Date(child.birthDate)) },
                      { label: 'Genre', value: child.gender === 'MALE' ? '👦 Garçon' : '👧 Fille' },
                      { label: t.parent.child.class, value: child.classroom?.name ?? '' },
                      { label: 'Éducatrice', value: child.classroom?.teacher ? `${child.classroom.teacher.firstName} ${child.classroom.teacher.lastName}` : '' },
                    ].map((item) => (
                      <div key={item.label}>
                        <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {item.label}
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* Medical info */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(239,68,68,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Heart size={18} color="#ef4444" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{t.parent.child.medicalNotes}</h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div
                      style={{
                        padding: '14px',
                        background: child.allergies ? '#fef2f2' : '#f8fafc',
                        borderRadius: '12px',
                        borderLeft: `3px solid ${child.allergies ? '#ef4444' : '#e2e8f0'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <AlertTriangle size={14} color={child.allergies ? '#ef4444' : '#94a3b8'} />
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: child.allergies ? '#ef4444' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {t.parent.child.allergies}
                        </p>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                        {child.allergies || t.parent.child.noData}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: '14px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        borderLeft: '3px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <BookOpen size={14} color="#94a3b8" />
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {t.parent.child.medicalNotes}
                        </p>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                        {child.medicalNotes || t.parent.child.noData}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attendance stats */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(67,97,238,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Baby size={18} color="#4361EE" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{t.parent.sidebar.attendance}</h2>
                  </div>

                  {/* Rate circle */}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: `conic-gradient(#10b981 ${rate * 3.6}deg, #f1f5f9 ${rate * 3.6}deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '76px',
                          height: '76px',
                          borderRadius: '50%',
                          background: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{rate}%</span>
                      </div>
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>Taux de présence</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {[
                      { label: t.parent.dashboard.present, value: presentCount, color: '#10b981', bg: '#d1fae5' },
                      { label: t.parent.dashboard.absent, value: absentCount, color: '#ef4444', bg: '#fee2e2' },
                      { label: t.parent.dashboard.late, value: lateCount, color: '#f59e0b', bg: '#fef3c7' },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{ textAlign: 'center', padding: '12px', background: s.bg, borderRadius: '10px' }}
                      >
                        <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '700', color: s.color }}>{s.value}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: s.color, fontWeight: '600' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
