import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - Get hamburger menu config (admin)
export async function GET() {
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

    const settings = await prisma.settings.findFirst({
      select: { hamburgerMenuConfig: true }
    })

    return NextResponse.json({
      config: settings?.hamburgerMenuConfig || null
    })
  } catch (error) {
    console.error('Failed to get hamburger menu config:', error)
    return NextResponse.json({ error: 'Failed to get config' }, { status: 500 })
  }
}

// POST - Save hamburger menu config (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true }
    })

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { config } = body

    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'Invalid config' }, { status: 400 })
    }

    let settings = await prisma.settings.findFirst()

    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { hamburgerMenuConfig: config }
      })
    } else {
      settings = await prisma.settings.create({
        data: { hamburgerMenuConfig: config }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save hamburger menu config:', error)
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }
}
