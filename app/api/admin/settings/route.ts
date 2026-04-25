import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { execSync } from 'child_process'

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
    let settings = await prisma.settings.findFirst().catch(async (err: any) => {
      // If findFirst fails due to missing columns, auto-migrate
      const errMsg = err?.message || ''
      if (errMsg.includes('column') || errMsg.includes('field') || errMsg.includes('does not exist')) {
        console.log('Settings findFirst failed, attempting auto db push...')
        try {
          execSync('npx prisma db push --skip-generate --accept-data-loss', {
            cwd: process.cwd(),
            timeout: 30000,
            stdio: 'pipe'
          })
          return prisma.settings.findFirst()
        } catch {
          return null
        }
      }
      return null
    })
    
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
    
    const data: Record<string, any> = {
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
      // Trial VPN
      trialEnabled: body.trialEnabled !== undefined ? Boolean(body.trialEnabled) : (settings?.trialEnabled ?? true),
      trialDurationMinutes: body.trialDurationMinutes !== undefined ? parseInt(body.trialDurationMinutes) || 60 : (settings?.trialDurationMinutes ?? 60),
      // Server List Template
      serverListTemplate: body.serverListTemplate !== undefined ? body.serverListTemplate : (settings?.serverListTemplate || 'detailed'),
      // Login / Register / VPN Template
      loginTemplate: body.loginTemplate !== undefined ? body.loginTemplate : (settings?.loginTemplate || 'classic'),
      registerTemplate: body.registerTemplate !== undefined ? body.registerTemplate : (settings?.registerTemplate || 'classic'),
      vpnTemplate: body.vpnTemplate !== undefined ? body.vpnTemplate : (settings?.vpnTemplate || 'classic'),
      // Registration IP Check
      registrationIpCheck: body.registrationIpCheck !== undefined ? Boolean(body.registrationIpCheck) : (settings?.registrationIpCheck ?? true),
      // Custom CSS/JS
      customCss: body.customCss !== undefined ? body.customCss : (settings?.customCss || null),
      customJs: body.customJs !== undefined ? body.customJs : (settings?.customJs || null),
      // Footer Editor
      footerText: body.footerText !== undefined ? body.footerText : (settings?.footerText || 'Nexus Shield'),
      footerLinks: body.footerLinks !== undefined ? body.footerLinks : (settings?.footerLinks || []),
      footerSocialLinks: body.footerSocialLinks !== undefined ? body.footerSocialLinks : (settings?.footerSocialLinks || []),
      footerShowCredit: body.footerShowCredit !== undefined ? Boolean(body.footerShowCredit) : (settings?.footerShowCredit ?? true),
      // Floating Button
      floatingButtonEnabled: body.floatingButtonEnabled !== undefined ? Boolean(body.floatingButtonEnabled) : (settings?.floatingButtonEnabled ?? false),
      floatingButtonIcon: body.floatingButtonIcon !== undefined ? body.floatingButtonIcon : (settings?.floatingButtonIcon || null),
      floatingButtonUrl: body.floatingButtonUrl !== undefined ? body.floatingButtonUrl : (settings?.floatingButtonUrl || null),
      floatingButtonColor: body.floatingButtonColor !== undefined ? body.floatingButtonColor : (settings?.floatingButtonColor || '#06b6e4'),
      floatingButtonPosition: body.floatingButtonPosition !== undefined ? body.floatingButtonPosition : (settings?.floatingButtonPosition || 'bottom-right'),
      floatingButtonText: body.floatingButtonText !== undefined ? body.floatingButtonText : (settings?.floatingButtonText || null),
      // Preloader
      preloaderEnabled: body.preloaderEnabled !== undefined ? Boolean(body.preloaderEnabled) : (settings?.preloaderEnabled ?? false),
      preloaderLogo: body.preloaderLogo !== undefined ? body.preloaderLogo : (settings?.preloaderLogo || null),
      preloaderBgColor: body.preloaderBgColor !== undefined ? body.preloaderBgColor : (settings?.preloaderBgColor || '#000000'),
      preloaderText: body.preloaderText !== undefined ? body.preloaderText : (settings?.preloaderText || null),
      preloaderAnimation: body.preloaderAnimation !== undefined ? body.preloaderAnimation : (settings?.preloaderAnimation || 'spin'),
      preloaderDuration: body.preloaderDuration !== undefined ? parseInt(body.preloaderDuration) || 2000 : (settings?.preloaderDuration ?? 2000),
      preloaderSkippable: body.preloaderSkippable !== undefined ? Boolean(body.preloaderSkippable) : (settings?.preloaderSkippable ?? true),
      // Marquee Bar
      marqueeEnabled: body.marqueeEnabled !== undefined ? Boolean(body.marqueeEnabled) : (settings?.marqueeEnabled ?? false),
      marqueeText: body.marqueeText !== undefined ? body.marqueeText : (settings?.marqueeText || null),
      marqueeBgColor: body.marqueeBgColor !== undefined ? body.marqueeBgColor : (settings?.marqueeBgColor || '#06b6e4'),
      marqueeTextColor: body.marqueeTextColor !== undefined ? body.marqueeTextColor : (settings?.marqueeTextColor || '#ffffff'),
      marqueeSpeed: body.marqueeSpeed !== undefined ? parseInt(body.marqueeSpeed) || 20 : (settings?.marqueeSpeed ?? 20),
      marqueeLink: body.marqueeLink !== undefined ? body.marqueeLink : (settings?.marqueeLink || null),
      // Countdown Timer
      countdownEnabled: body.countdownEnabled !== undefined ? Boolean(body.countdownEnabled) : (settings?.countdownEnabled ?? false),
      countdownTitle: body.countdownTitle !== undefined ? body.countdownTitle : (settings?.countdownTitle || null),
      countdownEndDate: body.countdownEndDate !== undefined ? (body.countdownEndDate ? new Date(body.countdownEndDate) : null) : (settings?.countdownEndDate || null),
      countdownStyle: body.countdownStyle !== undefined ? body.countdownStyle : (settings?.countdownStyle || 'boxed'),
      countdownBgColor: body.countdownBgColor !== undefined ? body.countdownBgColor : (settings?.countdownBgColor || null),
      countdownTextColor: body.countdownTextColor !== undefined ? body.countdownTextColor : (settings?.countdownTextColor || null),
      countdownExpiredText: body.countdownExpiredText !== undefined ? body.countdownExpiredText : (settings?.countdownExpiredText || 'หมดเวลาแล้ว'),
      // Top Notification Bar
      topBarEnabled: body.topBarEnabled !== undefined ? Boolean(body.topBarEnabled) : (settings?.topBarEnabled ?? false),
      topBarText: body.topBarText !== undefined ? body.topBarText : (settings?.topBarText || null),
      topBarBgColor: body.topBarBgColor !== undefined ? body.topBarBgColor : (settings?.topBarBgColor || '#ef4444'),
      topBarTextColor: body.topBarTextColor !== undefined ? body.topBarTextColor : (settings?.topBarTextColor || '#ffffff'),
      topBarLink: body.topBarLink !== undefined ? body.topBarLink : (settings?.topBarLink || null),
      topBarDismissible: body.topBarDismissible !== undefined ? Boolean(body.topBarDismissible) : (settings?.topBarDismissible ?? true),
      // Back to Top Button
      backToTopEnabled: body.backToTopEnabled !== undefined ? Boolean(body.backToTopEnabled) : (settings?.backToTopEnabled ?? false),
      backToTopStyle: body.backToTopStyle !== undefined ? body.backToTopStyle : (settings?.backToTopStyle || 'circle'),
      backToTopColor: body.backToTopColor !== undefined ? body.backToTopColor : (settings?.backToTopColor || '#06b6e4'),
      backToTopPosition: body.backToTopPosition !== undefined ? body.backToTopPosition : (settings?.backToTopPosition || 'bottom-right'),
      // Custom Cursor
      customCursorEnabled: body.customCursorEnabled !== undefined ? Boolean(body.customCursorEnabled) : (settings?.customCursorEnabled ?? false),
      customCursorStyle: body.customCursorStyle !== undefined ? body.customCursorStyle : (settings?.customCursorStyle || 'glow'),
      customCursorColor: body.customCursorColor !== undefined ? body.customCursorColor : (settings?.customCursorColor || '#06b6e4'),
      updatedAt: new Date()
    }

    // Helper to save settings
    async function doSave() {
      if (settings) {
        return prisma.settings.update({
          where: { id: settings!.id },
          data
        })
      } else {
        return prisma.settings.create({ data })
      }
    }
    
    try {
      settings = await doSave()
    } catch (firstError: any) {
      // If save fails (likely missing columns), auto-migrate DB schema and retry
      const errMsg = firstError?.message || ''
      if (errMsg.includes('Unknown arg') || errMsg.includes('column') || errMsg.includes('field')) {
        console.log('Settings save failed, attempting auto db push...')
        try {
          execSync('npx prisma db push --skip-generate --accept-data-loss', {
            cwd: process.cwd(),
            timeout: 30000,
            stdio: 'pipe'
          })
          console.log('Auto db push succeeded, retrying save...')
          settings = await doSave()
        } catch (pushError: any) {
          console.error('Auto db push failed:', pushError?.message)
          // Try saving with only core fields as last resort
          const coreFields = [
            'truemoneyPhone', 'truemoneyApiKey', 'slipApiKey', 'bankReceiverName',
            'bankAccountNumber', 'qrCodeImage', 'siteName', 'siteLogo', 'backgroundImage',
            'googleApiKey', 'vpnDailyPrice', 'vpnWeeklyPrice', 'vpnMonthlyPrice', 'updatedAt'
          ]
          const coreData: Record<string, any> = {}
          for (const key of coreFields) {
            if (data[key] !== undefined) coreData[key] = data[key]
          }
          try {
            if (settings) {
              settings = await prisma.settings.update({ where: { id: settings.id }, data: coreData })
            } else {
              settings = await prisma.settings.create({ data: coreData })
            }
          } catch (coreError: any) {
            throw firstError // throw original error
          }
        }
      } else {
        throw firstError
      }
    }

    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    console.error('Failed to save settings:', error)
    // Return more detail so admin can diagnose
    const detail = error?.meta?.cause || error?.message || ''
    return NextResponse.json({ error: 'Failed to save settings', detail }, { status: 500 })
  }
}
