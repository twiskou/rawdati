import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, activityDate, classroomId } = body

  if (!title || !activityDate || !classroomId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const activity = await prisma.activity.create({
    data: {
      title,
      description: description || null,
      activityDate: new Date(activityDate),
      classroomId,
      createdById: session.id,
    },
  })

  return NextResponse.json(activity, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, title, description, activityDate } = body

  if (!id || !title || !activityDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      title,
      description: description || null,
      activityDate: new Date(activityDate),
    },
  })

  return NextResponse.json(activity)
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  // Ensure activity belongs to the same kindergarten
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: { classroom: true }
  })

  if (!activity) {
    return NextResponse.json({ error: 'Activité non trouvée' }, { status: 404 })
  }

  if (activity.classroom.kindergartenId !== session.kindergartenId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Cascade delete handles media deletion due to onDelete: Cascade on Media relation
  await prisma.activity.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
