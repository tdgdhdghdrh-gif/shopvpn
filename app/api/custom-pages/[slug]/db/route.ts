import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Public CRUD API สำหรับ Custom Page Database ───
// GET  /api/custom-pages/[slug]/db?collection=xxx&id=xxx&limit=50&offset=0
// POST /api/custom-pages/[slug]/db  { collection?, data }
// PUT  /api/custom-pages/[slug]/db  { id, data }
// DELETE /api/custom-pages/[slug]/db?id=xxx

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return res
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }))
}

async function getPage(slug: string) {
  const page = await prisma.customPage.findUnique({
    where: { slug },
    select: { id: true, dbEnabled: true, isPublished: true }
  })
  if (!page) return null
  if (!page.dbEnabled) return null
  return page
}

// GET — ดึงข้อมูล
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return cors(NextResponse.json({ error: 'Database not enabled or page not found' }, { status: 404 }))

  const { searchParams } = new URL(request.url)
  const collection = searchParams.get('collection') // null = ดึงทุก collection
  const id = searchParams.get('id')
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50'), 1), 200)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

  try {
    // ดึง record เดียว
    if (id) {
      const record = await prisma.pageDatabaseRecord.findFirst({
        where: { id, pageId: page.id }
      })
      if (!record) return cors(NextResponse.json({ error: 'Record not found' }, { status: 404 }))
      return cors(NextResponse.json({ success: true, record: { id: record.id, collection: record.collection, data: record.data, createdAt: record.createdAt, updatedAt: record.updatedAt } }))
    }

    // ดึงหลาย records
    const where: Record<string, unknown> = { pageId: page.id }
    if (collection) where.collection = collection

    const [records, total] = await Promise.all([
      prisma.pageDatabaseRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.pageDatabaseRecord.count({ where })
    ])

    const mapped = records.map(r => ({ id: r.id, collection: r.collection, data: r.data, createdAt: r.createdAt, updatedAt: r.updatedAt }))

    return cors(NextResponse.json({
      success: true,
      records: mapped,
      data: mapped, // alias สำหรับ HTML ที่ใช้ result.data
      total,
      limit,
      offset,
    }))
  } catch {
    return cors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

// POST — เพิ่มข้อมูล
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return cors(NextResponse.json({ error: 'Database not enabled or page not found' }, { status: 404 }))

  try {
    const body = await request.json()
    const { collection = 'default', data } = body

    if (!data || typeof data !== 'object') {
      return cors(NextResponse.json({ error: 'data must be a JSON object' }, { status: 400 }))
    }

    // จำกัด collection name
    const col = String(collection).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50) || 'default'

    // จำกัดจำนวน records ต่อ page (ป้องกัน spam) — สูงสุด 10,000
    const count = await prisma.pageDatabaseRecord.count({ where: { pageId: page.id } })
    if (count >= 10000) {
      return cors(NextResponse.json({ error: 'Database limit reached (10,000 records)' }, { status: 429 }))
    }

    const record = await prisma.pageDatabaseRecord.create({
      data: {
        pageId: page.id,
        collection: col,
        data,
      }
    })

    return cors(NextResponse.json({
      success: true,
      record: { id: record.id, collection: record.collection, data: record.data, createdAt: record.createdAt, updatedAt: record.updatedAt }
    }, { status: 201 }))
  } catch {
    return cors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

// PUT — อัปเดตข้อมูล
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return cors(NextResponse.json({ error: 'Database not enabled or page not found' }, { status: 404 }))

  try {
    const body = await request.json()
    const { id, data } = body

    if (!id) return cors(NextResponse.json({ error: 'id is required' }, { status: 400 }))
    if (!data || typeof data !== 'object') {
      return cors(NextResponse.json({ error: 'data must be a JSON object' }, { status: 400 }))
    }

    // ตรวจว่า record เป็นของ page นี้
    const existing = await prisma.pageDatabaseRecord.findFirst({
      where: { id, pageId: page.id }
    })
    if (!existing) return cors(NextResponse.json({ error: 'Record not found' }, { status: 404 }))

    const record = await prisma.pageDatabaseRecord.update({
      where: { id },
      data: { data }
    })

    return cors(NextResponse.json({
      success: true,
      record: { id: record.id, collection: record.collection, data: record.data, createdAt: record.createdAt, updatedAt: record.updatedAt }
    }))
  } catch {
    return cors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

// DELETE — ลบข้อมูล
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return cors(NextResponse.json({ error: 'Database not enabled or page not found' }, { status: 404 }))

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return cors(NextResponse.json({ error: 'id is required' }, { status: 400 }))

  try {
    // ตรวจว่า record เป็นของ page นี้
    const existing = await prisma.pageDatabaseRecord.findFirst({
      where: { id, pageId: page.id }
    })
    if (!existing) return cors(NextResponse.json({ error: 'Record not found' }, { status: 404 }))

    await prisma.pageDatabaseRecord.delete({ where: { id } })

    return cors(NextResponse.json({ success: true }))
  } catch {
    return cors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}
