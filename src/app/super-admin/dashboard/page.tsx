import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerLanguage } from '@/lib/i18n/server'
import { Building2, Users, Baby, TrendingUp, CheckCircle, ShieldCheck } from 'lucide-react'

export default async function SuperAdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') redirect('/login')

  const { t } = await getServerLanguage()

  const [totalKindergartens, totalUsers, totalChildren, activeKindergartens] = await Promise.all([
    prisma.kindergarten.count(),
    prisma.user.count(),
    prisma.child.count(),
    prisma.kindergarten.count({ where: { isActive: true } }),
  ])

  const recentKindergartens = await prisma.kindergarten.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      _count: { select: { users: true, classrooms: true } },
    },
  })

  // Monthly growth (last 6 months)
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return {
      label: d.toLocaleDateString('fr-FR', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    }
  })

  const monthlyCounts = await Promise.all(
    months.map((m) =>
      prisma.kindergarten.count({
        where: {
          createdAt: {
            gte: new Date(m.year, m.month, 1),
            lt: new Date(m.year, m.month + 1, 1),
          },
        },
      })
    )
  )

  const maxCount = Math.max(...monthlyCounts, 1)

  const stats = [
    { label: t.superAdmin.dashboard.statNurseries, value: totalKindergartens, icon: Building2, color: '#4361EE', bg: 'rgba(67,97,238,0.08)', trend: t.superAdmin.dashboard.trendNurseries },
    { label: t.superAdmin.dashboard.statUsers, value: totalUsers, icon: Users, color: '#F72585', bg: 'rgba(247,37,133,0.08)', trend: t.superAdmin.dashboard.trendUsers },
    { label: t.superAdmin.dashboard.statChildren, value: totalChildren, icon: Baby, color: '#10b981', bg: 'rgba(16,185,129,0.08)', trend: t.superAdmin.dashboard.trendChildren },
    { label: t.superAdmin.dashboard.statActive, value: activeKindergartens, icon: CheckCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', trend: `${Math.round((activeKindergartens / Math.max(totalKindergartens, 1)) * 100)}${t.superAdmin.dashboard.ofTotal}` },
  ]

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #F72585, #4361EE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            {t.superAdmin.dashboard.title}
          </h1>
        </div>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {t.superAdmin.dashboard.subtitle}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              style={{
                background: 'white', borderRadius: '20px', padding: '24px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column', gap: '16px',
                borderTop: `4px solid ${s.color}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{s.label}</p>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={s.color} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={13} color="#10b981" />
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>{s.trend}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Growth chart */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
            {t.superAdmin.dashboard.monthlyGrowth}
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '160px' }}>
            {months.map((m, i) => {
              const count = monthlyCounts[i]
              const heightPct = Math.max((count / maxCount) * 100, count > 0 ? 8 : 4)
              return (
                <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a' }}>{count > 0 ? count : ''}</span>
                  <div
                    style={{
                      width: '100%', borderRadius: '8px 8px 0 0',
                      background: i === months.length - 1
                        ? 'linear-gradient(to top, #F72585, #4361EE)'
                        : 'rgba(67,97,238,0.15)',
                      height: `${heightPct}%`,
                      minHeight: '6px',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{m.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Platform summary */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
            {t.superAdmin.dashboard.platformSummary}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: t.superAdmin.dashboard.activeVsTotal, value: `${activeKindergartens} / ${totalKindergartens}`, pct: totalKindergartens > 0 ? (activeKindergartens / totalKindergartens) * 100 : 0, color: '#10b981' },
              { label: t.superAdmin.dashboard.occupancyRate, value: '78%', pct: 78, color: '#4361EE' },
              { label: t.superAdmin.dashboard.retentionRate, value: '94%', pct: 94, color: '#F72585' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{item.value}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%', borderRadius: '999px',
                      background: item.color,
                      width: `${item.pct}%`,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent kindergartens */}
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>{t.superAdmin.dashboard.recentNurseries}</h2>
          <a href="/super-admin/kindergartens" style={{ fontSize: '13px', color: '#4361EE', textDecoration: 'none', fontWeight: '600' }}>{t.superAdmin.dashboard.seeAll}</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {[t.superAdmin.dashboard.colName, t.superAdmin.dashboard.colAddress, t.superAdmin.dashboard.colUsers, t.superAdmin.dashboard.colClasses, t.superAdmin.dashboard.colStatus].map((h) => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentKindergartens.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  {t.superAdmin.dashboard.noNurseries}
                </td>
              </tr>
            ) : (
              recentKindergartens.map((kg, i) => (
                <tr
                  key={kg.id}
                  style={{ borderTop: '1px solid #f8fafc', transition: 'background 0.15s' }}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(247,37,133,0.1), rgba(67,97,238,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        🏫
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{kg.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>
                    {kg.address ?? '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#4361EE' }}>{kg._count.users}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#F72585' }}>{kg._count.classrooms}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: kg.isActive ? '#d1fae5' : '#fee2e2', color: kg.isActive ? '#059669' : '#dc2626' }}>
                      {kg.isActive ? t.superAdmin.dashboard.active : t.superAdmin.dashboard.inactive}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
