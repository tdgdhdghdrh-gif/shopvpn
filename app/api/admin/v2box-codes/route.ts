import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function checkAdmin() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true },
  })
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

// GET - ดึงรายการ V2Box Codes ทั้งหมด + สถิติ
export async function GET() {
  try {
    const admin = await checkAdmin()
    if (!admin) return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })

    const codes = await prisma.v2BoxCode.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    const now = new Date()
    return NextResponse.json({
      codes,
      stats: {
        totalCodes: codes.length,
        activeCodes: codes.filter(c => c.isActive && new Date(c.expiryDate) > now).length,
        expiredCodes: codes.filter(c => new Date(c.expiryDate) <= now).length,
      },
    })
  } catch (error) {
    console.error('Admin v2box-codes GET error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - สร้าง/แก้ไข/ลบ/toggle V2Box Code
export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })

    const body = await req.json()
    const { action } = body

    if (action === 'create') {
      const { name, code, description, logoUrl, carrier, ownerContact, expiryDate, sortOrder } = body
      if (!name || !code || !expiryDate) {
        return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ (ชื่อ, โค้ด, วันหมดอายุ)' }, { status: 400 })
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
          createdBy: admin.id,
        },
      })

      return NextResponse.json({ success: true, code: v2boxCode })
    }

    if (action === 'update') {
      const { id, name, code, description, logoUrl, carrier, ownerContact, expiryDate, sortOrder } = body
      if (!id) return NextResponse.json({ error: 'ไม่พบ ID' }, { status: 400 })

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

      return NextResponse.json({ success: true, code: v2boxCode })
    }

    if (action === 'delete') {
      const { id } = body
      if (!id) return NextResponse.json({ error: 'ไม่พบ ID' }, { status: 400 })

      await prisma.v2BoxCode.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    if (action === 'toggle') {
      const { id } = body
      if (!id) return NextResponse.json({ error: 'ไม่พบ ID' }, { status: 400 })

      const existing = await prisma.v2BoxCode.findUnique({ where: { id } })
      if (!existing) return NextResponse.json({ error: 'ไม่พบโค้ด' }, { status: 404 })

      await prisma.v2BoxCode.update({
        where: { id },
        data: { isActive: !existing.isActive },
      })

      return NextResponse.json({ success: true, isActive: !existing.isActive })
    }

    // action: deleteExpired — ลบโค้ดที่หมดอายุทั้งหมด
    if (action === 'deleteExpired') {
      const result = await prisma.v2BoxCode.deleteMany({
        where: { expiryDate: { lte: new Date() } },
      })
      return NextResponse.json({ success: true, deletedCount: result.count })
    }

    return NextResponse.json({ error: 'action ไม่ถูกต้อง' }, { status: 400 })
  } catch (error) {
    console.error('Admin v2box-codes POST error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
