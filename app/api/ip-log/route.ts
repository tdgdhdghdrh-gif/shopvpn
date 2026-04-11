import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'

interface SessionData {
  userId?: string
  isLoggedIn: boolean
}

// POST - บันทึก IP log (เรียกจาก middleware)
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ internal key เพื่อป้องกันการเรียกจากภายนอก
    const internalKey = request.headers.get('X-Internal-Key')
    const expectedKey = process.env.IP_LOG_SECRET || 'ip-log-internal-secret-key'
    
    if (internalKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ipAddress, path, method, userAgent, sessionCookie } = await request.json()

    if (!ipAddress || ipAddress === 'unknown') {
      return NextResponse.json({ logged: false, blocked: false })
    }

    // เช็คว่า IP ถูกบล็อกหรือไม่
    const blockedIP = await prisma.blockedIP.findUnique({
      where: { ipAddress }
    })

    if (blockedIP) {
      // เช็คว่าหมดเวลาบล็อกหรือยัง
      if (blockedIP.expiresAt && blockedIP.expiresAt < new Date()) {
        // หมดเวลาแล้ว ลบออก
        await prisma.blockedIP.delete({ where: { ipAddress } })
      } else {
        // ยังบล็อกอยู่ - บันทึก log ว่าถูกบล็อก
        await prisma.iPLog.create({
          data: {
            ipAddress,
            path: path || '/',
            method: method || 'GET',
            userAgent: userAgent?.substring(0, 500) || null,
            isBlocked: true,
          }
        })
        return NextResponse.json({ logged: true, blocked: true, reason: blockedIP.reason })
      }
    }

    // ดึง userId จาก session cookie (ถ้ามี)
    let userId: string | null = null
    // เราไม่สามารถ decode iron-session จาก string ได้ใน middleware
    // จึงเก็บแค่ IP log โดยไม่มี userId (หรือจะเพิ่มทีหลัง)

    // บันทึก IP log (ไม่บล็อก, แค่ sample - บันทึก 1 ครั้งต่อ IP ต่อ path ต่อ 5 นาที)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentLog = await prisma.iPLog.findFirst({
      where: {
        ipAddress,
        path: path || '/',
        createdAt: { gte: fiveMinutesAgo }
      }
    })

    if (!recentLog) {
      await prisma.iPLog.create({
        data: {
          ipAddress,
          path: path || '/',
          method: method || 'GET',
          userAgent: userAgent?.substring(0, 500) || null,
          userId,
          isBlocked: false,
        }
      })
    }

    return NextResponse.json({ logged: true, blocked: false })
  } catch (error) {
    console.error('[IP Log API] Error:', error)
    return NextResponse.json({ logged: false, blocked: false })
  }
}
