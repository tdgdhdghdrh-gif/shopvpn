import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint - no auth required
export async function GET(request: NextRequest) {
  try {
    // Get top users by total topup amount (only SUCCESS topups)
    const topUsers = await prisma.topUp.groupBy({
      by: ['userId'],
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 20,
    })

    // Fetch user info for each top user
    const userIds = topUsers.map(t => t.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatar: true, createdAt: true },
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    // Mask user names for privacy: show first 2 chars, mask the rest
    function maskName(name: string): string {
      if (name.length <= 2) return name + '***'
      return name.slice(0, 2) + '*'.repeat(Math.min(name.length - 2, 4))
    }

    const leaderboard = topUsers.map((entry, index) => {
      const user = userMap.get(entry.userId)
      return {
        rank: index + 1,
        name: user ? maskName(user.name) : 'ไม่ทราบ',
        avatar: user?.avatar || null,
        totalAmount: entry._sum.amount || 0,
        topupCount: entry._count.id,
        joinedAt: user?.createdAt || null,
      }
    })

    // Get recent slips (topups with slipUrl, last 30, SUCCESS only)
    const recentSlips = await prisma.topUp.findMany({
      where: {
        status: 'SUCCESS',
        slipUrl: { not: null },
        method: 'SLIP',
      },
      select: {
        id: true,
        amount: true,
        slipUrl: true,
        createdAt: true,
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    const slips = recentSlips.map(slip => ({
      id: slip.id,
      amount: slip.amount,
      slipUrl: slip.slipUrl,
      createdAt: slip.createdAt,
      userName: maskName(slip.user.name),
    }))

    // Get summary stats
    const totalTopups = await prisma.topUp.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
      _count: { id: true },
    })

    const uniqueUsers = await prisma.topUp.groupBy({
      by: ['userId'],
      where: { status: 'SUCCESS' },
    })

    return NextResponse.json({
      success: true,
      leaderboard,
      slips,
      stats: {
        totalAmount: totalTopups._sum.amount || 0,
        totalTransactions: totalTopups._count.id,
        totalUsers: uniqueUsers.length,
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
