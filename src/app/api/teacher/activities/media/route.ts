import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const activityId = formData.get('activityId') as string
    const files = formData.getAll('files') as File[]

    if (!activityId || files.length === 0) {
      return NextResponse.json({ error: 'Activity ID and files are required' }, { status: 400 })
    }

    // Verify activity ownership
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { classroom: true }
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    if (session.role !== 'SUPER_ADMIN' && activity.classroom.kindergartenId !== session.kindergartenId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Ignore if directory already exists
    }

    const uploadedMedia = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = path.extname(file.name) || '.jpg'
      const uniqueName = crypto.randomBytes(16).toString('hex') + ext
      const filepath = `/uploads/${uniqueName}`
      const diskPath = path.join(uploadDir, uniqueName)

      await writeFile(diskPath, buffer)

      const media = await prisma.media.create({
        data: {
          activityId,
          filepath,
          filename: file.name,
          filetype: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        }
      })

      uploadedMedia.push(media)
    }

    return NextResponse.json({ success: true, count: uploadedMedia.length, media: uploadedMedia }, { status: 201 })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
