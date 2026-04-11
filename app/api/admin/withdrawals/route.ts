import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET - list all withdrawals
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findFirst({
      where: { id: session.userId, OR: [{ isSuperAdmin: true }, { isAdmin: true }, { isRevenueAdmin: true }] }
    })
    if (!admin) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const rawWithdrawals = await prisma.withdrawal.findMany({
      include: {
        reseller: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const settings = await prisma.settings.findFirst({
      select: { qrCodeImage: true, bankReceiverName: true, bankAccountNumber: true }
    })

    const withdrawals = rawWithdrawals.map((w) => ({
      id: w.id,
      resellerId: w.resellerId,
      amount: w.amount,
      method: w.method,
      accountInfo: w.accountInfo,
      status: w.status,
      note: w.note,
      processedAt: w.processedAt?.toISOString(),
      createdAt: w.createdAt.toISOString(),
      shopName: w.reseller.shopName,
      userName: w.reseller.user.name,
      userEmail: w.reseller.user.email,
      walletPhone: w.reseller.walletPhone,
      qrCodeImage: w.reseller.qrCodeImage,
      adminQrCode: settings?.qrCodeImage,
      bankReceiverName: settings?.bankReceiverName,
      bankAccountNumber: settings?.bankAccountNumber,
    }))

    return Response.json({ success: true, withdrawals })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - approve/reject withdrawal
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findFirst({
      where: { id: session.userId, OR: [{ isSuperAdmin: true }, { isAdmin: true }, { isRevenueAdmin: true }] }
    })
    if (!admin) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id, status, note } = await req.json()

    if (!id || !['approved', 'rejected'].includes(status)) {
      return Response.json({ success: false, error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
    }

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } })
    if (!withdrawal) {
      return Response.json({ success: false, error: 'ไม่พบรายการ' }, { status: 404 })
    }

    if (withdrawal.status !== 'pending') {
      return Response.json({ success: false, error: 'รายการนี้ดำเนินการไปแล้ว' }, { status: 400 })
    }

    if (status === 'rejected') {
      // Refund to reseller balance
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id },
          data: { status: 'rejected', note, processedAt: new Date() }
        }),
        prisma.resellerProfile.update({
          where: { id: withdrawal.resellerId },
          data: { resellerBalance: { increment: withdrawal.amount } }
        })
      ])
    } else {
      await prisma.withdrawal.update({
        where: { id },
        data: { status: 'approved', note, processedAt: new Date() }
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
