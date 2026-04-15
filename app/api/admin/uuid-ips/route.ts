import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import {
  adminGetClientIps,
  adminGetOnlineClients,
  adminGetClientTraffic,
} from '@/lib/vpn-api'

// GET: List all active VPN orders with UUID info + fetch IPs from panel
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    // Action: fetch IPs for a specific order
    if (action === 'getIps') {
      const orderId = searchParams.get('orderId')
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 })
      }

      const order = await prisma.vpnOrder.findUnique({
        where: { id: orderId },
        include: {
          server: true,
          user: true,
        },
      })

      if (!order) {
        return NextResponse.json({ success: false, error: 'ไม่พบ order' }, { status: 404 })
      }

      // Fetch IPs from 3x-ui panel
      let ips: string[] = []
      let isOnline = false
      let traffic: any = null

      try {
        const ipResult = await adminGetClientIps(order.serverId, order.remark)
        if (ipResult?.success && ipResult.obj) {
          // obj can be a string like "1.2.3.4\n5.6.7.8" or null
          const ipStr = typeof ipResult.obj === 'string' ? ipResult.obj : ''
          ips = ipStr.split('\n').map((ip: string) => ip.trim()).filter((ip: string) => ip && ip !== 'No IP Record')
        }
      } catch (e) {
        console.error('Error fetching client IPs:', e)
      }

      try {
        const onlineResult = await adminGetOnlineClients(order.serverId)
        if (onlineResult?.success && Array.isArray(onlineResult.obj)) {
          isOnline = onlineResult.obj.some((email: string) => email === order.remark)
        }
      } catch (e) {
        console.error('Error fetching online clients:', e)
      }

      try {
        const trafficResult = await adminGetClientTraffic(order.serverId, order.remark)
        if (trafficResult?.success && trafficResult.obj) {
          traffic = {
            up: trafficResult.obj.up || 0,
            down: trafficResult.obj.down || 0,
            total: (trafficResult.obj.up || 0) + (trafficResult.obj.down || 0),
          }
        }
      } catch (e) {
        console.error('Error fetching traffic:', e)
      }

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          clientUUID: order.clientUUID,
          remark: order.remark,
          ipLimit: order.ipLimit,
          expiryTime: order.expiryTime,
          isActive: order.isActive,
          serverName: order.server.name,
          serverFlag: order.server.flag,
          userName: order.user.username || order.user.lineDisplayName || 'N/A',
          userId: order.userId,
        },
        ips,
        ipCount: ips.length,
        isOnline,
        traffic,
      })
    }

    // Default: List all active orders with basic info
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const statusFilter = searchParams.get('status') || 'active' // active, expired, all
    const serverId = searchParams.get('serverId') || ''

    const where: any = {}

    if (statusFilter === 'active') {
      where.isActive = true
    } else if (statusFilter === 'expired') {
      where.isActive = false
    }

    if (serverId) {
      where.serverId = serverId
    }

    if (search) {
      where.OR = [
        { clientUUID: { contains: search, mode: 'insensitive' } },
        { remark: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { user: { lineDisplayName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.vpnOrder.findMany({
        where,
        include: {
          server: {
            select: { id: true, name: true, flag: true, host: true },
          },
          user: {
            select: { id: true, username: true, lineDisplayName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vpnOrder.count({ where }),
    ])

    // Get all servers for filter dropdown
    const servers = await prisma.vpnServer.findMany({
      select: { id: true, name: true, flag: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        id: o.id,
        clientUUID: o.clientUUID,
        remark: o.remark,
        ipLimit: o.ipLimit,
        expiryTime: o.expiryTime,
        isActive: o.isActive,
        createdAt: o.createdAt,
        duration: o.duration,
        price: o.price,
        serverName: o.server.name,
        serverFlag: o.server.flag,
        serverId: o.server.id,
        serverHost: o.server.host,
        userName: o.user.username || o.user.lineDisplayName || 'N/A',
        userId: o.user.id,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      servers,
    })
  } catch (error: any) {
    console.error('UUID IPs API error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
