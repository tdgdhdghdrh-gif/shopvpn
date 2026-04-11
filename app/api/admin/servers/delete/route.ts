import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true, isAgent: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin && !user?.isAgent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const serverId = formData.get('serverId') as string

    if (!serverId) {
      return NextResponse.json({ error: 'Missing server ID' }, { status: 400 })
    }

    // ตัวแทนลบได้เฉพาะเซิร์ฟเวอร์ของตัวเอง
    const isAgentOnly = user.isAgent && !user.isSuperAdmin && !user.isAdmin
    if (isAgentOnly) {
      const server = await prisma.vpnServer.findUnique({
        where: { id: serverId },
        select: { agentId: true }
      })
      if (!server || server.agentId !== session.userId) {
        return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบเซิร์ฟเวอร์นี้' }, { status: 403 })
      }
    }

    await prisma.vpnServer.delete({
      where: { id: serverId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete server:', error)
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 })
  }
}
