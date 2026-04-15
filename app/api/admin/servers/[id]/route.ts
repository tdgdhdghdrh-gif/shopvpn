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
      select: { isSuperAdmin: true, isAdmin: true, isAgent: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin && !user?.isAgent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // ตัวแทนแก้ไขได้เฉพาะเซิร์ฟเวอร์ของตัวเอง
    const isAgentOnly = user.isAgent && !user.isSuperAdmin && !user.isAdmin
    if (isAgentOnly) {
      const server = await prisma.vpnServer.findUnique({
        where: { id },
        select: { agentId: true }
      })
      if (!server || server.agentId !== session.userId) {
        return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไขเซิร์ฟเวอร์นี้' }, { status: 403 })
      }
    }

    const body = await request.json()
    
    const { 
      name, flag, host, port, path, username, password, inboundId, 
      protocol, tlsType, flow, sni, clientPort,
      supportsAis, supportsTrue, supportsDtac, category, speed,
      inboundConfigs,
      // Per-server pricing & decoration
      pricePerDay, priceWeekly, priceMonthly,
      price3Months, price6Months, price12Months,
      description, badge, tags, features, themeColor, themeGradient, imageUrl,
      sortOrder, maxClients, defaultIpLimit,
      vlessTemplate
    } = body

    if (!name || !host || !port || !path || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // inboundId is required unless inboundConfigs provides one
    const effectiveInboundId = inboundId || (inboundConfigs?.[0]?.inboundId) || 0

    // Prepare update data
    const updateData: any = {
      name,
      flag: flag || '🌐',
      host,
      port,
      path,
      username,
      inboundId: effectiveInboundId,
      protocol: protocol || 'vless',
      tlsType: tlsType || 'Reality',
      flow: flow || 'xtls-rprx-vision',
      sni: sni || 'google.co.th',
      clientPort: clientPort || 443,
      supportsAis: supportsAis ?? true,
      supportsTrue: supportsTrue ?? false,
      supportsDtac: supportsDtac ?? false,
      category: category || 'general',
      speed: speed || 1000,
      inboundConfigs: inboundConfigs || undefined,
      // Per-server pricing
      pricePerDay: pricePerDay ?? 2,
      priceWeekly: priceWeekly !== undefined ? priceWeekly : null,
      priceMonthly: priceMonthly !== undefined ? priceMonthly : null,
      price3Months: price3Months !== undefined ? price3Months : null,
      price6Months: price6Months !== undefined ? price6Months : null,
      price12Months: price12Months !== undefined ? price12Months : null,
      // Decoration
      description: description || null,
      badge: badge || null,
      tags: tags || [],
      features: features || [],
      themeColor: themeColor || null,
      themeGradient: themeGradient || null,
      imageUrl: imageUrl || null,
      sortOrder: sortOrder ?? 0,
      // Limits
      maxClients: maxClients ?? 0,
      defaultIpLimit: defaultIpLimit ?? 0,
      // VLESS template
      vlessTemplate: vlessTemplate !== undefined ? (vlessTemplate || null) : undefined,
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
      select: { isSuperAdmin: true, isAdmin: true, isAgent: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin && !user?.isAgent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // ตัวแทนลบได้เฉพาะเซิร์ฟเวอร์ของตัวเอง
    const isAgentOnly = user.isAgent && !user.isSuperAdmin && !user.isAdmin
    if (isAgentOnly) {
      const server = await prisma.vpnServer.findUnique({
        where: { id },
        select: { agentId: true }
      })
      if (!server || server.agentId !== session.userId) {
        return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบเซิร์ฟเวอร์นี้' }, { status: 403 })
      }
    }

    await prisma.vpnServer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete server:', error)
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 })
  }
}
