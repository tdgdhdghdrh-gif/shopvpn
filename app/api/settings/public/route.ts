import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get public settings (for users - no auth required)
export async function GET() {
  try {
    // Get settings
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          truemoneyPhone: '0825658423',
          truemoneyApiKey: '',
          slipApiKey: '',
          bankReceiverName: 'พันวิลา',
          bankAccountNumber: '',
          qrCodeImage: '',
          siteName: 'SimonVPNShop',
          siteLogo: '',
          backgroundImage: '',
          googleApiKey: '',
          vpnDailyPrice: 4,
          vpnWeeklyPrice: 25,
          vpnMonthlyPrice: 100
        }
      })
    }

    // Return only public fields
    return NextResponse.json({
      settings: {
        // Payment Info
        bankReceiverName: settings.bankReceiverName,
        bankAccountNumber: settings.bankAccountNumber,
        qrCodeImage: settings.qrCodeImage,
        // Site Info
        siteName: settings.siteName,
        siteLogo: settings.siteLogo,
        backgroundImage: settings.backgroundImage,
        // VPN Pricing
        vpnDailyPrice: settings.vpnDailyPrice,
        vpnWeeklyPrice: settings.vpnWeeklyPrice,
        vpnMonthlyPrice: settings.vpnMonthlyPrice,
        // Google API (public key only - site key for reCAPTCHA)
        googleApiKey: settings.googleApiKey
      }
    })
  } catch (error) {
    console.error('Failed to get public settings:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}
