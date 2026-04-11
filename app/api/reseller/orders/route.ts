import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

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

    const orders = await prisma.resellerOrder.findMany({
      where: { resellerId: profile.id },
      include: {
        buyer: { select: { name: true, email: true } },
        server: { select: { name: true, flag: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return Response.json({ success: true, orders })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
