import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to ensure single row exists
async function getAppearance() {
  let a = await prisma.siteAppearance.findFirst()
  if (!a) {
    a = await prisma.siteAppearance.create({ data: {} })
  }
  return a
}

export async function GET() {
  try {
    const appearance = await getAppearance()
    return NextResponse.json({ success: true, appearance })
  } catch (error: any) {
    console.error('Appearance GET error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const appearance = await getAppearance()

    const updated = await prisma.siteAppearance.update({
      where: { id: appearance.id },
      data: {
        themeMode: body.themeMode !== undefined ? body.themeMode : appearance.themeMode,
        seasonalTheme: body.seasonalTheme !== undefined ? body.seasonalTheme : appearance.seasonalTheme,
        moodColor: body.moodColor !== undefined ? body.moodColor : appearance.moodColor,
        customPrimaryColor: body.customPrimaryColor !== undefined ? body.customPrimaryColor : appearance.customPrimaryColor,
        customBgColor: body.customBgColor !== undefined ? body.customBgColor : appearance.customBgColor,
        enableParticles: body.enableParticles !== undefined ? Boolean(body.enableParticles) : appearance.enableParticles,
        particleType: body.particleType !== undefined ? body.particleType : appearance.particleType,
        enableConfetti: body.enableConfetti !== undefined ? Boolean(body.enableConfetti) : appearance.enableConfetti,
        updatedBy: body.updatedBy,
      },
    })

    return NextResponse.json({ success: true, appearance: updated })
  } catch (error: any) {
    console.error('Appearance POST error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
