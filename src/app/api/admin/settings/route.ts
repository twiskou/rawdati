import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, address, phone, whatsappNumber, email, logo } = body

  if (!id || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify admin owns this kindergarten
  if (session.kindergartenId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const kindergarten = await prisma.kindergarten.update({
    where: { id },
    data: {
      name,
      address: address || null,
      phone: phone || null,
      whatsappNumber: whatsappNumber || null,
      email: email || null,
      logo: logo !== undefined ? logo : undefined, // only update if provided
    },
  })

  return NextResponse.json(kindergarten, { status: 200 })
}
