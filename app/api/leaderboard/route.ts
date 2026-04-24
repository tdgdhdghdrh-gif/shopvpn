import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint - no auth required
export async function GET() {
  try {
    // Get top users by data usage
    const topUsers = await prisma.user.findMany({
      where: { dataUsage: { gt: 0 } },
      orderBy: { dataUsage: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        avatar: true,
        createdAt: true,
        dataUsage: true,
      },
    })

    // Mask user names for privacy: show first 2 chars, mask the rest
    function maskName(name: string): string {
      if (name.length <= 2) return name + '***'
      return name.slice(0, 2) + '*'.repeat(Math.min(name.length - 2, 4))
    }

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      name: maskName(user.name),
      avatar: user.avatar || null,
      dataUsage: user.dataUsage || 0,
      joinedAt: user.createdAt || null,
    }))

    // Get summary stats
    const totalUsageAgg = await prisma.user.aggregate({
      _sum: { dataUsage: true },
      _count: { id: true },
    })

    const activeUsers = await prisma.user.count({
      where: { dataUsage: { gt: 0 } },
    })

    return NextResponse.json({
      success: true,
      leaderboard,
      stats: {
        totalUsage: totalUsageAgg._sum.dataUsage || 0,
        totalUsers: totalUsageAgg._count.id,
        activeUsers,
      },
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' },
      { status: 500 }
    )
  }
}
