import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public: List active announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || undefined

    const where: any = { isActive: true }
    if (category && category !== 'all') where.category = category

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          priority: true,
          isPinned: true,
          createdAt: true,
        }
      }),
      prisma.announcement.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      announcements,
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Fetch announcements error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
