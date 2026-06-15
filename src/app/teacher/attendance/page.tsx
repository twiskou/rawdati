import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TeacherAttendanceClient from './TeacherAttendanceClient'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TeacherAttendancePage({ searchParams }: Props) {
  const session = await getSession()
  if (!session || !['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) redirect('/login')

  const resolvedSearchParams = await searchParams
  const dateParam = typeof resolvedSearchParams.date === 'string' ? resolvedSearchParams.date : null
  const classParam = typeof resolvedSearchParams.class === 'string' ? resolvedSearchParams.class : null

  // Fetch classrooms (all if admin, or just the teacher's)
  const classrooms = await prisma.classroom.findMany({
    where: session.role === 'TEACHER' ? { teacherId: session.id } : { kindergartenId: session.kindergartenId },
    include: { children: true },
    orderBy: { name: 'asc' }
  })

  // Selected classroom (null means 'all' is selected)
  const isAll = classParam === 'all'
  const classroom = !isAll && classParam 
    ? classrooms.find(c => c.id === classParam) 
    : (isAll ? null : classrooms[0] || null)

  let todayStr = new Date().toISOString().split('T')[0]
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    todayStr = dateParam
  }

  const [y, m, d] = todayStr.split('-').map(Number)
  const today = new Date(Date.UTC(y, m - 1, d))
  const tomorrow = new Date(today.getTime() + 86400000)

  // Target children (either from one classroom or all classrooms)
  const targetChildren = isAll 
    ? classrooms.flatMap(c => c.children.map(child => ({ ...child, className: c.name })))
    : (classroom?.children.map(child => ({ ...child, className: classroom.name })) ?? [])

  const attendances = targetChildren.length > 0
    ? await prisma.attendance.findMany({
        where: {
          childId: { in: targetChildren.map((c) => c.id) },
          date: { gte: today, lt: tomorrow },
        },
      })
    : []

  const attMap = new Map(attendances.map((a) => [a.childId, { status: a.status }]))

  const childrenWithAttendance = targetChildren.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    className: c.className,
    birthDate: c.birthDate?.toISOString() || null,
    allergies: c.allergies,
    medicalNotes: c.medicalNotes,
    attendance: attMap.get(c.id) ?? null,
  }))

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Présences
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            {isAll ? 'Toutes les classes' : (classroom?.name ?? 'Aucune classe')} — Marquage des présences
          </p>
        </div>
      </div>

      <TeacherAttendanceClient
        key={`${todayStr}-${isAll ? 'all' : classroom?.id}`}
        children={childrenWithAttendance}
        classroomId={isAll ? 'all' : (classroom?.id ?? null)}
        todayStr={todayStr}
        classrooms={classrooms.map(c => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}

