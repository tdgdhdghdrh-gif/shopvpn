import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get premium app page config (public)
export async function GET() {
  try {
    let settings: any = null
    try {
      settings = await prisma.settings.findFirst()
    } catch {
      const rows: any[] = await prisma.$queryRaw`SELECT * FROM "Settings" LIMIT 1`
      settings = rows[0] || null
    }

    const defaultConfig = {
      pageTitle: 'ซื้อของ',
      pageSubtitle: 'รวมสินค้าคุณภาพ ซื้อง่าย ใช้ได้ทันที',
      heroBadge: 'Premium App Store',
      showStatsBar: true,
      showCategoryFilter: true,
      showSearch: true,
      showSoldCount: true,
      showStockCount: true,
      cardStyle: 'default',
      primaryColor: 'violet',
    }

    return NextResponse.json({
      success: true,
      config: settings?.premiumAppPageConfig || defaultConfig,
    })
  } catch (error) {
    console.error('Failed to get premium app settings:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}
