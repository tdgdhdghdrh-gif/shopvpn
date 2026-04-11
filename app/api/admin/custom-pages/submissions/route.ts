import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function requireAdminSession() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true },
  })

  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

// GET - ดูข้อมูล submissions (รองรับ filter ด้วย pageId)
export async function GET(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const skip = (page - 1) * limit

  const where = pageId ? { pageId } : {}

  const [submissions, total] = await Promise.all([
    prisma.formSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        page: {
          select: { title: true, slug: true },
        },
      },
    }),
    prisma.formSubmission.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    submissions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

// DELETE - ลบ submission (รองรับ single id หรือ deleteAll by pageId)
export async function DELETE(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const pageId = searchParams.get('pageId')

  if (id) {
    // ลบทีละรายการ
    await prisma.formSubmission.delete({ where: { id } })
    return NextResponse.json({ success: true })
  }

  if (pageId) {
    // ลบทั้งหมดของ page นั้น
    const result = await prisma.formSubmission.deleteMany({ where: { pageId } })
    return NextResponse.json({ success: true, deleted: result.count })
  }

  return NextResponse.json({ error: 'ต้องระบุ id หรือ pageId' }, { status: 400 })
}
