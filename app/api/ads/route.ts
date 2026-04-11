import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, checkImpersonation } from '@/lib/session'

const PRICE_PER_DAY = 3 // บาทต่อวัน

// GET — ดูโฆษณา
// ?mine=1 → ดูของตัวเอง (ต้อง login)
// ไม่มี param → ดูโฆษณาที่ approved + ยังไม่หมดอายุ (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mine = searchParams.get('mine')

    if (mine === '1') {
      const session = await getSession()
      if (!session.isLoggedIn || !session.userId) {
        return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
      }

      const ads = await prisma.ad.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ ads })
    }

    // Public: โฆษณาที่ approved, ยังไม่หมดอายุ, เปิดอยู่
    const now = new Date()
    const ads = await prisma.ad.findMany({
      where: {
        status: 'approved',
        isActive: true,
        endDate: { gt: now },
      },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // เพิ่ม views
    if (ads.length > 0) {
      await prisma.ad.updateMany({
        where: { id: { in: ads.map(a => a.id) } },
        data: { views: { increment: 1 } },
      })
    }

    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Ads GET error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST — สร้างโฆษณาใหม่ (หักเงินจาก balance)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    const body = await req.json()
    const { title, description, image, contactInfo, category, days } = body

    if (!title?.trim()) return NextResponse.json({ error: 'กรุณากรอกหัวข้อโฆษณา' }, { status: 400 })
    if (!description?.trim()) return NextResponse.json({ error: 'กรุณากรอกรายละเอียด' }, { status: 400 })
    if (!contactInfo?.trim()) return NextResponse.json({ error: 'กรุณากรอกช่องทางติดต่อ' }, { status: 400 })
    if (!days || days < 1 || days > 30) return NextResponse.json({ error: 'จำนวนวันต้องอยู่ระหว่าง 1-30 วัน' }, { status: 400 })

    const totalPrice = PRICE_PER_DAY * days

    // ตรวจ balance
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { balance: true },
    })
    if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    if (user.balance < totalPrice) {
      return NextResponse.json({ error: `ยอดเงินไม่พอ ต้องการ ${totalPrice} บาท (คงเหลือ ${user.balance} บาท)` }, { status: 400 })
    }

    // หักเงิน + สร้างโฆษณา
    const [, ad] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.userId },
        data: { balance: { decrement: totalPrice } },
      }),
      prisma.ad.create({
        data: {
          userId: session.userId,
          title: title.trim(),
          description: description.trim(),
          image: image || null,
          contactInfo: contactInfo.trim(),
          category: category || 'general',
          price: totalPrice,
          days,
          status: 'pending',
        },
      }),
      prisma.notification.create({
        data: {
          userId: session.userId,
          type: 'ad',
          title: 'ฝากลงโฆษณาสำเร็จ',
          message: `โฆษณา "${title.trim()}" กำลังรอการอนุมัติจากแอดมิน (${days} วัน / ${totalPrice} บาท)`,
          icon: '📢',
        },
      }),
    ])

    return NextResponse.json({ success: true, ad, message: `ฝากลงโฆษณาสำเร็จ! หัก ${totalPrice} บาท รอแอดมินอนุมัติ` })
  } catch (error) {
    console.error('Ads POST error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT — แก้ไขโฆษณาของตัวเอง (เฉพาะ pending/rejected)
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const body = await req.json()
    const { id, title, description, image, contactInfo, category, isActive } = body

    if (!id) return NextResponse.json({ error: 'ไม่พบ ID โฆษณา' }, { status: 400 })

    const ad = await prisma.ad.findUnique({ where: { id } })
    if (!ad) return NextResponse.json({ error: 'ไม่พบโฆษณา' }, { status: 404 })
    if (ad.userId !== session.userId) return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไข' }, { status: 403 })

    // toggle เปิด/ปิด — ทำได้เสมอ
    if (isActive !== undefined) {
      const updated = await prisma.ad.update({
        where: { id },
        data: { isActive },
      })
      return NextResponse.json({ success: true, ad: updated })
    }

    // แก้ไขเนื้อหา — ได้เฉพาะ pending/rejected
    if (ad.status !== 'pending' && ad.status !== 'rejected') {
      return NextResponse.json({ error: 'แก้ไขได้เฉพาะโฆษณาที่รอตรวจหรือถูกปฏิเสธเท่านั้น' }, { status: 400 })
    }

    const updated = await prisma.ad.update({
      where: { id },
      data: {
        title: title?.trim() || ad.title,
        description: description?.trim() || ad.description,
        image: image !== undefined ? (image || null) : ad.image,
        contactInfo: contactInfo?.trim() || ad.contactInfo,
        category: category || ad.category,
        status: 'pending', // ส่งตรวจใหม่
        rejectReason: null,
      },
    })

    return NextResponse.json({ success: true, ad: updated, message: 'แก้ไขโฆษณาแล้ว รอแอดมินตรวจใหม่' })
  } catch (error) {
    console.error('Ads PUT error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE — ลบโฆษณาของตัวเอง
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ไม่พบ ID โฆษณา' }, { status: 400 })

    const ad = await prisma.ad.findUnique({ where: { id } })
    if (!ad) return NextResponse.json({ error: 'ไม่พบโฆษณา' }, { status: 404 })
    if (ad.userId !== session.userId) return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบ' }, { status: 403 })

    await prisma.ad.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'ลบโฆษณาแล้ว' })
  } catch (error) {
    console.error('Ads DELETE error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
