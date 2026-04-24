import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - ดึงสถานะช่องทางเติมเงิน
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst({
      select: { walletEnabled: true, slipEnabled: true, autoDisableTopup: true }
    })
    return NextResponse.json({
      walletEnabled: settings?.walletEnabled ?? true,
      slipEnabled: settings?.slipEnabled ?? true,
      autoDisableTopup: settings?.autoDisableTopup ?? true,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topup status' }, { status: 500 })
  }
}

// POST - อัปเดตสถานะช่องทางเติมเงิน (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) {
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
    const { walletEnabled, slipEnabled, autoDisableTopup } = body

    const existing = await prisma.settings.findFirst()
    if (!existing) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    const updated = await prisma.settings.update({
      where: { id: existing.id },
      data: {
        walletEnabled: walletEnabled !== undefined ? walletEnabled : existing.walletEnabled,
        slipEnabled: slipEnabled !== undefined ? slipEnabled : existing.slipEnabled,
        autoDisableTopup: autoDisableTopup !== undefined ? autoDisableTopup : existing.autoDisableTopup,
      }
    })

    return NextResponse.json({ success: true, settings: updated })
  } catch (error) {
    console.error('Update topup status error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
