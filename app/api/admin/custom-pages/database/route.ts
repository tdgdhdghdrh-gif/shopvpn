import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// ─── Admin API สำหรับดู/ลบ PageDatabaseRecord ───
// GET    ?pageId=xxx&collection=xxx&page=1&limit=20
// DELETE ?id=xxx  (ลบ record เดียว)
// DELETE ?pageId=xxx&collection=xxx  (ลบทั้ง collection)

async function requireAdmin() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true }
  })
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')
  const collection = searchParams.get('collection')
  const p = Math.max(parseInt(searchParams.get('page') || '1'), 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100)

  const where: Record<string, unknown> = {}
  if (pageId) where.pageId = pageId
  if (collection) where.collection = collection

  try {
    const [records, total] = await Promise.all([
      prisma.pageDatabaseRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (p - 1) * limit,
        include: {
          page: { select: { title: true, slug: true } }
        }
      }),
      prisma.pageDatabaseRecord.count({ where })
    ])

    // ดึง collections ที่มี (สำหรับ filter)
    let collections: string[] = []
    if (pageId) {
      const raw = await prisma.pageDatabaseRecord.findMany({
        where: { pageId },
        select: { collection: true },
        distinct: ['collection']
      })
      collections = raw.map(r => r.collection)
    }

    return NextResponse.json({
      success: true,
      records,
      total,
      page: p,
      totalPages: Math.ceil(total / limit),
      collections,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const pageId = searchParams.get('pageId')
  const collection = searchParams.get('collection')

  try {
    // ลบ record เดียว
    if (id) {
      await prisma.pageDatabaseRecord.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    // ลบทั้ง collection ของ page
    if (pageId) {
      const where: Record<string, unknown> = { pageId }
      if (collection) where.collection = collection
      const result = await prisma.pageDatabaseRecord.deleteMany({ where })
      return NextResponse.json({ success: true, deleted: result.count })
    }

    return NextResponse.json({ error: 'id or pageId is required' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
