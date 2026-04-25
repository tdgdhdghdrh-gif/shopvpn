import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get public settings (for users - no auth required)
export async function GET() {
  try {
    // Get settings - use raw query fallback if Prisma model is out of sync
    let settings: any = null
    try {
      settings = await prisma.settings.findFirst()
    } catch {
      // If findFirst fails (missing columns in Prisma client vs DB), use raw query
      const rows: any[] = await prisma.$queryRaw`SELECT * FROM "Settings" LIMIT 1`
      settings = rows[0] || null
    }
    
    if (!settings) {
      try {
        settings = await prisma.settings.create({
          data: {
            truemoneyPhone: '',
            truemoneyApiKey: '',
            slipApiKey: '',
            bankReceiverName: '',
            bankAccountNumber: '',
            qrCodeImage: '',
            siteName: '',
            siteLogo: '',
            backgroundImage: '',
            googleApiKey: '',
            vpnDailyPrice: 4,
            vpnWeeklyPrice: 25,
            vpnMonthlyPrice: 100
          }
        })
      } catch {
        // If create fails too, return safe defaults
        return NextResponse.json({
          settings: {
            bankReceiverName: '',
            bankAccountNumber: '',
            qrCodeImage: '',
            siteName: '',
            siteLogo: '',
            appLogo: '',
            backgroundImage: '',
            backgroundOpacity: 30,
            theme: 'cyber',
            landingTemplate: 'classic',
            landingCustomHtml: null,
            webEffect: 'none',
            webEffectCustomHtml: null,
            vpnDailyPrice: 4,
            vpnWeeklyPrice: 25,
            vpnMonthlyPrice: 100,
            minTopupAmount: 60,
            googleApiKey: '',
            recaptchaEnabled: false,
            themeConfig: null,
            defaultHomePage: '/',
            menuClickEffect: 'none',
            trialEnabled: true,
            trialDurationMinutes: 60,
            serverListTemplate: 'detailed',
            loginTemplate: 'classic',
            registerTemplate: 'classic',
            vpnTemplate: 'classic',
            registrationIpCheck: true,
          }
        })
      }
    }

    // Return only public fields (safely access with fallbacks)
    return NextResponse.json({
      settings: {
        // Payment Info
        bankReceiverName: settings.bankReceiverName || '',
        bankAccountNumber: settings.bankAccountNumber || '',
        qrCodeImage: settings.qrCodeImage || '',
        // Site Info
        siteName: settings.siteName || '',
        siteLogo: settings.siteLogo || '',
        appLogo: settings.appLogo || '',
        backgroundImage: settings.backgroundImage || '',
        backgroundOpacity: settings.backgroundOpacity ?? 30,
        theme: settings.theme || 'cyber',
        // Landing Template
        landingTemplate: settings.landingTemplate || 'classic',
        landingCustomHtml: settings.landingCustomHtml || null,
        // Web Effect
        webEffect: settings.webEffect || 'none',
        webEffectCustomHtml: settings.webEffectCustomHtml || null,
        // VPN Pricing
        vpnDailyPrice: settings.vpnDailyPrice ?? 4,
        vpnWeeklyPrice: settings.vpnWeeklyPrice ?? 25,
        vpnMonthlyPrice: settings.vpnMonthlyPrice ?? 100,
        // Topup
        minTopupAmount: settings.minTopupAmount ?? 60,
        // Google API (public key only - site key for reCAPTCHA)
        googleApiKey: settings.googleApiKey || '',
        // reCAPTCHA toggle
        recaptchaEnabled: settings.recaptchaEnabled ?? false,
        // Theme Config (UI customization)
        themeConfig: settings.themeConfig || null,
        // Default home page after login
        defaultHomePage: settings.defaultHomePage || '/',
        // Menu Click Effect
        menuClickEffect: settings.menuClickEffect || 'none',
        // Trial VPN
        trialEnabled: settings.trialEnabled ?? true,
        trialDurationMinutes: settings.trialDurationMinutes ?? 60,
        // Server List Template
        serverListTemplate: settings.serverListTemplate || 'detailed',
        // Login / Register / VPN Template
        loginTemplate: settings.loginTemplate || 'classic',
        registerTemplate: settings.registerTemplate || 'classic',
        vpnTemplate: settings.vpnTemplate || 'classic',
        // Registration IP Check
        registrationIpCheck: settings.registrationIpCheck ?? true,
        // Footer
        footerText: settings.footerText || 'Nexus Shield',
        footerLinks: settings.footerLinks || [],
        footerSocialLinks: settings.footerSocialLinks || [],
        footerShowCredit: settings.footerShowCredit ?? true,
        // Floating Button
        floatingButtonEnabled: settings.floatingButtonEnabled ?? false,
        floatingButtonIcon: settings.floatingButtonIcon || null,
        floatingButtonUrl: settings.floatingButtonUrl || null,
        floatingButtonColor: settings.floatingButtonColor || '#06b6e4',
        floatingButtonPosition: settings.floatingButtonPosition || 'bottom-right',
        floatingButtonText: settings.floatingButtonText || null,
        // Preloader
        preloaderEnabled: settings.preloaderEnabled ?? false,
        preloaderLogo: settings.preloaderLogo || null,
        preloaderBgColor: settings.preloaderBgColor || '#000000',
        preloaderText: settings.preloaderText || null,
        preloaderAnimation: settings.preloaderAnimation || 'spin',
        preloaderDuration: settings.preloaderDuration ?? 2000,
        preloaderSkippable: settings.preloaderSkippable ?? true,
        // Marquee Bar
        marqueeEnabled: settings.marqueeEnabled ?? false,
        marqueeText: settings.marqueeText || null,
        marqueeBgColor: settings.marqueeBgColor || '#06b6e4',
        marqueeTextColor: settings.marqueeTextColor || '#ffffff',
        marqueeSpeed: settings.marqueeSpeed ?? 20,
        marqueeLink: settings.marqueeLink || null,
        // Countdown Timer
        countdownEnabled: settings.countdownEnabled ?? false,
        countdownTitle: settings.countdownTitle || null,
        countdownEndDate: settings.countdownEndDate || null,
        countdownStyle: settings.countdownStyle || 'boxed',
        countdownBgColor: settings.countdownBgColor || null,
        countdownTextColor: settings.countdownTextColor || null,
        countdownExpiredText: settings.countdownExpiredText || 'หมดเวลาแล้ว',
        // Top Notification Bar
        topBarEnabled: settings.topBarEnabled ?? false,
        topBarText: settings.topBarText || null,
        topBarBgColor: settings.topBarBgColor || '#ef4444',
        topBarTextColor: settings.topBarTextColor || '#ffffff',
        topBarLink: settings.topBarLink || null,
        topBarDismissible: settings.topBarDismissible ?? true,
        // Back to Top Button
        backToTopEnabled: settings.backToTopEnabled ?? false,
        backToTopStyle: settings.backToTopStyle || 'circle',
        backToTopColor: settings.backToTopColor || '#06b6e4',
        backToTopPosition: settings.backToTopPosition || 'bottom-right',
        // Custom Cursor
        customCursorEnabled: settings.customCursorEnabled ?? false,
        customCursorStyle: settings.customCursorStyle || 'glow',
        customCursorColor: settings.customCursorColor || '#06b6e4',
      }
    })
  } catch (error) {
    console.error('Failed to get public settings:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}
