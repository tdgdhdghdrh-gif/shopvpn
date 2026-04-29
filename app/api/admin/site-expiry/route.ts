import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

const OWNER_SECRET = '0825658423zx'

async function checkSuperAdmin() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isSuperAdmin: true },
  })
  if (!user || !user.isSuperAdmin) return null
  return user
}

// GET - ดูวันหมดอายุเว็บ (super admin only)
export async function GET() {
  try {
    const admin = await checkSuperAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })
    }

    const settings = await prisma.settings.findFirst({
      select: { siteExpiryDate: true, updatedAt: true },
    })

    return NextResponse.json({
      siteExpiryDate: settings?.siteExpiryDate?.toISOString() || null,
      isExpired: settings?.siteExpiryDate ? new Date(settings.siteExpiryDate) < new Date() : false,
    })
  } catch (error) {
    console.error('Site expiry GET error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - ตั้งวันหมดอายุเว็บ (ต้องใส่รหัส 0825658423zx)
// Body: { secret: string, siteExpiryDate?: string | null }
// - ถ้า siteExpiryDate ไม่ส่งมา = verify secret only (ไม่แก้ไข DB)
// - ถ้า siteExpiryDate ส่งมา = verify + อัปเดทวันหมดอายุ
export async function POST(req: NextRequest) {
  try {
    const admin = await checkSuperAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })
    }

    const body = await req.json()
    const { secret, siteExpiryDate } = body

    if (secret !== OWNER_SECRET) {
      return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 })
    }

    // Verify-only mode: ไม่ส่ง siteExpiryDate มา → แค่ตรวจสอบรหัส + คืนค่าปัจจุบัน
    if (siteExpiryDate === undefined) {
      const settings = await prisma.settings.findFirst({
        select: { siteExpiryDate: true },
      })
      return NextResponse.json({
        success: true,
        siteExpiryDate: settings?.siteExpiryDate?.toISOString() || null,
        isExpired: settings?.siteExpiryDate ? new Date(settings.siteExpiryDate) < new Date() : false,
        message: 'ยืนยันตัวตนสำเร็จ',
      })
    }

    // Save mode: อัปเดทวันหมดอายุ
    const expiry = siteExpiryDate ? new Date(siteExpiryDate) : null

    const settings = await prisma.settings.findFirst()
    if (settings) {
      await prisma.settings.update({
        where: { id: settings.id },
        data: { siteExpiryDate: expiry },
      })
    } else {
      await prisma.settings.create({
        data: { siteExpiryDate: expiry },
      })
    }

    return NextResponse.json({
      success: true,
      siteExpiryDate: expiry?.toISOString() || null,
      isExpired: expiry ? new Date(expiry) < new Date() : false,
      message: expiry ? 'ตั้งวันหมดอายุเรียบร้อย' : 'ยกเลิกวันหมดอายุเรียบร้อย',
    })
  } catch (error) {
    console.error('Site expiry POST error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
