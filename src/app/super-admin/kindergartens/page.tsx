import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getT } from '@/lib/i18n/server'
import KindergartensClient from './KindergartensClient'

export default async function SuperAdminKindergartensPage() {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') redirect('/login')

  const t = await getT()

  const kindergartens = await prisma.kindergarten.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          users: true,
          classrooms: true,
        },
      },
    },
  })

  // Count children per kindergarten via classrooms
  const kgWithChildren = await Promise.all(
    kindergartens.map(async (kg) => {
      const childrenCount = await prisma.child.count({
        where: { classroom: { kindergartenId: kg.id } },
      })
      return {
        id: kg.id,
        name: kg.name,
        address: kg.address,
        phone: kg.phone,
        email: kg.email,
        isActive: kg.isActive,
        createdAt: kg.createdAt.toISOString(),
        usersCount: kg._count.users,
        childrenCount,
        classroomsCount: kg._count.classrooms,
      }
    })
  )

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {t.superAdmin.kindergartens.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {t.superAdmin.kindergartens.subtitle.replace('{count}', kindergartens.length.toString())}
        </p>
      </div>
      <KindergartensClient kindergartens={kgWithChildren} />
    </div>
  )
}
