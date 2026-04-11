import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, logApiUsage } from '../validate'

// POST /api/external/promo
// body: { email: "xxx", code: "promo-code" }
export async function POST(request: NextRequest) {
  try {
    const result = await validateApiKey(request, 'promo:activate')
    if (result.error) return result.error

    const { apiKey } = result
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Required fields: email, code' },
        { status: 400 }
      )
    }

    // หา user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, promoDiscountPercent: true, promoLinkCode: true },
    })

    if (!user) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      await logApiUsage(apiKey.id, 'promo:activate', email, 'User not found', ip, false)
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // หาโปร
    const promo = await prisma.promoLink.findUnique({ where: { code } })

    if (!promo) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      await logApiUsage(apiKey.id, 'promo:activate', user.email, `Promo not found: ${code}`, ip, false)
      return NextResponse.json({ success: false, error: 'Promo code not found' }, { status: 404 })
    }

    if (!promo.isActive) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      await logApiUsage(apiKey.id, 'promo:activate', user.email, `Promo inactive: ${code}`, ip, false)
      return NextResponse.json({ success: false, error: 'Promo is inactive' }, { status: 400 })
    }

    // เช็คหมดอายุ
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      await logApiUsage(apiKey.id, 'promo:activate', user.email, `Promo expired: ${code}`, ip, false)
      return NextResponse.json({ success: false, error: 'Promo has expired' }, { status: 400 })
    }

    // เช็คจำนวนคนรับ
    if (promo.maxUsage !== null && promo.usageCount >= promo.maxUsage) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      await logApiUsage(apiKey.id, 'promo:activate', user.email, `Promo full: ${code}`, ip, false)
      return NextResponse.json({ success: false, error: 'Promo usage limit reached' }, { status: 400 })
    }

    // เช็คว่ารับไปแล้วหรือยัง
    const existing = await prisma.promoActivation.findUnique({
      where: { promoId_userId: { promoId: promo.id, userId: user.id } },
    })

    if (existing) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      await logApiUsage(apiKey.id, 'promo:activate', user.email, `Already activated: ${code}`, ip, false)
      return NextResponse.json({ success: false, error: 'User already activated this promo' }, { status: 400 })
    }

    // สร้าง activation + อัปเดต user + เพิ่ม usageCount
    await prisma.$transaction([
      prisma.promoActivation.create({
        data: { promoId: promo.id, userId: user.id },
      }),
      prisma.promoLink.update({
        where: { id: promo.id },
        data: { usageCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          promoDiscountPercent: promo.discountPercent,
          promoLinkCode: promo.code,
        },
      }),
    ])

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    await logApiUsage(
      apiKey.id,
      'promo:activate',
      user.email,
      `Activated: ${code} (${promo.discountPercent}% off)`,
      ip,
      true
    )

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        promoCode: promo.code,
        promoName: promo.name,
        discountPercent: promo.discountPercent,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
