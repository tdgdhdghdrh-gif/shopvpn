import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function checkAdmin() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true },
  })
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

// GET - ดึงรายการคูปองทั้งหมด + สถิติ
export async function GET() {
  try {
    const admin = await checkAdmin()
    if (!admin) return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { redemptions: true } },
      },
    })

    const totalRedemptions = await prisma.couponRedemption.count()
    const totalDiscount = await prisma.couponRedemption.aggregate({
      _sum: { discount: true },
    })

    return NextResponse.json({
      coupons,
      stats: {
        totalCoupons: coupons.length,
        activeCoupons: coupons.filter(c => c.isActive).length,
        totalRedemptions,
        totalDiscount: totalDiscount._sum.discount || 0,
      },
    })
  } catch (error) {
    console.error('Admin coupons GET error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - สร้าง/แก้ไข/ลบคูปอง
export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })

    const body = await req.json()
    const { action } = body

    if (action === 'create') {
      const { code, name, description, type, value, minPurchase, maxDiscount, usageLimit, perUserLimit, expiresAt } = body
      if (!code || !name || !type || !value) {
        return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
      }

      // เช็คว่า code ซ้ำไหม
      const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } })
      if (existing) {
        return NextResponse.json({ error: 'รหัสคูปองนี้มีอยู่แล้ว' }, { status: 400 })
      }

      const coupon = await prisma.coupon.create({
        data: {
          code: code.toUpperCase().trim(),
          name,
          description: description || null,
          type,
          value: parseFloat(value),
          minPurchase: parseFloat(minPurchase || '0'),
          maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          perUserLimit: parseInt(perUserLimit || '1'),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          createdBy: admin.id,
        },
      })

      return NextResponse.json({ success: true, coupon })
    }

    if (action === 'update') {
      const { id, name, description, type, value, minPurchase, maxDiscount, usageLimit, perUserLimit, isActive, expiresAt } = body
      if (!id) return NextResponse.json({ error: 'ไม่พบ ID คูปอง' }, { status: 400 })

      const coupon = await prisma.coupon.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description: description || null }),
          ...(type !== undefined && { type }),
          ...(value !== undefined && { value: parseFloat(value) }),
          ...(minPurchase !== undefined && { minPurchase: parseFloat(minPurchase) }),
          ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
          ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
          ...(perUserLimit !== undefined && { perUserLimit: parseInt(perUserLimit) }),
          ...(isActive !== undefined && { isActive }),
          ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        },
      })

      return NextResponse.json({ success: true, coupon })
    }

    if (action === 'delete') {
      const { id } = body
      if (!id) return NextResponse.json({ error: 'ไม่พบ ID คูปอง' }, { status: 400 })

      await prisma.coupon.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    if (action === 'toggle') {
      const { id } = body
      if (!id) return NextResponse.json({ error: 'ไม่พบ ID คูปอง' }, { status: 400 })

      const coupon = await prisma.coupon.findUnique({ where: { id } })
      if (!coupon) return NextResponse.json({ error: 'ไม่พบคูปอง' }, { status: 404 })

      await prisma.coupon.update({
        where: { id },
        data: { isActive: !coupon.isActive },
      })

      return NextResponse.json({ success: true, isActive: !coupon.isActive })
    }

    return NextResponse.json({ error: 'action ไม่ถูกต้อง' }, { status: 400 })
  } catch (error) {
    console.error('Admin coupons POST error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
