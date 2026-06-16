import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerLanguage } from '@/lib/i18n/server'
import { Search, UserCheck, UserX } from 'lucide-react'
import DeleteUserButton from './DeleteUserButton'

export default async function SuperAdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string; kg?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') redirect('/login')

  const { t } = await getServerLanguage()

  const roleConfig: Record<string, { label: string; bg: string; color: string }> = {
    PARENT:      { label: t.superAdmin.users.roleParent,         bg: '#dbeafe', color: '#2563eb' },
    TEACHER:     { label: t.superAdmin.users.roleTeacher,     bg: '#d1fae5', color: '#059669' },
    ADMIN:       { label: t.superAdmin.users.roleAdmin,          bg: '#ede9fe', color: '#7c3aed' },
    SUPER_ADMIN: { label: t.superAdmin.users.roleSuperAdmin,    bg: '#fef3c7', color: '#d97706' },
  }

  const params = await searchParams
  const roleFilter = params.role
  const search = params.search?.toLowerCase() ?? ''
  const kgFilter = params.kg

  const [users, kindergartens] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: roleFilter ? { equals: roleFilter as 'PARENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN' } : undefined,
        kindergartenId: kgFilter || undefined,
        OR: search
          ? [{ firstName: { contains: search } }, { lastName: { contains: search } }, { email: { contains: search } }]
          : undefined,
      },
      include: { kindergarten: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.kindergarten.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {t.superAdmin.users.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {t.superAdmin.users.subtitle.replace('{count}', users.length.toString())}
        </p>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <form>
            <input
              name="search"
              defaultValue={search}
              type="text"
              placeholder={t.superAdmin.users.searchPlaceholder}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
            />
          </form>
        </div>

        {/* Role filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[{ key: '', label: t.superAdmin.users.filterAll }, ...Object.entries(roleConfig).map(([k, v]) => ({ key: k, label: v.label }))].map((f) => (
            <a
              key={f.key}
              href={`/super-admin/users?role=${f.key}${search ? `&search=${search}` : ''}${kgFilter ? `&kg=${kgFilter}` : ''}`}
              style={{
                padding: '7px 14px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '600',
                background: roleFilter === f.key || (!roleFilter && f.key === '')
                  ? 'linear-gradient(135deg, #F72585, #4361EE)'
                  : '#f1f5f9',
                color: roleFilter === f.key || (!roleFilter && f.key === '') ? 'white' : '#64748b',
              }}
            >
              {f.label}
            </a>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {users.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', margin: '0 0 12px' }}>👤</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: 0 }}>{t.superAdmin.users.noUsers}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {[t.superAdmin.users.colUser, t.superAdmin.users.colEmail, t.superAdmin.users.colNursery, t.superAdmin.users.colRole, t.superAdmin.users.colStatus, t.superAdmin.users.colDate, t.superAdmin.users.colActions].map((h) => (
                  <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const rc = roleConfig[user.role] ?? { label: user.role, bg: '#f1f5f9', color: '#475569' }
                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: i < users.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s' }}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #F72585, #4361EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#64748b' }}>{user.email}</td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#64748b' }}>
                      {user.kindergarten?.name ?? <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: rc.bg, color: rc.color }}>
                        {rc.label}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: user.isActive ? '#10b981' : '#ef4444' }}>
                        {user.isActive ? <UserCheck size={13} /> : <UserX size={13} />}
                        {user.isActive ? t.superAdmin.users.active : t.superAdmin.users.inactive}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <DeleteUserButton
                        userId={user.id}
                        confirmText={t.superAdmin.users.confirmDelete}
                        deleteText={t.superAdmin.users.delete}
                        errorText={t.superAdmin.users.errorDelete}
                      />
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
