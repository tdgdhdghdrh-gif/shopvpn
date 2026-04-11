import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, checkImpersonation } from '@/lib/session'
import { randomBytes } from 'crypto'

function generateGiftCode(): string {
  return 'GIFT-' + randomBytes(4).toString('hex').toUpperCase()
}

// GET - Get user's gift history
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [sent, received] = await Promise.all([
      prisma.gift.findMany({
        where: { senderId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { receiver: { select: { name: true } } }
      }),
      prisma.gift.findMany({
        where: { receiverId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { sender: { select: { name: true } } }
      })
    ])

    return NextResponse.json({ sent, received })
  } catch (error) {
    console.error('Failed to get gifts:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Create gift or redeem gift
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    const body = await request.json()
    const { action } = body

    // ========== REDEEM GIFT ==========
    if (action === 'redeem') {
      const { code } = body
      if (!code) return NextResponse.json({ error: 'กรุณากรอกรหัสของขวัญ' }, { status: 400 })

      const gift = await prisma.gift.findUnique({ where: { giftCode: code.toUpperCase() } })
      if (!gift) return NextResponse.json({ error: 'ไม่พบรหัสของขวัญนี้' }, { status: 404 })
      if (gift.isRedeemed) return NextResponse.json({ error: 'ของขวัญนี้ถูกใช้แล้ว' }, { status: 400 })
      if (new Date() > gift.expiresAt) return NextResponse.json({ error: 'ของขวัญนี้หมดอายุแล้ว' }, { status: 400 })
      if (gift.senderId === session.userId) return NextResponse.json({ error: 'ไม่สามารถรับของขวัญที่ส่งเองได้' }, { status: 400 })

      // Apply reward
      if (gift.type === 'credit') {
        await prisma.$transaction([
          prisma.gift.update({
            where: { id: gift.id },
            data: { isRedeemed: true, redeemedAt: new Date(), receiverId: session.userId }
          }),
          prisma.user.update({
            where: { id: session.userId },
            data: { balance: { increment: gift.value } }
          })
        ])
        return NextResponse.json({ success: true, message: `ได้รับเครดิต ${gift.value} บาท!`, gift })
      }

      // For vpn_days, mark as redeemed (admin must process)
      await prisma.gift.update({
        where: { id: gift.id },
        data: { isRedeemed: true, redeemedAt: new Date(), receiverId: session.userId }
      })
      return NextResponse.json({ success: true, message: `ได้รับ VPN ฟรี ${gift.value} วัน! ติดต่อแอดมินเพื่อรับสิทธิ์`, gift })
    }

    // ========== CREATE GIFT ==========
    const { type, value, message: giftMessage } = body

    if (!type || !value) return NextResponse.json({ error: 'กรุณาเลือกประเภทและมูลค่าของขวัญ' }, { status: 400 })
    if (type !== 'credit') return NextResponse.json({ error: 'ขณะนี้รองรับเฉพาะของขวัญประเภทเครดิตเท่านั้น' }, { status: 400 })

    const numValue = Number(value)
    if (numValue < 5 || numValue > 1000) return NextResponse.json({ error: 'มูลค่าต้องอยู่ระหว่าง 5-1,000 บาท' }, { status: 400 })

    // Check sender balance
    const sender = await prisma.user.findUnique({ where: { id: session.userId }, select: { balance: true } })
    if (!sender || sender.balance < numValue) {
      return NextResponse.json({ error: 'เครดิตไม่เพียงพอ' }, { status: 400 })
    }

    // Deduct from sender + create gift
    const giftCode = generateGiftCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 day expiry

    const [gift] = await prisma.$transaction([
      prisma.gift.create({
        data: {
          senderId: session.userId,
          type: 'credit',
          value: numValue,
          message: giftMessage || null,
          giftCode,
          expiresAt
        }
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: { balance: { decrement: numValue } }
      })
    ])

    return NextResponse.json({
      success: true,
      giftCode: gift.giftCode,
      message: `สร้างของขวัญสำเร็จ! แชร์รหัส ${gift.giftCode} ให้เพื่อน`,
      expiresAt: gift.expiresAt
    })
  } catch (error) {
    console.error('Failed to process gift:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' }, { status: 500 })
  }
}
