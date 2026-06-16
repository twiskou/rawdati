import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerLanguage } from '@/lib/i18n/server'
import AdminSidebar from '@/components/sidebar/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const kindergarten = session.kindergartenId
    ? await prisma.kindergarten.findUnique({ where: { id: session.kindergartenId } })
    : null

  const { isRTL } = await getServerLanguage()
  const marginStyle = isRTL ? { marginRight: '260px' } : { marginLeft: '260px' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', direction: isRTL ? 'rtl' : 'ltr' }}>
      <AdminSidebar
        firstName={session.firstName}
        lastName={session.lastName}
        kindergartenName={kindergarten?.name}
      />
      <main style={{ ...marginStyle, minHeight: '100vh', padding: '32px' }} className="admin-main-content">
        {children}
      </main>
      <style>{`
        @media (max-width: 767px) {
          .admin-main-content { ${isRTL ? 'margin-right: 0 !important;' : 'margin-left: 0 !important;'} padding: 80px 16px 24px !important; }
        }
      `}</style>
    </div>
  )
}
