'use client'

import { useState, useTransition } from 'react'
import { loginAction } from '@/actions/auth'
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'
import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import { useT } from '@/lib/i18n/LanguageContext'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const t = useT()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #eff6ff 50%, #f0f4ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 20px 60px 20px',
          fontFamily: "inherit",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
      {/* Background decorations */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,37,133,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(67,97,238,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '440px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #F72585, #4361EE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={22} color="white" />
            </div>
            <span
              style={{
                fontSize: '28px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #F72585, #4361EE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.5px',
              }}
            >
              ALLO MAMA
            </span>
          </div>
          <div
            style={{
              height: '2px',
              width: '60px',
              background: 'linear-gradient(90deg, #F72585, #4361EE)',
              borderRadius: '2px',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px',
            }}
          >
            {t.login.welcome}
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            {t.login.subtitle}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                letterSpacing: '0.02em',
              }}
            >
              {t.login.emailLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Mail size={17} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder={t.login.emailPlaceholder}
                style={{
                  width: '100%',
                  padding: '13px 14px 13px 44px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  color: '#1e293b',
                  background: '#f8fafc',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4361EE'
                  e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)'
                  e.target.style.background = 'white'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = '#f8fafc'
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  letterSpacing: '0.02em',
                }}
              >
                {t.login.passwordLabel}
              </label>
              <a
                href="#"
                style={{
                  fontSize: '13px',
                  color: '#4361EE',
                  textDecoration: 'none',
                  fontWeight: '500',
                }}
              >
                {t.login.forgotPassword}
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Lock size={17} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '13px 44px 13px 44px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  color: '#1e293b',
                  background: '#f8fafc',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4361EE'
                  e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)'
                  e.target.style.background = 'white'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = '#f8fafc'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0',
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: '100%',
              padding: '14px',
              background: isPending
                ? 'linear-gradient(135deg, #c084a0, #7b8fd4)'
                : 'linear-gradient(135deg, #F72585, #4361EE)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isPending ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s, transform 0.1s',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 15px rgba(247, 37, 133, 0.3)',
              marginTop: '4px',
            }}
            onMouseOver={(e) => {
              if (!isPending) {
                ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.92'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
              }
            }}
            onMouseOut={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
            }}
          >
            {isPending ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                  </path>
                </svg>
                {t.login.loading}
              </span>
            ) : (
              t.login.submit
            )}
          </button>
        </form>

        {/* Separator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '28px 0 20px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{t.login.noAccount}</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* Contact info */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(247,37,133,0.04), rgba(67,97,238,0.04))',
            border: '1px solid rgba(67,97,238,0.12)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
            {t.login.nurseryInfo}
            <br />
            <strong style={{ color: '#4361EE' }}>{t.login.nurseryContact}</strong>{' '}
            {t.login.nurseryContactSuffix}
          </p>
        </div>

      </div>
    </div>
    <Footer />
    </>
  )
}
