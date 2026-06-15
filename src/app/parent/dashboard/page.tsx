import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MessageCircle, TrendingUp, Image, Bell, CheckCircle, Calendar, Utensils, Baby, ClipboardList } from 'lucide-react'
import { QuickLinkCard } from './QuickLinkCard'
import { getT } from '@/lib/i18n/server'

export default async function ParentDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'PARENT') redirect('/login')

  const t = await getT()

  // Fetch parent's children with current month attendances
  const parentChildren = await prisma.parentChild.findMany({
    where: { parentId: session.id },
    include: {
      child: {
        include: {
          classroom: { include: { teacher: true, kindergarten: true } },
          attendances: {
            where: {
              date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
            },
          },
        },
      },
    },
  })

  const child = parentChildren[0]?.child ?? null
  const classroom = child?.classroom ?? null

  // Fetch recent activities
  const recentActivities = classroom
    ? await prisma.activity.findMany({
        where: { classroomId: classroom.id },
        orderBy: { activityDate: 'desc' },
        take: 3,
        include: { media: true },
      })
    : []

  // Today's date using UTC-safe method
  const now = new Date()
  const y = now.getFullYear()
  const mo = now.getMonth()
  const d = now.getDate()
  const todayUtc = new Date(Date.UTC(y, mo, d))
  const tomorrowUtc = new Date(Date.UTC(y, mo, d + 1))

  const meal = classroom?.kindergartenId
    ? await prisma.meal.findFirst({
        where: {
          kindergartenId: classroom.kindergartenId,
          date: { gte: todayUtc, lt: tomorrowUtc },
        },
      })
    : null

  // Today's attendance for the child
  const todayAttendance = child
    ? await prisma.attendance.findFirst({
        where: { childId: child.id, date: { gte: todayUtc, lt: tomorrowUtc } },
      })
    : null

  // Fetch announcements
  const announcements = classroom?.kindergartenId
    ? await prisma.announcement.findMany({
        where: { kindergartenId: classroom.kindergartenId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      })
    : []

  // Stats
  const presentCount = child?.attendances.filter((a) => a.status === 'PRESENT').length ?? 0
  const totalAttendance = child?.attendances.length ?? 0
  const absenceCount = child?.attendances.filter((a) => a.status === 'ABSENT').length ?? 0
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

  // Fetch kindergarten for WhatsApp
  const kindergarten = classroom?.kindergartenId
    ? await prisma.kindergarten.findUnique({ where: { id: classroom.kindergartenId } })
    : null

  const todayStatusConfig: Record<string, { label: string; bg: string; color: string }> = {
    PRESENT: { label: 'Présent aujourd\'hui ✓', bg: '#d1fae5', color: '#059669' },
    ABSENT: { label: 'Absent aujourd\'hui ✗', bg: '#fee2e2', color: '#dc2626' },
    LATE: { label: 'En retard aujourd\'hui', bg: '#fef3c7', color: '#d97706' },
  }

  const announcementBadge: Record<string, { bg: string; color: string; label: string }> = {
    MEETING: { bg: '#ede9fe', color: '#7c3aed', label: 'Réunion' },
    OUTING: { bg: '#d1fae5', color: '#059669', label: 'Sortie' },
    EVENT: { bg: '#fef3c7', color: '#d97706', label: 'Événement' },
    INFO: { bg: '#dbeafe', color: '#2563eb', label: 'Info' },
  }

  const quickLinks = [
    { href: '/parent/child', icon: <Baby size={22} color="#F72585" />, label: t.parent.sidebar.myChild, bg: 'rgba(247,37,133,0.08)' },
    { href: '/parent/attendance', icon: <ClipboardList size={22} color="#4361EE" />, label: t.parent.sidebar.attendance, bg: 'rgba(67,97,238,0.08)' },
    { href: '/parent/meals', icon: <Utensils size={22} color="#10b981" />, label: t.parent.sidebar.meals, bg: 'rgba(16,185,129,0.08)' },
    { href: '/parent/gallery', icon: <Image size={22} color="#f59e0b" />, label: t.parent.sidebar.gallery, bg: 'rgba(245,158,11,0.08)' },
    { href: '/parent/activities', icon: <Calendar size={22} color="#8b5cf6" />, label: t.parent.sidebar.activities, bg: 'rgba(139,92,246,0.08)' },
    { href: '/parent/announcements', icon: <Bell size={22} color="#ef4444" />, label: t.parent.sidebar.announcements, bg: 'rgba(239,68,68,0.08)' },
  ]

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1100px' }}>

      {/* Greeting */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          {session.firstName} 👋
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Child Hero Card */}
      {child ? (
        <div
          style={{
            background: 'linear-gradient(135deg, #F72585 0%, #4361EE 100%)',
            borderRadius: '24px', padding: '28px 32px', marginBottom: '24px',
            color: 'white', boxShadow: '0 12px 40px rgba(247,37,133,0.25)',
            display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '30px', fontWeight: '700', flexShrink: 0, overflow: 'hidden',
              border: '3px solid rgba(255,255,255,0.4)',
            }}
          >
            {child.photo
              ? <img src={child.photo} alt={child.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : `${child.firstName[0]}${child.lastName[0]}`}
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.3px' }}>
              {child.firstName} {child.lastName}
            </p>
            <p style={{ margin: '0 0 2px', fontSize: '14px', opacity: 0.85 }}>
              🏫 {classroom?.name ?? ''}
            </p>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.75 }}>
              👩‍🏫 {classroom?.teacher ? `${classroom.teacher.firstName} ${classroom.teacher.lastName}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {/* Today attendance status */}
            {todayAttendance ? (
              <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '8px 16px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>
                  {todayStatusConfig[todayAttendance.status]?.label ?? todayAttendance.status}
                </p>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '8px 16px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>⏳ Présence non marquée</p>
              </div>
            )}
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '8px 16px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '28px', fontWeight: '800' }}>{attendanceRate}%</p>
              <p style={{ margin: 0, fontSize: '11px', opacity: 0.85 }}>Présence ce mois</p>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'white', borderRadius: '20px', padding: '48px 40px',
            textAlign: 'center', marginBottom: '24px', border: '2px dashed #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '36px' }}>👶</div>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#374151', margin: '0 0 6px' }}>{t.parent.dashboard.noChildren}</p>
          <p style={{ color: '#64748b', margin: 0 }}>{t.parent.dashboard.noChildrenDesc}</p>
        </div>
      )}

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {quickLinks.map((link) => (
          <QuickLinkCard key={link.href} link={link} />
        ))}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Présences ce mois', value: `${presentCount}/${totalAttendance}`, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Absences', value: absenceCount, icon: ClipboardList, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
          { label: 'Activités récentes', value: recentActivities.length, icon: TrendingUp, color: '#4361EE', bg: 'rgba(67,97,238,0.08)' },
          { label: 'Photos disponibles', value: recentActivities.reduce((acc, a) => acc + a.media.length, 0), icon: Image, color: '#F72585', bg: 'rgba(247,37,133,0.08)' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={card.color} />
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{card.value}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        
        {/* Today's Meals */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🍽️ Repas du jour
            </h2>
            <Link href="/parent/meals" style={{ fontSize: '13px', color: '#4361EE', textDecoration: 'none', fontWeight: '600' }}>
              Voir tout →
            </Link>
          </div>
          {meal ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Petit-déjeuner', emoji: '🥐', value: meal.breakfast },
                { label: 'Déjeuner', emoji: '🍽️', value: meal.lunch },
                { label: 'Goûter', emoji: '🍎', value: meal.snack },
              ].map((m) => (
                <div key={m.label} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>{m.emoji}</span>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: m.value ? '#1e293b' : '#94a3b8', fontStyle: m.value ? 'normal' : 'italic' }}>{m.value || 'Non renseigné'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px' }}>
              <p style={{ fontSize: '28px', margin: '0 0 8px' }}>🍽️</p>
              <p style={{ fontSize: '14px', margin: 0 }}>{t.parent.meals.noMeals}</p>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📅 {t.parent.dashboard.recentActivities}
            </h2>
            <Link href="/parent/activities" style={{ fontSize: '13px', color: '#4361EE', textDecoration: 'none', fontWeight: '600' }}>
              {t.parent.child.details}
            </Link>
          </div>
          {recentActivities.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px' }}>
              <p style={{ fontSize: '28px', margin: '0 0 8px' }}>🎨</p>
              <p style={{ fontSize: '14px', margin: 0 }}>{t.parent.dashboard.noActivities}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentActivities.map((activity) => (
                <div key={activity.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', borderLeft: '3px solid #4361EE', display: 'flex', gap: '12px' }}>
                  {activity.media[0] ? (
                    <img src={activity.media[0].filepath} alt={activity.title} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(247,37,133,0.15), rgba(67,97,238,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>🎨</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activity.title}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        {new Date(activity.activityDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </p>
                      {activity.media.length > 0 && (
                        <span style={{ fontSize: '11px', color: '#F72585', fontWeight: '700' }}>
                          📷 {activity.media.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcements */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)', marginBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📢 {t.parent.dashboard.latestAnnouncements}
          </h2>
          <Link href="/parent/announcements" style={{ fontSize: '13px', color: '#4361EE', textDecoration: 'none', fontWeight: '600' }}>
            {t.parent.child.details}
          </Link>
        </div>
        {announcements.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px' }}>
            <p style={{ fontSize: '28px', margin: '0 0 8px' }}>📢</p>
            <p style={{ fontSize: '14px', margin: 0 }}>{t.parent.dashboard.noAnnouncements}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.map((ann) => {
              const badge = announcementBadge[ann.type] ?? { bg: '#f1f5f9', color: '#475569', label: ann.type }
              return (
                <div key={ann.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', background: badge.bg, color: badge.color, flexShrink: 0 }}>
                    {badge.label}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{ann.title}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {ann.content}
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', flexShrink: 0 }}>
                    {new Date(ann.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* WhatsApp FAB */}
      {kindergarten?.whatsappNumber && (
        <a
          href={`https://wa.me/${kindergarten.whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed', bottom: '28px', insetInlineEnd: '28px',
            width: '60px', height: '60px', borderRadius: '50%',
            background: '#25D366', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 6px 24px rgba(37,211,102,0.45)',
            zIndex: 100, textDecoration: 'none',
          }}
        >
          <MessageCircle size={28} color="white" />
        </a>
      )}
    </div>
  )
}
