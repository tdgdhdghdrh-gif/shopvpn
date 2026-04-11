import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const profile = await prisma.resellerProfile.findUnique({
      where: { userId: session.userId }
    })

    if (!profile || profile.status !== 'approved') {
      return Response.json({ success: false, error: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    // Get today's start
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Get stats
    const [totalOrders, todayOrders, totalServers, pendingWithdrawals] = await Promise.all([
      prisma.resellerOrder.aggregate({
        where: { resellerId: profile.id },
        _sum: { resellerEarning: true },
        _count: true,
      }),
      prisma.resellerOrder.aggregate({
        where: { resellerId: profile.id, createdAt: { gte: todayStart } },
        _sum: { resellerEarning: true },
        _count: true,
      }),
      prisma.resellerServer.count({
        where: { resellerId: profile.id, isActive: true }
      }),
      prisma.withdrawal.aggregate({
        where: { resellerId: profile.id, status: 'pending' },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    return Response.json({
      success: true,
      dashboard: {
        resellerBalance: profile.resellerBalance,
        totalEarnings: totalOrders._sum.resellerEarning || 0,
        totalOrderCount: totalOrders._count,
        todayEarnings: todayOrders._sum.resellerEarning || 0,
        todayOrderCount: todayOrders._count,
        activeServers: totalServers,
        pendingWithdrawals: pendingWithdrawals._count,
        pendingWithdrawalAmount: pendingWithdrawals._sum.amount || 0,
      }
    })
  } catch (error) {
    console.error('Reseller dashboard error:', error)
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
