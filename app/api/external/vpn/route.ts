import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, logApiUsage } from '../validate'

// GET /api/external/vpn?email=xxx or ?id=xxx
// ดึงรายการโค้ด VPN (vlessLink, expiryTime, serverName, etc.) ที่ผู้ใช้มี
export async function GET(request: NextRequest) {
  try {
    const result = await validateApiKey(request, 'vpn:codes')
    if (result.error) return result.error

    const { apiKey } = result
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('id')
    const activeOnly = searchParams.get('active') !== 'false' // default: true (เฉพาะที่ยังใช้งานได้)

    if (!email && !userId) {
      return NextResponse.json(
        { success: false, error: 'Required query: ?email=xxx or ?id=xxx' },
        { status: 400 }
      )
    }

    // หา user ก่อน
    const user = await prisma.user.findUnique({
      where: email ? { email } : { id: userId! },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      await logApiUsage(apiKey.id, 'vpn:codes', email || userId, 'User not found', ip, false)
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // ดึง VPN orders
    const whereClause: any = { userId: user.id }
    if (activeOnly) {
      whereClause.isActive = true
      whereClause.expiryTime = { gte: new Date() }
    }

    const vpnOrders = await prisma.vpnOrder.findMany({
      where: whereClause,
      select: {
        id: true,
        clientUUID: true,
        remark: true,
        subId: true,
        vlessLink: true,
        packageType: true,
        price: true,
        duration: true,
        expiryTime: true,
        isActive: true,
        ipLimit: true,
        createdAt: true,
        server: {
          select: {
            id: true,
            name: true,
            flag: true,
            protocol: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    await logApiUsage(
      apiKey.id,
      'vpn:codes',
      user.email,
      `Read VPN codes: ${vpnOrders.length} orders`,
      ip,
      true
    )

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        vpnOrders: vpnOrders.map(order => ({
          id: order.id,
          serverName: order.server.name,
          serverFlag: order.server.flag,
          serverProtocol: order.server.protocol,
          serverStatus: order.server.status,
          clientUUID: order.clientUUID,
          remark: order.remark,
          subId: order.subId,
          vlessLink: order.vlessLink,
          packageType: order.packageType,
          price: order.price,
          duration: order.duration,
          expiryTime: order.expiryTime,
          isActive: order.isActive,
          ipLimit: order.ipLimit,
          createdAt: order.createdAt,
        })),
        total: vpnOrders.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
