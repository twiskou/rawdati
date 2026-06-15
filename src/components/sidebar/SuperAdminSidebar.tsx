'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/auth'
import {
  LayoutDashboard, Building2, Users, CreditCard, ShieldCheck,
  Sparkles, Menu, X, LogOut,
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface SuperAdminSidebarProps {
  firstName: string
  lastName: string
  avatar?: string | null
}

export default function SuperAdminSidebar({ firstName, lastName, avatar }: SuperAdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t, isRTL } = useLanguage()

  const navItems = [
    { href: '/super-admin/dashboard', icon: LayoutDashboard, label: t.superAdmin.sidebar.dashboard },
    { href: '/super-admin/kindergartens', icon: Building2, label: t.superAdmin.sidebar.kindergartens },
    { href: '/super-admin/users', icon: Users, label: t.superAdmin.sidebar.users },
    { href: '/super-admin/subscriptions', icon: CreditCard, label: t.superAdmin.sidebar.subscriptions },
  ]

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 16px' }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', paddingInlineStart: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <img src="/logo.png" alt="ALLO MAMA" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingInlineStart: '48px' }}>
          <ShieldCheck size={11} color="#4361EE" />
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#4361EE', letterSpacing: '0.04em' }}>
            {t.superAdmin.sidebar.superAdmin}
          </span>
        </div>
      </div>

      {/* User */}
      <div style={{ background: 'linear-gradient(135deg, rgba(247,37,133,0.06), rgba(67,97,238,0.06))', borderRadius: '14px', padding: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #F72585, #4361EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'white', flexShrink: 0, overflow: 'hidden' }}>
          {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${firstName[0]}${lastName[0]}`}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {firstName} {lastName}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#4361EE', fontWeight: '600' }}>{t.superAdmin.sidebar.superAdministrator}</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '12px', textDecoration: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(247,37,133,0.10), rgba(67,97,238,0.10))' : 'transparent',
                color: isActive ? '#4361EE' : '#64748b',
                fontWeight: isActive ? '600' : '500', fontSize: '14px', transition: 'all 0.15s',
                borderInlineStart: isActive ? '3px solid #4361EE' : '3px solid transparent',
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <form action={logoutAction} style={{ marginTop: '16px' }}>
        <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: '500', fontSize: '14px' }}>
          <LogOut size={18} />
          {t.superAdmin.sidebar.logout}
        </button>
      </form>
    </div>
  )

  return (
    <>
      <aside style={{ width: '260px', minHeight: '100vh', background: 'white', borderInlineEnd: '1px solid #f1f5f9', position: 'fixed', top: 0, insetInlineStart: 0, bottom: 0, zIndex: 40, overflowY: 'auto' }} className="hidden-mobile-sidebar">
        <SidebarContent />
      </aside>

      <div style={{ position: 'fixed', top: 0, insetInlineStart: 0, insetInlineEnd: 0, height: '60px', background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 50 }} className="show-mobile-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="ALLO MAMA" style={{ height: '32px', objectFit: 'contain' }} />
        </div>
        <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', padding: '6px' }}>
          <Menu size={24} />
        </button>
      </div>

      {mobileOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60 }} onClick={() => setMobileOpen(false)} />}
      <div style={{ position: 'fixed', top: 0, insetInlineStart: 0, bottom: 0, width: '280px', background: 'white', zIndex: 70, transform: mobileOpen ? 'translateX(0)' : `translateX(${isRTL ? '100%' : '-100%'})`, transition: 'transform 0.3s ease', overflowY: 'auto' }}>
        <div style={{ position: 'absolute', top: '16px', insetInlineEnd: '16px' }}>
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
