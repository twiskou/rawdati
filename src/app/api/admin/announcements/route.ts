import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Create announcement (Admin only)
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, content, type, kindergartenId } = body

  if (!title || !content || !kindergartenId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify admin owns this kindergarten
  if (session.kindergartenId !== kindergartenId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      type: (type as 'MEETING' | 'OUTING' | 'EVENT' | 'INFO') || 'INFO',
      kindergartenId,
      createdById: session.id,
    },
  })

  return NextResponse.json(announcement, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.announcement.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
