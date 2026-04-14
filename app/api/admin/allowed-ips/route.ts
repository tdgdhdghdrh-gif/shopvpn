import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import dns from 'dns/promises'

// ตรวจสอบว่าเป็น IP address จริง (IPv4 หรือ IPv6)
function isIpAddress(value: string): boolean {
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) return true
  if (/^[0-9a-fA-F:]+$/.test(value) && value.includes(':')) return true
  return false
}

// resolve hostname → IP addresses
async function resolveHostname(hostname: string): Promise<string[]> {
  try {
    return await dns.resolve4(hostname)
  } catch {
    try {
      return await dns.resolve6(hostname)
    } catch {
      throw new Error(`ไม่สามารถ resolve hostname "${hostname}" ได้`)
    }
  }
}

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
        ชื่อโฮสต์: ip.hostname || null,
        ชื่อหมายเหตุ: ip.label || '(ไม่ได้ระบุ)',
        สถานะ: ip.isActive ? 'เปิดใช้งาน' : 'ปิดอยู่',
        isActive: ip.isActive,
        ipAddress: ip.ipAddress,
        hostname: ip.hostname,
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

// POST - เพิ่ม IP ใหม่ (รองรับ hostname)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()

    const { ipAddress, hostname, label } = body

    // กรณีใส่ hostname
    if (hostname && !ipAddress) {
      const host = hostname.trim().toLowerCase()

      if (isIpAddress(host)) {
        // ใส่เป็น IP จริงๆ
        return await createSingleIp(host, null, label, admin.id)
      }

      // resolve hostname
      const resolved = await resolveHostname(host)

      if (resolved.length === 1) {
        return await createSingleIp(resolved[0], host, label, admin.id)
      }

      // หลาย IP
      const results = []
      for (const resolvedIp of resolved) {
        const existing = await prisma.allowedIP.findUnique({
          where: { ipAddress: resolvedIp },
        })

        if (existing) {
          if (!existing.hostname) {
            await prisma.allowedIP.update({
              where: { id: existing.id },
              data: { hostname: host },
            })
          }
          results.push({ ip: resolvedIp, status: 'already_exists', ข้อความ: `IP ${resolvedIp} มีอยู่แล้ว` })
        } else {
          const created = await prisma.allowedIP.create({
            data: {
              ipAddress: resolvedIp,
              hostname: host,
              label: label?.trim() || `Resolved from ${host}`,
              createdBy: admin.id,
            },
          })
          results.push({ id: created.id, ip: resolvedIp, status: 'created', ข้อความ: `เพิ่ม IP ${resolvedIp} สำเร็จ` })
        }
      }

      return NextResponse.json({
        success: true,
        ข้อความ: `Resolve "${host}" ได้ ${resolved.length} IP — เพิ่มทั้งหมดแล้ว`,
        hostname: host,
        resolvedIps: resolved,
        results,
      })
    }

    // กรณีใส่ ipAddress ปกติ
    if (!ipAddress || !ipAddress.trim()) {
      return NextResponse.json({ success: false, ข้อผิดพลาด: 'กรุณากรอก IP Address หรือ Hostname', error: 'กรุณากรอก IP Address หรือ Hostname' }, { status: 400 })
    }

    const trimmedValue = ipAddress.trim()

    // เช็คว่าเป็น hostname
    if (!isIpAddress(trimmedValue)) {
      const host = trimmedValue.toLowerCase()
      const resolved = await resolveHostname(host)

      if (resolved.length === 1) {
        return await createSingleIp(resolved[0], host, label, admin.id)
      }

      // หลาย IP
      const results = []
      for (const resolvedIp of resolved) {
        const existing = await prisma.allowedIP.findUnique({
          where: { ipAddress: resolvedIp },
        })

        if (existing) {
          if (!existing.hostname) {
            await prisma.allowedIP.update({
              where: { id: existing.id },
              data: { hostname: host },
            })
          }
          results.push({ ip: resolvedIp, status: 'already_exists' })
        } else {
          await prisma.allowedIP.create({
            data: {
              ipAddress: resolvedIp,
              hostname: host,
              label: label?.trim() || `Resolved from ${host}`,
              createdBy: admin.id,
            },
          })
          results.push({ ip: resolvedIp, status: 'created' })
        }
      }

      return NextResponse.json({
        success: true,
        ข้อความ: `Resolve "${host}" ได้ ${resolved.length} IP — เพิ่มทั้งหมดแล้ว`,
        hostname: host,
        resolvedIps: resolved,
        results,
      })
    }

    return await createSingleIp(trimmedValue, null, label, admin.id)
  } catch (error: any) {
    return NextResponse.json({ success: false, ข้อผิดพลาด: error.message, error: error.message }, { status: 500 })
  }
}

// Helper: สร้าง IP เดียว
async function createSingleIp(ip: string, hostname: string | null, label: string | undefined, adminId: string) {
  const existing = await prisma.allowedIP.findUnique({
    where: { ipAddress: ip },
  })
  if (existing) {
    // อัพเดท hostname ถ้ายังไม่มี
    if (hostname && !existing.hostname) {
      await prisma.allowedIP.update({
        where: { id: existing.id },
        data: { hostname },
      })
    }
    return NextResponse.json({
      success: false,
      ข้อผิดพลาด: `IP ${ip} มีอยู่ในระบบแล้ว${hostname ? ` (resolve จาก ${hostname})` : ''}`,
      error: `IP ${ip} มีอยู่ในระบบแล้ว`,
    }, { status: 400 })
  }

  const allowedIp = await prisma.allowedIP.create({
    data: {
      ipAddress: ip,
      hostname,
      label: label?.trim() || (hostname ? `Resolved from ${hostname}` : null),
      createdBy: adminId,
    },
  })

  return NextResponse.json({
    success: true,
    ข้อความ: `เพิ่ม IP ${ip} สำเร็จ${hostname ? ` (resolve จาก ${hostname})` : ''}`,
    data: {
      id: allowedIp.id,
      ไอพีแอดเดรส: allowedIp.ipAddress,
      ชื่อโฮสต์: allowedIp.hostname,
      ชื่อหมายเหตุ: allowedIp.label || '(ไม่ได้ระบุ)',
      สถานะ: 'เปิดใช้งาน',
      isActive: allowedIp.isActive,
      ipAddress: allowedIp.ipAddress,
      hostname: allowedIp.hostname,
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
    ...(hostname ? { resolvedFrom: hostname } : {}),
  })
}

// PUT - อัปเดต IP (เปลี่ยน label, เปิด/ปิด, hostname)
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    const { id, label, isActive, ipAddress, hostname } = body

    if (!id) {
      return NextResponse.json({ success: false, ข้อผิดพลาด: 'ไม่พบ ID', error: 'ไม่พบ ID' }, { status: 400 })
    }

    const updateData: any = {}
    if (label !== undefined) updateData.label = label?.trim() || null
    if (isActive !== undefined) updateData.isActive = isActive
    if (hostname !== undefined) updateData.hostname = hostname?.trim() || null

    // ถ้าเปลี่ยน ipAddress → เช็คว่าเป็น hostname หรือ IP
    if (ipAddress !== undefined) {
      const trimmed = ipAddress.trim()
      if (!isIpAddress(trimmed)) {
        // resolve hostname
        const host = trimmed.toLowerCase()
        const resolved = await resolveHostname(host)
        updateData.ipAddress = resolved[0]
        updateData.hostname = host
      } else {
        updateData.ipAddress = trimmed
      }
    }

    const allowedIp = await prisma.allowedIP.update({
      where: { id },
      data: updateData,
    })

    const changes: string[] = []
    if (label !== undefined) changes.push('ชื่อ/หมายเหตุ')
    if (isActive !== undefined) changes.push(isActive ? 'เปิดใช้งาน' : 'ปิดการใช้งาน')
    if (ipAddress !== undefined) changes.push('IP Address')
    if (hostname !== undefined) changes.push('Hostname')

    return NextResponse.json({
      success: true,
      ข้อความ: `อัปเดต IP ${allowedIp.ipAddress} สำเร็จ (${changes.join(', ')})`,
      data: {
        id: allowedIp.id,
        ไอพีแอดเดรส: allowedIp.ipAddress,
        ชื่อโฮสต์: allowedIp.hostname,
        ชื่อหมายเหตุ: allowedIp.label || '(ไม่ได้ระบุ)',
        สถานะ: allowedIp.isActive ? 'เปิดใช้งาน' : 'ปิดอยู่',
        isActive: allowedIp.isActive,
        ipAddress: allowedIp.ipAddress,
        hostname: allowedIp.hostname,
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
