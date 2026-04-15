import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true, isRevenueAdmin: true, isAgent: true }
    })

    if (!admin?.isSuperAdmin && !admin?.isAdmin && !admin?.isRevenueAdmin && !admin?.isAgent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    // Fetch all data in parallel
    const [
      totalUsers,
      newUsersToday,
      newUsersYesterday,
      newUsersMonth,
      totalServers,
      activeServers,
      totalOrders,
      activeOrders,
      ordersToday,
      ordersMonth,
      allTopupsSuccess,
      topupsToday,
      topupsYesterday,
      topupsMonth,
      topupsLastMonth,
      totalBalance,
      recentTopups,
      recentOrders,
      topupsByDay,
      ordersByDay,
      // New queries
      newUsersByDay,
      topupMethodBreakdown,
      topupMethodBreakdownMonth,
      topServers,
      openTickets,
      totalTickets,
      totalReviews,
      avgRating,
      slowReportsToday,
      trialOrdersToday,
      trialOrdersMonth,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      
      // Servers
      prisma.vpnServer.count(),
      prisma.vpnServer.count({ where: { isActive: true } }),
      
      // Orders
      prisma.vpnOrder.count(),
      prisma.vpnOrder.count({ where: { isActive: true } }),
      prisma.vpnOrder.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.vpnOrder.count({ where: { createdAt: { gte: monthStart } } }),
      
      // Topups - successful
      prisma.topUp.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.topUp.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: todayStart } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.topUp.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: yesterdayStart, lt: todayStart } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.topUp.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: monthStart } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.topUp.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
        _count: true,
      }),
      
      // Total user balance
      prisma.user.aggregate({
        _sum: { balance: true },
      }),

      // Recent topups (last 10)
      prisma.topUp.findMany({
        where: { status: 'SUCCESS' },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),

      // Recent orders (last 8)
      prisma.vpnOrder.findMany({
        include: { 
          user: { select: { name: true } },
          server: { select: { name: true, flag: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),

      // Topups per day (last 14 days)
      prisma.$queryRawUnsafe(`
        SELECT DATE("createdAt") as date, SUM(amount) as total, COUNT(*)::int as count
        FROM "TopUp"
        WHERE status = 'SUCCESS' AND "createdAt" >= $1
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `, new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)),

      // Orders per day (last 14 days)
      prisma.$queryRawUnsafe(`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count, SUM(price) as total
        FROM "VpnOrder"
        WHERE "createdAt" >= $1
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `, new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)),

      // === NEW QUERIES ===

      // New users per day (last 14 days)
      prisma.$queryRawUnsafe(`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "User"
        WHERE "createdAt" >= $1
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `, new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)),

      // Topup method breakdown (all time)
      prisma.topUp.groupBy({
        by: ['method'],
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: true,
      }),

      // Topup method breakdown (this month)
      prisma.topUp.groupBy({
        by: ['method'],
        where: { status: 'SUCCESS', createdAt: { gte: monthStart } },
        _sum: { amount: true },
        _count: true,
      }),

      // Top 5 servers by revenue this month
      prisma.vpnOrder.groupBy({
        by: ['serverId'],
        where: { createdAt: { gte: monthStart } },
        _sum: { price: true },
        _count: true,
        orderBy: { _sum: { price: 'desc' } },
        take: 5,
      }),

      // Open tickets
      prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }).catch(() => 0),

      // Total tickets
      prisma.ticket.count().catch(() => 0),

      // Total reviews
      prisma.review.count().catch(() => 0),

      // Average rating
      prisma.review.aggregate({ _avg: { rating: true } }).catch(() => ({ _avg: { rating: null } })),

      // Slow reports today
      prisma.slowReport.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),

      // Trial orders today
      prisma.vpnOrder.count({ where: { packageType: 'TRIAL', createdAt: { gte: todayStart } } }),

      // Trial orders this month
      prisma.vpnOrder.count({ where: { packageType: 'TRIAL', createdAt: { gte: monthStart } } }),
    ])

    // Online users (active in last 15 minutes via IPLog)
    const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000)
    const onlineUsersResult = await prisma.iPLog.groupBy({
      by: ['userId'],
      where: {
        userId: { not: null },
        createdAt: { gte: fifteenMinAgo },
      },
    })
    const onlineUsers = onlineUsersResult.length

    // VPN revenue (sum of all order prices)
    const [vpnRevenueToday, vpnRevenueMonth, vpnRevenueTotal] = await Promise.all([
      prisma.vpnOrder.aggregate({
        where: { createdAt: { gte: todayStart } },
        _sum: { price: true },
      }),
      prisma.vpnOrder.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { price: true },
      }),
      prisma.vpnOrder.aggregate({
        _sum: { price: true },
      }),
    ])

    // Resolve top server names
    const topServerIds = topServers.map(s => s.serverId)
    const serverDetails = topServerIds.length > 0 ? await prisma.vpnServer.findMany({
      where: { id: { in: topServerIds } },
      select: { id: true, name: true, flag: true, maxClients: true, _count: { select: { orders: { where: { isActive: true } } } } },
    }) : []

    const topServersData = topServers.map(s => {
      const detail = serverDetails.find(d => d.id === s.serverId)
      return {
        id: s.serverId,
        name: detail?.name || 'Unknown',
        flag: detail?.flag || '',
        revenue: s._sum.price || 0,
        orders: s._count,
        activeClients: detail?._count.orders || 0,
        maxClients: detail?.maxClients || 0,
      }
    })

    // Calculate growth percentages
    const todayTopupAmount = topupsToday._sum.amount || 0
    const yesterdayTopupAmount = topupsYesterday._sum.amount || 0
    const topupGrowth = yesterdayTopupAmount > 0 
      ? Math.round(((todayTopupAmount - yesterdayTopupAmount) / yesterdayTopupAmount) * 100) 
      : todayTopupAmount > 0 ? 100 : 0

    const monthTopupAmount = topupsMonth._sum.amount || 0
    const lastMonthTopupAmount = topupsLastMonth._sum.amount || 0
    const monthGrowth = lastMonthTopupAmount > 0
      ? Math.round(((monthTopupAmount - lastMonthTopupAmount) / lastMonthTopupAmount) * 100)
      : monthTopupAmount > 0 ? 100 : 0

    const userGrowthToday = newUsersYesterday > 0
      ? Math.round(((newUsersToday - newUsersYesterday) / newUsersYesterday) * 100)
      : newUsersToday > 0 ? 100 : 0

    return NextResponse.json({
      isSuperAdmin: admin?.isSuperAdmin || false,
      overview: {
        totalUsers,
        onlineUsers,
        newUsersToday,
        newUsersMonth,
        userGrowthToday,
        
        totalServers,
        activeServers,
        
        totalOrders,
        activeOrders,
        ordersToday,
        ordersMonth,

        totalBalance: totalBalance._sum.balance || 0,

        openTickets,
        totalTickets,
        totalReviews,
        avgRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : 0,
        slowReportsToday,
        trialOrdersToday,
        trialOrdersMonth,
      },
      revenue: {
        topups: {
          today: todayTopupAmount,
          todayCount: topupsToday._count,
          month: monthTopupAmount,
          monthCount: topupsMonth._count,
          allTime: allTopupsSuccess._sum.amount || 0,
          allTimeCount: allTopupsSuccess._count,
          growthToday: topupGrowth,
          growthMonth: monthGrowth,
        },
        vpn: {
          today: vpnRevenueToday._sum.price || 0,
          month: vpnRevenueMonth._sum.price || 0,
          allTime: vpnRevenueTotal._sum.price || 0,
        }
      },
      charts: {
        topupsByDay: (topupsByDay as any[]).map((d: any) => ({
          date: new Date(d.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
          amount: Number(d.total) || 0,
          count: d.count,
        })),
        ordersByDay: (ordersByDay as any[]).map((d: any) => ({
          date: new Date(d.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
          amount: Number(d.total) || 0,
          count: d.count,
        })),
        newUsersByDay: (newUsersByDay as any[]).map((d: any) => ({
          date: new Date(d.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
          count: d.count,
        })),
      },
      topupMethods: topupMethodBreakdownMonth.map(m => ({
        method: m.method,
        amount: m._sum.amount || 0,
        count: m._count,
      })),
      topServers: topServersData,
      recent: {
        topups: recentTopups.map(t => ({
          id: t.id,
          amount: t.amount,
          method: t.method,
          userName: t.user.name,
          createdAt: t.createdAt,
        })),
        orders: recentOrders.map(o => ({
          id: o.id,
          price: o.price,
          duration: o.duration,
          packageType: o.packageType,
          userName: o.user.name,
          serverName: o.server.name,
          serverFlag: o.server.flag,
          createdAt: o.createdAt,
        })),
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
