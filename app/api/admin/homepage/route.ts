import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// Default sections ที่จะสร้างถ้ายังไม่มีข้อมูล
const DEFAULT_SECTIONS = [
  { type: 'hero', title: 'Welcome Hero', sortOrder: 0, isVisible: true },
  { type: 'stats', title: 'Stats Grid', sortOrder: 1, isVisible: true },
  { type: 'quick_actions', title: 'Quick Actions', sortOrder: 2, isVisible: true },
  { type: 'banners', title: 'Promo Banners', sortOrder: 3, isVisible: true },
  { type: 'ads', title: 'User Ads', sortOrder: 4, isVisible: true },
  { type: 'expiry_warning', title: 'VPN Expiry Warning', sortOrder: 5, isVisible: true },
  { type: 'recent_orders', title: 'Recent Orders', sortOrder: 6, isVisible: true },
  { type: 'servers', title: 'Server Selection', sortOrder: 7, isVisible: true },
]

const DEFAULT_QUICK_ACTIONS = [
  { label: 'เติมเงิน', href: '/topup', icon: 'CreditCard', color: 'cyan', sortOrder: 0, isVisible: true },
  { label: 'คำสั่งซื้อ', href: '/profile/orders', icon: 'ShoppingBag', color: 'emerald', sortOrder: 1, isVisible: true },
  { label: 'แจ้งปัญหา', href: '/tickets', icon: 'Ticket', color: 'amber', sortOrder: 2, isVisible: true },
  { label: 'วิธีใช้', href: '/setup-guide', icon: 'BookOpen', color: 'pink', sortOrder: 3, isVisible: true },
]

const DEFAULT_STAT_CARDS = [
  { type: 'active_vpn', label: 'VPN ที่ใช้อยู่', icon: 'Shield', color: 'emerald', sortOrder: 0, isVisible: true },
  { type: 'nearest_expiry', label: 'หมดอายุเร็วสุด', icon: 'Clock', color: 'amber', sortOrder: 1, isVisible: true },
  { type: 'servers', label: 'เซิร์ฟเวอร์', icon: 'Globe', color: 'blue', sortOrder: 2, isVisible: true },
  { type: 'referrals', label: 'แนะนำเพื่อน', icon: 'UserPlus', color: 'violet', sortOrder: 3, isVisible: true },
]

async function checkAdmin() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) return null
  const user = await prisma.user.findFirst({
    where: { id: session.userId },
    select: { isSuperAdmin: true, isAdmin: true, isAgent: true }
  })
  if (!user || (!user.isSuperAdmin && !user.isAdmin && !user.isAgent)) return null
  return user
}

// GET — ดึงข้อมูลทั้งหมด (auto-init ถ้ายังว่าง)
export async function GET() {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Auto-seed sections ถ้ายังไม่มี
  const sectionCount = await prisma.homepageSection.count()
  if (sectionCount === 0) {
    await prisma.homepageSection.createMany({ data: DEFAULT_SECTIONS })
  }

  const qaCount = await prisma.homepageQuickAction.count()
  if (qaCount === 0) {
    await prisma.homepageQuickAction.createMany({ data: DEFAULT_QUICK_ACTIONS })
  }

  const statCount = await prisma.homepageStatCard.count()
  if (statCount === 0) {
    await prisma.homepageStatCard.createMany({ data: DEFAULT_STAT_CARDS })
  }

  // Fetch all
  const [sections, quickActions, statCards, settings] = await Promise.all([
    prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.homepageQuickAction.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.homepageStatCard.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.settings.findFirst({ select: { homepageConfig: true } }),
  ])

  return NextResponse.json({
    sections,
    quickActions,
    statCards,
    heroConfig: (settings?.homepageConfig as any)?.hero || {},
  })
}

// PUT — อัพเดตทั้งหมด (reorder, toggle, update)
export async function PUT(req: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body

  try {
    switch (action) {
      // === Sections ===
      case 'reorder_sections': {
        const { items } = body // [{ id, sortOrder }]
        await Promise.all(
          items.map((item: { id: string; sortOrder: number }) =>
            prisma.homepageSection.update({
              where: { id: item.id },
              data: { sortOrder: item.sortOrder },
            })
          )
        )
        return NextResponse.json({ success: true })
      }

      case 'toggle_section': {
        const { id, isVisible } = body
        await prisma.homepageSection.update({
          where: { id },
          data: { isVisible },
        })
        return NextResponse.json({ success: true })
      }

      case 'update_section': {
        const { id, ...data } = body
        delete data.action
        await prisma.homepageSection.update({
          where: { id },
          data,
        })
        return NextResponse.json({ success: true })
      }

      // === Quick Actions ===
      case 'reorder_quick_actions': {
        const { items } = body
        await Promise.all(
          items.map((item: { id: string; sortOrder: number }) =>
            prisma.homepageQuickAction.update({
              where: { id: item.id },
              data: { sortOrder: item.sortOrder },
            })
          )
        )
        return NextResponse.json({ success: true })
      }

      case 'update_quick_action': {
        const { id, ...data } = body
        delete data.action
        await prisma.homepageQuickAction.update({
          where: { id },
          data,
        })
        return NextResponse.json({ success: true })
      }

      case 'toggle_quick_action': {
        const { id, isVisible } = body
        await prisma.homepageQuickAction.update({
          where: { id },
          data: { isVisible },
        })
        return NextResponse.json({ success: true })
      }

      // === Stat Cards ===
      case 'reorder_stat_cards': {
        const { items } = body
        await Promise.all(
          items.map((item: { id: string; sortOrder: number }) =>
            prisma.homepageStatCard.update({
              where: { id: item.id },
              data: { sortOrder: item.sortOrder },
            })
          )
        )
        return NextResponse.json({ success: true })
      }

      case 'update_stat_card': {
        const { id, ...data } = body
        delete data.action
        await prisma.homepageStatCard.update({
          where: { id },
          data,
        })
        return NextResponse.json({ success: true })
      }

      case 'toggle_stat_card': {
        const { id, isVisible } = body
        await prisma.homepageStatCard.update({
          where: { id },
          data: { isVisible },
        })
        return NextResponse.json({ success: true })
      }

      // === Hero Config ===
      case 'update_hero': {
        const { heroConfig } = body
        const settings = await prisma.settings.findFirst()
        const currentConfig = (settings?.homepageConfig as any) || {}
        if (settings) {
          await prisma.settings.update({
            where: { id: settings.id },
            data: { homepageConfig: { ...currentConfig, hero: heroConfig } },
          })
        }
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST — เพิ่ม item ใหม่
export async function POST(req: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { target } = body

  try {
    switch (target) {
      case 'section': {
        const { type, title, content, imageUrl, linkUrl, bgColor, textColor, borderColor, icon, config } = body
        const maxSort = await prisma.homepageSection.aggregate({ _max: { sortOrder: true } })
        const section = await prisma.homepageSection.create({
          data: {
            type: type || 'custom_text',
            title: title || 'New Section',
            sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
            isVisible: true,
            content,
            imageUrl,
            linkUrl,
            bgColor,
            textColor,
            borderColor,
            icon,
            config,
          },
        })
        return NextResponse.json({ success: true, section })
      }

      case 'quick_action': {
        const { label, href, icon, color } = body
        const maxSort = await prisma.homepageQuickAction.aggregate({ _max: { sortOrder: true } })
        const qa = await prisma.homepageQuickAction.create({
          data: {
            label: label || 'New Action',
            href: href || '/',
            icon: icon || 'Zap',
            color: color || 'cyan',
            sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
            isVisible: true,
          },
        })
        return NextResponse.json({ success: true, quickAction: qa })
      }

      case 'stat_card': {
        const { type, label, icon, color } = body
        if (!type) return NextResponse.json({ error: 'Missing type' }, { status: 400 })
        // Check uniqueness
        const exists = await prisma.homepageStatCard.findUnique({ where: { type } })
        if (exists) return NextResponse.json({ error: 'Stat card type already exists' }, { status: 400 })
        const maxSort = await prisma.homepageStatCard.aggregate({ _max: { sortOrder: true } })
        const stat = await prisma.homepageStatCard.create({
          data: {
            type,
            label: label || type,
            icon: icon || 'BarChart3',
            color: color || 'cyan',
            sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
            isVisible: true,
          },
        })
        return NextResponse.json({ success: true, statCard: stat })
      }

      default:
        return NextResponse.json({ error: 'Unknown target' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE — ลบ item
export async function DELETE(req: NextRequest) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const target = searchParams.get('target')
  const id = searchParams.get('id')

  if (!target || !id) {
    return NextResponse.json({ error: 'Missing target or id' }, { status: 400 })
  }

  try {
    switch (target) {
      case 'section': {
        // ห้ามลบ built-in sections
        const section = await prisma.homepageSection.findUnique({ where: { id } })
        if (!section) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        const builtIn = ['hero', 'stats', 'quick_actions', 'banners', 'ads', 'expiry_warning', 'recent_orders', 'servers']
        if (builtIn.includes(section.type)) {
          return NextResponse.json({ error: 'Cannot delete built-in section. You can hide it instead.' }, { status: 400 })
        }
        await prisma.homepageSection.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }

      case 'quick_action': {
        await prisma.homepageQuickAction.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }

      case 'stat_card': {
        await prisma.homepageStatCard.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown target' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
