import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import TeacherSidebar from '@/components/sidebar/TeacherSidebar'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'TEACHER') redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TeacherSidebar firstName={session.firstName} lastName={session.lastName} />
      <main style={{ marginLeft: '260px', minHeight: '100vh', padding: '32px' }} className="teacher-main-content">
        {children}
      </main>
      <style>{`
        @media (max-width: 767px) {
          .teacher-main-content {
            margin-left: 0 !important;
            padding: 80px 16px 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
