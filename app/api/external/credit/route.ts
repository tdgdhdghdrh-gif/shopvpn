import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, logApiUsage } from '../validate'

// POST /api/external/credit
// body: { email: "xxx", amount: 100, action: "add" | "deduct", note?: "..." }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, action, note } = body

    if (!email || !amount || !action) {
      return NextResponse.json(
        { success: false, error: 'Required fields: email, amount, action ("add" or "deduct")' },
        { status: 400 }
      )
    }

    if (action !== 'add' && action !== 'deduct') {
      return NextResponse.json(
        { success: false, error: 'action must be "add" or "deduct"' },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'amount must be a positive number' },
        { status: 400 }
      )
    }

    // เช็คสิทธิ์ตาม action
    const permission = action === 'add' ? 'credit:add' : 'credit:deduct'
    const result = await validateApiKey(request, permission)
    if (result.error) return result.error

    const { apiKey } = result

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, balance: true },
    })

    if (!user) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      await logApiUsage(apiKey.id, `credit:${action}`, email, 'User not found', ip, false)
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // เช็คยอดเงินก่อนหัก
    if (action === 'deduct' && user.balance < parsedAmount) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      await logApiUsage(
        apiKey.id,
        'credit:deduct',
        user.email,
        `Insufficient balance: ${user.balance} < ${parsedAmount}`,
        ip,
        false
      )
      return NextResponse.json(
        { success: false, error: `Insufficient balance. Current: ${user.balance}, Requested: ${parsedAmount}` },
        { status: 400 }
      )
    }

    const newBalance = action === 'add'
      ? user.balance + parsedAmount
      : user.balance - parsedAmount

    // อัปเดตยอดเงิน + สร้าง TopUp record
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: newBalance },
      }),
      prisma.topUp.create({
        data: {
          userId: user.id,
          amount: action === 'add' ? parsedAmount : -parsedAmount,
          method: 'api',
          note: note || `API ${action}: ${parsedAmount} (key: ${apiKey.name})`,
          status: 'SUCCESS',
        },
      }),
    ])

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    await logApiUsage(
      apiKey.id,
      `credit:${action}`,
      user.email,
      `${action === 'add' ? '+' : '-'}${parsedAmount} credit | ${user.balance} -> ${newBalance}`,
      ip,
      true
    )

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        previousBalance: user.balance,
        newBalance,
        action,
        amount: parsedAmount,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
