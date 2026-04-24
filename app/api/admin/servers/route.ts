import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true, isAgent: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin && !user?.isAgent) {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    // ตัวแทนเห็นเฉพาะเซิร์ฟเวอร์ของตัวเอง
    const where = user.isAgent && !user.isSuperAdmin && !user.isAdmin
      ? { agentId: session.userId }
      : {}

    const servers = await prisma.vpnServer.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        flag: true,
        host: true,
        port: true,
        path: true,
        username: true,
        password: true,
        inboundId: true,
        protocol: true,
        tlsType: true,
        flow: true,
        sni: true,
        clientPort: true,
        isActive: true,
        isHidden: true,
        healthStatus: true,
        lastHealthCheck: true,
        ping: true,
        load: true,
        status: true,
        supportsAis: true,
        supportsTrue: true,
        supportsDtac: true,
        category: true,
        speed: true,
        inboundConfigs: true,
        createdAt: true,
        updatedAt: true,
        pricePerDay: true,
        priceWeekly: true,
        priceMonthly: true,
        customPackages: true,
        description: true,
        badge: true,
        tags: true,
        features: true,
        themeColor: true,
        themeGradient: true,
        imageUrl: true,
        sortOrder: true,
        maxClients: true,
        defaultIpLimit: true,
        vlessTemplate: true,
      }
    })

    // Optionally run quick background health check for stale servers (older than 5 min)
    const staleThreshold = new Date(Date.now() - 5 * 60 * 1000)
    const staleServers = servers.filter(
      (s) =>
        !s.lastHealthCheck ||
        new Date(s.lastHealthCheck) < staleThreshold
    )

    if (staleServers.length > 0) {
      // Fire-and-forget background health refresh (do not block response)
      Promise.all(
        staleServers.map(async (server) => {
          try {
            const res = await fetch(
              `${request.nextUrl.origin}/api/admin/servers/health-check`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serverId: server.id }),
              }
            )
            return await res.json()
          } catch {
            return null
          }
        })
      ).catch(() => {})
    }

    return NextResponse.json({ servers })
  } catch (error) {
    console.error('Failed to fetch servers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    )
  }
}
