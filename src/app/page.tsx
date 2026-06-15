'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import { useT } from '@/lib/i18n/LanguageContext'
import {
  Camera,
  CalendarCheck,
  UtensilsCrossed,
  Megaphone,
  Bell,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const featureIcons = [Camera, CalendarCheck, UtensilsCrossed, Megaphone, Bell, MessageCircle]
const featureStyles = [
  { bg: 'bg-pink-50', border: 'border-pink-100', iconBg: 'bg-pink-100', iconColor: 'text-pink-500' },
  { bg: 'bg-blue-50', border: 'border-blue-100', iconBg: 'bg-blue-100', iconColor: 'text-blue-500' },
  { bg: 'bg-purple-50', border: 'border-purple-100', iconBg: 'bg-purple-100', iconColor: 'text-purple-500' },
  { bg: 'bg-orange-50', border: 'border-orange-100', iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  { bg: 'bg-green-50', border: 'border-green-100', iconBg: 'bg-green-100', iconColor: 'text-green-500' },
  { bg: 'bg-teal-50', border: 'border-teal-100', iconBg: 'bg-teal-100', iconColor: 'text-teal-500' },
]

export default function HomePage() {
  const t = useT()

  const stats = [
    { number: '500+', label: t.home.statFamilies },
    { number: '50+', label: t.home.statNurseries },
    { number: '99%', label: t.home.statSatisfaction },
  ]

  return (
    <main className="min-h-screen bg-white">

      <Navbar />

      {/* HERO */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-full px-4 py-2 mb-8">
            <Sparkles size={14} className="text-pink-500" />
            <span className="text-pink-600 text-sm font-medium">{t.home.badge}</span>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight tracking-tight text-gray-900">
            {t.home.heroTitle1}
            <br />
            <span className="gradient-text">{t.home.heroTitle2}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.home.heroSubtitle}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="gradient-bg text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 hover:scale-105 transition-all shadow-xl shadow-pink-200 w-full sm:w-auto text-center flex items-center justify-center gap-2"
            >
              {t.home.ctaStart}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#features"
              className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-pink-300 transition-all w-full sm:w-auto text-center"
            >
              {t.home.ctaFeatures}
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black gradient-text">{stat.number}</div>
                <div className="text-gray-400 text-sm mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-gray-900">{t.home.featuresTitle}</h2>
            <p className="text-gray-500 text-lg">{t.home.featuresSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.home.features.map((feature, i) => {
              const Icon = featureIcons[i]
              const s = featureStyles[i]
              return (
                <div
                  key={feature.title}
                  className={`${s.bg} border ${s.border} rounded-2xl p-7 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                >
                  <div className={`${s.iconBg} w-12 h-12 rounded-xl flex items-center justify-center mb-5`}>
                    <Icon size={22} className={s.iconColor} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-gray-900">{t.home.howTitle}</h2>
            <p className="text-gray-500 text-lg">{t.home.howSubtitle}</p>
          </div>
          <div className="space-y-5">
            {t.home.steps.map((item, i) => (
              <div
                key={i}
                className="flex gap-5 items-start bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`${i % 2 === 0 ? 'bg-gradient-to-br from-pink-500 to-pink-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'} text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md`}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="gradient-bg rounded-3xl p-12 text-white text-center shadow-2xl">
            <h2 className="text-4xl font-black mb-4">{t.home.ctaBoxTitle}</h2>
            <p className="text-white/80 text-lg mb-8">
              {t.home.ctaBoxSubtitle}
            </p>
            <Link
              href="/login"
              className="bg-white text-pink-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform inline-flex items-center gap-2 shadow-lg"
            >
              {t.home.ctaBoxBtn}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />

    </main>
  )
}
