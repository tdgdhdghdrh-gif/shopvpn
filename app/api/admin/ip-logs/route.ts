import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

// GET - ดู IP logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isAdmin: true, isSuperAdmin: true }
    })

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const ip = searchParams.get('ip') || undefined
    const path = searchParams.get('path') || undefined
    const blocked = searchParams.get('blocked')

    const where: Record<string, unknown> = {}
    if (ip) where.ipAddress = { contains: ip }
    if (path) where.path = { contains: path }
    if (blocked === 'true') where.isBlocked = true
    if (blocked === 'false') where.isBlocked = false

    const [logs, total] = await Promise.all([
      prisma.iPLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.iPLog.count({ where }),
    ])

    // สถิติ IP ที่เข้ามาบ่อย (24 ชั่วโมงล่าสุด)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const topIPs = await prisma.iPLog.groupBy({
      by: ['ipAddress'],
      where: { createdAt: { gte: oneDayAgo } },
      _count: { ipAddress: true },
      orderBy: { _count: { ipAddress: 'desc' } },
      take: 20,
    })

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      topIPs: topIPs.map(t => ({ ip: t.ipAddress, count: t._count.ipAddress })),
    })
  } catch (error) {
    console.error('[Admin IP Logs] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
