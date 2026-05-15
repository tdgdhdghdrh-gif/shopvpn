import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export interface GradientPreset {
  id: string
  name: string
  emoji: string
  type: 'linear' | 'radial' | 'conic' | 'mesh'
  colors: string[]
  angle: number
  animated: boolean
  speed: number
}

export const gradientPresets: GradientPreset[] = [
  { id: 'aurora', name: 'Aurora Borealis', emoji: '🌌', type: 'linear', colors: ['#0f0c29', '#302b63', '#24243e'], angle: 135, animated: true, speed: 20 },
  { id: 'sunset', name: 'Sunset Vibes', emoji: '🌅', type: 'linear', colors: ['#ff6e7f', '#bfe9ff'], angle: 135, animated: true, speed: 15 },
  { id: 'cosmic', name: 'Cosmic Fusion', emoji: '🌠', type: 'linear', colors: ['#ff00cc', '#333399'], angle: 45, animated: true, speed: 18 },
  { id: 'ocean-deep', name: 'Ocean Deep', emoji: '🌊', type: 'linear', colors: ['#000428', '#004e92'], angle: 180, animated: true, speed: 25 },
  { id: 'neon-city', name: 'Neon City', emoji: '🌃', type: 'linear', colors: ['#ec008c', '#fc6767', '#0099ff'], angle: 90, animated: true, speed: 12 },
  { id: 'mystic', name: 'Mystic Forest', emoji: '🍀', type: 'linear', colors: ['#134e5e', '#71b280'], angle: 135, animated: true, speed: 22 },
  { id: 'royal', name: 'Royal Velvet', emoji: '👑', type: 'linear', colors: ['#1a2980', '#26d0ce'], angle: 135, animated: true, speed: 20 },
  { id: 'fire', name: 'Fire Storm', emoji: '🔥', type: 'linear', colors: ['#ff416c', '#ff4b2b'], angle: 135, animated: true, speed: 10 },
  { id: 'lavender', name: 'Lavender Dream', emoji: '💜', type: 'linear', colors: ['#667eea', '#764ba2'], angle: 135, animated: true, speed: 18 },
  { id: 'midnight-aurora', name: 'Midnight Aurora', emoji: '✨', type: 'radial', colors: ['#3a0ca3', '#000428', '#000000'], angle: 0, animated: true, speed: 30 },
  { id: 'cherry', name: 'Cherry Blossom', emoji: '🌸', type: 'linear', colors: ['#ee9ca7', '#ffdde1'], angle: 135, animated: true, speed: 20 },
  { id: 'galaxy', name: 'Galaxy', emoji: '🌌', type: 'conic', colors: ['#ff00cc', '#3333ff', '#00ffcc', '#ff00cc'], angle: 0, animated: true, speed: 25 },
]

async function ensureSuperAdmin() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isSuperAdmin: true },
  })
  if (!user?.isSuperAdmin) return null
  return user
}

export async function GET() {
  const user = await ensureSuperAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let appearance = await prisma.siteAppearance.findFirst()
  if (!appearance) {
    appearance = await prisma.siteAppearance.create({ data: {} })
  }

  return NextResponse.json({
    success: true,
    presets: gradientPresets,
    config: {
      gradientEnabled: appearance.gradientEnabled,
      gradientType: appearance.gradientType,
      gradientColors: (appearance.gradientColors as string[] | null) || ['#1a2980', '#26d0ce'],
      gradientAngle: appearance.gradientAngle,
      gradientAnimated: appearance.gradientAnimated,
      gradientSpeed: appearance.gradientSpeed,
    },
  })
}

const validTypes = new Set(['linear', 'radial', 'conic', 'mesh'])

function clean(body: any) {
  const colors = Array.isArray(body.gradientColors)
    ? body.gradientColors.filter((c: any) => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c)).slice(0, 5)
    : []
  return {
    gradientEnabled: Boolean(body.gradientEnabled),
    gradientType: validTypes.has(body.gradientType) ? body.gradientType : 'linear',
    gradientColors: colors.length >= 2 ? colors : ['#1a2980', '#26d0ce'],
    gradientAngle: Math.min(360, Math.max(0, Number(body.gradientAngle) || 135)),
    gradientAnimated: Boolean(body.gradientAnimated),
    gradientSpeed: Math.min(60, Math.max(5, Number(body.gradientSpeed) || 15)),
  }
}

export async function POST(request: NextRequest) {
  const user = await ensureSuperAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const data = clean(body)

  let appearance = await prisma.siteAppearance.findFirst()
  if (!appearance) {
    appearance = await prisma.siteAppearance.create({ data: {} })
  }
  await prisma.siteAppearance.update({
    where: { id: appearance.id },
    data: {
      gradientEnabled: data.gradientEnabled,
      gradientType: data.gradientType,
      gradientColors: data.gradientColors as any,
      gradientAngle: data.gradientAngle,
      gradientAnimated: data.gradientAnimated,
      gradientSpeed: data.gradientSpeed,
      updatedBy: user.id,
    },
  })

  return NextResponse.json({ success: true, config: data })
}
