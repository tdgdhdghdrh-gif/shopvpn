import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, checkImpersonation } from '@/lib/session'

// POST - ผู้ใช้กดรับส่วนลดจากลิงก์โปร
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสโปร' }, { status: 400 })
    }

    // หาลิงก์โปร
    const promo = await prisma.promoLink.findUnique({ where: { code } })

    if (!promo) {
      return NextResponse.json({ success: false, error: 'ลิงก์โปรไม่ถูกต้อง' }, { status: 404 })
    }

    if (!promo.isActive) {
      return NextResponse.json({ success: false, error: 'โปรนี้หมดอายุหรือถูกปิดแล้ว' }, { status: 400 })
    }

    // เช็ควันหมดอายุ
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      return NextResponse.json({ success: false, error: 'โปรนี้หมดอายุแล้ว' }, { status: 400 })
    }

    // เช็คจำนวนคนรับสูงสุด
    if (promo.maxUsage !== null && promo.usageCount >= promo.maxUsage) {
      return NextResponse.json({ success: false, error: 'โปรนี้ถูกใช้เต็มจำนวนแล้ว' }, { status: 400 })
    }

    // เช็คว่าผู้ใช้เคยรับโปรนี้แล้วหรือยัง
    const existingActivation = await prisma.promoActivation.findUnique({
      where: {
        promoId_userId: {
          promoId: promo.id,
          userId: session.userId,
        }
      }
    })

    if (existingActivation) {
      return NextResponse.json({ success: false, error: 'คุณได้รับส่วนลดนี้ไปแล้ว', alreadyActivated: true })
    }

    // บันทึกการ activate และอัปเดต user
    await prisma.$transaction([
      // สร้าง activation record
      prisma.promoActivation.create({
        data: {
          promoId: promo.id,
          userId: session.userId,
        }
      }),
      // อัปเดตจำนวนการใช้
      prisma.promoLink.update({
        where: { id: promo.id },
        data: { usageCount: { increment: 1 } }
      }),
      // อัปเดต user ให้ได้ส่วนลดถาวร
      prisma.user.update({
        where: { id: session.userId },
        data: {
          promoDiscountPercent: promo.discountPercent,
          promoLinkCode: promo.code,
        }
      })
    ])

    return NextResponse.json({ 
      success: true, 
      message: `รับส่วนลด ${promo.discountPercent}% สำเร็จ!`,
      discountPercent: promo.discountPercent,
    })
  } catch (error: any) {
    console.error('[Promo Activate Error]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
