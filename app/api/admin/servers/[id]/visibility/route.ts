import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// PATCH - Toggle server visibility settings (isActive, isHidden)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true, isAgent: true },
    })

    if (!user?.isSuperAdmin && !user?.isAdmin && !user?.isAgent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Agent can only modify their own servers
    const isAgentOnly = user.isAgent && !user.isSuperAdmin && !user.isAdmin
    if (isAgentOnly) {
      const server = await prisma.vpnServer.findUnique({
        where: { id },
        select: { agentId: true },
      })
      if (!server || server.agentId !== session.userId) {
        return NextResponse.json(
          { error: 'ไม่มีสิทธิ์แก้ไขเซิร์ฟเวอร์นี้' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { isActive, isHidden } = body

    const updateData: any = {}
    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (typeof isHidden === 'boolean') updateData.isHidden = isHidden

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'กรุณาระบุ isActive หรือ isHidden' },
        { status: 400 }
      )
    }

    const updated = await prisma.vpnServer.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, server: updated })
  } catch (error) {
    console.error('Toggle visibility error:', error)
    return NextResponse.json(
      { error: 'Failed to update visibility' },
      { status: 500 }
    )
  }
}
