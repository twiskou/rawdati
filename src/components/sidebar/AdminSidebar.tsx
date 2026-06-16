'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/auth'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import {
  LayoutDashboard, Users, Baby, DoorOpen, Calendar, Bell, Settings, Sparkles, Menu, X, LogOut,
} from 'lucide-react'

interface AdminSidebarProps {
  firstName: string
  lastName: string
  avatar?: string | null
  kindergartenName?: string | null
}

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, labelFr: 'Tableau de bord', labelAr: 'لوحة القيادة' },
  { href: '/admin/users', icon: Users, labelFr: 'Utilisateurs', labelAr: 'المستخدمين' },
  { href: '/admin/children', icon: Baby, labelFr: 'Enfants', labelAr: 'الأطفال' },
  { href: '/admin/classrooms', icon: DoorOpen, labelFr: 'Classes', labelAr: 'الفصول' },
  { href: '/admin/activities', icon: Calendar, labelFr: 'Activités', labelAr: 'الأنشطة' },
  { href: '/admin/announcements', icon: Bell, labelFr: 'Annonces', labelAr: 'الإعلانات' },
  { href: '/admin/settings', icon: Settings, labelFr: 'Paramètres', labelAr: 'الإعدادات' },
]

export default function AdminSidebar({ firstName, lastName, avatar, kindergartenName }: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isRTL } = useLanguage()

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 16px', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ marginBottom: '32px', paddingLeft: isRTL ? 0 : '8px', paddingRight: isRTL ? '8px' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <img src="/logo.png" alt="ALLO MAMA" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        {kindergartenName && (
          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', paddingLeft: isRTL ? 0 : '48px', paddingRight: isRTL ? '48px' : 0 }}>{kindergartenName}</p>
        )}
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(247,37,133,0.06), rgba(67,97,238,0.06))', borderRadius: '14px', padding: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #F72585, #4361EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'white', flexShrink: 0, overflow: 'hidden' }}>
          {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${firstName[0]}${lastName[0]}`}
        </div>
        <div style={{ overflow: 'hidden', textAlign: isRTL ? 'right' : 'left' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {firstName} {lastName}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{isRTL ? 'مدير' : 'Administrateur'}</p>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          const activeBorder = isRTL ? { borderRight: '3px solid #4361EE' } : { borderLeft: '3px solid #4361EE' }
          const inactiveBorder = isRTL ? { borderRight: '3px solid transparent' } : { borderLeft: '3px solid transparent' }
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', background: isActive ? 'linear-gradient(135deg, rgba(247,37,133,0.10), rgba(67,97,238,0.10))' : 'transparent', color: isActive ? '#4361EE' : '#64748b', fontWeight: isActive ? '600' : '500', fontSize: '14px', transition: 'all 0.15s ease', ...(isActive ? activeBorder : inactiveBorder) }}>
              <Icon size={18} />
              {isRTL ? item.labelAr : item.labelFr}
            </Link>
          )
        })}
      </nav>

      <form action={logoutAction} style={{ marginTop: '16px' }}>
        <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: '500', fontSize: '14px' }}>
          <LogOut size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
          {isRTL ? 'تسجيل الخروج' : 'Déconnexion'}
        </button>
      </form>
    </div>
  )

  return (
    <>
      <aside style={{ width: '260px', minHeight: '100vh', background: 'white', borderRight: isRTL ? 'none' : '1px solid #f1f5f9', borderLeft: isRTL ? '1px solid #f1f5f9' : 'none', position: 'fixed', top: 0, left: isRTL ? 'auto' : 0, right: isRTL ? 0 : 'auto', bottom: 0, zIndex: 40, overflowY: 'auto', direction: isRTL ? 'rtl' : 'ltr' }} className="hidden-mobile-sidebar">
        <SidebarContent />
      </aside>

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 50 }} className="show-mobile-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="ALLO MAMA" style={{ height: '32px', objectFit: 'contain' }} />
        </div>
        <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', padding: '6px' }}>
          <Menu size={24} />
        </button>
      </div>

      {mobileOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60 }} onClick={() => setMobileOpen(false)} />}

      <div style={{ position: 'fixed', top: 0, left: isRTL ? 'auto' : 0, right: isRTL ? 0 : 'auto', bottom: 0, width: '280px', background: 'white', zIndex: 70, transform: mobileOpen ? 'translateX(0)' : (isRTL ? 'translateX(100%)' : 'translateX(-100%)'), transition: 'transform 0.3s ease', overflowY: 'auto', direction: isRTL ? 'rtl' : 'ltr' }}>
        <div style={{ position: 'absolute', top: '16px', right: isRTL ? 'auto' : '16px', left: isRTL ? '16px' : 'auto' }}>
          <button onClick={() => setMobileOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '6px', display: 'flex' }}>
            <X size={20} color="#374151" />
          </button>
        </div>
        <SidebarContent />
      </div>

      <style>{`
        @media (min-width: 768px) { .hidden-mobile-sidebar { display: block !important; } .show-mobile-bar { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile-sidebar { display: none !important; } .show-mobile-bar { display: flex !important; } }
      `}</style>
    </>
  )
}
