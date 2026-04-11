import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// POST - Ban a user
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!admin?.isSuperAdmin && !admin?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, reason } = body

    if (!userId) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสผู้ใช้' }, { status: 400 })
    }

    // Prevent banning yourself
    if (userId === session.userId) {
      return NextResponse.json({ error: 'ไม่สามารถแบนตัวเองได้' }, { status: 400 })
    }

    // Check target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, isSuperAdmin: true, isAdmin: true, isBanned: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }

    // Prevent banning admins/superadmins (unless you're superAdmin banning a regular admin)
    if (targetUser.isSuperAdmin) {
      return NextResponse.json({ error: 'ไม่สามารถแบน Super Admin ได้' }, { status: 403 })
    }

    if (targetUser.isAdmin && !admin.isSuperAdmin) {
      return NextResponse.json({ error: 'เฉพาะ Super Admin เท่านั้นที่แบน Admin ได้' }, { status: 403 })
    }

    if (targetUser.isBanned) {
      return NextResponse.json({ error: 'ผู้ใช้นี้ถูกแบนอยู่แล้ว' }, { status: 400 })
    }

    // Ban the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason || null,
      }
    })

    return NextResponse.json({
      success: true,
      message: `แบนผู้ใช้ ${targetUser.name} สำเร็จ`
    })
  } catch (error) {
    console.error('Failed to ban user:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแบนผู้ใช้' }, { status: 500 })
  }
}

// DELETE - Unban a user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!admin?.isSuperAdmin && !admin?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสผู้ใช้' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, isBanned: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }

    if (!targetUser.isBanned) {
      return NextResponse.json({ error: 'ผู้ใช้นี้ไม่ได้ถูกแบน' }, { status: 400 })
    }

    // Unban the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedAt: null,
        banReason: null,
      }
    })

    return NextResponse.json({
      success: true,
      message: `ปลดแบนผู้ใช้ ${targetUser.name} สำเร็จ`
    })
  } catch (error) {
    console.error('Failed to unban user:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการปลดแบน' }, { status: 500 })
  }
}
