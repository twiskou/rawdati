import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getServerLanguage } from '@/lib/i18n/server'

export default async function ParentMealsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'PARENT') redirect('/login')

  const { t } = await getServerLanguage()

  const params = await searchParams
  const weekOffset = parseInt(params.week ?? '0', 10)

  const parentChildren = await prisma.parentChild.findMany({
    where: { parentId: session.id },
    include: { child: { include: { classroom: { include: { kindergarten: true } } } } },
  })

  const kindergartenId = parentChildren[0]?.child?.classroom?.kindergartenId

  // Calculate week dates with UTC-safe approach
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // Monday = 0

  // UTC-based monday  
  const mondayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + weekOffset * 7))
  const sundayUtc = new Date(Date.UTC(mondayUtc.getUTCFullYear(), mondayUtc.getUTCMonth(), mondayUtc.getUTCDate() + 6, 23, 59, 59, 999))

  // Keep local versions for display labels
  const monday = new Date(mondayUtc.getUTCFullYear(), mondayUtc.getUTCMonth(), mondayUtc.getUTCDate())
  const sunday = new Date(sundayUtc.getUTCFullYear(), sundayUtc.getUTCMonth(), sundayUtc.getUTCDate())

  const meals = kindergartenId
    ? await prisma.meal.findMany({
        where: {
          kindergartenId,
          date: { gte: mondayUtc, lte: sundayUtc },
        },
        orderBy: { date: 'asc' },
      })
    : []

  const weekLabel = weekOffset === 0
    ? 'Cette semaine'
    : weekOffset === -1
    ? 'Semaine dernière'
    : weekOffset === 1
    ? 'Semaine prochaine'
    : `Semaine du ${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`

  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

  const mealEmojis = {
    breakfast: { emoji: '🥐', label: t.parent.meals.breakfast },
    lunch: { emoji: '🍽️', label: t.parent.meals.lunch },
    snack: { emoji: '🍎', label: t.parent.meals.snack },
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {t.parent.meals.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>{t.parent.meals.subtitle}</p>
      </div>

      {/* Week navigation */}
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px 24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <a
          href={`/parent/meals?week=${weekOffset - 1}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '10px',
            background: '#f1f5f9',
            textDecoration: 'none',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background 0.15s',
          }}
        >
          <ChevronLeft size={16} />
          Précédente
        </a>

        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{weekLabel}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            {monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} —{' '}
            {sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <a
          href={`/parent/meals?week=${weekOffset + 1}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '10px',
            background: '#f1f5f9',
            textDecoration: 'none',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Suivante
          <ChevronRight size={16} />
        </a>
      </div>

      {/* Days */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const dayDate = new Date(monday)
          dayDate.setDate(monday.getDate() + i)

          const meal = meals.find((m) => {
            const md = new Date(m.date)
            return md.getUTCDate() === dayDate.getDate() && md.getUTCMonth() === dayDate.getMonth()
          })

          const isToday =
            dayDate.getDate() === now.getDate() &&
            dayDate.getMonth() === now.getMonth() &&
            dayDate.getFullYear() === now.getFullYear()

          return (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '20px 24px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                borderInlineStart: isToday ? '4px solid #4361EE' : '4px solid transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                    {dayNames[i]}
                    {isToday && (
                      <span
                        style={{
                          marginInlineStart: '10px',
                          padding: '2px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: 'rgba(67,97,238,0.1)',
                          color: '#4361EE',
                        }}
                      >
                        Aujourd&apos;hui
                      </span>
                    )}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                    {dayDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                {!meal && (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>{t.parent.child.noData}</span>
                )}
              </div>

              {meal ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  {(['breakfast', 'lunch', 'snack'] as const).map((key) => {
                    const info = mealEmojis[key]
                    return (
                      <div
                        key={key}
                        style={{
                          padding: '12px',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{info.emoji}</span>
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {info.label}
                          </p>
                          <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                            {meal[key] || 'Non renseigné'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px',
                  }}
                >
                  {t.parent.meals.noMeals}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
