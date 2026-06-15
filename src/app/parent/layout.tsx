import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import ParentSidebar from '@/components/sidebar/ParentSidebar'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'PARENT') {
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <ParentSidebar
        firstName={session.firstName}
        lastName={session.lastName}
      />
      {/* Main content */}
      <main
        style={{
          marginInlineStart: '260px',
          minHeight: '100vh',
          padding: '32px',
        }}
        className="parent-main-content"
      >
        {children}
      </main>
      <style>{`
        @media (max-width: 767px) {
          .parent-main-content {
            margin-inline-start: 0 !important;
            padding: 80px 16px 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
