import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: list children for this kindergarten
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.kindergartenId) return NextResponse.json({ error: 'No kindergarten' }, { status: 400 })

  const children = await prisma.child.findMany({
    where: { classroom: { kindergartenId: session.kindergartenId } },
    include: {
      classroom: { select: { id: true, name: true } },
      parents: {
        include: {
          parent: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: { firstName: 'asc' },
  })

  // Also include children not yet assigned to any classroom but belonging to this kg
  const orphans = await prisma.child.findMany({
    where: {
      classroomId: null,
      parents: {
        some: {
          parent: { kindergartenId: session.kindergartenId },
        },
      },
    },
    include: {
      classroom: { select: { id: true, name: true } },
      parents: {
        include: {
          parent: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  })

  const all = [...children, ...orphans.filter(o => !children.find(c => c.id === o.id))]
  return NextResponse.json(all)
}

// POST: create child
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.kindergartenId) return NextResponse.json({ error: 'No kindergarten' }, { status: 400 })

  const body = await request.json()
  const { firstName, lastName, birthDate, gender, classroomId, allergies, medicalNotes, parentIds } = body

  if (!firstName || !lastName || !birthDate || !gender) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  // Verify classroom belongs to this kindergarten if provided
  if (classroomId) {
    const cls = await prisma.classroom.findUnique({ where: { id: classroomId } })
    if (!cls || cls.kindergartenId !== session.kindergartenId) {
      return NextResponse.json({ error: 'Classe invalide' }, { status: 400 })
    }
  }

  const child = await prisma.child.create({
    data: {
      firstName,
      lastName,
      birthDate: new Date(birthDate),
      gender,
      classroomId: classroomId || null,
      allergies: allergies || null,
      medicalNotes: medicalNotes || null,
      parents: {
        create: (parentIds || []).map((parentId: string) => ({ parentId })),
      },
    },
    include: {
      classroom: { select: { id: true, name: true } },
      parents: {
        include: {
          parent: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  })

  return NextResponse.json(child, { status: 201 })
}

// PUT: update child
export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.kindergartenId) return NextResponse.json({ error: 'No kindergarten' }, { status: 400 })

  const body = await request.json()
  const { id, firstName, lastName, birthDate, gender, classroomId, allergies, medicalNotes, parentIds } = body

  if (!id || !firstName || !lastName || !birthDate || !gender) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  // Delete old parent links, recreate
  await prisma.parentChild.deleteMany({ where: { childId: id } })

  const child = await prisma.child.update({
    where: { id },
    data: {
      firstName,
      lastName,
      birthDate: new Date(birthDate),
      gender,
      classroomId: classroomId || null,
      allergies: allergies || null,
      medicalNotes: medicalNotes || null,
      parents: {
        create: (parentIds || []).map((parentId: string) => ({ parentId })),
      },
    },
    include: {
      classroom: { select: { id: true, name: true } },
      parents: {
        include: {
          parent: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  })

  return NextResponse.json(child)
}

// DELETE: remove child
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  // Cascading deletes handled by Prisma schema (ParentChild has onDelete: Cascade)
  await prisma.parentChild.deleteMany({ where: { childId: id } })
  await prisma.attendance.deleteMany({ where: { childId: id } })
  await prisma.child.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
