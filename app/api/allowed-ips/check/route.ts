import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/allowed-ips/check?ip=xxx.xxx.xxx.xxx
// Public API สำหรับเช็คว่า IP อยู่ใน whitelist หรือไม่
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')

    if (!ip) {
      return NextResponse.json({
        อนุญาต: false,
        allowed: false,
        ข้อผิดพลาด: 'กรุณาระบุ IP Address ผ่าน query parameter เช่น ?ip=203.150.166.82',
        error: 'กรุณาระบุ IP Address (query param: ip)',
      }, { status: 400 })
    }

    const trimmedIp = ip.trim()

    const found = await prisma.allowedIP.findUnique({
      where: { ipAddress: trimmedIp },
      select: { id: true, ipAddress: true, hostname: true, label: true, isActive: true },
    })

    if (!found || !found.isActive) {
      return NextResponse.json({
        อนุญาต: false,
        allowed: false,
        ไอพีแอดเดรส: trimmedIp,
        ip: trimmedIp,
        ข้อความ: `IP ${trimmedIp} ไม่ได้อยู่ในรายการที่อนุญาต หรือถูกปิดการใช้งาน`,
      })
    }

    return NextResponse.json({
      อนุญาต: true,
      allowed: true,
      ไอพีแอดเดรส: trimmedIp,
      ip: trimmedIp,
      ชื่อโฮสต์: found.hostname || null,
      hostname: found.hostname,
      ชื่อหมายเหตุ: found.label || '(ไม่ได้ระบุ)',
      label: found.label,
      ข้อความ: `IP ${trimmedIp} ได้รับอนุญาตให้เข้าถึงระบบ`,
    })
  } catch (error: any) {
    return NextResponse.json({
      อนุญาต: false,
      allowed: false,
      ข้อผิดพลาด: error.message,
      error: error.message,
    }, { status: 500 })
  }
}

// POST /api/allowed-ips/check
// Body: { ip: "xxx.xxx.xxx.xxx" } หรือ { ips: ["xxx", "yyy"] } — เช็คหลาย IP พร้อมกัน
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // เช็ค IP เดียว
    if (body.ip) {
      const trimmedIp = body.ip.trim()
      const found = await prisma.allowedIP.findUnique({
        where: { ipAddress: trimmedIp },
        select: { id: true, ipAddress: true, hostname: true, label: true, isActive: true },
      })

      const isAllowed = !!(found && found.isActive)

      return NextResponse.json({
        อนุญาต: isAllowed,
        allowed: isAllowed,
        ไอพีแอดเดรส: trimmedIp,
        ip: trimmedIp,
        ชื่อโฮสต์: found?.hostname || null,
        hostname: found?.hostname || null,
        ชื่อหมายเหตุ: found?.label || '(ไม่ได้ระบุ)',
        label: found?.label || null,
        ข้อความ: isAllowed
          ? `IP ${trimmedIp} ได้รับอนุญาตให้เข้าถึงระบบ`
          : `IP ${trimmedIp} ไม่ได้อยู่ในรายการที่อนุญาต หรือถูกปิดการใช้งาน`,
      })
    }

    // เช็คหลาย IP
    if (body.ips && Array.isArray(body.ips)) {
      const ips = body.ips.map((ip: string) => ip.trim())
      const found = await prisma.allowedIP.findMany({
        where: { ipAddress: { in: ips }, isActive: true },
        select: { ipAddress: true, hostname: true, label: true },
      })

      const allowedSet = new Set(found.map(f => f.ipAddress))
      const results = ips.map((ip: string) => ({
        อนุญาต: allowedSet.has(ip),
        allowed: allowedSet.has(ip),
        ไอพีแอดเดรส: ip,
        ip,
        ชื่อโฮสต์: found.find(f => f.ipAddress === ip)?.hostname || null,
        hostname: found.find(f => f.ipAddress === ip)?.hostname || null,
        ชื่อหมายเหตุ: found.find(f => f.ipAddress === ip)?.label || '(ไม่ได้ระบุ)',
        label: found.find(f => f.ipAddress === ip)?.label || null,
        ข้อความ: allowedSet.has(ip)
          ? `IP ${ip} ได้รับอนุญาต`
          : `IP ${ip} ไม่ได้รับอนุญาต`,
      }))

      const allowedCount = results.filter((r: any) => r.allowed).length

      return NextResponse.json({
        ข้อความ: `ตรวจสอบ ${ips.length} IP — อนุญาต ${allowedCount} รายการ, ไม่อนุญาต ${ips.length - allowedCount} รายการ`,
        จำนวนที่ตรวจสอบ: ips.length,
        อนุญาต: allowedCount,
        ไม่อนุญาต: ips.length - allowedCount,
        ผลลัพธ์: results,
        results,
      })
    }

    return NextResponse.json({
      อนุญาต: false,
      allowed: false,
      ข้อผิดพลาด: 'กรุณาระบุ ip (เช็คเดียว) หรือ ips (เช็คหลาย IP) ใน body',
      error: 'กรุณาระบุ ip หรือ ips',
    }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({
      อนุญาต: false,
      allowed: false,
      ข้อผิดพลาด: error.message,
      error: error.message,
    }, { status: 500 })
  }
}
