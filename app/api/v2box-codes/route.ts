import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public: ดึง V2Box Codes ที่ยังไม่หมดอายุ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const carrier = searchParams.get('carrier') || undefined

    const now = new Date()
    const where: any = {
      isActive: true,
      expiryDate: { gt: now },
    }
    if (carrier && carrier !== 'all') where.carrier = carrier

    const [codes, total] = await Promise.all([
      prisma.v2BoxCode.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          logoUrl: true,
          carrier: true,
          ownerContact: true,
          expiryDate: true,
          sortOrder: true,
          createdAt: true,
        },
      }),
      prisma.v2BoxCode.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      codes,
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Fetch v2box-codes error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
