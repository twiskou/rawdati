'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface QuickLink {
  href: string
  icon: ReactNode
  label: string
  bg: string
}

export function QuickLinkCard({ link }: { link: QuickLink }) {
  return (
    <Link href={link.href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: 'white', borderRadius: '16px', padding: '20px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)',
          transition: 'all 0.2s ease', cursor: 'pointer', textAlign: 'center',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: link.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {link.icon}
        </div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{link.label}</span>
      </div>
    </Link>
  )
}
