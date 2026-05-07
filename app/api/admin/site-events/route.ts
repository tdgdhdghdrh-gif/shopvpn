import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function requireAdminSession() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true }
  })
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

// GET - List all site events
export async function GET() {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const events = await prisma.siteEvent.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, events })
  } catch (error) {
    console.error('GET admin site-events error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - Create site event
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, description, imageUrl, startDate, endDate, isActive, sortOrder } = body

    if (!title?.trim()) return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อกิจกรรม' }, { status: 400 })

    const event = await prisma.siteEvent.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      }
    })

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('POST site-event error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - Update site event
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })

    const data: any = {}
    if (fields.title !== undefined) data.title = fields.title.trim()
    if (fields.description !== undefined) data.description = fields.description?.trim() || null
    if (fields.imageUrl !== undefined) data.imageUrl = fields.imageUrl?.trim() || null
    if (fields.startDate !== undefined) data.startDate = fields.startDate ? new Date(fields.startDate) : null
    if (fields.endDate !== undefined) data.endDate = fields.endDate ? new Date(fields.endDate) : null
    if (fields.isActive !== undefined) data.isActive = fields.isActive
    if (fields.sortOrder !== undefined) data.sortOrder = fields.sortOrder

    const event = await prisma.siteEvent.update({ where: { id }, data })

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('PUT site-event error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - Delete site event
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })

    await prisma.siteEvent.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE site-event error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
