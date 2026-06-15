import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET: list users for the admin's kindergarten
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.kindergartenId) return NextResponse.json({ error: 'No kindergarten' }, { status: 400 })

  const users = await prisma.user.findMany({
    where: { kindergartenId: session.kindergartenId, role: { in: ['PARENT', 'TEACHER'] } },
    include: {
      taughtClasses: { select: { id: true, name: true } },
      parentChildren: {
        include: {
          child: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

// POST: create user (TEACHER or PARENT)
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.kindergartenId) return NextResponse.json({ error: 'No kindergarten' }, { status: 400 })

  const body = await request.json()
  const { firstName, lastName, email, password, role, phone, classroomId } = body

  if (!firstName || !lastName || !email || !password || !role) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }
  if (!['TEACHER', 'PARENT'].includes(role)) {
    return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashed,
      role,
      phone: phone || null,
      kindergartenId: session.kindergartenId,
      isActive: true,
    },
    include: {
      taughtClasses: { select: { id: true, name: true } },
      parentChildren: { include: { child: { select: { id: true, firstName: true, lastName: true } } } },
    },
  })

  // Assign teacher to classroom if given
  if (role === 'TEACHER' && classroomId) {
    await prisma.classroom.update({
      where: { id: classroomId },
      data: { teacherId: user.id },
    })
  }

  return NextResponse.json(user, { status: 201 })
}

// PUT: update user info
export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, firstName, lastName, phone, classroomId } = body

  if (!id || !firstName || !lastName) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing || existing.kindergartenId !== session.kindergartenId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { firstName, lastName, phone: phone || null },
    include: {
      taughtClasses: { select: { id: true, name: true } },
      parentChildren: { include: { child: { select: { id: true, firstName: true, lastName: true } } } },
    },
  })

  // Re-assign teacher classroom
  if (existing.role === 'TEACHER') {
    // Remove from current classroom
    await prisma.classroom.updateMany({
      where: { teacherId: id },
      data: { teacherId: null },
    })
    if (classroomId) {
      await prisma.classroom.update({ where: { id: classroomId }, data: { teacherId: id } })
    }
  }

  return NextResponse.json(user)
}

// PATCH: toggle active
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, isActive } = body

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing || existing.kindergartenId !== session.kindergartenId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive },
  })

  return NextResponse.json(user)
}

// DELETE: remove user
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing || existing.kindergartenId !== session.kindergartenId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
