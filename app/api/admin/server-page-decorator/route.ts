import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function ensureAdmin() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true },
  })
  if (!user?.isAdmin && !user?.isSuperAdmin) return null
  return user
}

export const cardStylePresets = [
  { id: 'default', name: 'Default', emoji: '⚪', description: 'สไตล์เริ่มต้น' },
  { id: 'glass', name: 'Glass', emoji: '🪟', description: 'กระจกใส โปร่งแสง' },
  { id: 'neon', name: 'Neon', emoji: '💡', description: 'ขอบเรืองแสง นีออน' },
  { id: 'premium', name: 'Premium', emoji: '👑', description: 'ทองหรู กรอบทองคำ' },
  { id: 'minimal', name: 'Minimal', emoji: '⬜', description: 'เรียบง่าย ไม่มีเงา' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮', description: 'ขอบเฉียง สไตล์เกม' },
]

export const sectionThemePresets = [
  { id: 'default', name: 'Default', emoji: '⚪' },
  { id: 'gradient', name: 'Gradient', emoji: '🌈' },
  { id: 'neon', name: 'Neon Glow', emoji: '✨' },
  { id: 'pulse', name: 'Pulse', emoji: '💓' },
  { id: 'sparkle', name: 'Sparkle', emoji: '🎆' },
]

export async function GET() {
  const user = await ensureAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const settings = await prisma.settings.findFirst({
    select: {
      id: true,
      serverCardStyle: true,
      serverSectionTheme: true,
      serverSectionTitle: true,
      serverSectionSubtitle: true,
      serverPageWidgets: true,
    },
  })

  return NextResponse.json({
    success: true,
    cardStylePresets,
    sectionThemePresets,
    config: {
      serverCardStyle: settings?.serverCardStyle || 'default',
      serverSectionTheme: settings?.serverSectionTheme || 'default',
      serverSectionTitle: settings?.serverSectionTitle || '',
      serverSectionSubtitle: settings?.serverSectionSubtitle || '',
      serverPageWidgets: (settings?.serverPageWidgets as any) || [],
    },
  })
}

const cardStyleIds = new Set(cardStylePresets.map(p => p.id))
const sectionThemeIds = new Set(sectionThemePresets.map(p => p.id))

export async function POST(request: NextRequest) {
  const user = await ensureAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()

  const data = {
    serverCardStyle: cardStyleIds.has(body.serverCardStyle) ? body.serverCardStyle : 'default',
    serverSectionTheme: sectionThemeIds.has(body.serverSectionTheme) ? body.serverSectionTheme : 'default',
    serverSectionTitle: typeof body.serverSectionTitle === 'string' ? body.serverSectionTitle.slice(0, 100) : '',
    serverSectionSubtitle: typeof body.serverSectionSubtitle === 'string' ? body.serverSectionSubtitle.slice(0, 200) : '',
    serverPageWidgets: Array.isArray(body.serverPageWidgets) ? body.serverPageWidgets.slice(0, 20) : [],
  }

  let settings = await prisma.settings.findFirst()
  if (!settings) {
    settings = await prisma.settings.create({ data: data as any })
  } else {
    await prisma.settings.update({
      where: { id: settings.id },
      data: data as any,
    })
  }

  return NextResponse.json({ success: true, config: data })
}
