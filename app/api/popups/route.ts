import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public: get active popups for frontend display
export async function GET() {
  try {
    const now = new Date()

    const popups = await prisma.promoPopup.findMany({
      where: {
        isActive: true,
        // startDate: ถ้าตั้งไว้ ต้องถึงเวลาแล้ว
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        // endDate: ถ้าตั้งไว้ ต้องยังไม่หมดอายุ
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gt: now } },
            ]
          }
        ]
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
        sortOrder: true,
      }
    })

    return NextResponse.json({ success: true, popups })
  } catch (error) {
    console.error('Fetch popups error:', error)
    return NextResponse.json({ success: true, popups: [] })
  }
}
