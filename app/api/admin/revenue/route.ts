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

    // ดึงรายชื่อ user ที่เคยเติมเงินจริง (มี TopUp record)
    const usersWithRealTopup = await prisma.topUp.findMany({
      where: {
        status: 'SUCCESS'
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })
    
    const realUserIds = new Set(usersWithRealTopup.map(t => t.userId))

    // คำนวณรายได้รวมของแต่ละเซิร์ฟเวอร์ (นับเฉพาะลูกค้าที่เติมเงินจริง)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const serverRevenue = servers.map(server => {
      // กรองเฉพาะออร์เดอร์ของผู้ใช้ที่เคยเติมเงินจริง
      const realOrders = server.orders.filter(order => realUserIds.has(order.userId))
      
      const totalRevenue = realOrders.reduce((sum, order) => sum + order.price, 0)
      const todayRevenue = realOrders
        .filter(order => new Date(order.createdAt) >= today)
        .reduce((sum, order) => sum + order.price, 0)
      const monthRevenue = realOrders
        .filter(order => new Date(order.createdAt) >= thisMonth)
        .reduce((sum, order) => sum + order.price, 0)
      
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
