import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import TeacherSidebar from '@/components/sidebar/TeacherSidebar'
import { getServerLanguage } from '@/lib/i18n/server'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'TEACHER') redirect('/login')

  const { isRTL } = await getServerLanguage()
  const marginStyle = isRTL ? { marginRight: '260px' } : { marginLeft: '260px' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', direction: isRTL ? 'rtl' : 'ltr' }}>
      <TeacherSidebar firstName={session.firstName} lastName={session.lastName} />
      <main style={{ ...marginStyle, minHeight: '100vh', padding: '32px' }} className="teacher-main-content">
        {children}
      </main>
      <style>{`
        @media (max-width: 767px) {
          .teacher-main-content {
            ${isRTL ? 'margin-right: 0 !important;' : 'margin-left: 0 !important;'}
            padding: 80px 16px 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
