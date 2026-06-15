'use client'

import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'
import { useT } from '@/lib/i18n/LanguageContext'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const t = useT()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    borderRadius: 12, border: '1.5px solid #e5e7eb',
    fontSize: 15, color: '#111827',
    backgroundColor: 'white', outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  }

  const contactItems = [
    { Icon: Mail, label: t.contact.email, value: 'contact@allomama.dz', color: '#F72585' },
    { Icon: Phone, label: t.contact.phone, value: '+213655330801', color: '#4361EE' },
    { Icon: MapPin, label: t.contact.address, value: 'Annaba, Algérie', color: '#7c3aed' },
    { Icon: MessageCircle, label: t.contact.whatsapp, value: '+213655330801', color: '#059669' },
  ]

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section style={{ paddingTop: 120, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            backgroundColor: '#eff2ff', border: '1px solid #c7d2fe',
            borderRadius: 999, padding: '6px 16px', marginBottom: 24
          }}>
            <MessageCircle size={14} color="#4361EE" />
            <span style={{ color: '#4361EE', fontSize: 14, fontWeight: 500 }}>{t.contact.badge}</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.15, marginBottom: 20, color: '#111827' }}>
            {t.contact.heroTitle1}{' '}
            <span style={{
              background: 'linear-gradient(135deg, #F72585, #4361EE)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              {t.contact.heroTitle2}
            </span>
          </h1>

          <p style={{ fontSize: 18, color: '#6b7280', lineHeight: 1.7 }}>
            {t.contact.heroSubtitle}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 40
        }}>

          {/* Infos */}
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: '#111827' }}>
              {t.contact.coordsTitle}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {contactItems.map(({ Icon, label, value, color }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  backgroundColor: '#f9fafb', borderRadius: 14, padding: '16px 20px'
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    backgroundColor: 'white', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flexShrink: 0
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 15, color: '#111827', fontWeight: 600 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: 24, padding: 32 }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F72585, #4361EE)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Send size={28} color="white" />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#111827' }}>{t.contact.sentTitle}</h3>
                <p style={{ color: '#6b7280' }}>{t.contact.sentSubtitle}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#111827' }}>
                  {t.contact.formTitle}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{t.contact.fullName}</label>
                    <input type="text" placeholder={t.contact.namePlaceholder} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{t.contact.emailLabel}</label>
                    <input type="email" placeholder={t.contact.emailPlaceholder} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{t.contact.subject}</label>
                  <input type="text" placeholder={t.contact.subjectPlaceholder} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required style={inputStyle} />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{t.contact.message}</label>
                  <textarea placeholder={t.contact.messagePlaceholder} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                <button type="submit" style={{
                  background: 'linear-gradient(135deg, #F72585, #4361EE)',
                  color: 'white', padding: '14px 24px',
                  borderRadius: 999, fontSize: 15, fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(247,37,133,0.35)',
                }}>
                  {t.contact.send} <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}