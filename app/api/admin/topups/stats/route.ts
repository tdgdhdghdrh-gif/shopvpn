import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get today's date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Fetch all topups for calculations
    const [todayTopups, monthTopups, allTopups] = await Promise.all([
      // Today's topups
      prisma.topUp.findMany({
        where: { createdAt: { gte: today } },
        include: { user: { select: { id: true } } }
      }),
      // This month's topups
      prisma.topUp.findMany({
        where: { createdAt: { gte: startOfMonth } },
        include: { user: { select: { id: true } } }
      }),
      // All topups
      prisma.topUp.findMany({
        include: { user: { select: { id: true } } }
      })
    ])

    // Calculate stats
    const stats = {
      // Today
      totalToday: todayTopups.reduce((sum, t) => sum + t.amount, 0),
      countToday: todayTopups.length,
      uniqueUsersToday: new Set(todayTopups.map(t => t.user.id)).size,
      
      // This month
      totalMonth: monthTopups.reduce((sum, t) => sum + t.amount, 0),
      countMonth: monthTopups.length,
      uniqueUsersMonth: new Set(monthTopups.map(t => t.user.id)).size,
      
      // All time
      totalAllTime: allTopups.reduce((sum, t) => sum + t.amount, 0),
      countAllTime: allTopups.length
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
