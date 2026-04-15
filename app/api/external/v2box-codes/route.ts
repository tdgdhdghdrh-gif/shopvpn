import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, logApiUsage } from '../validate'

// GET /api/external/v2box-codes
// ดึงโค้ด V2Box ทั้งหมดที่ยังไม่หมดอายุ + isActive
// รองรับ ?carrier=AIS, ?limit=50, ?page=1
export async function GET(request: NextRequest) {
  try {
    const result = await validateApiKey(request, 'v2box:read')
    if (result.error) return result.error

    const { apiKey } = result
    const { searchParams } = new URL(request.url)
    const carrier = searchParams.get('carrier') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

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
          expiryDate: true,
          sortOrder: true,
          createdAt: true,
        },
      }),
      prisma.v2BoxCode.count({ where }),
    ])

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    await logApiUsage(
      apiKey.id,
      'v2box:read',
      null,
      `Read V2Box codes: ${codes.length} codes (page ${page})`,
      ip,
      true
    )

    return NextResponse.json({
      success: true,
      data: {
        codes,
        total,
        pages: Math.ceil(total / limit),
        page,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
