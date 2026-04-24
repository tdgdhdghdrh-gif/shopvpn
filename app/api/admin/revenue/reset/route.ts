import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// POST - Reset all revenue by deleting all VPN orders
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Count orders before delete
    const orderCount = await prisma.vpnOrder.count()

    // Delete all VPN orders
    await prisma.vpnOrder.deleteMany({})

    // Also delete revenue locks since they're now irrelevant
    await prisma.serverRevenueLock.deleteMany({})

    return NextResponse.json({ 
      success: true,
      message: `รีเซ็ตรายได้สำเร็จ ลบคำสั่งซื้อทั้งหมด ${orderCount} รายการ`,
      deletedOrders: orderCount
    })
  } catch (error) {
    console.error('Failed to reset revenue:', error)
    return NextResponse.json({ error: 'Failed to reset revenue' }, { status: 500 })
  }
}
