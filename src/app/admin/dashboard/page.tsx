import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerLanguage } from '@/lib/i18n/server'
import { Users, Baby, DoorOpen, Bell, CheckCircle, Calendar } from 'lucide-react'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const { t, isRTL } = await getServerLanguage()

  if (!session.kindergartenId) {
    return (
      <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '18px', color: '#374151' }}>{t.admin.dashboard.noKindergarten}</p>
        </div>
      </div>
    )
  }

  const kgId = session.kindergartenId

  const [totalUsers, totalChildren, classrooms, announcements, activities] = await Promise.all([
    prisma.user.count({ where: { kindergartenId: kgId } }),
    prisma.child.count({ where: { classroom: { kindergartenId: kgId } } }),
    prisma.classroom.findMany({
      where: { kindergartenId: kgId },
      include: { teacher: true, children: true, activities: { include: { media: true }, orderBy: { activityDate: 'desc' }, take: 3 } },
    }),
    prisma.announcement.findMany({
      where: { kindergartenId: kgId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { createdBy: true },
    }),
    prisma.activity.findMany({
      where: { classroom: { kindergartenId: kgId } },
      orderBy: { activityDate: 'desc' },
      take: 5,
      include: { classroom: true, createdBy: true, media: true },
    }),
  ])

  const teachers = await prisma.user.count({ where: { kindergartenId: kgId, role: 'TEACHER' } })
  const parents = await prisma.user.count({ where: { kindergartenId: kgId, role: 'PARENT' } })

  // Today's attendance
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const presentToday = await prisma.attendance.count({
    where: {
      status: 'PRESENT',
      date: { gte: today },
      child: { classroom: { kindergartenId: kgId } },
    },
  })

  const stats = [
    { label: t.admin.dashboard.totalChildren, value: totalChildren, icon: Baby, color: '#4361EE', bg: 'rgba(67,97,238,0.08)' },
    { label: t.admin.dashboard.parents, value: parents, icon: Users, color: '#F72585', bg: 'rgba(247,37,133,0.08)' },
    { label: t.admin.dashboard.teachers, value: teachers, icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
    { label: t.admin.dashboard.classrooms, value: classrooms.length, icon: DoorOpen, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: t.admin.dashboard.presentToday, value: presentToday, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: t.admin.dashboard.announcements, value: announcements.length, icon: Bell, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  ]

  const announcementBadge: Record<string, { bg: string; color: string; label: string }> = {
    MEETING: { bg: '#ede9fe', color: '#7c3aed', label: t.admin.dashboard.badgeMeeting },
    OUTING: { bg: '#d1fae5', color: '#059669', label: t.admin.dashboard.badgeOuting },
    EVENT: { bg: '#fef3c7', color: '#d97706', label: t.admin.dashboard.badgeEvent },
    INFO: { bg: '#dbeafe', color: '#2563eb', label: t.admin.dashboard.badgeInfo },
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {t.admin.dashboard.title} 🏫
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {t.admin.dashboard.subtitle.replace('{name}', session.firstName)}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={s.color} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '26px', fontWeight: '700', color: '#0f172a' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Classes overview */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>{t.admin.dashboard.classrooms}</h2>
          {classrooms.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>{t.admin.dashboard.noClassrooms}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {classrooms.map((cls) => (
                <div key={cls.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{cls.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      {cls.teacher ? `${cls.teacher.firstName} ${cls.teacher.lastName}` : t.admin.dashboard.unassigned}
                    </p>
                  </div>
                  <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', background: 'rgba(67,97,238,0.1)', color: '#4361EE' }}>
                      {cls.children.length} {t.admin.dashboard.students}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activities */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>{t.admin.dashboard.recentActivities}</h2>
          {activities.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>{t.admin.dashboard.noActivities}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activities.map((act) => (
                <div key={act.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', borderLeft: isRTL ? 'none' : '3px solid #4361EE', borderRight: isRTL ? '3px solid #4361EE' : 'none' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{act.title}</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>📚 {act.classroom.name}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      📅 {new Date(act.activityDate).toLocaleDateString(isRTL ? 'ar-EG' : 'fr-FR')}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>📷 {act.media.length} {t.admin.dashboard.photos}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcements */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>{t.admin.dashboard.latestAnnouncements}</h2>
          <a href="/admin/announcements" style={{ fontSize: '13px', color: '#4361EE', textDecoration: 'none', fontWeight: '500' }}>{t.admin.dashboard.seeAll}</a>
        </div>
        {announcements.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>{t.admin.dashboard.noAnnouncements}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {announcements.map((ann) => {
              const badge = announcementBadge[ann.type] ?? { bg: '#f1f5f9', color: '#475569', label: ann.type }
              return (
                <div key={ann.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: '#f8fafc', borderRadius: '12px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: badge.bg, color: badge.color, flexShrink: 0 }}>{badge.label}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{ann.title}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                      {ann.createdBy.firstName} {ann.createdBy.lastName} · {new Date(ann.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'fr-FR')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
