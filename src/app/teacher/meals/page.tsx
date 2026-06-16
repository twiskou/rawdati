import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerLanguage } from '@/lib/i18n/server'
import TeacherMealsClient from './TeacherMealsClient'

export default async function TeacherMealsPage() {
  const session = await getSession()
  if (!session || session.role !== 'TEACHER') redirect('/login')

  const { t, isRTL } = await getServerLanguage()
  const tr = t.teacher.meals

  const classroom = await prisma.classroom.findFirst({
    where: { teacherId: session.id },
    include: { kindergarten: true },
  })

  const kindergartenId = classroom?.kindergartenId ?? null

  // Get today's local date in YYYY-MM-DD
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`

  // Create UTC boundaries for today to ensure consistent saving across timezones
  const todayUtc = new Date(Date.UTC(year, Number(month) - 1, Number(day)))
  const tomorrowUtc = new Date(todayUtc.getTime() + 86400000)

  const existingMeal = kindergartenId
    ? await prisma.meal.findFirst({
        where: { kindergartenId, date: { gte: todayUtc, lt: tomorrowUtc } },
      })
    : null

  return (
    <div
      style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        maxWidth: '700px',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 6px',
            letterSpacing: '-0.5px',
          }}
        >
          {tr.title}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
          {tr.subtitle}
        </p>
      </div>
      <TeacherMealsClient
        kindergartenId={kindergartenId}
        existingMeal={
          existingMeal
            ? {
                breakfast: existingMeal.breakfast,
                lunch: existingMeal.lunch,
                snack: existingMeal.snack,
              }
            : null
        }
        todayStr={todayStr}
      />
    </div>
  )
}
