import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
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
    const data = body.data

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const results: Record<string, { imported: number; skipped?: number }> = {}

    async function importTable(name: string, items: any[], createFn: (item: any) => Promise<any>) {
      if (!Array.isArray(items) || items.length === 0) {
        results[name] = { imported: 0 }
        return
      }
      let imported = 0
      let skipped = 0
      for (const item of items) {
        try {
          const { id, createdAt, updatedAt, ...rest } = item
          await createFn(rest)
          imported++
        } catch {
          skipped++
        }
      }
      results[name] = { imported, skipped }
    }

    await importTable('users', data.users, (d) => prisma.user.create({ data: d }))
    await importTable('products', data.products, (d) => prisma.product.create({ data: d }))
    await importTable('orders', data.orders, (d) => prisma.order.create({ data: d }))
    await importTable('topUps', data.topUps, (d) => prisma.topUp.create({ data: d }))
    await importTable('settings', data.settings, (d) => prisma.settings.create({ data: d }))
    await importTable('vpnServers', data.vpnServers, (d) => prisma.vpnServer.create({ data: d }))
    await importTable('vpnOrders', data.vpnOrders, (d) => prisma.vpnOrder.create({ data: d }))
    await importTable('vlessPublicOrders', data.vlessPublicOrders, (d) => prisma.vlessPublicOrder.create({ data: d }))
    await importTable('chatMessages', data.chatMessages, (d) => prisma.chatMessage.create({ data: d }))
    await importTable('referralHistories', data.referralHistories, (d) => prisma.referralHistory.create({ data: d }))
    await importTable('referralIPTrackings', data.referralIPTrackings, (d) => prisma.referralIPTracking.create({ data: d }))
    await importTable('tickets', data.tickets, (d) => prisma.ticket.create({ data: d }))
    await importTable('ticketMessages', data.ticketMessages, (d) => prisma.ticketMessage.create({ data: d }))
    await importTable('discountEvents', data.discountEvents, (d) => prisma.discountEvent.create({ data: d }))
    await importTable('serverRevenueLocks', data.serverRevenueLocks, (d) => prisma.serverRevenueLock.create({ data: d }))
    await importTable('resellerProfiles', data.resellerProfiles, (d) => prisma.resellerProfile.create({ data: d }))
    await importTable('resellerServers', data.resellerServers, (d) => prisma.resellerServer.create({ data: d }))
    await importTable('resellerOrders', data.resellerOrders, (d) => prisma.resellerOrder.create({ data: d }))
    await importTable('withdrawals', data.withdrawals, (d) => prisma.withdrawal.create({ data: d }))
    await importTable('promoLinks', data.promoLinks, (d) => prisma.promoLink.create({ data: d }))
    await importTable('promoActivations', data.promoActivations, (d) => prisma.promoActivation.create({ data: d }))
    await importTable('ipLogs', data.ipLogs, (d) => prisma.iPLog.create({ data: d }))
    await importTable('reviews', data.reviews, (d) => prisma.review.create({ data: d }))
    await importTable('reviewLikes', data.reviewLikes, (d) => prisma.reviewLike.create({ data: d }))
    await importTable('blockedIps', data.blockedIps, (d) => prisma.blockedIP.create({ data: d }))
    await importTable('allowedIps', data.allowedIps, (d) => prisma.allowedIP.create({ data: d }))
    await importTable('apiKeys', data.apiKeys, (d) => prisma.apiKey.create({ data: d }))
    await importTable('apiKeyLogs', data.apiKeyLogs, (d) => prisma.apiKeyLog.create({ data: d }))
    await importTable('slowReports', data.slowReports, (d) => prisma.slowReport.create({ data: d }))
    await importTable('adminContacts', data.adminContacts, (d) => prisma.adminContact.create({ data: d }))
    await importTable('announcements', data.announcements, (d) => prisma.announcement.create({ data: d }))
    await importTable('pushSubscriptions', data.pushSubscriptions, (d) => prisma.pushSubscription.create({ data: d }))
    await importTable('notificationLogs', data.notificationLogs, (d) => prisma.notificationLog.create({ data: d }))
    await importTable('blogPosts', data.blogPosts, (d) => prisma.blogPost.create({ data: d }))
    await importTable('promoBanners', data.promoBanners, (d) => prisma.promoBanner.create({ data: d }))
    await importTable('promoPopups', data.promoPopups, (d) => prisma.promoPopup.create({ data: d }))
    await importTable('luckyWheelPrizes', data.luckyWheelPrizes, (d) => prisma.luckyWheelPrize.create({ data: d }))
    await importTable('luckyWheelSpins', data.luckyWheelSpins, (d) => prisma.luckyWheelSpin.create({ data: d }))
    await importTable('dailyCheckins', data.dailyCheckins, (d) => prisma.dailyCheckin.create({ data: d }))
    await importTable('gifts', data.gifts, (d) => prisma.gift.create({ data: d }))
    await importTable('coupons', data.coupons, (d) => prisma.coupon.create({ data: d }))
    await importTable('couponRedemptions', data.couponRedemptions, (d) => prisma.couponRedemption.create({ data: d }))
    await importTable('notifications', data.notifications, (d) => prisma.notification.create({ data: d }))
    await importTable('ads', data.ads, (d) => prisma.ad.create({ data: d }))
    await importTable('homepageSections', data.homepageSections, (d) => prisma.homepageSection.create({ data: d }))
    await importTable('homepageQuickActions', data.homepageQuickActions, (d) => prisma.homepageQuickAction.create({ data: d }))
    await importTable('homepageStatCards', data.homepageStatCards, (d) => prisma.homepageStatCard.create({ data: d }))
    await importTable('premiumApps', data.premiumApps, (d) => prisma.premiumApp.create({ data: d }))
    await importTable('premiumAppOrders', data.premiumAppOrders, (d) => prisma.premiumAppOrder.create({ data: d }))
    await importTable('customPages', data.customPages, (d) => prisma.customPage.create({ data: d }))
    await importTable('formSubmissions', data.formSubmissions, (d) => prisma.formSubmission.create({ data: d }))
    await importTable('pageDatabaseRecords', data.pageDatabaseRecords, (d) => prisma.pageDatabaseRecord.create({ data: d }))
    await importTable('siteUpdateLogs', data.siteUpdateLogs, (d) => prisma.siteUpdateLog.create({ data: d }))
    await importTable('v2BoxCodes', data.v2BoxCodes, (d) => prisma.v2BoxCode.create({ data: d }))
    await importTable('siteUpdates', data.siteUpdates, (d) => prisma.siteUpdate.create({ data: d }))
    await importTable('siteMusics', data.siteMusics, (d) => prisma.siteMusic.create({ data: d }))
    await importTable('telegramConfigs', data.telegramConfigs, (d) => prisma.telegramConfig.create({ data: d }))

    const totalImported = Object.values(results).reduce((sum, r) => sum + r.imported, 0)
    const totalSkipped = Object.values(results).reduce((sum, r) => sum + (r.skipped || 0), 0)

    return NextResponse.json({
      success: true,
      results,
      summary: { totalImported, totalSkipped, totalTables: Object.keys(results).length },
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error?.message || 'Import failed' }, { status: 500 })
  }
}
