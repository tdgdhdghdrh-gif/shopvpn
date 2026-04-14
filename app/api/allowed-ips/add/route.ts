import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, logApiUsage } from '@/app/api/external/validate'
import dns from 'dns/promises'

// ตรวจสอบว่าเป็น IP address จริง (IPv4 หรือ IPv6)
function isIpAddress(value: string): boolean {
  // IPv4
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) return true
  // IPv6
  if (/^[0-9a-fA-F:]+$/.test(value) && value.includes(':')) return true
  return false
}

// resolve hostname → IP addresses
async function resolveHostname(hostname: string): Promise<string[]> {
  try {
    const addresses = await dns.resolve4(hostname)
    return addresses
  } catch {
    // ลอง IPv6
    try {
      const addresses = await dns.resolve6(hostname)
      return addresses
    } catch {
      throw new Error(`ไม่สามารถ resolve hostname "${hostname}" ได้ — ตรวจสอบชื่อโฮสต์อีกครั้ง`)
    }
  }
}

function getClientIP(request: NextRequest): string {
  const cfIP = request.headers.get('cf-connecting-ip')
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  if (cfIP) return cfIP
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  return 'unknown'
}

// POST /api/allowed-ips/add
// Authorization: Bearer sk_xxx (ต้องมี permission: ip:manage)
//
// Body:
//   { ip: "203.150.166.82", label: "ชื่อ" }          — เพิ่ม IP ตรง
//   { hostname: "example.com", label: "ชื่อ" }       — resolve hostname → IP แล้วเพิ่ม
//   { ip: "auto", label: "ชื่อ" }                    — ใช้ IP ของผู้เรียก (caller IP)
//
// Response:
//   { success: true, data: { ... }, resolvedFrom?: "example.com" }
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ API Key
    const result = await validateApiKey(request, 'ip:manage')
    if (result.error) return result.error
    const { apiKey } = result

    const ip = getClientIP(request)
    const body = await request.json()
    const { label } = body

    let targetIp: string
    let hostname: string | null = null

    // กรณี 1: ใส่ hostname → resolve เป็น IP
    if (body.hostname && !body.ip) {
      const host = body.hostname.trim().toLowerCase()
      hostname = host

      if (isIpAddress(host)) {
        // ใส่ hostname แต่จริงๆ เป็น IP
        targetIp = host
        hostname = null
      } else {
        const resolved = await resolveHostname(host)
        targetIp = resolved[0] // ใช้ IP แรกที่ resolve ได้

        // เพิ่มทุก IP ที่ resolve ได้ (ถ้ามีหลาย IP)
        if (resolved.length > 1) {
          const results = []
          for (const resolvedIp of resolved) {
            const existing = await prisma.allowedIP.findUnique({
              where: { ipAddress: resolvedIp },
            })

            if (existing) {
              // อัพเดท hostname ถ้ายังไม่มี
              if (!existing.hostname) {
                await prisma.allowedIP.update({
                  where: { id: existing.id },
                  data: { hostname: host },
                })
              }
              results.push({
                ip: resolvedIp,
                status: 'already_exists',
                ข้อความ: `IP ${resolvedIp} มีอยู่แล้ว`,
              })
            } else {
              const created = await prisma.allowedIP.create({
                data: {
                  ipAddress: resolvedIp,
                  hostname: host,
                  label: label?.trim() || `Resolved from ${host}`,
                  createdBy: `api:${apiKey.name}`,
                },
              })
              results.push({
                id: created.id,
                ip: resolvedIp,
                status: 'created',
                ข้อความ: `เพิ่ม IP ${resolvedIp} สำเร็จ`,
              })
            }
          }

          await logApiUsage(apiKey.id, 'ip:manage', null, `Add hostname ${host} → ${resolved.length} IPs: ${resolved.join(', ')}`, ip, true)

          return NextResponse.json({
            success: true,
            ข้อความ: `Resolve "${host}" ได้ ${resolved.length} IP — เพิ่มทั้งหมดแล้ว`,
            hostname: host,
            resolvedIps: resolved,
            results,
          })
        }
      }
    }
    // กรณี 2: ip: "auto" → ใช้ IP ของผู้เรียก
    else if (body.ip === 'auto') {
      targetIp = ip
    }
    // กรณี 3: ใส่ IP ตรง
    else if (body.ip) {
      const value = body.ip.trim()

      // เช็คว่าเป็น hostname แทน IP
      if (!isIpAddress(value)) {
        hostname = value.toLowerCase()
        const resolved = await resolveHostname(hostname)
        targetIp = resolved[0]
      } else {
        targetIp = value
      }
    }
    // ไม่มี ip และไม่มี hostname
    else {
      await logApiUsage(apiKey.id, 'ip:manage', null, 'Missing ip or hostname', ip, false)
      return NextResponse.json({
        success: false,
        error: 'กรุณาระบุ ip หรือ hostname',
        ข้อผิดพลาด: 'กรุณาระบุ ip หรือ hostname',
        ตัวอย่าง: {
          'เพิ่ม IP ตรง': '{ "ip": "203.150.166.82", "label": "ชื่อ" }',
          'เพิ่มจาก hostname': '{ "hostname": "example.com", "label": "ชื่อ" }',
          'ใช้ IP ผู้เรียก': '{ "ip": "auto", "label": "ชื่อ" }',
        },
      }, { status: 400 })
    }

    // เช็คว่ามีอยู่แล้วหรือไม่
    const existing = await prisma.allowedIP.findUnique({
      where: { ipAddress: targetIp },
    })

    if (existing) {
      // อัพเดท hostname ถ้ายังไม่มี
      if (hostname && !existing.hostname) {
        await prisma.allowedIP.update({
          where: { id: existing.id },
          data: { hostname },
        })
      }
      // ถ้า inactive ให้เปิดใช้งาน
      if (!existing.isActive) {
        await prisma.allowedIP.update({
          where: { id: existing.id },
          data: { isActive: true },
        })
        await logApiUsage(apiKey.id, 'ip:manage', null, `Re-activated existing IP ${targetIp}`, ip, true)
        return NextResponse.json({
          success: true,
          ข้อความ: `IP ${targetIp} มีอยู่แล้วแต่ปิดอยู่ — เปิดใช้งานให้แล้ว`,
          data: {
            id: existing.id,
            ipAddress: targetIp,
            hostname: hostname || existing.hostname,
            label: existing.label,
            isActive: true,
            reactivated: true,
          },
          ...(hostname ? { resolvedFrom: hostname } : {}),
        })
      }

      await logApiUsage(apiKey.id, 'ip:manage', null, `IP ${targetIp} already exists`, ip, true)
      return NextResponse.json({
        success: true,
        ข้อความ: `IP ${targetIp} มีอยู่ในระบบแล้วและเปิดใช้งานอยู่`,
        data: {
          id: existing.id,
          ipAddress: targetIp,
          hostname: hostname || existing.hostname,
          label: existing.label,
          isActive: true,
          alreadyExists: true,
        },
        ...(hostname ? { resolvedFrom: hostname } : {}),
      })
    }

    // สร้างใหม่
    const created = await prisma.allowedIP.create({
      data: {
        ipAddress: targetIp,
        hostname,
        label: label?.trim() || (hostname ? `Resolved from ${hostname}` : null),
        createdBy: `api:${apiKey.name}`,
      },
    })

    await logApiUsage(apiKey.id, 'ip:manage', null, `Added IP ${targetIp}${hostname ? ` (from ${hostname})` : ''}`, ip, true)

    return NextResponse.json({
      success: true,
      ข้อความ: `เพิ่ม IP ${targetIp} สำเร็จ${hostname ? ` (resolve จาก ${hostname})` : ''}`,
      data: {
        id: created.id,
        ipAddress: created.ipAddress,
        hostname: created.hostname,
        label: created.label,
        isActive: created.isActive,
        createdAt: created.createdAt,
      },
      ...(hostname ? { resolvedFrom: hostname } : {}),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      ข้อผิดพลาด: error.message,
    }, { status: 500 })
  }
}

// DELETE /api/allowed-ips/add
// Authorization: Bearer sk_xxx (ต้องมี permission: ip:manage)
//
// Body: { ip: "203.150.166.82" } หรือ { hostname: "example.com" }
export async function DELETE(request: NextRequest) {
  try {
    const result = await validateApiKey(request, 'ip:manage')
    if (result.error) return result.error
    const { apiKey } = result

    const ip = getClientIP(request)
    const body = await request.json()

    let targetIp: string

    if (body.hostname) {
      const host = body.hostname.trim().toLowerCase()
      if (isIpAddress(host)) {
        targetIp = host
      } else {
        const resolved = await resolveHostname(host)
        // ลบทุก IP ที่ resolve ได้
        const results = []
        for (const resolvedIp of resolved) {
          const existing = await prisma.allowedIP.findUnique({
            where: { ipAddress: resolvedIp },
          })
          if (existing) {
            await prisma.allowedIP.delete({ where: { id: existing.id } })
            results.push({ ip: resolvedIp, status: 'deleted' })
          } else {
            results.push({ ip: resolvedIp, status: 'not_found' })
          }
        }

        await logApiUsage(apiKey.id, 'ip:manage', null, `Delete hostname ${host} → ${resolved.join(', ')}`, ip, true)

        return NextResponse.json({
          success: true,
          ข้อความ: `ลบ IP จาก hostname "${host}" แล้ว`,
          hostname: host,
          results,
        })
      }
    } else if (body.ip) {
      targetIp = body.ip.trim()
    } else {
      return NextResponse.json({
        success: false,
        error: 'กรุณาระบุ ip หรือ hostname',
      }, { status: 400 })
    }

    const existing = await prisma.allowedIP.findUnique({
      where: { ipAddress: targetIp },
    })

    if (!existing) {
      await logApiUsage(apiKey.id, 'ip:manage', null, `IP ${targetIp} not found for delete`, ip, false)
      return NextResponse.json({
        success: false,
        error: `IP ${targetIp} ไม่พบในระบบ`,
        ข้อผิดพลาด: `IP ${targetIp} ไม่พบในระบบ`,
      }, { status: 404 })
    }

    await prisma.allowedIP.delete({ where: { id: existing.id } })
    await logApiUsage(apiKey.id, 'ip:manage', null, `Deleted IP ${targetIp}`, ip, true)

    return NextResponse.json({
      success: true,
      ข้อความ: `ลบ IP ${targetIp} ออกจากระบบแล้ว`,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      ข้อผิดพลาด: error.message,
    }, { status: 500 })
  }
}

// GET /api/allowed-ips/add
// Authorization: Bearer sk_xxx (ต้องมี permission: ip:manage)
// ดึงรายการ IP ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const result = await validateApiKey(request, 'ip:manage')
    if (result.error) return result.error
    const { apiKey } = result

    const ip = getClientIP(request)

    const allowedIps = await prisma.allowedIP.findMany({
      orderBy: { createdAt: 'desc' },
    })

    await logApiUsage(apiKey.id, 'ip:manage', null, `Listed ${allowedIps.length} IPs`, ip, true)

    const activeCount = allowedIps.filter(i => i.isActive).length

    return NextResponse.json({
      success: true,
      ข้อความ: `พบ ${allowedIps.length} IP (เปิดใช้งาน ${activeCount})`,
      data: allowedIps.map(i => ({
        id: i.id,
        ipAddress: i.ipAddress,
        hostname: i.hostname,
        label: i.label,
        isActive: i.isActive,
        createdAt: i.createdAt,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      ข้อผิดพลาด: error.message,
    }, { status: 500 })
  }
}
