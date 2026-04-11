import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - Get settings
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

    // Get or create settings
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          truemoneyPhone: '0825658423',
          truemoneyApiKey: '',
          slipApiKey: '',
          bankReceiverName: 'พันวิลา',
          bankAccountNumber: '',
          promptpayNumber: '0825658423',
          qrCodeImage: '',
          siteName: '',
          siteLogo: '',
          backgroundImage: '',
          googleApiKey: '',
      vpnDailyPrice: 4,
      vpnWeeklyPrice: 25,
      vpnMonthlyPrice: 100,
      minTopupAmount: 60
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Failed to get settings:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

// POST - Save settings
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
    
    // Get existing settings or create new
    let settings = await prisma.settings.findFirst()
    
    const data = {
      truemoneyPhone: body.truemoneyPhone || settings?.truemoneyPhone || '',
      truemoneyApiKey: body.truemoneyApiKey || settings?.truemoneyApiKey || '',
      slipApiKey: body.slipApiKey || settings?.slipApiKey || '',
      bankReceiverName: body.bankReceiverName || settings?.bankReceiverName || 'พันวิลา',
      bankAccountNumber: body.bankAccountNumber || settings?.bankAccountNumber || '',
      qrCodeImage: body.qrCodeImage !== undefined ? body.qrCodeImage : (settings?.qrCodeImage || ''),
      // Site Configuration
      siteName: body.siteName !== undefined ? body.siteName : (settings?.siteName || ''),
      siteLogo: body.siteLogo !== undefined ? body.siteLogo : (settings?.siteLogo || ''),
      appLogo: body.appLogo !== undefined ? body.appLogo : (settings?.appLogo || ''),
      backgroundImage: body.backgroundImage !== undefined ? body.backgroundImage : (settings?.backgroundImage || ''),
      theme: body.theme !== undefined ? body.theme : (settings?.theme || 'cyber'),
      backgroundOpacity: body.backgroundOpacity !== undefined ? parseFloat(body.backgroundOpacity) : (settings?.backgroundOpacity ?? 30),
      // Google API / reCAPTCHA
      googleApiKey: body.googleApiKey !== undefined ? body.googleApiKey : (settings?.googleApiKey || ''),
      recaptchaEnabled: body.recaptchaEnabled !== undefined ? Boolean(body.recaptchaEnabled) : (settings?.recaptchaEnabled ?? false),
      recaptchaSecretKey: body.recaptchaSecretKey !== undefined ? body.recaptchaSecretKey : (settings?.recaptchaSecretKey || ''),
      // VPN Pricing
      vpnDailyPrice: body.vpnDailyPrice !== undefined ? parseFloat(body.vpnDailyPrice) : (settings?.vpnDailyPrice || 4),
      vpnWeeklyPrice: body.vpnWeeklyPrice !== undefined ? parseFloat(body.vpnWeeklyPrice) : (settings?.vpnWeeklyPrice || 25),
      vpnMonthlyPrice: body.vpnMonthlyPrice !== undefined ? parseFloat(body.vpnMonthlyPrice) : (settings?.vpnMonthlyPrice || 100),
      // Topup
      minTopupAmount: body.minTopupAmount !== undefined ? parseFloat(body.minTopupAmount) : (settings?.minTopupAmount ?? 60),
      // Landing Template
      landingTemplate: body.landingTemplate !== undefined ? body.landingTemplate : (settings?.landingTemplate || 'classic'),
      // Custom HTML Landing Page
      landingCustomHtml: body.landingCustomHtml !== undefined ? body.landingCustomHtml : (settings?.landingCustomHtml || null),
      // Web Effect
      webEffect: body.webEffect !== undefined ? body.webEffect : (settings?.webEffect || 'none'),
      // Custom HTML Effect
      webEffectCustomHtml: body.webEffectCustomHtml !== undefined ? body.webEffectCustomHtml : (settings?.webEffectCustomHtml || null),
      // Default Home Page
      defaultHomePage: body.defaultHomePage !== undefined ? body.defaultHomePage : (settings?.defaultHomePage || '/'),
      // Menu Click Effect
      menuClickEffect: body.menuClickEffect !== undefined ? body.menuClickEffect : (settings?.menuClickEffect || 'none'),
      updatedAt: new Date()
    }
    
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data
      })
    } else {
      settings = await prisma.settings.create({ data })
    }

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
