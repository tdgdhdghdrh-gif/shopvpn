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
        // Login / Register Template
        loginTemplate: settings.loginTemplate || 'classic',
        registerTemplate: settings.registerTemplate || 'classic',
      }
    })
  } catch (error) {
    console.error('Failed to get public settings:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}
