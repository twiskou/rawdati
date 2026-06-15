import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { childId, status, date } = body

  if (!childId || !status || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [y, m, d] = date.split('-').map(Number)
  const dateObj = new Date(Date.UTC(y, m - 1, d))

  // Upsert attendance (create or update)
  const attendance = await prisma.attendance.upsert({
    where: { childId_date: { childId, date: dateObj } },
    create: {
      childId,
      status: status as 'PRESENT' | 'ABSENT' | 'LATE',
      date: dateObj,
    },
    update: {
      status: status as 'PRESENT' | 'ABSENT' | 'LATE',
    },
  })

  return NextResponse.json(attendance, { status: 200 })
}
