import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { defaultThemeConfig, type ThemeConfig } from '@/app/api/admin/theme-settings/route'

export interface ThemePreset {
  id: string
  name: string
  description: string
  emoji: string
  gradient: string
  themeConfig: Partial<ThemeConfig>
  appearance: {
    themeMode?: string
    moodColor?: string | null
    customPrimaryColor?: string | null
    customBgColor?: string | null
    enableParticles?: boolean
    particleType?: string | null
    enableConfetti?: boolean
  }
}

export const themePresets: ThemePreset[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'นีออนชมพู-ฟ้า อนาคต',
    emoji: '🌃',
    gradient: 'from-fuchsia-500 to-cyan-400',
    themeConfig: {
      borderRadius: 12,
      borderWidth: 1,
      cardOpacity: 80,
      backdropBlur: 16,
      accentColor: '#ec4899',
      useCustomAccent: true,
      textBrightness: 110,
      colorIntensity: 130,
      navbarBlur: 20,
      navbarOpacity: 70,
      backgroundColor: '#0a0014',
      useCustomBg: true,
    },
    appearance: {
      themeMode: 'dark',
      moodColor: 'night',
      enableParticles: true,
      particleType: 'stars',
      enableConfetti: true,
      customPrimaryColor: '#ec4899',
      customBgColor: '#0a0014',
    },
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    description: 'ขาว-ดำ เรียบหรู',
    emoji: '⬜',
    gradient: 'from-zinc-300 to-zinc-600',
    themeConfig: {
      borderRadius: 8,
      borderWidth: 1,
      cardOpacity: 100,
      backdropBlur: 0,
      accentColor: '#ffffff',
      useCustomAccent: true,
      textBrightness: 100,
      colorIntensity: 80,
      navbarBlur: 0,
      navbarOpacity: 100,
      backgroundColor: '#000000',
      useCustomBg: true,
    },
    appearance: {
      themeMode: 'dark',
      moodColor: null,
      enableParticles: false,
      particleType: null,
      enableConfetti: false,
      customPrimaryColor: '#ffffff',
      customBgColor: '#000000',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'ฟ้าทะเลสงบ',
    emoji: '🌊',
    gradient: 'from-cyan-400 to-blue-600',
    themeConfig: {
      borderRadius: 20,
      borderWidth: 1,
      cardOpacity: 85,
      backdropBlur: 12,
      accentColor: '#06b6d4',
      useCustomAccent: true,
      textBrightness: 100,
      colorIntensity: 110,
      navbarBlur: 16,
      navbarOpacity: 85,
      backgroundColor: '#001020',
      useCustomBg: true,
    },
    appearance: {
      themeMode: 'dark',
      moodColor: 'ocean',
      enableParticles: true,
      particleType: 'bubbles',
      enableConfetti: false,
      customPrimaryColor: '#06b6d4',
      customBgColor: '#001020',
    },
  },
  {
    id: 'sakura',
    name: 'Sakura',
    description: 'ชมพูซากุระ อบอุ่น',
    emoji: '🌸',
    gradient: 'from-pink-400 to-rose-500',
    themeConfig: {
      borderRadius: 24,
      borderWidth: 1,
      cardOpacity: 90,
      backdropBlur: 8,
      accentColor: '#f43f5e',
      useCustomAccent: true,
      textBrightness: 105,
      colorIntensity: 110,
      navbarBlur: 12,
      navbarOpacity: 90,
      backgroundColor: '#1a0010',
      useCustomBg: true,
    },
    appearance: {
      themeMode: 'dark',
      moodColor: 'sunset',
      enableParticles: true,
      particleType: 'leaves',
      enableConfetti: true,
      customPrimaryColor: '#f43f5e',
      customBgColor: '#1a0010',
    },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    description: 'เขียวมรกต hacker',
    emoji: '💚',
    gradient: 'from-emerald-400 to-green-600',
    themeConfig: {
      borderRadius: 4,
      borderWidth: 1,
      cardOpacity: 75,
      backdropBlur: 4,
      accentColor: '#22c55e',
      useCustomAccent: true,
      textBrightness: 115,
      colorIntensity: 120,
      navbarBlur: 8,
      navbarOpacity: 80,
      backgroundColor: '#000800',
      useCustomBg: true,
    },
    appearance: {
      themeMode: 'dark',
      moodColor: 'forest',
      enableParticles: false,
      particleType: null,
      enableConfetti: false,
      customPrimaryColor: '#22c55e',
      customBgColor: '#000800',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'ส้ม-ม่วง พระอาทิตย์ตก',
    emoji: '🌅',
    gradient: 'from-orange-500 to-purple-600',
    themeConfig: {
      borderRadius: 18,
      borderWidth: 1,
      cardOpacity: 88,
      backdropBlur: 14,
      accentColor: '#f97316',
      useCustomAccent: true,
      textBrightness: 100,
      colorIntensity: 115,
      navbarBlur: 16,
      navbarOpacity: 85,
      backgroundColor: '#1a0820',
      useCustomBg: true,
    },
    appearance: {
      themeMode: 'dark',
      moodColor: 'sunset',
      enableParticles: true,
      particleType: 'fireflies',
      enableConfetti: false,
      customPrimaryColor: '#f97316',
      customBgColor: '#1a0820',
    },
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    description: 'ทองหรู สง่างาม',
    emoji: '👑',
    gradient: 'from-amber-400 to-yellow-600',
    themeConfig: {
      borderRadius: 16,
      borderWidth: 1,
      cardOpacity: 92,
      backdropBlur: 10,
      accentColor: '#eab308',
      useCustomAccent: true,
      textBrightness: 105,
      colorIntensity: 110,
      navbarBlur: 14,
      navbarOpacity: 90,
      backgroundColor: '#0a0800',
      useCustomBg: true,
    },
    appearance: {
      themeMode: 'dark',
      moodColor: 'luxury',
      enableParticles: true,
      particleType: 'stars',
      enableConfetti: true,
      customPrimaryColor: '#eab308',
      customBgColor: '#0a0800',
    },
  },
]

export const defaultPreset: ThemePreset = {
  id: 'default',
  name: 'ค่าเริ่มต้น',
  description: 'รีเซ็ตกลับค่าเริ่มต้นของระบบ',
  emoji: '🔄',
  gradient: 'from-zinc-500 to-zinc-700',
  themeConfig: { ...defaultThemeConfig },
  appearance: {
    themeMode: 'dark',
    moodColor: null,
    enableParticles: false,
    particleType: null,
    enableConfetti: false,
    customPrimaryColor: null,
    customBgColor: null,
  },
}

const allPresets = [...themePresets, defaultPreset]

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

function detectActivePreset(themeConfig: any, appearance: any): string | null {
  if (!themeConfig || !appearance) return null
  for (const p of allPresets) {
    const tc = { ...defaultThemeConfig, ...p.themeConfig }
    if (
      themeConfig.accentColor === tc.accentColor &&
      themeConfig.backgroundColor === tc.backgroundColor &&
      Boolean(themeConfig.useCustomAccent) === Boolean(tc.useCustomAccent) &&
      Boolean(themeConfig.useCustomBg) === Boolean(tc.useCustomBg) &&
      Number(themeConfig.borderRadius) === Number(tc.borderRadius) &&
      (appearance.moodColor || null) === (p.appearance.moodColor ?? null) &&
      Boolean(appearance.enableParticles) === Boolean(p.appearance.enableParticles) &&
      (appearance.particleType || null) === (p.appearance.particleType ?? null)
    ) {
      return p.id
    }
  }
  return null
}

export async function GET() {
  const user = await ensureSuperAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const settings = await prisma.settings.findFirst()
  const appearance = await prisma.siteAppearance.findFirst()
  const activePresetId = detectActivePreset(settings?.themeConfig, appearance)

  return NextResponse.json({
    success: true,
    presets: themePresets,
    defaultPreset,
    activePresetId,
  })
}

export async function POST(request: NextRequest) {
  const user = await ensureSuperAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const presetId = String(body?.presetId || '')
  const preset = allPresets.find(p => p.id === presetId)
  if (!preset) return NextResponse.json({ error: 'Preset not found' }, { status: 404 })

  const mergedTheme: ThemeConfig = { ...defaultThemeConfig, ...preset.themeConfig }

  let settings = await prisma.settings.findFirst()
  if (settings) {
    await prisma.settings.update({
      where: { id: settings.id },
      data: { themeConfig: mergedTheme as any },
    })
  } else {
    await prisma.settings.create({
      data: { themeConfig: mergedTheme as any },
    })
  }

  let appearance = await prisma.siteAppearance.findFirst()
  if (!appearance) {
    appearance = await prisma.siteAppearance.create({ data: {} })
  }
  await prisma.siteAppearance.update({
    where: { id: appearance.id },
    data: {
      themeMode: preset.appearance.themeMode ?? appearance.themeMode,
      moodColor: preset.appearance.moodColor ?? null,
      customPrimaryColor: preset.appearance.customPrimaryColor ?? null,
      customBgColor: preset.appearance.customBgColor ?? null,
      enableParticles: preset.appearance.enableParticles ?? false,
      particleType: preset.appearance.particleType ?? null,
      enableConfetti: preset.appearance.enableConfetti ?? false,
      updatedBy: user.id,
    },
  })

  return NextResponse.json({ success: true, applied: preset.id })
}
