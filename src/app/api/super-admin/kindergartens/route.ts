import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, address, phone, email } = body

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const kindergarten = await prisma.kindergarten.create({
    data: {
      name,
      address: address || null,
      phone: phone || null,
      email: email || null,
      isActive: true,
    },
  })

  return NextResponse.json(kindergarten, { status: 201 })
}

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const kindergartens = await prisma.kindergarten.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { users: true, classrooms: true } } },
  })

  return NextResponse.json(kindergartens)
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, isActive } = body

  const kindergarten = await prisma.kindergarten.update({
    where: { id },
    data: { isActive },
  })

  return NextResponse.json(kindergarten)
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, address, phone, email } = body

  if (!id || !name) {
    return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 })
  }

  const kindergarten = await prisma.kindergarten.update({
    where: { id },
    data: {
      name,
      address: address || null,
      phone: phone || null,
      email: email || null,
    },
  })

  return NextResponse.json(kindergarten)
}
