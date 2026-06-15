import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const publicRoutes = ['/', '/about', '/contact', '/login']

const roleRoutes: Record<string, string[]> = {
  PARENT: ['/parent'],
  TEACHER: ['/teacher'],
  ADMIN: ['/admin'],
  SUPER_ADMIN: ['/super-admin'],
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Routes publiques
  if (publicRoutes.includes(pathname)) {
    if (token) {
      const payload = await verifyToken(token)
      if (payload) {
        return NextResponse.redirect(new URL(getDashboard(payload.role), request.url))
      }
    }
    return NextResponse.next()
  }

  // Routes protégées
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Vérifier les permissions par rôle
  for (const [role, paths] of Object.entries(roleRoutes)) {
    if (paths.some((p) => pathname.startsWith(p))) {
      if (payload.role !== role) {
        return NextResponse.redirect(new URL(getDashboard(payload.role), request.url))
      }
    }
  }

  return NextResponse.next()
}

function getDashboard(role: string): string {
  switch (role) {
    case 'PARENT': return '/parent/dashboard'
    case 'TEACHER': return '/teacher/dashboard'
    case 'ADMIN': return '/admin/dashboard'
    case 'SUPER_ADMIN': return '/super-admin/dashboard'
    default: return '/login'
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
}
