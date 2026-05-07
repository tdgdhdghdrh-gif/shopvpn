import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function requireAdminSession() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true }
  })

  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

// GET - Get setup guide config (admin)
export async function GET() {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    let settings: any = null
    try {
      settings = await prisma.settings.findFirst()
    } catch {
      const rows: any[] = await prisma.$queryRaw`SELECT * FROM "Settings" LIMIT 1`
      settings = rows[0] || null
    }

    return NextResponse.json({
      success: true,
      config: settings?.setupGuideConfig || null,
    })
  } catch (error) {
    console.error('Failed to get setup guide:', error)
    return NextResponse.json({ error: 'Failed to get setup guide' }, { status: 500 })
  }
}

// POST / PUT - Save setup guide config
export async function POST(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { config } = body

    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'Invalid config' }, { status: 400 })
    }

    let settings = await prisma.settings.findFirst()
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          truemoneyPhone: '',
          truemoneyApiKey: '',
          slipApiKey: '',
          bankReceiverName: 'พันวิลา',
          bankAccountNumber: '',
          qrCodeImage: '',
          siteName: '',
          siteLogo: '',
          backgroundImage: '',
          setupGuideConfig: config,
        }
      })
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { setupGuideConfig: config }
      })
    }

    return NextResponse.json({ success: true, config: settings.setupGuideConfig })
  } catch (error) {
    console.error('Failed to save setup guide:', error)
    return NextResponse.json({ error: 'Failed to save setup guide' }, { status: 500 })
  }
}

// DELETE - Reset to default
export async function DELETE() {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const settings = await prisma.settings.findFirst()
    if (settings) {
      await prisma.settings.update({
        where: { id: settings.id },
        data: { setupGuideConfig: null }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to reset setup guide:', error)
    return NextResponse.json({ error: 'Failed to reset setup guide' }, { status: 500 })
  }
}
