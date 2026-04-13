import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

// GET - ดึง Allowed IPs ทั้งหมด
export async function GET() {
  try {
    await requireAdmin()

    const allowedIps = await prisma.allowedIP.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const activeCount = allowedIps.filter(ip => ip.isActive).length
    const inactiveCount = allowedIps.length - activeCount

    return NextResponse.json({
      success: true,
      ข้อความ: 'ดึงรายการ IP ที่อนุญาตสำเร็จ',
      สรุป: {
        จำนวนทั้งหมด: allowedIps.length,
        เปิดใช้งาน: activeCount,
        ปิดอยู่: inactiveCount,
      },
      data: allowedIps.map(ip => ({
        id: ip.id,
        ไอพีแอดเดรส: ip.ipAddress,
        ชื่อหมายเหตุ: ip.label || '(ไม่ได้ระบุ)',
        สถานะ: ip.isActive ? 'เปิดใช้งาน' : 'ปิดอยู่',
        isActive: ip.isActive,
        ipAddress: ip.ipAddress,
        label: ip.label,
        เพิ่มเมื่อ: new Date(ip.createdAt).toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        createdAt: ip.createdAt,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, ข้อผิดพลาด: error.message, error: error.message }, { status: 500 })
  }
}

// POST - เพิ่ม IP ใหม่
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()

    const { ipAddress, label } = body

    if (!ipAddress || !ipAddress.trim()) {
      return NextResponse.json({ success: false, ข้อผิดพลาด: 'กรุณากรอก IP Address', error: 'กรุณากรอก IP Address' }, { status: 400 })
    }

    const trimmedIp = ipAddress.trim()

    // เช็คว่ามีอยู่แล้วหรือไม่
    const existing = await prisma.allowedIP.findUnique({
      where: { ipAddress: trimmedIp },
    })
    if (existing) {
      return NextResponse.json({ success: false, ข้อผิดพลาด: `IP ${trimmedIp} มีอยู่ในระบบแล้ว`, error: `IP ${trimmedIp} มีอยู่ในระบบแล้ว` }, { status: 400 })
    }

    const allowedIp = await prisma.allowedIP.create({
      data: {
        ipAddress: trimmedIp,
        label: label?.trim() || null,
        createdBy: admin.id,
      },
    })

    return NextResponse.json({
      success: true,
      ข้อความ: `เพิ่ม IP ${trimmedIp} สำเร็จแล้ว`,
      data: {
        id: allowedIp.id,
        ไอพีแอดเดรส: allowedIp.ipAddress,
        ชื่อหมายเหตุ: allowedIp.label || '(ไม่ได้ระบุ)',
        สถานะ: 'เปิดใช้งาน',
        isActive: allowedIp.isActive,
        ipAddress: allowedIp.ipAddress,
        label: allowedIp.label,
        เพิ่มเมื่อ: new Date(allowedIp.createdAt).toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        createdAt: allowedIp.createdAt,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, ข้อผิดพลาด: error.message, error: error.message }, { status: 500 })
  }
}

// PUT - อัปเดต IP (เปลี่ยน label, เปิด/ปิด)
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    const { id, label, isActive, ipAddress } = body

    if (!id) {
      return NextResponse.json({ success: false, ข้อผิดพลาด: 'ไม่พบ ID', error: 'ไม่พบ ID' }, { status: 400 })
    }

    const updateData: any = {}
    if (label !== undefined) updateData.label = label?.trim() || null
    if (isActive !== undefined) updateData.isActive = isActive
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress.trim()

    const allowedIp = await prisma.allowedIP.update({
      where: { id },
      data: updateData,
    })

    const changes: string[] = []
    if (label !== undefined) changes.push('ชื่อ/หมายเหตุ')
    if (isActive !== undefined) changes.push(isActive ? 'เปิดใช้งาน' : 'ปิดการใช้งาน')
    if (ipAddress !== undefined) changes.push('IP Address')

    return NextResponse.json({
      success: true,
      ข้อความ: `อัปเดต IP ${allowedIp.ipAddress} สำเร็จ (${changes.join(', ')})`,
      data: {
        id: allowedIp.id,
        ไอพีแอดเดรส: allowedIp.ipAddress,
        ชื่อหมายเหตุ: allowedIp.label || '(ไม่ได้ระบุ)',
        สถานะ: allowedIp.isActive ? 'เปิดใช้งาน' : 'ปิดอยู่',
        isActive: allowedIp.isActive,
        ipAddress: allowedIp.ipAddress,
        label: allowedIp.label,
        createdAt: allowedIp.createdAt,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, ข้อผิดพลาด: error.message, error: error.message }, { status: 500 })
  }
}

// DELETE - ลบ IP
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, ข้อผิดพลาด: 'ไม่พบ ID', error: 'ไม่พบ ID' }, { status: 400 })
    }

    const deleted = await prisma.allowedIP.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      ข้อความ: `ลบ IP ${deleted.ipAddress} ออกจากระบบแล้ว`,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, ข้อผิดพลาด: error.message, error: error.message }, { status: 500 })
  }
}
