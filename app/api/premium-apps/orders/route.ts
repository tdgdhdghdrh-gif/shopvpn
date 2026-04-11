import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - Fetch current user's premium app order history
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const orders = await prisma.premiumAppOrder.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        appName: true,
        price: true,
        status: true,
        deliveredCode: true,
        createdAt: true,
        app: {
          select: {
            imageUrl: true,
            category: true,
          }
        }
      }
    })

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error('GET premium-app orders error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
