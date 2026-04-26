import { NextRequest, NextResponse } from 'next/server'

// License system disabled - all sites are fully activated
export async function GET() {
  return NextResponse.json({
    activated: true,
    isLicenseServer: false,
    licenseKey: 'FREE-LICENSE-DISABLED',
  })
}

export async function POST() {
  return NextResponse.json({
    success: true,
    activated: true,
    siteName: 'Shop VPN',
    expiryDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    remaining: { text: 'ถาวร' },
  })
}
