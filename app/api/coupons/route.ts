import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, checkImpersonation } from '@/lib/session'

// GET - ดูประวัติคูปองที่ใช้ + เช็คโค้ดคูปอง
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    // ถ้ามี code = เช็คโค้ดคูปอง
    if (code) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase().trim() },
      })

      if (!coupon) {
        return NextResponse.json({ error: 'ไม่พบคูปองนี้' }, { status: 404 })
      }
      if (!coupon.isActive) {
        return NextResponse.json({ error: 'คูปองนี้ถูกปิดการใช้งาน' }, { status: 400 })
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: 'คูปองนี้หมดอายุแล้ว' }, { status: 400 })
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'คูปองนี้ถูกใช้ครบจำนวนแล้ว' }, { status: 400 })
      }

      // เช็คว่า user ใช้ไปกี่ครั้งแล้ว
      const userRedemptions = await prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId: session.userId },
      })
      if (userRedemptions >= coupon.perUserLimit) {
        return NextResponse.json({ error: 'คุณใช้คูปองนี้ครบจำนวนแล้ว' }, { status: 400 })
      }

      // เช็คระยะเวลาที่ใช้ได้ (ถ้ามีส่งมา)
      const durationParam = searchParams.get('duration')
      if (durationParam && coupon.applicableDurations && coupon.applicableDurations.length > 0) {
        if (!coupon.applicableDurations.includes(durationParam)) {
          const durationLabels: Record<string, string> = {
            '1': '1 วัน', '7': '7 วัน', '30': '1 เดือน', '90': '3 เดือน', '180': '6 เดือน', '365': '1 ปี'
          }
          const allowedLabels = coupon.applicableDurations.map(d => durationLabels[d] || `${d} วัน`).join(', ')
          return NextResponse.json({ error: `คูปองนี้ใช้ได้เฉพาะซื้อ ${allowedLabels} เท่านั้น` }, { status: 400 })
        }
      }

      return NextResponse.json({
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          minPurchase: coupon.minPurchase,
          maxDiscount: coupon.maxDiscount,
          applicableDurations: coupon.applicableDurations,
          expiresAt: coupon.expiresAt,
        },
      })
    }

    // ถ้าไม่มี code = ดูประวัติ
    const redemptions = await prisma.couponRedemption.findMany({
      where: { userId: session.userId },
      include: {
        coupon: { select: { code: true, name: true, type: true, value: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    return NextResponse.json({ redemptions })
  } catch (error) {
    console.error('Coupon GET error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - ใช้คูปอง (DEPRECATED: คูปองเปลี่ยนเป็น purchase-time เท่านั้น)
// ผู้ใช้ต้องใส่รหัสคูปองตอนซื้อ VPN ที่หน้า /vpn เท่านั้น
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const body = await req.json()
    const { code, duration } = body

    if (!code) {
      return NextResponse.json({ error: 'กรุณากรอกรหัสคูปอง' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!coupon) {
      return NextResponse.json({ error: 'ไม่พบคูปองนี้' }, { status: 404 })
    }
    if (!coupon.isActive) {
      return NextResponse.json({ error: 'คูปองนี้ถูกปิดการใช้งาน' }, { status: 400 })
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'คูปองนี้หมดอายุแล้ว' }, { status: 400 })
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'คูปองนี้ถูกใช้ครบจำนวนแล้ว' }, { status: 400 })
    }

    // เช็ค per-user limit
    const userRedemptions = await prisma.couponRedemption.count({
      where: { couponId: coupon.id, userId: session.userId },
    })
    if (userRedemptions >= coupon.perUserLimit) {
      return NextResponse.json({ error: 'คุณใช้คูปองนี้ครบจำนวนแล้ว' }, { status: 400 })
    }

    // เช็คระยะเวลาที่ใช้ได้ (ถ้ามีส่งมา)
    if (duration && coupon.applicableDurations && coupon.applicableDurations.length > 0) {
      if (!coupon.applicableDurations.includes(String(duration))) {
        const durationLabels: Record<string, string> = {
          '1': '1 วัน', '7': '7 วัน', '30': '1 เดือน', '90': '3 เดือน', '180': '6 เดือน', '365': '1 ปี'
        }
        const allowedLabels = coupon.applicableDurations.map(d => durationLabels[d] || `${d} วัน`).join(', ')
        return NextResponse.json({ error: `คูปองนี้ใช้ได้เฉพาะซื้อ ${allowedLabels} เท่านั้น` }, { status: 400 })
      }
    }

    // คูปองเป็นระบบ purchase-time — ไม่เติมเครดิตเข้ากระเป๋า แต่ให้ไปใช้ตอนซื้อ VPN
    return NextResponse.json({
      success: true,
      purchaseTimeOnly: true,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
        applicableDurations: coupon.applicableDurations,
      },
      message: `คูปอง "${coupon.name}" พร้อมใช้งาน! กรุณาใส่รหัสนี้ตอนซื้อ VPN เพื่อรับส่วนลด`,
    })
  } catch (error) {
    console.error('Coupon POST error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
