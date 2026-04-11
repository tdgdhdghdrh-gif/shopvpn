import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// Theme config type
export interface ThemeConfig {
  // ขอบ/กรอบการ์ด
  borderRadius: number    // 0-32 px
  borderWidth: number     // 0-4 px
  // ความทึบแสง
  cardOpacity: number     // 0-100 (% of card bg opacity)
  backdropBlur: number    // 0-40 px
  // สีหลัก (custom accent override)
  accentColor: string     // hex color e.g. '#3b82f6'
  useCustomAccent: boolean // ถ้า true ใช้ accentColor แทน theme default
  // สีตัวหนังสือ
  textBrightness: number  // 70-130 (% brightness of text)
  // ความเข้มสี
  colorIntensity: number  // 50-150 (% intensity multiplier)
  // Navbar
  navbarBlur: number      // 0-40 px
  navbarOpacity: number   // 0-100 (% of navbar bg opacity)
  // สีพื้นหลัง (custom background override)
  backgroundColor: string   // hex color e.g. '#000000'
  useCustomBg: boolean       // ถ้า true ใช้ backgroundColor แทน theme default --theme-bg
}

export const defaultThemeConfig: ThemeConfig = {
  borderRadius: 16,      // rounded-2xl default
  borderWidth: 1,        // 1px borders
  cardOpacity: 100,      // fully opaque cards (relative to theme)
  backdropBlur: 0,       // no blur by default
  accentColor: '#3b82f6',
  useCustomAccent: false,
  textBrightness: 100,
  colorIntensity: 100,
  navbarBlur: 12,
  navbarOpacity: 90,
  backgroundColor: '#000000',
  useCustomBg: false,
}

// GET - Get theme config
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const settings = await prisma.settings.findFirst()
    const themeConfig = settings?.themeConfig
      ? { ...defaultThemeConfig, ...(settings.themeConfig as object) }
      : defaultThemeConfig

    return NextResponse.json({ success: true, themeConfig })
  } catch (error) {
    console.error('Failed to get theme config:', error)
    return NextResponse.json({ success: false, error: 'Failed to get theme config' }, { status: 500 })
  }
}

// POST - Save theme config
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const themeConfig: ThemeConfig = {
      borderRadius: Math.min(32, Math.max(0, Number(body.borderRadius) || defaultThemeConfig.borderRadius)),
      borderWidth: Math.min(4, Math.max(0, Number(body.borderWidth) || 0)),
      cardOpacity: Math.min(100, Math.max(0, Number(body.cardOpacity) ?? defaultThemeConfig.cardOpacity)),
      backdropBlur: Math.min(40, Math.max(0, Number(body.backdropBlur) || 0)),
      accentColor: typeof body.accentColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(body.accentColor) ? body.accentColor : defaultThemeConfig.accentColor,
      useCustomAccent: Boolean(body.useCustomAccent),
      textBrightness: Math.min(130, Math.max(70, Number(body.textBrightness) || defaultThemeConfig.textBrightness)),
      colorIntensity: Math.min(150, Math.max(50, Number(body.colorIntensity) || defaultThemeConfig.colorIntensity)),
      navbarBlur: Math.min(40, Math.max(0, Number(body.navbarBlur) || 0)),
      navbarOpacity: Math.min(100, Math.max(0, Number(body.navbarOpacity) ?? defaultThemeConfig.navbarOpacity)),
      backgroundColor: typeof body.backgroundColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(body.backgroundColor) ? body.backgroundColor : defaultThemeConfig.backgroundColor,
      useCustomBg: Boolean(body.useCustomBg),
    }

    let settings = await prisma.settings.findFirst()
    if (settings) {
      await prisma.settings.update({
        where: { id: settings.id },
        data: { themeConfig: themeConfig as any }
      })
    } else {
      await prisma.settings.create({
        data: { themeConfig: themeConfig as any }
      })
    }

    return NextResponse.json({ success: true, themeConfig })
  } catch (error) {
    console.error('Failed to save theme config:', error)
    return NextResponse.json({ success: false, error: 'Failed to save theme config' }, { status: 500 })
  }
}
