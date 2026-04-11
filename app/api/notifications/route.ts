import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - ดึงแจ้งเตือนของผู้ใช้
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true'

    const where: any = { userId: session.userId }
    if (unreadOnly) where.isRead = false

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: session.userId, isRead: false },
      }),
    ])

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - อ่านแจ้งเตือน / อ่านทั้งหมด / ลบ
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const body = await req.json()
    const { action, id } = body

    if (action === 'read' && id) {
      await prisma.notification.updateMany({
        where: { id, userId: session.userId },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'read_all') {
      await prisma.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete' && id) {
      await prisma.notification.deleteMany({
        where: { id, userId: session.userId },
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete_all_read') {
      await prisma.notification.deleteMany({
        where: { userId: session.userId, isRead: true },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'action ไม่ถูกต้อง' }, { status: 400 })
  } catch (error) {
    console.error('Notifications POST error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
