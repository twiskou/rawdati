import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { kindergartenId, breakfast, lunch, snack, date } = body

  if (!kindergartenId || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [y, m, d] = date.split('-').map(Number)
  const dateObj = new Date(Date.UTC(y, m - 1, d))

  const meal = await prisma.meal.upsert({
    where: { kindergartenId_date: { kindergartenId, date: dateObj } },
    create: {
      kindergartenId,
      breakfast: breakfast || null,
      lunch: lunch || null,
      snack: snack || null,
      date: dateObj,
    },
    update: {
      breakfast: breakfast || null,
      lunch: lunch || null,
      snack: snack || null,
    },
  })

  return NextResponse.json(meal, { status: 200 })
}
