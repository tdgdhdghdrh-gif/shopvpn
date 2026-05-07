import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function requireAdminSession() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true }
  })
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

// GET - List award winners (users who topped up or bought from event servers)
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // all, today, week, month
    const minTopup = parseFloat(searchParams.get('minTopup') || '0')

    // Get event servers
    const eventServers = await prisma.vpnServer.findMany({
      where: { isEventServer: true },
      select: { id: true, name: true, flag: true }
    })
    const eventServerIds = eventServers.map(s => s.id)

    // Date filter
    const now = new Date()
    let dateFilter: any = {}
    if (period === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      dateFilter = { gte: start }
    } else if (period === 'week') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = { gte: start }
    } else if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      dateFilter = { gte: start }
    }

    // Get topup users
    const topupWhere: any = { status: 'SUCCESS' }
    if (period !== 'all') topupWhere.createdAt = dateFilter
    if (minTopup > 0) topupWhere.amount = { gte: minTopup }

    const topups = await prisma.topUp.findMany({
      where: topupWhere,
      select: {
        userId: true,
        amount: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get VPN orders from event servers
    const vpnWhere: any = {}
    if (eventServerIds.length > 0) {
      vpnWhere.serverId = { in: eventServerIds }
    }
    if (period !== 'all') vpnWhere.createdAt = dateFilter

    const vpnOrders = await prisma.vpnOrder.findMany({
      where: vpnWhere,
      select: {
        userId: true,
        price: true,
        server: { select: { name: true, flag: true } },
        createdAt: true,
        user: { select: { id: true, name: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
    })

    // Merge and deduplicate by user
    const userMap = new Map()

    for (const t of topups) {
      if (!t.user) continue
      const existing = userMap.get(t.userId)
      if (!existing) {
        userMap.set(t.userId, {
          user: t.user,
          totalTopup: t.amount,
          totalVpnSpend: 0,
          vpnOrders: [],
          topupCount: 1,
          lastActive: t.createdAt,
        })
      } else {
        existing.totalTopup += t.amount
        existing.topupCount += 1
        if (new Date(t.createdAt) > new Date(existing.lastActive)) {
          existing.lastActive = t.createdAt
        }
      }
    }

    for (const v of vpnOrders) {
      if (!v.user) continue
      const existing = userMap.get(v.userId)
      if (!existing) {
        userMap.set(v.userId, {
          user: v.user,
          totalTopup: 0,
          totalVpnSpend: v.price,
          vpnOrders: [{ serverName: v.server.name, serverFlag: v.server.flag, price: v.price, createdAt: v.createdAt }],
          topupCount: 0,
          lastActive: v.createdAt,
        })
      } else {
        existing.totalVpnSpend += v.price
        existing.vpnOrders.push({ serverName: v.server.name, serverFlag: v.server.flag, price: v.price, createdAt: v.createdAt })
        if (new Date(v.createdAt) > new Date(existing.lastActive)) {
          existing.lastActive = v.createdAt
        }
      }
    }

    const winners = Array.from(userMap.values())
      .sort((a: any, b: any) => b.totalTopup + b.totalVpnSpend - (a.totalTopup + a.totalVpnSpend))

    return NextResponse.json({
      success: true,
      winners,
      eventServers,
      totalCount: winners.length,
    })
  } catch (error) {
    console.error('GET award-winners error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
