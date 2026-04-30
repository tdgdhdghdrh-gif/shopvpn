import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const settings = await prisma.settings.findFirst()

    return NextResponse.json({
      vpnBuyEnabled: settings?.vpnBuyEnabled ?? true,
      vpnBaseDeviceLimit: settings?.vpnBaseDeviceLimit ?? 1,
      vpnExtraDevicePrice: settings?.vpnExtraDevicePrice ?? 1,
    })
  } catch (error) {
    console.error('Failed to get VPN buy settings:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    let settings = await prisma.settings.findFirst()
    const data: Record<string, any> = {
      vpnBuyEnabled: body.vpnBuyEnabled !== undefined ? Boolean(body.vpnBuyEnabled) : (settings?.vpnBuyEnabled ?? true),
      vpnBaseDeviceLimit: body.vpnBaseDeviceLimit !== undefined ? parseInt(body.vpnBaseDeviceLimit) || 1 : (settings?.vpnBaseDeviceLimit ?? 1),
      vpnExtraDevicePrice: body.vpnExtraDevicePrice !== undefined ? parseFloat(body.vpnExtraDevicePrice) || 1 : (settings?.vpnExtraDevicePrice ?? 1),
      updatedAt: new Date()
    }

    if (settings) {
      settings = await prisma.settings.update({ where: { id: settings.id }, data })
    } else {
      settings = await prisma.settings.create({ data })
    }

    return NextResponse.json({ success: true, settings: {
      vpnBuyEnabled: settings.vpnBuyEnabled,
      vpnBaseDeviceLimit: settings.vpnBaseDeviceLimit,
      vpnExtraDevicePrice: settings.vpnExtraDevicePrice,
    }})
  } catch (error: any) {
    console.error('Failed to save VPN buy settings:', error)
    return NextResponse.json({ error: 'Failed to save settings', detail: error?.message || '' }, { status: 500 })
  }
}
