import { NextRequest } from 'next/server'
import { getSession, checkImpersonation } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// POST - request withdrawal
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    const profile = await prisma.resellerProfile.findUnique({
      where: { userId: session.userId }
    })

    if (!profile || profile.status !== 'approved') {
      return Response.json({ success: false, error: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const { amount, method, accountInfo } = await req.json()

    if (!amount || amount <= 0) {
      return Response.json({ success: false, error: 'จำนวนเงินไม่ถูกต้อง' }, { status: 400 })
    }

    if (amount > profile.resellerBalance) {
      return Response.json({ success: false, error: `ยอดเงินไม่เพียงพอ (มี: ${profile.resellerBalance} ฿)` }, { status: 400 })
    }

    if (amount < 10) {
      return Response.json({ success: false, error: 'ถอนขั้นต่ำ 10 บาท' }, { status: 400 })
    }

    // Check if there's a pending withdrawal
    const pendingCount = await prisma.withdrawal.count({
      where: { resellerId: profile.id, status: 'pending' }
    })

    if (pendingCount > 0) {
      return Response.json({ success: false, error: 'มีรายการถอนเงินที่รอดำเนินการอยู่ กรุณารอแอดมินอนุมัติก่อน' }, { status: 400 })
    }

    // Create withdrawal and deduct from reseller balance atomically
    const [withdrawal] = await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          resellerId: profile.id,
          amount: parseFloat(String(amount)),
          method: method || 'wallet',
          accountInfo: accountInfo || profile.walletPhone,
          status: 'pending',
        }
      }),
      prisma.resellerProfile.update({
        where: { id: profile.id },
        data: { resellerBalance: { decrement: parseFloat(String(amount)) } }
      })
    ])

    return Response.json({ success: true, withdrawal })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// GET - list my withdrawals
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

    const withdrawals = await prisma.withdrawal.findMany({
      where: { resellerId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return Response.json({ success: true, withdrawals, balance: profile.resellerBalance })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
