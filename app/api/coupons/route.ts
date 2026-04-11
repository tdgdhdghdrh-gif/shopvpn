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

      return NextResponse.json({
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          minPurchase: coupon.minPurchase,
          maxDiscount: coupon.maxDiscount,
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

// POST - ใช้คูปอง (redeem)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    const body = await req.json()
    const { code } = body

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

    // คำนวณส่วนลด (ใช้เป็นเครดิตเข้ากระเป๋า)
    let discount = 0
    if (coupon.type === 'fixed') {
      discount = coupon.value
    } else {
      // percent — ให้เครดิตตามเปอร์เซ็นต์ของ value (ใช้ value เป็นจำนวนเครดิต)
      discount = coupon.value
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    }

    // Transaction: เพิ่มเครดิต + สร้าง redemption + อัปเดตจำนวนใช้
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.userId },
        data: { balance: { increment: discount } },
      }),
      prisma.couponRedemption.create({
        data: {
          couponId: coupon.id,
          userId: session.userId,
          discount,
        },
      }),
      prisma.coupon.update({
        where: { id: coupon.id },
        data: { usageCount: { increment: 1 } },
      }),
      // สร้าง notification
      prisma.notification.create({
        data: {
          userId: session.userId,
          type: 'coupon',
          title: 'ใช้คูปองสำเร็จ!',
          message: `คูปอง ${coupon.code} — ได้รับเครดิต ${discount} บาท`,
          icon: 'Ticket',
          linkUrl: '/coupons',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      discount,
      couponName: coupon.name,
      message: `ได้รับเครดิต ${discount} บาทจากคูปอง "${coupon.name}"`,
    })
  } catch (error) {
    console.error('Coupon POST error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
