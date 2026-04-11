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
      select: { isSuperAdmin: true }
    })

    if (!user?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin only' },
        { status: 403 }
      )
    }

    const servers = await prisma.vpnServer.findMany({
      select: {
        id: true,
        name: true,
        host: true,
        port: true,
        path: true,
        username: true,
        password: true,
        inboundId: true,
        protocol: true,
        isActive: true,
        flag: true,
        status: true,
        clientPort: true,
        sni: true,
        tlsType: true,
        network: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, servers })
  } catch (error) {
    console.error('Failed to fetch server info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch server info' },
      { status: 500 }
    )
  }
}
