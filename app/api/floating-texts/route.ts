import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.floatingTextSetting.findFirst()
    if (!settings?.enabled) {
      return NextResponse.json({ success: true, messages: [], settings: { enabled: false } })
    }

    const messages: string[] = []

    // Get real recent activity
    if (settings.showRealData) {
      const [recentTopups, recentOrders, recentUsers, totalUsers, totalOrders] = await Promise.all([
        prisma.topUp.findMany({
          where: { status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { name: true } } },
        }),
        prisma.vpnOrder.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { name: true } } },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { name: true, createdAt: true },
        }),
        prisma.user.count(),
        prisma.vpnOrder.count({ where: { isActive: true } }),
      ])

      // Recent topups
      recentTopups.forEach(t => {
        const name = t.user?.name || 'ผู้ใช้'
        messages.push(`💸 ${name} เติมเงิน ${t.amount.toLocaleString('th-TH')}฿`)
      })

      // Recent orders
      recentOrders.forEach(o => {
        const name = o.user?.name || 'ผู้ใช้'
        messages.push(`🎉 ${name} ซื้อ VPN ${o.duration} วัน`)
      })

      // Recent registrations
      recentUsers.forEach(u => {
        messages.push(`👋 ${u.name} สมัครสมาชิกใหม่`)
      })

      // Stats
      messages.push(`📊 ผู้ใช้งานทั้งหมด ${totalUsers.toLocaleString('th-TH')} คน`)
      messages.push(`🔥 ออเดอร์ใช้งานอยู่ ${totalOrders.toLocaleString('th-TH')} รายการ`)
    }

    // Custom texts
    if (settings.customTexts?.length > 0) {
      messages.push(...settings.customTexts)
    }

    // Shuffle
    for (let i = messages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [messages[i], messages[j]] = [messages[j], messages[i]]
    }

    return NextResponse.json({
      success: true,
      messages,
      settings: {
        enabled: settings.enabled,
        interval: settings.interval,
        minDuration: settings.minDuration,
        maxDuration: settings.maxDuration,
        fontSize: settings.fontSize,
        textColor: settings.textColor,
        glowColor: settings.glowColor,
        position: settings.position,
      },
    })
  } catch (error: any) {
    console.error('Floating texts public error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
