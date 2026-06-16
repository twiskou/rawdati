import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileForm from './ProfileForm'
import { getServerLanguage } from '@/lib/i18n/server'

export default async function ParentProfilePage() {
  const session = await getSession()
  if (!session || session.role !== 'PARENT') redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.id } })
  if (!user) redirect('/login')

  const { t, isRTL } = await getServerLanguage()

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {t.parent.profile.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {t.parent.profile.subtitle}
        </p>
      </div>
      <ProfileForm
        user={{
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
        }}
      />
    </div>
  )
}
