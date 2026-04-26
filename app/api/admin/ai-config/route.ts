import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - fetch AI config
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isSuperAdmin: true } })
    if (!user?.isSuperAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let config = await prisma.aiAssistantConfig.findFirst()
    if (!config) config = await prisma.aiAssistantConfig.create({ data: {} })

    // Removed auto-migrate — user can choose any provider/model freely

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        apiKey: config.apiKey ? `${config.apiKey.slice(0, 7)}...${config.apiKey.slice(-4)}` : '',
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

// POST - save AI config
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isSuperAdmin: true } })
    if (!user?.isSuperAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { apiKey, baseUrl, model, isEnabled } = body

    let config = await prisma.aiAssistantConfig.findFirst()

    const data: any = {
      baseUrl: baseUrl !== undefined ? baseUrl : config?.baseUrl ?? 'https://generativelanguage.googleapis.com',
      model: model !== undefined ? model : config?.model ?? 'gemini-2.5-flash-preview-05-20',
      isEnabled: isEnabled !== undefined ? isEnabled : config?.isEnabled ?? false,
    }
    if (apiKey && !apiKey.includes('...')) data.apiKey = apiKey

    if (config) config = await prisma.aiAssistantConfig.update({ where: { id: config.id }, data })
    else config = await prisma.aiAssistantConfig.create({ data })

    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
