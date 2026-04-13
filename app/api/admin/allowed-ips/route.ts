import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/session'

// GET - ดึง Allowed IPs ทั้งหมด
export async function GET() {
  try {
    await requireSuperAdmin()

    const allowedIps = await prisma.allowedIP.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: allowedIps })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - เพิ่ม IP ใหม่
export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin()
    const body = await request.json()

    const { ipAddress, label } = body

    if (!ipAddress || !ipAddress.trim()) {
      return NextResponse.json({ success: false, error: 'กรุณากรอก IP Address' }, { status: 400 })
    }

    const trimmedIp = ipAddress.trim()

    // เช็คว่ามีอยู่แล้วหรือไม่
    const existing = await prisma.allowedIP.findUnique({
      where: { ipAddress: trimmedIp },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: `IP ${trimmedIp} มีอยู่ในระบบแล้ว` }, { status: 400 })
    }

    const allowedIp = await prisma.allowedIP.create({
      data: {
        ipAddress: trimmedIp,
        label: label?.trim() || null,
        createdBy: admin.id,
      },
    })

    return NextResponse.json({ success: true, data: allowedIp })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - อัปเดต IP (เปลี่ยน label, เปิด/ปิด)
export async function PUT(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const body = await request.json()

    const { id, label, isActive, ipAddress } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })
    }

    const updateData: any = {}
    if (label !== undefined) updateData.label = label?.trim() || null
    if (isActive !== undefined) updateData.isActive = isActive
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress.trim()

    const allowedIp = await prisma.allowedIP.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: allowedIp })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - ลบ IP
export async function DELETE(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })
    }

    await prisma.allowedIP.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
