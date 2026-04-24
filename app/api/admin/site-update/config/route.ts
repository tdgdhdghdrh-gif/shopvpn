import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - Admin: ดึง config ล่าสุด (ไม่สนว่าเปิด/ปิด)
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true },
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let update = await prisma.siteUpdate.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    // สร้าง default record ถ้ายังไม่มี
    if (!update) {
      update = await prisma.siteUpdate.create({
        data: {
          title: 'กำลังอัปเดตระบบ',
          htmlContent: '<div style="width:100vw;height:100vh;background:#000;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#fff;"><h1>กำลังอัปเดตระบบ</h1><p>กรุณารอสักครู่...</p></div>',
          isEnabled: false,
          showToUsers: true,
          showToAdmin: false,
          bypassIps: [],
        },
      })
    }

    return NextResponse.json({ update })
  } catch (error) {
    console.error('Failed to fetch site update config:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// POST - Admin: บันทึก config
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true },
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, htmlContent, isEnabled, showToUsers, showToAdmin, bypassIps } = body

    // หา record ล่าสุด
    let existing = await prisma.siteUpdate.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    // สร้างถ้ายังไม่มี
    if (!existing) {
      existing = await prisma.siteUpdate.create({
        data: {
          title: 'กำลังอัปเดตระบบ',
          htmlContent: '<div style="width:100vw;height:100vh;background:#000;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#fff;"><h1>กำลังอัปเดตระบบ</h1><p>กรุณารอสักครู่...</p></div>',
          isEnabled: false,
          showToUsers: true,
          showToAdmin: false,
          bypassIps: [],
        },
      })
    }

    // ถ้าเปิด isEnabled ให้ปิดอันอื่นก่อน
    if (isEnabled === true) {
      await prisma.siteUpdate.updateMany({
        where: { isEnabled: true, id: { not: existing.id } },
        data: { isEnabled: false },
      })
    }

    const updated = await prisma.siteUpdate.update({
      where: { id: existing.id },
      data: {
        title: title !== undefined ? title : existing.title,
        htmlContent: htmlContent !== undefined ? htmlContent : existing.htmlContent,
        isEnabled: isEnabled !== undefined ? isEnabled : existing.isEnabled,
        showToUsers: showToUsers !== undefined ? showToUsers : existing.showToUsers,
        showToAdmin: showToAdmin !== undefined ? showToAdmin : existing.showToAdmin,
        bypassIps: bypassIps !== undefined ? bypassIps : existing.bypassIps,
      },
    })

    return NextResponse.json({ success: true, update: updated })
  } catch (error) {
    console.error('Failed to save site update:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
