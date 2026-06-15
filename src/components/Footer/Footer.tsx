'use client'

import Link from 'next/link'
import Image from 'next/image'
import logo from '../../../public/logo.png'
import { useT } from '@/lib/i18n/LanguageContext'

export default function Footer() {
  const t = useT()

  return (
    <footer style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #f3f4f6', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Image src={logo} alt="Logo" style={{ height: 75, width: 'auto' }} />
            </div>
            <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#111827' }}>{t.footer.usefulLinks}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="/about" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t.footer.about}</Link>
              <Link href="#features" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t.footer.features}</Link>
              <Link href="/contact" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t.footer.contact}</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#111827' }}>{t.footer.legal}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t.footer.legalNotice}</Link>
              <Link href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t.footer.privacy}</Link>
              <Link href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t.footer.terms}</Link>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>
            {t.footer.copyright.replace('{year}', String(new Date().getFullYear()))}
          </p>
        </div>

      </div>
    </footer>
  )
}
