import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET - list all reseller applications
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findFirst({
      where: { id: session.userId, isSuperAdmin: true }
    })
    if (!admin) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const resellers = await prisma.resellerProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { servers: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ success: true, resellers })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - approve/reject reseller
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findFirst({
      where: { id: session.userId, isSuperAdmin: true }
    })
    if (!admin) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id, status, commissionRate } = await req.json()

    if (!id || !['approved', 'rejected'].includes(status)) {
      return Response.json({ success: false, error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
    }

    const updated = await prisma.resellerProfile.update({
      where: { id },
      data: {
        status,
        ...(commissionRate !== undefined && { commissionRate: parseFloat(String(commissionRate)) }),
      }
    })

    return Response.json({ success: true, reseller: updated })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
