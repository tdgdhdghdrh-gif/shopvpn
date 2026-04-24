import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { sendTelegramNotification } from '@/lib/telegram'

// GET - fetch config
export async function GET() {
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

    let config = await prisma.telegramConfig.findFirst()
    if (!config) {
      config = await prisma.telegramConfig.create({ data: {} })
    }

    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    console.error('Get telegram config error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

// POST - save config
export async function POST(request: NextRequest) {
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
    const {
      botToken,
      chatId,
      notifyTopup,
      notifyRegister,
      notifyBuyVpn,
      notifyError,
      isEnabled,
    } = body

    let config = await prisma.telegramConfig.findFirst()

    const data: any = {
      botToken: botToken !== undefined ? botToken : config?.botToken ?? '',
      chatId: chatId !== undefined ? chatId : config?.chatId ?? '',
      notifyTopup: notifyTopup !== undefined ? notifyTopup : config?.notifyTopup ?? true,
      notifyRegister: notifyRegister !== undefined ? notifyRegister : config?.notifyRegister ?? true,
      notifyBuyVpn: notifyBuyVpn !== undefined ? notifyBuyVpn : config?.notifyBuyVpn ?? true,
      notifyError: notifyError !== undefined ? notifyError : config?.notifyError ?? true,
      isEnabled: isEnabled !== undefined ? isEnabled : config?.isEnabled ?? false,
    }

    if (config) {
      config = await prisma.telegramConfig.update({
        where: { id: config.id },
        data,
      })
    } else {
      config = await prisma.telegramConfig.create({ data })
    }

    // Send test message if enabling
    if (isEnabled && botToken && chatId) {
      await sendTelegramNotification(
        `✅ <b>แจ้งเตือน Telegram เปิดใช้งานแล้ว!</b>\n\n` +
        `บอทจะแจ้งเตือนเหตุการณ์ต่างๆ ในระบบให้คุณทราบ\n` +
        `⏰ ${new Date().toLocaleString('th-TH')}`
      )
    }

    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    console.error('Save telegram config error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
