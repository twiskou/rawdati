'use client'

import Link from 'next/link'
import { Users, CheckCircle, Calendar, Image, ClipboardList, Utensils, Bell, Star, ChevronRight } from 'lucide-react'

interface ChildWithAttendance {
  id: string
  firstName: string
  lastName: string
  className: string
  attendances: { status: string }[]
}

interface ActivityWithMedia {
  id: string
  title: string
  activityDate: Date | string
  media: any[]
}

interface TeacherDashboardClientProps {
  firstName: string
  classNames: string
  stats: {
    totalChildren: number
    presentToday: number
    absentToday: number
    notMarked: number
    totalActivities: number
    totalPhotos: number
  }
  childrenList: ChildWithAttendance[]
  activitiesList: ActivityWithMedia[]
}

export default function TeacherDashboardClient({
  firstName, classNames, stats, childrenList, activitiesList
}: TeacherDashboardClientProps) {

  const quickLinks = [
    { href: '/teacher/attendance', icon: ClipboardList, label: 'Présences', color: '#10b981', bg: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(16,185,129,0.4)' },
    { href: '/teacher/activities', icon: Calendar, label: 'Activités', color: '#4361EE', bg: 'linear-gradient(135deg, #4361EE, #3b82f6)', shadow: 'rgba(67,97,238,0.4)' },
    { href: '/teacher/meals', icon: Utensils, label: 'Repas', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: 'rgba(245,158,11,0.4)' },
    { href: '/teacher/announcements', icon: Bell, label: 'Annonces', color: '#F72585', bg: 'linear-gradient(135deg, #F72585, #e11d48)', shadow: 'rgba(247,37,133,0.4)' },
  ]

  const statCards = [
    { label: 'Élèves total', value: stats.totalChildren, icon: Users, color: '#4361EE', bg: 'rgba(67,97,238,0.08)' },
    { label: "Présents aujourd'hui", value: stats.presentToday, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'Activités publiées', value: stats.totalActivities, icon: Star, color: '#F72585', bg: 'rgba(247,37,133,0.08)' },
    { label: 'Photos partagées', value: stats.totalPhotos, icon: Image, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  ]

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1200px', animation: 'fadeIn 0.4s ease' }}>
      
      {/* Header Area with Glassmorphism */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '24px', padding: '40px', marginBottom: '32px',
        color: 'white', boxShadow: '0 12px 32px rgba(15,23,42,0.15)'
      }}>
        {/* Decorative background shapes */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(67,97,238,0.4) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-40%', left: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(247,37,133,0.3) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              Bonjour, {firstName} 👋
            </h1>
            <p style={{ fontSize: '16px', color: '#cbd5e1', margin: 0, fontWeight: '500' }}>
              {classNames ? `En charge de : ${classNames}` : 'Aucune classe assignée pour le moment'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aujourd'hui</p>
              <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '700' }}>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Stats Section */}
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {statCards.map((card, i) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="hover-card"
                style={{
                  background: 'white', borderRadius: '20px', padding: '24px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '18px',
                  border: '1px solid rgba(0,0,0,0.02)', transition: 'all 0.2s ease', cursor: 'default'
                }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={26} color={card.color} />
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{card.value}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{card.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Left Column: Attendance & Students */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: 'span 2' }}>
          
          <div style={{ background: 'white', borderRadius: '24px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Présences du jour</h2>
              <Link href="/teacher/attendance" className="hover-link" style={{ fontSize: '14px', color: '#4361EE', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Faire l'appel <ChevronRight size={16} />
              </Link>
            </div>

            {/* Attendance Progress Bar */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
                <span style={{ color: '#10b981' }}>{stats.presentToday} Présents</span>
                <span style={{ color: '#f59e0b' }}>{stats.notMarked} À pointer</span>
                <span style={{ color: '#ef4444' }}>{stats.absentToday} Absents</span>
              </div>
              <div style={{ display: 'flex', height: '12px', borderRadius: '999px', overflow: 'hidden', background: '#f1f5f9' }}>
                {stats.totalChildren > 0 && (
                  <>
                    <div style={{ width: `${(stats.presentToday / stats.totalChildren) * 100}%`, background: '#10b981', transition: 'width 1s ease' }} />
                    <div style={{ width: `${(stats.notMarked / stats.totalChildren) * 100}%`, background: '#fcd34d', transition: 'width 1s ease' }} />
                    <div style={{ width: `${(stats.absentToday / stats.totalChildren) * 100}%`, background: '#ef4444', transition: 'width 1s ease' }} />
                  </>
                )}
              </div>
            </div>

            {/* Mini Student List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {childrenList.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
                   <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Aucun élève trouvé</p>
                 </div>
              ) : (
                childrenList.map((child) => {
                  const att = child.attendances[0]
                  const statusInfo = att
                    ? att.status === 'PRESENT'
                      ? { label: 'Présent', bg: '#d1fae5', color: '#059669', dot: '#10b981' }
                      : att.status === 'ABSENT'
                      ? { label: 'Absent', bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' }
                      : { label: 'Retard', bg: '#fef3c7', color: '#d97706', dot: '#f59e0b' }
                    : { label: 'Non marqué', bg: '#f8fafc', color: '#94a3b8', dot: '#cbd5e1' }

                  return (
                    <div
                      key={child.id}
                      className="hover-bg"
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderRadius: '14px', transition: 'background 0.2s',
                        border: '1px solid #f1f5f9'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: '700', color: '#475569',
                        }}>
                          {child.firstName[0]}{child.lastName[0]}
                        </div>
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                            {child.firstName} {child.lastName}
                          </p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                            {child.className}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: statusInfo.bg, padding: '4px 10px', borderRadius: '999px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusInfo.dot }} />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: statusInfo.color }}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Actions (Floating Cards) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {quickLinks.map((ql) => {
              const Icon = ql.icon
              return (
                <Link
                  key={ql.href}
                  href={ql.href}
                  className="quick-action-card"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    padding: '24px 16px', background: 'white', borderRadius: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)', textDecoration: 'none',
                    border: '1px solid rgba(0,0,0,0.02)', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  <div className="icon-wrapper" style={{
                    width: '56px', height: '56px', borderRadius: '18px',
                    background: ql.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 16px ${ql.shadow}`, transition: 'transform 0.25s ease'
                  }}>
                    <Icon size={26} color="white" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{ql.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Recent Activities */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                Activités récentes
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activitiesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Aucune activité publiée</p>
                </div>
              ) : (
                activitiesList.map((act) => (
                  <div
                    key={act.id}
                    className="hover-card"
                    style={{
                      padding: '16px', background: '#f8fafc', borderRadius: '16px',
                      borderLeft: '4px solid #4361EE', transition: 'all 0.2s', cursor: 'default'
                    }}
                  >
                    <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{act.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {new Date(act.activityDate).toLocaleDateString('fr-FR')}
                      </span>
                      <span style={{ fontSize: '12px', color: '#F72585', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Image size={14} /> {act.media.length} photo(s)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .hover-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06) !important; }
        .hover-bg:hover { background: #f1f5f9 !important; }
        .hover-link:hover { text-decoration: underline !important; }
        .quick-action-card:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.08) !important; }
        .quick-action-card:hover .icon-wrapper { transform: scale(1.1) rotate(5deg); }
      `}</style>
    </div>
  )
}
