import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public endpoint for Navbar to fetch hamburger menu config
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst({
      select: { hamburgerMenuConfig: true }
    })

    return NextResponse.json({
      config: settings?.hamburgerMenuConfig || null
    })
  } catch (error) {
    console.error('Failed to get hamburger menu config:', error)
    return NextResponse.json({ config: null })
  }
}
