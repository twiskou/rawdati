import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getT } from '@/lib/i18n/server'
import { CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react'

// Since there's no Subscription model in the schema, we simulate subscription data
// based on kindergarten creation date. This can be replaced with real subscription model later.

export default async function SuperAdminSubscriptionsPage() {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') redirect('/login')

  const t = await getT()

  function getSubscriptionStatus(createdAt: Date): { status: string; label: string; daysLeft: number } {
    const now = new Date()
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    // Simulate: 30-day trial, then annual subscription
    if (daysSinceCreation <= 30) {
      return { status: 'TRIAL', label: t.superAdmin.subscriptions.statusTrial, daysLeft: 30 - daysSinceCreation }
    } else if (daysSinceCreation <= 365) {
      return { status: 'ACTIVE', label: t.superAdmin.subscriptions.statusActive, daysLeft: 365 - daysSinceCreation }
    } else {
      return { status: 'EXPIRED', label: t.superAdmin.subscriptions.statusExpired, daysLeft: 0 }
    }
  }

  const kindergartens = await prisma.kindergarten.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { users: true } },
    },
  })

  const subscriptions = kindergartens.map((kg) => ({
    ...kg,
    subscription: getSubscriptionStatus(kg.createdAt),
  }))

  const activeCount = subscriptions.filter((s) => s.subscription.status === 'ACTIVE').length
  const trialCount = subscriptions.filter((s) => s.subscription.status === 'TRIAL').length
  const expiredCount = subscriptions.filter((s) => s.subscription.status === 'EXPIRED').length

  const statusConfig: Record<string, { bg: string; color: string; icon: typeof CheckCircle }> = {
    ACTIVE:  { bg: '#d1fae5', color: '#059669', icon: CheckCircle },
    TRIAL:   { bg: '#dbeafe', color: '#2563eb', icon: Clock },
    EXPIRED: { bg: '#fee2e2', color: '#dc2626', icon: AlertTriangle },
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {t.superAdmin.subscriptions.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {t.superAdmin.subscriptions.subtitle}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: t.superAdmin.subscriptions.active, value: activeCount, color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle },
          { label: t.superAdmin.subscriptions.trial, value: trialCount, color: '#2563eb', bg: 'rgba(37,99,235,0.08)', icon: Clock },
          { label: t.superAdmin.subscriptions.expired, value: expiredCount, color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: AlertTriangle },
          { label: t.superAdmin.subscriptions.total, value: subscriptions.length, color: '#4361EE', bg: 'rgba(67,97,238,0.08)', icon: CreditCard },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              style={{
                background: 'white', borderRadius: '16px', padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={s.color} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {subscriptions.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', margin: '0 0 12px' }}>💳</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: 0 }}>{t.superAdmin.subscriptions.noSubscriptions}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {[t.superAdmin.subscriptions.colNursery, t.superAdmin.subscriptions.colStatus, t.superAdmin.subscriptions.colDaysLeft, t.superAdmin.subscriptions.colUsers, t.superAdmin.subscriptions.colStartDate, t.superAdmin.subscriptions.colActions].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, i) => {
                const scfg = statusConfig[sub.subscription.status] ?? statusConfig.EXPIRED
                const Icon = scfg.icon
                return (
                  <tr
                    key={sub.id}
                    style={{ borderBottom: i < subscriptions.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s' }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(247,37,133,0.1), rgba(67,97,238,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                          🏫
                        </div>
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{sub.name}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{sub.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', background: scfg.bg, color: scfg.color, width: 'fit-content' }}>
                        <Icon size={13} />
                        {sub.subscription.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {sub.subscription.status === 'EXPIRED' ? (
                        <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>{t.superAdmin.subscriptions.expiredText}</span>
                      ) : (
                        <div>
                          <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                            {sub.subscription.daysLeft}j
                          </p>
                          <div style={{ width: '80px', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                borderRadius: '999px',
                                background: sub.subscription.status === 'TRIAL' ? '#3b82f6' : '#10b981',
                                width: `${Math.min((sub.subscription.daysLeft / (sub.subscription.status === 'TRIAL' ? 30 : 365)) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#4361EE' }}>{sub._count.users}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>
                      {new Date(sub.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            style={{
                              padding: '7px 14px', borderRadius: '10px',
                              background: 'linear-gradient(135deg, rgba(247,37,133,0.08), rgba(67,97,238,0.08))',
                              border: '1px solid rgba(67,97,238,0.2)',
                              cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#4361EE',
                            }}
                          >
                            {t.superAdmin.subscriptions.renewBtn}
                          </button>
                          {sub.subscription.status === 'EXPIRED' && (
                            <button style={{ padding: '7px 14px', borderRadius: '10px', background: '#fee2e2', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#dc2626' }}>
                              {t.superAdmin.subscriptions.suspendBtn}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
