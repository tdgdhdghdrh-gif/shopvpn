import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import webpush from 'web-push'

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@simonvpn.darkx.shop',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

interface NotificationTarget {
  userId: string
  orderId: string
  remark: string
  serverName: string
  serverFlag: string
  expiryTime: Date
  type: 'vpn_expiry_24h' | 'vpn_expiry_3h' | 'vpn_expired'
}

// GET - Check VPN orders about to expire and send push notifications
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000)
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Find orders expiring within 24 hours (still active)
    const expiringOrders = await prisma.vpnOrder.findMany({
      where: {
        isActive: true,
        expiryTime: {
          gt: now,
          lt: twentyFourHoursFromNow,
        }
      },
      include: {
        user: { select: { id: true, name: true } },
        server: { select: { name: true, flag: true } },
      }
    })

    // Find orders that just expired (within last 30 minutes)
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000)
    const justExpiredOrders = await prisma.vpnOrder.findMany({
      where: {
        isActive: true,
        expiryTime: {
          gt: thirtyMinAgo,
          lt: now,
        }
      },
      include: {
        user: { select: { id: true, name: true } },
        server: { select: { name: true, flag: true } },
      }
    })

    const targets: NotificationTarget[] = []

    // Categorize expiring orders
    for (const order of expiringOrders) {
      const hoursLeft = (order.expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      if (hoursLeft <= 3) {
        targets.push({
          userId: order.userId,
          orderId: order.id,
          remark: order.remark,
          serverName: order.server.name,
          serverFlag: order.server.flag,
          expiryTime: order.expiryTime,
          type: 'vpn_expiry_3h',
        })
      } else {
        targets.push({
          userId: order.userId,
          orderId: order.id,
          remark: order.remark,
          serverName: order.server.name,
          serverFlag: order.server.flag,
          expiryTime: order.expiryTime,
          type: 'vpn_expiry_24h',
        })
      }
    }

    // Add expired orders
    for (const order of justExpiredOrders) {
      targets.push({
        userId: order.userId,
        orderId: order.id,
        remark: order.remark,
        serverName: order.server.name,
        serverFlag: order.server.flag,
        expiryTime: order.expiryTime,
        type: 'vpn_expired',
      })
    }

    let sentCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const target of targets) {
      // Check if we already notified for this order + type in last 12 hours
      const existingLog = await prisma.notificationLog.findFirst({
        where: {
          orderId: target.orderId,
          type: target.type,
          createdAt: { gt: new Date(now.getTime() - 12 * 60 * 60 * 1000) },
        }
      })

      if (existingLog) {
        skippedCount++
        continue
      }

      // Get user's push subscriptions
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: target.userId }
      })

      if (subscriptions.length === 0) {
        skippedCount++
        continue
      }

      // Build notification content
      const { title, body } = buildNotificationContent(target)

      // Send to all user's subscriptions
      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              }
            },
            JSON.stringify({
              title,
              body,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: `vpn-expiry-${target.orderId}`,
              requireInteraction: target.type === 'vpn_expiry_3h' || target.type === 'vpn_expired',
              url: '/profile/renew',
              actions: [
                { action: 'renew', title: 'ต่ออายุ' },
                { action: 'dismiss', title: 'ปิด' },
              ],
            })
          )
          sentCount++
        } catch (pushError: any) {
          // If subscription is expired/invalid, remove it
          if (pushError.statusCode === 404 || pushError.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
          }
          errorCount++
        }
      }

      // Log the notification
      await prisma.notificationLog.create({
        data: {
          userId: target.userId,
          type: target.type,
          orderId: target.orderId,
          title,
          body,
          sent: true,
        }
      })
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalTargets: targets.length,
        sent: sentCount,
        skipped: skippedCount,
        errors: errorCount,
        timestamp: now.toISOString(),
      }
    })
  } catch (error) {
    console.error('Cron notify-expiry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildNotificationContent(target: NotificationTarget): { title: string; body: string } {
  const timeStr = target.expiryTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  const dateStr = target.expiryTime.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  
  switch (target.type) {
    case 'vpn_expiry_24h': {
      const hoursLeft = Math.round((target.expiryTime.getTime() - Date.now()) / (1000 * 60 * 60))
      return {
        title: `${target.serverFlag} VPN ใกล้หมดอายุ`,
        body: `โค้ด "${target.remark}" จะหมดอายุใน ${hoursLeft} ชม. (${dateStr} ${timeStr}) กดต่ออายุเลย!`,
      }
    }
    case 'vpn_expiry_3h': {
      const minsLeft = Math.round((target.expiryTime.getTime() - Date.now()) / (1000 * 60))
      const display = minsLeft >= 60 ? `${Math.floor(minsLeft / 60)} ชม. ${minsLeft % 60} นาที` : `${minsLeft} นาที`
      return {
        title: `⚠️ VPN กำลังจะหมดอายุ!`,
        body: `โค้ด "${target.remark}" ${target.serverFlag} เหลืออีก ${display} เท่านั้น! รีบต่ออายุก่อนหมด`,
      }
    }
    case 'vpn_expired':
      return {
        title: `❌ VPN หมดอายุแล้ว`,
        body: `โค้ด "${target.remark}" ${target.serverFlag} หมดอายุแล้ว กดต่ออายุเพื่อใช้งานต่อ`,
      }
    default:
      return {
        title: 'VPN แจ้งเตือน',
        body: 'คุณมีการแจ้งเตือนใหม่',
      }
  }
}
