import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public: get active banners for frontend display
export async function GET() {
  try {
    const banners = await prisma.promoBanner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
        sortOrder: true,
        aspectRatio: true,
        overlayTitle: true,
        overlaySubtitle: true,
        buttonText: true,
        buttonLink: true,
      }
    })

    return NextResponse.json({ success: true, banners })
  } catch (error) {
    console.error('Fetch banners error:', error)
    return NextResponse.json({ success: true, banners: [] })
  }
}
