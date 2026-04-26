import { NextRequest, NextResponse } from 'next/server'

// License check disabled - always valid
export async function GET() {
  return NextResponse.json({
    valid: true,
    activated: true,
    siteName: 'Shop VPN',
    expiryDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    remaining: { text: 'ถาวร' },
  })
}

export async function POST() {
  return NextResponse.json({
    valid: true,
    activated: true,
  })
}
