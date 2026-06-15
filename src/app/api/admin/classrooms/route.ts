import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: list classrooms for the admin's kindergarten
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.kindergartenId) {
    return NextResponse.json({ error: 'No kindergarten' }, { status: 400 })
  }

  const classrooms = await prisma.classroom.findMany({
    where: { kindergartenId: session.kindergartenId },
    include: {
      teacher: { select: { id: true, firstName: true, lastName: true } },
      children: { select: { id: true, firstName: true, lastName: true, gender: true, birthDate: true, photo: true } },
      activities: { orderBy: { activityDate: 'desc' }, take: 1, select: { activityDate: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(classrooms)
}

// POST: create classroom
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.kindergartenId) {
    return NextResponse.json({ error: 'No kindergarten' }, { status: 400 })
  }

  const body = await request.json()
  const { name, description, teacherId } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
  }

  const classroom = await prisma.classroom.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      kindergartenId: session.kindergartenId,
      teacherId: teacherId || null,
    },
    include: {
      teacher: { select: { id: true, firstName: true, lastName: true } },
      children: { select: { id: true, firstName: true, lastName: true, gender: true, birthDate: true, photo: true } },
      activities: { orderBy: { activityDate: 'desc' }, take: 1, select: { activityDate: true } },
    },
  })

  return NextResponse.json(classroom, { status: 201 })
}

// PUT: update classroom
export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, description, teacherId } = body

  if (!id || !name?.trim()) {
    return NextResponse.json({ error: 'ID et nom requis' }, { status: 400 })
  }

  // Verify ownership
  const existing = await prisma.classroom.findUnique({ where: { id } })
  if (!existing || existing.kindergartenId !== session.kindergartenId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const classroom = await prisma.classroom.update({
    where: { id },
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      teacherId: teacherId || null,
    },
    include: {
      teacher: { select: { id: true, firstName: true, lastName: true } },
      children: { select: { id: true, firstName: true, lastName: true, gender: true, birthDate: true, photo: true } },
      activities: { orderBy: { activityDate: 'desc' }, take: 1, select: { activityDate: true } },
    },
  })

  return NextResponse.json(classroom)
}

// DELETE: delete classroom
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  // Verify ownership
  const existing = await prisma.classroom.findUnique({ where: { id } })
  if (!existing || existing.kindergartenId !== session.kindergartenId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.classroom.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
