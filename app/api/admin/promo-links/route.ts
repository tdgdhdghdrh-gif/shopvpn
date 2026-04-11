import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

// GET - ดึงรายการลิงก์โปรทั้งหมด
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const promoId = searchParams.get('promoId')

    // ถ้าส่ง promoId มา = ดึงรายชื่อคนรับโปร
    if (promoId) {
      const activations = await prisma.promoActivation.findMany({
        where: { promoId },
        orderBy: { activatedAt: 'desc' },
        include: {
          promo: { select: { name: true, code: true, discountPercent: true } },
        },
      })

      // ดึงข้อมูล user แยก (เพราะ PromoActivation ไม่มี relation กับ User โดยตรงใน schema)
      const userIds = activations.map((a) => a.userId)
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true, avatar: true, createdAt: true },
      })
      const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

      const data = activations.map((a) => ({
        id: a.id,
        userId: a.userId,
        activatedAt: a.activatedAt,
        user: userMap[a.userId] || { id: a.userId, name: 'Unknown', email: '-' },
      }))

      return NextResponse.json({ success: true, data })
    }

    // ปกติ = ดึง promo links ทั้งหมด
    const promoLinks = await prisma.promoLink.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { activations: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: promoLinks })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - สร้างลิงก์โปรใหม่
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()

    const { name, description, discountPercent, code, maxUsage, expiresAt } = body

    if (!name || !code || !discountPercent) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
    }

    if (discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ success: false, error: 'เปอร์เซ็นต์ส่วนลดต้องอยู่ระหว่าง 1-100' }, { status: 400 })
    }

    if (maxUsage !== undefined && maxUsage !== null && maxUsage < 1) {
      return NextResponse.json({ success: false, error: 'จำนวนคนรับต้องมากกว่า 0' }, { status: 400 })
    }

    // ตรวจว่า code ซ้ำไหม
    const existing = await prisma.promoLink.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'รหัสลิงก์นี้ถูกใช้แล้ว' }, { status: 400 })
    }

    const promoLink = await prisma.promoLink.create({
      data: {
        name,
        description: description || null,
        discountPercent: parseInt(discountPercent),
        code: code.toLowerCase().replace(/[^a-z0-9-_]/g, ''),
        maxUsage: maxUsage ? parseInt(maxUsage) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: admin.id,
      }
    })

    return NextResponse.json({ success: true, data: promoLink })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - อัปเดตลิงก์โปร
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    const { id, name, description, discountPercent, isActive, maxUsage, expiresAt } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (discountPercent !== undefined) updateData.discountPercent = parseInt(discountPercent)
    if (isActive !== undefined) updateData.isActive = isActive
    if (maxUsage !== undefined) updateData.maxUsage = maxUsage === null || maxUsage === '' ? null : parseInt(maxUsage)
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null

    const promoLink = await prisma.promoLink.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: promoLink })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - ลบลิงก์โปร หรือ ลบ activation
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const activationId = searchParams.get('activationId')

    // ลบ activation (คนรับโปร)
    if (activationId) {
      // ดึง activation เพื่อหา promoId และ userId
      const activation = await prisma.promoActivation.findUnique({
        where: { id: activationId },
        include: { promo: true },
      })

      if (!activation) {
        return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลการรับโปร' }, { status: 404 })
      }

      // ลบ activation + ลด usageCount + ลบส่วนลดจาก user
      await prisma.$transaction([
        prisma.promoActivation.delete({ where: { id: activationId } }),
        prisma.promoLink.update({
          where: { id: activation.promoId },
          data: { usageCount: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id: activation.userId },
          data: {
            promoDiscountPercent: null,
            promoLinkCode: null,
          },
        }),
      ])

      return NextResponse.json({ success: true })
    }

    // ลบ promo link
    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })
    }

    await prisma.promoLink.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
