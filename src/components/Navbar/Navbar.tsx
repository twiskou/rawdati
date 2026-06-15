'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import logo from '../../../public/logo.png'
import { useLanguage, useT } from '@/lib/i18n/LanguageContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const { locale, setLocale } = useLanguage()
  const t = useT()

  const links = [
    { href: '#features', label: t.nav.features },
    { href: '#how', label: t.nav.howItWorks },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ]

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setIsOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const gradientStyle = {
    background: 'linear-gradient(135deg, #F72585, #4361EE)',
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      backgroundColor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #f3f4f6',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Main Row */}
      <div style={{
        maxWidth: 1152, margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image src={logo} alt="Logo" style={{ height: 75, width: 'auto' }} priority />
        </Link>

        {/* Desktop Links */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {links.map(link => (
              <Link key={link.href} href={link.href} style={{
                color: '#6b7280', textDecoration: 'none',
                fontSize: 14, fontWeight: 500,
              }}>
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Desktop Right: Language Toggle + CTA */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Language Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1.5px solid #e5e7eb',
              borderRadius: 999,
              overflow: 'hidden',
              fontSize: 13,
              fontWeight: 600,
            }}>
              <button
                onClick={() => setLocale('fr')}
                style={{
                  padding: '7px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: locale === 'fr' ? 'linear-gradient(135deg, #F72585, #4361EE)' : 'white',
                  color: locale === 'fr' ? 'white' : '#6b7280',
                  transition: 'all 0.2s',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                FR
              </button>
              <button
                onClick={() => setLocale('ar')}
                style={{
                  padding: '7px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: locale === 'ar' ? 'linear-gradient(135deg, #F72585, #4361EE)' : 'white',
                  color: locale === 'ar' ? 'white' : '#6b7280',
                  transition: 'all 0.2s',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                ع
              </button>
            </div>

            {/* CTA Button */}
            <Link href="/login" style={{
              ...gradientStyle,
              color: 'white', padding: '10px 22px',
              borderRadius: 999, fontSize: 14, fontWeight: 600,
              textDecoration: 'none', display: 'flex',
              alignItems: 'center', gap: 6,
              boxShadow: '0 4px 14px rgba(247,37,133,0.35)',
            }}>
              {t.nav.login} <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Mobile Burger */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Mobile Language Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1.5px solid #e5e7eb',
              borderRadius: 999,
              overflow: 'hidden',
              fontSize: 12,
              fontWeight: 700,
            }}>
              <button
                onClick={() => setLocale('fr')}
                style={{
                  padding: '5px 10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: locale === 'fr' ? 'linear-gradient(135deg, #F72585, #4361EE)' : 'white',
                  color: locale === 'fr' ? 'white' : '#6b7280',
                  transition: 'all 0.2s',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                FR
              </button>
              <button
                onClick={() => setLocale('ar')}
                style={{
                  padding: '5px 10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: locale === 'ar' ? 'linear-gradient(135deg, #F72585, #4361EE)' : 'white',
                  color: locale === 'ar' ? 'white' : '#6b7280',
                  transition: 'all 0.2s',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                ع
              </button>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                width: 42, height: 42,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, border: '1.5px solid #e5e7eb',
                backgroundColor: 'white', cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {isOpen
                ? <X size={20} color="#374151" />
                : <Menu size={20} color="#374151" />
              }
            </button>
          </div>
        )}
      </div>

      {/* Mobile Dropdown */}
      {isMobile && isOpen && (
        <div style={{
          backgroundColor: 'white',
          borderTop: '1px solid #f3f4f6',
          padding: '12px 20px 20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        }}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                padding: '13px 16px',
                borderRadius: 12,
                color: '#374151',
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 500,
                marginBottom: 2,
              }}
            >
              {link.label}
            </Link>
          ))}

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              style={{
                ...gradientStyle,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                color: 'white', padding: '14px 20px',
                borderRadius: 999, fontSize: 15,
                fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(247,37,133,0.35)',
              }}
            >
              {t.nav.login} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}