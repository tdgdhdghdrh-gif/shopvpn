import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import webpush from 'web-push'

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@simonvpn.darkx.shop',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

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

// GET - List announcements (admin)
export async function GET(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category') || undefined

  const where: any = {}
  if (category && category !== 'all') where.category = category

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.announcement.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    announcements,
    total,
    pages: Math.ceil(total / limit),
  })
}

// POST - Create announcement + optionally send push
export async function POST(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { title, content, category, priority, isPinned, sendPush } = body

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'กรุณากรอกหัวข้อและเนื้อหา' }, { status: 400 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || 'general',
        priority: priority || 'normal',
        isPinned: isPinned || false,
        sendPush: sendPush || false,
        createdBy: admin.id,
      }
    })

    // Send push notification if requested
    let pushStats = { sent: 0, errors: 0, total: 0 }
    if (sendPush) {
      pushStats = await sendAnnouncementPush(announcement)
      
      await prisma.announcement.update({
        where: { id: announcement.id },
        data: {
          pushSentAt: new Date(),
          pushCount: pushStats.sent,
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      announcement,
      pushStats: sendPush ? pushStats : undefined,
    })
  } catch (error) {
    console.error('Create announcement error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - Update announcement
export async function PUT(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, title, content, category, priority, isPinned, isActive, resendPush } = body

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const existing = await prisma.announcement.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'ไม่พบประกาศ' }, { status: 404 })

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title?.trim() && { title: title.trim() }),
        ...(content?.trim() && { content: content.trim() }),
        ...(category && { category }),
        ...(priority && { priority }),
        ...(typeof isPinned === 'boolean' && { isPinned }),
        ...(typeof isActive === 'boolean' && { isActive }),
      }
    })

    // Resend push if requested
    let pushStats = undefined
    if (resendPush) {
      pushStats = await sendAnnouncementPush(updated)
      await prisma.announcement.update({
        where: { id },
        data: { pushSentAt: new Date(), pushCount: (updated.pushCount || 0) + pushStats.sent }
      })
    }

    return NextResponse.json({ success: true, announcement: updated, pushStats })
  } catch (error) {
    console.error('Update announcement error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - Delete announcement
export async function DELETE(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await prisma.announcement.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// Helper: Send push notification to all subscribed users
async function sendAnnouncementPush(announcement: any) {
  const subscriptions = await prisma.pushSubscription.findMany()
  let sent = 0
  let errors = 0

  const categoryEmoji: Record<string, string> = {
    general: '📢',
    update: '🆕',
    maintenance: '🔧',
    promo: '🎉',
    urgent: '🚨',
  }

  const emoji = categoryEmoji[announcement.category] || '📢'

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify({
          title: `${emoji} ${announcement.title}`,
          body: announcement.content.substring(0, 200),
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: `announcement-${announcement.id}`,
          url: '/announcements',
          data: { announcementId: announcement.id },
        })
      )
      sent++
    } catch (pushError: any) {
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
      }
      errors++
    }
  }

  return { sent, errors, total: subscriptions.length }
}
