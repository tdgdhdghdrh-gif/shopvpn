import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// PUT - Update server
export async function PUT(
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
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    
    const { 
      name, flag, host, port, path, username, password, inboundId, 
      protocol, tlsType, flow, sni, clientPort,
      supportsAis, supportsTrue, supportsDtac, category, speed
    } = body

    if (!name || !host || !port || !path || !username || !inboundId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      flag: flag || '🌐',
      host,
      port,
      path,
      username,
      inboundId,
      protocol: protocol || 'vless',
      tlsType: tlsType || 'Reality',
      flow: flow || 'xtls-rprx-vision',
      sni: sni || 'google.co.th',
      clientPort: clientPort || 443,
      supportsAis: supportsAis ?? true,
      supportsTrue: supportsTrue ?? false,
      supportsDtac: supportsDtac ?? false,
      category: category || 'general',
      speed: speed || 1000
    }

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = password
    }

    const server = await prisma.vpnServer.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, server })
  } catch (error) {
    console.error('Failed to update server:', error)
    return NextResponse.json({ error: 'Failed to update server' }, { status: 500 })
  }
}

// DELETE - Delete server
export async function DELETE(
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
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    await prisma.vpnServer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete server:', error)
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 })
  }
}
