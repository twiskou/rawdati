'use client'

import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import { Heart, Target, Users, Award } from 'lucide-react'
import { useT } from '@/lib/i18n/LanguageContext'

const cardIcons = [Target, Heart, Users, Award]
const cardColors = [
  { color: '#F72585', bg: '#fdf2f8' },
  { color: '#4361EE', bg: '#eff2ff' },
  { color: '#7c3aed', bg: '#f5f3ff' },
  { color: '#059669', bg: '#f0fdf4' },
]

export default function AboutPage() {
  const t = useT()

  const stats = [
    { number: '500+', label: t.about.statFamilies },
    { number: '50+', label: t.about.statNurseries },
    { number: '3', label: t.about.statCities },
    { number: '99%', label: t.about.statSatisfaction },
  ]

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section style={{ paddingTop: 120, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8',
            borderRadius: 999, padding: '6px 16px', marginBottom: 24
          }}>
            <Heart size={14} color="#ec4899" fill="#ec4899" />
            <span style={{ color: '#db2777', fontSize: 14, fontWeight: 500 }}>{t.about.badge}</span>
          </div>

          <h1 style={{
            fontSize: 52, fontWeight: 900, lineHeight: 1.15,
            marginBottom: 24, color: '#111827'
          }}>
            {t.about.heroTitle1}{' '}
            <span style={{
              background: 'linear-gradient(135deg, #F72585, #4361EE)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              {t.about.heroTitle2}
            </span>
          </h1>

          <p style={{
            fontSize: 18, color: '#6b7280', lineHeight: 1.8,
            maxWidth: 600, margin: '0 auto'
          }}>
            {t.about.heroSubtitle}
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24
          }}>
            {t.about.cards.map((card, i) => {
              const Icon = cardIcons[i]
              const { color, bg } = cardColors[i]
              return (
                <div key={card.title} style={{ backgroundColor: bg, borderRadius: 20, padding: 28, border: `1px solid ${bg}` }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, backgroundColor: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <Icon size={22} color={color} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#111827' }}>{card.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7 }}>{card.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #F72585, #4361EE)',
            borderRadius: 24, padding: '48px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 32, textAlign: 'center'
          }}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'white' }}>{stat.number}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}