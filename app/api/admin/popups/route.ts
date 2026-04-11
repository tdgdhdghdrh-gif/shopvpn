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

// GET - List all popups (admin)
export async function GET() {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const popups = await prisma.promoPopup.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ success: true, popups })
}

// POST - Create new popup
export async function POST(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, imageUrl, linkUrl, isActive, sortOrder, startDate, endDate } = await request.json()

    if (!title?.trim() || !imageUrl?.trim()) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกชื่อและอัพโหลดรูป Popup' }, { status: 400 })
    }

    const popup = await prisma.promoPopup.create({
      data: {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl?.trim() || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: admin.id,
      }
    })

    return NextResponse.json({ success: true, popup })
  } catch (error) {
    console.error('Create popup error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - Update popup
export async function PUT(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, title, imageUrl, linkUrl, isActive, sortOrder, startDate, endDate } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })
    }

    const data: any = {}
    if (title !== undefined) data.title = title.trim()
    if (imageUrl !== undefined) data.imageUrl = imageUrl.trim()
    if (linkUrl !== undefined) data.linkUrl = linkUrl?.trim() || null
    if (isActive !== undefined) data.isActive = isActive
    if (sortOrder !== undefined) data.sortOrder = sortOrder
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null

    const popup = await prisma.promoPopup.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, popup })
  } catch (error) {
    console.error('Update popup error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - Delete popup
export async function DELETE(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })
    }

    await prisma.promoPopup.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete popup error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
