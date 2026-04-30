import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function getSettings() {
  let s = await prisma.floatingTextSetting.findFirst()
  if (!s) {
    s = await prisma.floatingTextSetting.create({ data: {} })
  }
  return s
}

// Admin: GET settings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get('public') === 'true'

    if (!isPublic) {
      const session = await getSession()
      if (!session?.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { isSuperAdmin: true, isAdmin: true },
      })
      if (!user?.isSuperAdmin && !user?.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const settings = await getSettings()
    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

// Admin: UPDATE settings
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true },
    })
    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const settings = await getSettings()

    const updated = await prisma.floatingTextSetting.update({
      where: { id: settings.id },
      data: {
        enabled: body.enabled !== undefined ? Boolean(body.enabled) : settings.enabled,
        interval: body.interval !== undefined ? parseInt(body.interval) : settings.interval,
        minDuration: body.minDuration !== undefined ? parseInt(body.minDuration) : settings.minDuration,
        maxDuration: body.maxDuration !== undefined ? parseInt(body.maxDuration) : settings.maxDuration,
        fontSize: body.fontSize !== undefined ? body.fontSize : settings.fontSize,
        textColor: body.textColor !== undefined ? body.textColor : settings.textColor,
        glowColor: body.glowColor !== undefined ? body.glowColor : settings.glowColor,
        showRealData: body.showRealData !== undefined ? Boolean(body.showRealData) : settings.showRealData,
        customTexts: body.customTexts !== undefined ? body.customTexts : settings.customTexts,
        position: body.position !== undefined ? body.position : settings.position,
        updatedBy: session.userId,
      },
    })

    return NextResponse.json({ success: true, settings: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
