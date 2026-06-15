'use server'

import { prisma } from '@/lib/prisma'
import { setSession, clearSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function loginAction(formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Email ou mot de passe invalide' }
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (!user || !user.isActive) {
    return { error: 'Compte introuvable ou désactivé' }
  }

  const valid = await bcrypt.compare(parsed.data.password, user.password)
  if (!valid) {
    return { error: 'Mot de passe incorrect' }
  }

  await setSession({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    kindergartenId: user.kindergartenId || undefined,
  })

  const dashboards: Record<string, string> = {
    PARENT: '/parent/dashboard',
    TEACHER: '/teacher/dashboard',
    ADMIN: '/admin/dashboard',
    SUPER_ADMIN: '/super-admin/dashboard',
  }

  redirect(dashboards[user.role] || '/login')
}

export async function logoutAction() {
  await clearSession()
  redirect('/login')
}