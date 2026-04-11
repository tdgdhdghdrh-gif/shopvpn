import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// Helper: ตรวจสอบ Super Admin
async function checkSuperAdmin(session: any) {
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isAdmin: true, isSuperAdmin: true, id: true }
  })
  if (!user?.isSuperAdmin) return null
  return user
}

// GET: ดึงรายได้ของแต่ละเซิร์ฟเวอร์ พร้อมสถานะล็อก + commission
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await checkSuperAdmin(session)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ดึง lock records ทั้งหมด
    const locks = await prisma.serverRevenueLock.findMany()
    const lockMap = new Map(locks.map(l => [l.serverId, l]))

    // ดึงเซิร์ฟเวอร์ทั้งหมดพร้อม orders
    const servers = await prisma.vpnServer.findMany({
      include: {
        orders: {
          where: { isActive: true },
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

    // ดึง users ที่เคยเติมเงินจริง
    const usersWithRealTopup = await prisma.topUp.findMany({
      where: { status: 'SUCCESS' },
      select: { userId: true },
      distinct: ['userId']
    })
    const realUserIds = new Set(usersWithRealTopup.map(t => t.userId))

    const serverRevenue = servers.map(server => {
      const realOrders = server.orders.filter(order => realUserIds.has(order.userId))
      
      // รายได้รวม (ก่อนหัก)
      const grossRevenue = realOrders.reduce((sum, order) => sum + order.price, 0)
      
      // ใช้ commissionPercent จากเซิร์ฟเวอร์
      const commissionPercent = server.commissionPercent || 0
      const commissionAmount = grossRevenue * (commissionPercent / 100)
      const netRevenue = grossRevenue - commissionAmount

      const actualOrders = realOrders.length

      const lock = lockMap.get(server.id)
      
      return {
        id: server.id,
        name: server.name,
        host: server.host,
        flag: server.flag,
        isActive: server.isActive,
        commissionPercent,
        // รายได้รวม (ก่อนหัก)
        grossRevenue,
        // ยอดหัก (ค่าฝากขาย)
        commissionAmount,
        // กำไรสุทธิ (หลังหัก)
        netRevenue,
        // รายได้จริง (= netRevenue สำหรับ super admin)
        actualRevenue: netRevenue,
        actualOrders,
        // สถานะล็อก
        isLocked: lock?.isLocked || false,
        lockedRevenue: lock?.lockedRevenue || 0,
        lockedOrders: lock?.lockedOrders || 0,
        lockedAt: lock?.lockedAt || null,
        // รายได้ที่แสดงในหน้า revenue ปกติ
        displayRevenue: lock?.isLocked ? lock.lockedRevenue : netRevenue,
        displayOrders: lock?.isLocked ? lock.lockedOrders : actualOrders,
      }
    })

    return NextResponse.json({ servers: serverRevenue })
  } catch (error) {
    console.error('Failed to fetch super revenue data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

// POST: ล็อก/ปลดล็อกรายได้ หรือ ตั้งค่า commission %
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await checkSuperAdmin(session)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { serverId, action, commissionPercent } = body

    if (!serverId || !action) {
      return NextResponse.json({ error: 'Missing serverId or action' }, { status: 400 })
    }

    // ตั้งค่า commission %
    if (action === 'set-commission') {
      if (commissionPercent === undefined || commissionPercent < 0 || commissionPercent > 100) {
        return NextResponse.json({ error: 'commissionPercent ต้องอยู่ระหว่าง 0-100' }, { status: 400 })
      }

      const server = await prisma.vpnServer.update({
        where: { id: serverId },
        data: { commissionPercent },
        select: { name: true }
      })

      return NextResponse.json({ 
        success: true, 
        message: `ตั้งค่าหัก ${commissionPercent}% สำหรับ ${server.name} เรียบร้อย` 
      })
    }

    if (action === 'lock') {
      // ดึงข้อมูลรายได้ปัจจุบันของเซิร์ฟเวอร์นี้
      const server = await prisma.vpnServer.findUnique({
        where: { id: serverId },
        include: {
          orders: {
            where: { isActive: true },
            select: { price: true, userId: true }
          }
        }
      })

      if (!server) {
        return NextResponse.json({ error: 'Server not found' }, { status: 404 })
      }

      // คำนวณรายได้จริง (หลังหัก commission)
      const usersWithRealTopup = await prisma.topUp.findMany({
        where: { status: 'SUCCESS' },
        select: { userId: true },
        distinct: ['userId']
      })
      const realUserIds = new Set(usersWithRealTopup.map(t => t.userId))

      const realOrders = server.orders.filter(order => realUserIds.has(order.userId))
      const grossRevenue = realOrders.reduce((sum, order) => sum + order.price, 0)
      const commissionPct = server.commissionPercent || 0
      const currentRevenue = grossRevenue * (1 - commissionPct / 100)
      const currentOrders = realOrders.length

      // upsert lock record
      await prisma.serverRevenueLock.upsert({
        where: { serverId },
        create: {
          serverId,
          serverName: server.name,
          lockedRevenue: currentRevenue,
          lockedOrders: currentOrders,
          lockedBy: admin.id,
          isLocked: true
        },
        update: {
          lockedRevenue: currentRevenue,
          lockedOrders: currentOrders,
          lockedBy: admin.id,
          lockedAt: new Date(),
          isLocked: true
        }
      })

      return NextResponse.json({ success: true, message: `ล็อกรายได้เซิร์ฟเวอร์ ${server.name} เรียบร้อย` })

    } else if (action === 'unlock') {
      const existing = await prisma.serverRevenueLock.findUnique({
        where: { serverId }
      })

      if (existing) {
        await prisma.serverRevenueLock.update({
          where: { serverId },
          data: { isLocked: false }
        })
      }

      return NextResponse.json({ success: true, message: 'ปลดล็อกรายได้เรียบร้อย' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to manage revenue lock:', error)
    return NextResponse.json({ error: 'Failed to manage lock' }, { status: 500 })
  }
}
