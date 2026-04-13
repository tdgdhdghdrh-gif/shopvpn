import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, logApiUsage } from '../validate'

// GET /api/external/user?email=xxx or ?id=xxx
// ดึงข้อมูลผู้ใช้ (รวมรหัสผ่าน — สำหรับระบบล็อกอินในแอพ)
export async function GET(request: NextRequest) {
  try {
    const result = await validateApiKey(request, 'user:read')
    if (result.error) return result.error

    const { apiKey } = result
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('id')

    if (!email && !userId) {
      return NextResponse.json(
        { success: false, error: 'Required query: ?email=xxx or ?id=xxx' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: email ? { email } : { id: userId! },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatar: true,
        balance: true,
        promoDiscountPercent: true,
        promoLinkCode: true,
        referralCode: true,
        referralCount: true,
        createdAt: true,
      },
    })

    if (!user) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      await logApiUsage(apiKey.id, 'user:read', email || userId, 'User not found', ip, false)
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    await logApiUsage(apiKey.id, 'user:read', user.email, `Read user: ${user.name}`, ip, true)

    return NextResponse.json({ success: true, data: user })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
