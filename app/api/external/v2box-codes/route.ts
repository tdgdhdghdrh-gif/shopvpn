import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, logApiUsage } from '../validate'

// GET /api/external/v2box-codes — PUBLIC (ไม่ต้อง API Key)
// ดึงโค้ด V2Box ที่ยังไม่หมดอายุ + isActive
// รองรับ ?carrier=AIS, ?limit=50, ?page=1
export async function GET(request: NextRequest) {
  try {
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

// POST /api/external/v2box-codes — ต้องใช้ API Key (permission: v2box:write)
// action: create, update, delete
export async function POST(request: NextRequest) {
  try {
    const result = await validateApiKey(request, 'v2box:write')
    if (result.error) return result.error

    const { apiKey } = result
    const body = await request.json()
    const { action } = body
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null

    if (action === 'create') {
      const { name, code, description, logoUrl, carrier, ownerContact, expiryDate, sortOrder } = body
      if (!name || !code || !expiryDate) {
        return NextResponse.json({ success: false, error: 'Required: name, code, expiryDate' }, { status: 400 })
      }

      const v2boxCode = await prisma.v2BoxCode.create({
        data: {
          name,
          code,
          description: description || null,
          logoUrl: logoUrl || null,
          carrier: carrier || null,
          ownerContact: ownerContact || null,
          expiryDate: new Date(expiryDate),
          sortOrder: sortOrder ? parseInt(sortOrder) : 0,
          createdBy: `api:${apiKey.name}`,
        },
      })

      await logApiUsage(apiKey.id, 'v2box:write', null, `Created V2Box code: ${name}`, ip, true)
      return NextResponse.json({ success: true, data: v2boxCode })
    }

    if (action === 'update') {
      const { id, name, code, description, logoUrl, carrier, ownerContact, expiryDate, sortOrder } = body
      if (!id) return NextResponse.json({ success: false, error: 'Required: id' }, { status: 400 })

      const v2boxCode = await prisma.v2BoxCode.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(code !== undefined && { code }),
          ...(description !== undefined && { description: description || null }),
          ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
          ...(carrier !== undefined && { carrier: carrier || null }),
          ...(ownerContact !== undefined && { ownerContact: ownerContact || null }),
          ...(expiryDate !== undefined && { expiryDate: new Date(expiryDate) }),
          ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
        },
      })

      await logApiUsage(apiKey.id, 'v2box:write', null, `Updated V2Box code: ${id}`, ip, true)
      return NextResponse.json({ success: true, data: v2boxCode })
    }

    if (action === 'delete') {
      const { id } = body
      if (!id) return NextResponse.json({ success: false, error: 'Required: id' }, { status: 400 })

      await prisma.v2BoxCode.delete({ where: { id } })
      await logApiUsage(apiKey.id, 'v2box:write', null, `Deleted V2Box code: ${id}`, ip, true)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Use: create, update, delete' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
