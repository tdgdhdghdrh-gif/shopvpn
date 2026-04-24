import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst({
      select: {
        walletEnabled: true,
        slipEnabled: true,
      }
    })
    return NextResponse.json({
      walletEnabled: settings?.walletEnabled ?? true,
      slipEnabled: settings?.slipEnabled ?? true,
    })
  } catch {
    return NextResponse.json({ walletEnabled: true, slipEnabled: true })
  }
}
