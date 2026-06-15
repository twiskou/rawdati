import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import SuperAdminSidebar from '@/components/sidebar/SuperAdminSidebar'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <SuperAdminSidebar firstName={session.firstName} lastName={session.lastName} />
      <main style={{ marginInlineStart: '260px', minHeight: '100vh', padding: '32px' }} className="superadmin-main-content">
        {children}
      </main>
      <style>{`
        @media (max-width: 767px) {
          .superadmin-main-content { margin-inline-start: 0 !important; padding: 80px 16px 24px !important; }
        }
      `}</style>
    </div>
  )
}
