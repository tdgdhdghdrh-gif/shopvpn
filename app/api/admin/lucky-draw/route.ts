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

// GET - List eligible users + available servers
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'
    const minTopup = parseFloat(searchParams.get('minTopup') || '0')
    const serverIdsParam = searchParams.get('serverIds') || ''
    const selectedServerIds = serverIdsParam ? serverIdsParam.split(',') : []

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

    // Fetch active servers for selection
    const allServers = await prisma.vpnServer.findMany({
      where: { isActive: true },
      select: { id: true, name: true, flag: true, isEventServer: true },
      orderBy: [{ isEventServer: 'desc' }, { name: 'asc' }],
    })

    // Build eligible users from VPN orders on selected servers
    const vpnWhere: any = {}
    if (selectedServerIds.length > 0) {
      vpnWhere.serverId = { in: selectedServerIds }
    }
    if (period !== 'all') vpnWhere.createdAt = dateFilter

    const vpnOrders = await prisma.vpnOrder.findMany({
      where: vpnWhere,
      select: {
        userId: true,
        price: true,
        createdAt: true,
        server: { select: { id: true, name: true, flag: true } },
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    })

    // Merge by user
    const userMap = new Map()

    for (const v of vpnOrders) {
      if (!v.user) continue
      const existing = userMap.get(v.userId)
      if (!existing) {
        userMap.set(v.userId, {
          user: v.user,
          totalVpnSpend: v.price,
          vpnOrderCount: 1,
          servers: [v.server],
          lastActive: v.createdAt,
        })
      } else {
        existing.totalVpnSpend += v.price
        existing.vpnOrderCount += 1
        if (!existing.servers.find((s: any) => s.id === v.server.id)) {
          existing.servers.push(v.server)
        }
        if (new Date(v.createdAt) > new Date(existing.lastActive)) {
          existing.lastActive = v.createdAt
        }
      }
    }

    // Also check min topup if set
    if (minTopup > 0) {
      const topupWhere: any = { status: 'SUCCESS', amount: { gte: minTopup } }
      if (period !== 'all') topupWhere.createdAt = dateFilter

      const topups = await prisma.topUp.findMany({
        where: topupWhere,
        select: { userId: true, amount: true },
      })

      const topupUserIds = new Set(topups.map(t => t.userId))
      for (const [uid, data] of userMap) {
        if (!topupUserIds.has(uid)) {
          userMap.delete(uid)
        } else {
          const userTopups = topups.filter(t => t.userId === uid)
          data.totalTopup = userTopups.reduce((s, t) => s + t.amount, 0)
          data.topupCount = userTopups.length
        }
      }
    }

    const eligibleUsers = Array.from(userMap.values())
      .sort((a: any, b: any) => b.totalVpnSpend - a.totalVpnSpend)

    return NextResponse.json({
      success: true,
      users: eligibleUsers,
      totalCount: eligibleUsers.length,
      servers: allServers,
    })
  } catch (error) {
    console.error('GET lucky-draw error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - Draw winners
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { winnerCount = 1, period = 'all', minTopup = 0, serverIds = [], excludedUserIds = [] } = body

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

    // Build eligible users from VPN orders on selected servers
    const vpnWhere: any = {}
    if (serverIds.length > 0) {
      vpnWhere.serverId = { in: serverIds }
    }
    if (period !== 'all') vpnWhere.createdAt = dateFilter

    const vpnOrders = await prisma.vpnOrder.findMany({
      where: vpnWhere,
      select: {
        userId: true,
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    })

    const userMap = new Map()
    for (const v of vpnOrders) {
      if (!v.user || excludedUserIds.includes(v.userId)) continue
      if (!userMap.has(v.userId)) userMap.set(v.userId, v.user)
    }

    // Filter by min topup
    if (minTopup > 0) {
      const topupWhere: any = { status: 'SUCCESS', amount: { gte: minTopup } }
      if (period !== 'all') topupWhere.createdAt = dateFilter

      const topups = await prisma.topUp.findMany({
        where: topupWhere,
        select: { userId: true },
      })

      const topupUserIds = new Set(topups.map(t => t.userId))
      for (const [uid] of userMap) {
        if (!topupUserIds.has(uid)) userMap.delete(uid)
      }
    }

    const eligibleUsers = Array.from(userMap.values())

    if (eligibleUsers.length === 0) {
      return NextResponse.json({ success: false, error: 'ไม่มีผู้ใช้ที่มีสิทธิ์สุ่ม' }, { status: 400 })
    }

    if (winnerCount > eligibleUsers.length) {
      return NextResponse.json({ success: false, error: `จำนวนผู้โชคดีมากกว่าจำนวนผู้มีสิทธิ์ (${eligibleUsers.length} คน)` }, { status: 400 })
    }

    // Shuffle
    const shuffled = [...eligibleUsers]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const winners = shuffled.slice(0, winnerCount)

    return NextResponse.json({
      success: true,
      winners,
      totalEligible: eligibleUsers.length,
      winnerCount,
    })
  } catch (error) {
    console.error('POST lucky-draw error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
