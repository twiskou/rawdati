import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, Image } from 'lucide-react'
import { getServerLanguage } from '@/lib/i18n/server'

export default async function AdminActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ classroomId?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')
  if (!session.kindergartenId) redirect('/admin/dashboard')

  const params = await searchParams
  const classroomFilter = params.classroomId

  const classrooms = await prisma.classroom.findMany({
    where: { kindergartenId: session.kindergartenId },
    orderBy: { name: 'asc' },
  })

  const activities = await prisma.activity.findMany({
    where: {
      classroom: {
        kindergartenId: session.kindergartenId,
        ...(classroomFilter ? { id: classroomFilter } : {}),
      },
    },
    include: {
      classroom: true,
      createdBy: true,
      media: true,
    },
    orderBy: { activityDate: 'desc' },
  })

  const { t, isRTL } = await getServerLanguage()
  const tr = t.admin.activities

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1100px', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {tr.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {tr.subtitle.replace('{count}', activities.length.toString())}
        </p>
      </div>

      {/* Class filter */}
      <div
        style={{
          background: 'white', borderRadius: '16px', padding: '14px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '24px',
          display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', [isRTL ? 'marginLeft' : 'marginRight']: '4px' }}>{tr.filterClass}</span>
        <a
          href="/admin/activities"
          style={{
            padding: '7px 14px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '600',
            background: !classroomFilter ? 'linear-gradient(135deg, #F72585, #4361EE)' : '#f1f5f9',
            color: !classroomFilter ? 'white' : '#64748b',
          }}
        >
          {tr.all}
        </a>
        {classrooms.map((cls) => (
          <a
            key={cls.id}
            href={`/admin/activities?classroomId=${cls.id}`}
            style={{
              padding: '7px 14px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '600',
              background: classroomFilter === cls.id ? 'linear-gradient(135deg, #F72585, #4361EE)' : '#f1f5f9',
              color: classroomFilter === cls.id ? 'white' : '#64748b',
            }}
          >
            {cls.name}
          </a>
        ))}
      </div>

      {activities.length === 0 ? (
        <div
          style={{
            background: 'white', borderRadius: '20px', padding: '60px 40px',
            textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: '64px', margin: '0 0 16px' }}>🎨</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>{tr.noActivities}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                background: 'white', borderRadius: '18px', padding: '20px 24px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap',
                transition: 'box-shadow 0.15s',
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: '80px', height: '80px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(247,37,133,0.1), rgba(67,97,238,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {activity.media[0] ? (
                  <img src={activity.media[0].filepath} alt={activity.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '28px' }}>🎨</span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  {activity.title}
                </h3>
                {activity.description && (
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                    {activity.description.length > 120 ? activity.description.substring(0, 120) + '...' : activity.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#94a3b8' }}>
                    <Calendar size={12} />
                    {new Date(activity.activityDate).toLocaleDateString(isRTL ? 'ar-EG' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#94a3b8' }}>
                    <Image size={12} />
                    {tr.photos.replace('{count}', activity.media.length.toString())}
                  </span>
                  <span
                    style={{
                      padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600',
                      background: 'rgba(67,97,238,0.08)', color: '#4361EE',
                    }}
                  >
                    {activity.classroom.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {tr.by.replace('{name}', `${activity.createdBy.firstName} ${activity.createdBy.lastName}`)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  style={{
                    padding: '8px 14px', borderRadius: '10px', background: '#fee2e2',
                    border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#ef4444',
                  }}
                >
                  {tr.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
