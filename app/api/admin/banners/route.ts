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

// GET - List all banners (admin)
export async function GET() {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const banners = await prisma.promoBanner.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ success: true, banners })
}

// POST - Create new banner
export async function POST(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, imageUrl, linkUrl, isActive, sortOrder, aspectRatio, overlayTitle, overlaySubtitle, buttonText, buttonLink } = await request.json()

    if (!title?.trim() || !imageUrl?.trim()) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกชื่อและอัพโหลดรูปแบนเนอร์' }, { status: 400 })
    }

    const banner = await prisma.promoBanner.create({
      data: {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl?.trim() || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        aspectRatio: aspectRatio || '16:9',
        overlayTitle: overlayTitle?.trim() || null,
        overlaySubtitle: overlaySubtitle?.trim() || null,
        buttonText: buttonText?.trim() || null,
        buttonLink: buttonLink?.trim() || null,
        createdBy: admin.id,
      }
    })

    return NextResponse.json({ success: true, banner })
  } catch (error) {
    console.error('Create banner error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - Update banner
export async function PUT(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, title, imageUrl, linkUrl, isActive, sortOrder, aspectRatio, overlayTitle, overlaySubtitle, buttonText, buttonLink } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })
    }

    const data: any = {}
    if (title !== undefined) data.title = title.trim()
    if (imageUrl !== undefined) data.imageUrl = imageUrl.trim()
    if (linkUrl !== undefined) data.linkUrl = linkUrl?.trim() || null
    if (isActive !== undefined) data.isActive = isActive
    if (sortOrder !== undefined) data.sortOrder = sortOrder
    if (aspectRatio !== undefined) data.aspectRatio = aspectRatio
    if (overlayTitle !== undefined) data.overlayTitle = overlayTitle?.trim() || null
    if (overlaySubtitle !== undefined) data.overlaySubtitle = overlaySubtitle?.trim() || null
    if (buttonText !== undefined) data.buttonText = buttonText?.trim() || null
    if (buttonLink !== undefined) data.buttonLink = buttonLink?.trim() || null

    const banner = await prisma.promoBanner.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, banner })
  } catch (error) {
    console.error('Update banner error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - Delete banner
export async function DELETE(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })
    }

    await prisma.promoBanner.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete banner error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
