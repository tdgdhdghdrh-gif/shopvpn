import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    // Check if already registered
    const existing = await prisma.resellerProfile.findUnique({
      where: { userId: session.userId }
    })
    if (existing) {
      return Response.json({ success: false, error: 'คุณสมัครเป็นตัวแทนขายไปแล้ว' }, { status: 400 })
    }

    const { firstName, lastName, phone, facebookUrl, shopName, shopLogo, qrCodeImage, walletPhone } = await req.json()

    if (!firstName || !lastName || !phone || !facebookUrl || !shopName || !walletPhone) {
      return Response.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
    }

    const profile = await prisma.resellerProfile.create({
      data: {
        userId: session.userId,
        firstName,
        lastName,
        phone,
        facebookUrl,
        shopName,
        shopLogo: shopLogo || null,
        qrCodeImage: qrCodeImage || null,
        walletPhone,
        status: 'pending',
        commissionRate: 10, // default 10% ให้แอดมิน
      }
    })

    return Response.json({ success: true, profile })
  } catch (error) {
    console.error('Reseller register error:', error)
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// GET - check current reseller status
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const profile = await prisma.resellerProfile.findUnique({
      where: { userId: session.userId }
    })

    return Response.json({ success: true, profile })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
