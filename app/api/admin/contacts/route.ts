import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - ดึงรายชื่อแอดมินทั้งหมด (admin)
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const contacts = await prisma.adminContact.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Get admin contacts error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - เพิ่มรายชื่อแอดมิน
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { nickname, role, avatar, facebookUrl, availableFrom, availableTo, description } = body

    if (!nickname || !facebookUrl) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อเล่นและลิงก์เฟส' }, { status: 400 })
    }

    const contact = await prisma.adminContact.create({
      data: {
        nickname,
        role: role || 'แอดมิน',
        avatar: avatar || null,
        facebookUrl,
        availableFrom: availableFrom || '09:00',
        availableTo: availableTo || '22:00',
        description: description || null,
      }
    })

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    console.error('Create admin contact error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT - แก้ไขรายชื่อแอดมิน
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { id, nickname, role, avatar, facebookUrl, availableFrom, availableTo, description, isActive, sortOrder } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const contact = await prisma.adminContact.update({
      where: { id },
      data: {
        ...(nickname !== undefined && { nickname }),
        ...(role !== undefined && { role }),
        ...(avatar !== undefined && { avatar }),
        ...(facebookUrl !== undefined && { facebookUrl }),
        ...(availableFrom !== undefined && { availableFrom }),
        ...(availableTo !== undefined && { availableTo }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      }
    })

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    console.error('Update admin contact error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - ลบรายชื่อแอดมิน
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    await prisma.adminContact.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete admin contact error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
