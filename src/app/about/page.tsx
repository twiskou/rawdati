'use client'

import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import { Heart, Target, Users, Award, Star, Palette, BookOpen, Gamepad2, BookImage, Trophy, Globe, Baby, ShieldCheck, Smile } from 'lucide-react'
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

      {/* VIRTUAL KINDERGARTEN */}
      <section style={{ padding: '100px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              backgroundColor: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 999, padding: '8px 20px', marginBottom: 24
            }}>
              <Star size={16} color="#d97706" fill="#d97706" />
              <span style={{ color: '#b45309', fontSize: 15, fontWeight: 700 }}>{t.about.virtualKindergarten.badge}</span>
              <Star size={16} color="#d97706" fill="#d97706" />
            </div>
            
            <h2 style={{
              fontSize: 42, fontWeight: 900, marginBottom: 24, color: '#111827'
            }}>
              {t.about.virtualKindergarten.title1}{' '}
              <span style={{
                background: 'linear-gradient(135deg, #F72585, #4361EE)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                {t.about.virtualKindergarten.title2}
              </span>
            </h2>
            
            <p style={{
              fontSize: 20, color: '#4b5563', lineHeight: 1.8,
              maxWidth: 700, margin: '0 auto', fontWeight: 500
            }}>
              {t.about.virtualKindergarten.subtitle}
            </p>
            
            <p style={{
              fontSize: 16, color: '#6b7280', lineHeight: 1.8,
              maxWidth: 800, margin: '24px auto 0',
            }} dangerouslySetInnerHTML={{ __html: t.about.virtualKindergarten.description.replace('الروضة الافتراضية', '<strong>الروضة الافتراضية</strong>').replace('La Crèche Virtuelle', '<strong>La Crèche Virtuelle</strong>') }}>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
            {/* What we offer */}
            <div>
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32, color: '#111827', textAlign: 'center' }}>
                {t.about.virtualKindergarten.whatWeOffer}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 24
              }}>
                {[
                  { icon: Palette, color: '#F72585', bg: '#fdf2f8', text: t.about.virtualKindergarten.offer1 },
                  { icon: BookOpen, color: '#4361EE', bg: '#eff2ff', text: t.about.virtualKindergarten.offer2 },
                  { icon: Gamepad2, color: '#7c3aed', bg: '#f5f3ff', text: t.about.virtualKindergarten.offer3 },
                  { icon: BookImage, color: '#059669', bg: '#f0fdf4', text: t.about.virtualKindergarten.offer4 },
                  { icon: Trophy, color: '#d97706', bg: '#fffbeb', text: t.about.virtualKindergarten.offer5 },
                  { icon: Users, color: '#0891b2', bg: '#ecfeff', text: t.about.virtualKindergarten.offer6 },
                ].map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', alignItems: 'center', gap: 16, 
                    backgroundColor: item.bg, padding: 24, borderRadius: 20,
                    border: `1px solid ${item.bg}`
                  }}>
                    <div style={{
                      minWidth: 56, height: 56, borderRadius: 16, backgroundColor: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                      <item.icon size={28} color={item.color} />
                    </div>
                    <p style={{ color: '#374151', fontSize: 16, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why virtual kindergarten? */}
            <div style={{ backgroundColor: '#f9fafb', borderRadius: 32, padding: '48px 32px' }}>
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32, color: '#111827', textAlign: 'center' }}>
                {t.about.virtualKindergarten.whyUs}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 24, textAlign: 'center'
              }}>
                {[
                  { icon: Globe, title: t.about.virtualKindergarten.why1 },
                  { icon: Baby, title: t.about.virtualKindergarten.why2 },
                  { icon: ShieldCheck, title: t.about.virtualKindergarten.why3 },
                  { icon: Smile, title: t.about.virtualKindergarten.why4 },
                ].map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: 24,
                      background: 'linear-gradient(135deg, #F72585, #4361EE)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', boxShadow: '0 10px 25px rgba(67, 97, 238, 0.2)'
                    }}>
                      <feature.icon size={32} />
                    </div>
                    <h4 style={{ color: '#111827', fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>
                      {feature.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <p style={{
              fontSize: 22, color: '#111827', fontWeight: 800, marginBottom: 32
            }}>
              {t.about.virtualKindergarten.ctaText}
            </p>
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