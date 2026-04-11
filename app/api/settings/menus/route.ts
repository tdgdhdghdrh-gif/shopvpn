import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public endpoint to get disabled user menus (no auth required)
// Used by Navbar to hide disabled menu items
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst({
      select: { disabledUserMenus: true }
    })

    const disabledUserMenus = (settings?.disabledUserMenus as string[]) || []

    return NextResponse.json({ disabledUserMenus })
  } catch (error) {
    console.error('Failed to get user menu settings:', error)
    return NextResponse.json({ disabledUserMenus: [] })
  }
}
