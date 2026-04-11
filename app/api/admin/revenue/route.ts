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
      select: { isSuperAdmin: true, isAdmin: true, isRevenueAdmin: true, isAgent: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin && !user?.isRevenueAdmin && !user?.isAgent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ดึงข้อมูลเซิร์ฟเวอร์ทั้งหมดพร้อมคำสั่งซื้อ
    const servers = await prisma.vpnServer.findMany({
      include: {
        orders: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            price: true,
            createdAt: true,
            userId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // ดึงรายชื่อ user ที่เคยเติมเงินจริง (เฉพาะ WALLET/SLIP เท่านั้น ไม่รวม admin เพิ่มให้ หรือ API)
    const usersWithRealTopup = await prisma.topUp.findMany({
      where: {
        status: 'SUCCESS',
        method: { in: ['WALLET', 'SLIP'] }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })
    
    const realUserIds = new Set(usersWithRealTopup.map(t => t.userId))

    // ดึง lock records เพื่อเช็คว่าเซิร์ฟไหนถูกล็อก
    const locks = await prisma.serverRevenueLock.findMany({
      where: { isLocked: true }
    })
    const lockMap = new Map(locks.map(l => [l.serverId, l]))

    // คำนวณรายได้รวมของแต่ละเซิร์ฟเวอร์ (นับเฉพาะลูกค้าที่เติมเงินจริง)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const serverRevenue = servers.map(server => {
      const lock = lockMap.get(server.id)
      
      // ถ้าเซิร์ฟนี้ถูกล็อก ให้แสดงรายได้ที่ล็อกไว้เท่านั้น
      if (lock) {
        return {
          id: server.id,
          name: server.name,
          host: server.host,
          flag: server.flag,
          isActive: server.isActive,
          totalOrders: lock.lockedOrders,
          totalRevenue: lock.lockedRevenue,
          todayRevenue: 0,
          monthRevenue: lock.lockedRevenue
        }
      }

      // กรองเฉพาะออร์เดอร์ของผู้ใช้ที่เคยเติมเงินจริง
      const realOrders = server.orders.filter(order => realUserIds.has(order.userId))
      
      // ใช้ commissionPercent จากเซิร์ฟเวอร์ (ค่าฝากขาย)
      const commissionPct = server.commissionPercent || 0
      const applyFee = (price: number) => {
        if (commissionPct > 0) {
          return price * (1 - commissionPct / 100)
        }
        return price
      }

      const totalRevenue = realOrders.reduce((sum, order) => sum + applyFee(order.price), 0)
      const todayRevenue = realOrders
        .filter(order => new Date(order.createdAt) >= today)
        .reduce((sum, order) => sum + applyFee(order.price), 0)
      const monthRevenue = realOrders
        .filter(order => new Date(order.createdAt) >= thisMonth)
        .reduce((sum, order) => sum + applyFee(order.price), 0)
      
      return {
        id: server.id,
        name: server.name,
        host: server.host,
        flag: server.flag,
        isActive: server.isActive,
        totalOrders: realOrders.length,
        totalRevenue,
        todayRevenue,
        monthRevenue
      }
    })

    // คำนวณยอดรวมทั้งหมด
    const summary = {
      totalRevenue: serverRevenue.reduce((sum, s) => sum + s.totalRevenue, 0),
      todayRevenue: serverRevenue.reduce((sum, s) => sum + s.todayRevenue, 0),
      monthRevenue: serverRevenue.reduce((sum, s) => sum + s.monthRevenue, 0),
      totalOrders: serverRevenue.reduce((sum, s) => sum + s.totalOrders, 0),
      activeServers: serverRevenue.filter(s => s.isActive).length,
      totalServers: serverRevenue.length,
      realCustomers: realUserIds.size
    }

    return NextResponse.json({ 
      servers: serverRevenue,
      summary 
    })
  } catch (error) {
    console.error('Failed to fetch revenue data:', error)
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
  }
}
