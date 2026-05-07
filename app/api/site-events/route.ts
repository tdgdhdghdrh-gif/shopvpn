import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List active site events (public)
export async function GET() {
  try {
    const now = new Date()
    const events = await prisma.siteEvent.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: { lte: now }, endDate: { gte: now } },
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, events })
  } catch (error) {
    console.error('GET site-events error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
