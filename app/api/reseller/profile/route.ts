import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET - get reseller profile
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const profile = await prisma.resellerProfile.findUnique({
      where: { userId: session.userId }
    })

    if (!profile || profile.status !== 'approved') {
      return Response.json({ success: false, error: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    return Response.json({ success: true, profile })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - update reseller profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const profile = await prisma.resellerProfile.findUnique({
      where: { userId: session.userId }
    })

    if (!profile || profile.status !== 'approved') {
      return Response.json({ success: false, error: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const { firstName, lastName, phone, facebookUrl, shopName, shopLogo, qrCodeImage, walletPhone } = await req.json()

    const updated = await prisma.resellerProfile.update({
      where: { id: profile.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(facebookUrl && { facebookUrl }),
        ...(shopName && { shopName }),
        ...(shopLogo !== undefined && { shopLogo }),
        ...(qrCodeImage !== undefined && { qrCodeImage }),
        ...(walletPhone && { walletPhone }),
      }
    })

    return Response.json({ success: true, profile: updated })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
