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
