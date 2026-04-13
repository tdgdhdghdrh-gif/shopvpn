import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/allowed-ips/check?ip=xxx.xxx.xxx.xxx
// Public API สำหรับแอพเช็คว่า IP อยู่ใน whitelist หรือไม่
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')

    if (!ip) {
      return NextResponse.json({ allowed: false, error: 'กรุณาระบุ IP Address (query param: ip)' }, { status: 400 })
    }

    const trimmedIp = ip.trim()

    const found = await prisma.allowedIP.findUnique({
      where: { ipAddress: trimmedIp },
      select: { id: true, ipAddress: true, label: true, isActive: true },
    })

    if (!found || !found.isActive) {
      return NextResponse.json({ allowed: false, ip: trimmedIp })
    }

    return NextResponse.json({ allowed: true, ip: trimmedIp, label: found.label })
  } catch (error: any) {
    return NextResponse.json({ allowed: false, error: error.message }, { status: 500 })
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
        select: { id: true, ipAddress: true, label: true, isActive: true },
      })

      return NextResponse.json({
        allowed: !!(found && found.isActive),
        ip: trimmedIp,
        label: found?.label || null,
      })
    }

    // เช็คหลาย IP
    if (body.ips && Array.isArray(body.ips)) {
      const ips = body.ips.map((ip: string) => ip.trim())
      const found = await prisma.allowedIP.findMany({
        where: { ipAddress: { in: ips }, isActive: true },
        select: { ipAddress: true, label: true },
      })

      const allowedSet = new Set(found.map(f => f.ipAddress))
      const results = ips.map((ip: string) => ({
        ip,
        allowed: allowedSet.has(ip),
        label: found.find(f => f.ipAddress === ip)?.label || null,
      }))

      return NextResponse.json({ results })
    }

    return NextResponse.json({ allowed: false, error: 'กรุณาระบุ ip หรือ ips' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ allowed: false, error: error.message }, { status: 500 })
  }
}
