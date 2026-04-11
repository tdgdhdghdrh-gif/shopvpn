import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET — ดูโฆษณาทั้งหมด (admin)
export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true },
    })
    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ads = await prisma.ad.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const stats = {
      total: ads.length,
      pending: ads.filter(a => a.status === 'pending').length,
      approved: ads.filter(a => a.status === 'approved').length,
      rejected: ads.filter(a => a.status === 'rejected').length,
      expired: ads.filter(a => a.status === 'expired').length,
    }

    return NextResponse.json({ ads, stats })
  } catch (error) {
    console.error('Admin ads GET error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST — อนุมัติ / ปฏิเสธ / ลบ โฆษณา
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true },
    })
    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { id, action, rejectReason } = body

    if (!id) return NextResponse.json({ error: 'ไม่พบ ID โฆษณา' }, { status: 400 })
    if (!action) return NextResponse.json({ error: 'ไม่พบ action' }, { status: 400 })

    const ad = await prisma.ad.findUnique({ where: { id } })
    if (!ad) return NextResponse.json({ error: 'ไม่พบโฆษณา' }, { status: 404 })

    if (action === 'approve') {
      const now = new Date()
      const endDate = new Date(now.getTime() + ad.days * 24 * 60 * 60 * 1000)

      const [updated] = await prisma.$transaction([
        prisma.ad.update({
          where: { id },
          data: {
            status: 'approved',
            startDate: now,
            endDate,
            rejectReason: null,
          },
        }),
        prisma.notification.create({
          data: {
            userId: ad.userId,
            type: 'ad',
            title: 'โฆษณาได้รับการอนุมัติ',
            message: `โฆษณา "${ad.title}" ได้รับการอนุมัติแล้ว จะแสดงถึง ${endDate.toLocaleDateString('th-TH')}`,
            icon: '✅',
            linkUrl: '/ads',
          },
        }),
      ])

      return NextResponse.json({ success: true, ad: updated, message: 'อนุมัติโฆษณาแล้ว' })
    }

    if (action === 'reject') {
      if (!rejectReason?.trim()) {
        return NextResponse.json({ error: 'กรุณาระบุเหตุผลที่ปฏิเสธ' }, { status: 400 })
      }

      // คืนเงินให้ผู้ใช้
      const [updated] = await prisma.$transaction([
        prisma.ad.update({
          where: { id },
          data: {
            status: 'rejected',
            rejectReason: rejectReason.trim(),
          },
        }),
        prisma.user.update({
          where: { id: ad.userId },
          data: { balance: { increment: ad.price } },
        }),
        prisma.notification.create({
          data: {
            userId: ad.userId,
            type: 'ad',
            title: 'โฆษณาถูกปฏิเสธ',
            message: `โฆษณา "${ad.title}" ถูกปฏิเสธ: ${rejectReason.trim()} (คืนเงิน ${ad.price} บาท)`,
            icon: '❌',
            linkUrl: '/ads',
          },
        }),
      ])

      return NextResponse.json({ success: true, ad: updated, message: `ปฏิเสธโฆษณาแล้ว คืนเงิน ${ad.price} บาท` })
    }

    if (action === 'delete') {
      await prisma.ad.delete({ where: { id } })
      return NextResponse.json({ success: true, message: 'ลบโฆษณาแล้ว' })
    }

    return NextResponse.json({ error: 'action ไม่ถูกต้อง' }, { status: 400 })
  } catch (error) {
    console.error('Admin ads POST error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
