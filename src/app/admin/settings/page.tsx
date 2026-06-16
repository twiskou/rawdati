import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminSettingsClient from './AdminSettingsClient'
import { getServerLanguage } from '@/lib/i18n/server'

export default async function AdminSettingsPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')
  if (!session.kindergartenId) redirect('/admin/dashboard')

  const kindergarten = await prisma.kindergarten.findUnique({
    where: { id: session.kindergartenId },
  })

  if (!kindergarten) redirect('/admin/dashboard')

  const { t, isRTL } = await getServerLanguage()
  const tr = t.admin.settings

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {tr.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {tr.subtitle}
        </p>
      </div>
      <AdminSettingsClient
        kindergarten={{
          id: kindergarten.id,
          name: kindergarten.name,
          address: kindergarten.address,
          phone: kindergarten.phone,
          whatsappNumber: kindergarten.whatsappNumber,
          email: kindergarten.email,
          logo: kindergarten.logo,
        }}
      />
    </div>
  )
}
