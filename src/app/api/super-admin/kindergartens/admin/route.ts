import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { kindergartenId, firstName, lastName, email, password } = body

  if (!kindergartenId || !firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
  }

  // Check email not already used
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashed,
      role: 'ADMIN',
      kindergartenId,
      isActive: true,
    },
  })

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
