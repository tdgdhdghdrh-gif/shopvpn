import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public endpoint to compare servers
export async function GET() {
  try {
    const servers = await prisma.vpnServer.findMany({
      where: { isActive: true, isHidden: false },
      orderBy: { ping: 'asc' },
      select: {
        id: true,
        name: true,
        flag: true,
        protocol: true,
        status: true,
        ping: true,
        speed: true,
        load: true,
        tlsType: true,
        network: true,
        supportsAis: true,
        supportsTrue: true,
        supportsDtac: true,
        category: true,
        _count: {
          select: {
            orders: {
              where: { isActive: true, expiryTime: { gt: new Date() } }
            }
          }
        }
      }
    })

    // Get slow reports for each server
    const slowReports = await prisma.slowReport.groupBy({
      by: ['serverId', 'reason'],
      _count: true
    })

    const serversWithData = servers.map(server => {
      const reports = slowReports.filter(r => r.serverId === server.id)
      const totalReports = reports.reduce((sum, r) => sum + r._count, 0)
      return {
        ...server,
        activeUsers: server._count.orders,
        slowReports: totalReports,
        reportDetails: reports.reduce((acc, r) => ({ ...acc, [r.reason]: r._count }), {} as Record<string, number>)
      }
    })

    return NextResponse.json({ servers: serversWithData })
  } catch (error) {
    console.error('Failed to compare servers:', error)
    return NextResponse.json({ servers: [] })
  }
}
