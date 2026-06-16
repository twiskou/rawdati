import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, Image } from 'lucide-react'
import { getServerLanguage } from '@/lib/i18n/server'

export default async function ParentActivitiesPage() {
  const session = await getSession()
  if (!session || session.role !== 'PARENT') redirect('/login')

  const { t } = await getServerLanguage()

  const parentChildren = await prisma.parentChild.findMany({
    where: { parentId: session.id },
    include: { child: { include: { classroom: true } } },
  })

  const classroomId = parentChildren[0]?.child?.classroom?.id

  const activities = classroomId
    ? await prisma.activity.findMany({
        where: { classroomId },
        orderBy: { activityDate: 'desc' },
        include: { media: true, createdBy: true },
      })
    : []

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {t.parent.activities.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {t.parent.activities.subtitle}
        </p>
      </div>

      {activities.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: '64px', margin: '0 0 16px' }}>🎨</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>{t.parent.activities.noActivities}</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
            >
              {/* Image preview */}
              <div
                style={{
                  height: '160px',
                  background: 'linear-gradient(135deg, rgba(247,37,133,0.08) 0%, rgba(67,97,238,0.08) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {activity.media[0] ? (
                  <img
                    src={activity.media[0].filepath}
                    alt={activity.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #F72585, #4361EE)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '28px' }}>🎨</span>
                  </div>
                )}
                {activity.media.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      insetInlineEnd: '10px',
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Image size={12} color="white" />
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: '600' }}>{activity.media.length}</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  {activity.title}
                </h3>
                {activity.description && (
                  <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                    {activity.description.length > 100
                      ? activity.description.substring(0, 100) + '...'
                      : activity.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} color="#94a3b8" />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(activity.activityDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
