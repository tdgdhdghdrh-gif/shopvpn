import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, checkImpersonation } from '@/lib/session'

// GET - Get active prizes + check if user can spin today
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    const prizes = await prisma.luckyWheelPrize.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, label: true, type: true, value: true, color: true, probability: true }
    })

    let canSpin = false
    let lastSpin: Date | null = null
    let todaySpins = 0

    if (session?.isLoggedIn && session?.userId) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const spinsToday = await prisma.luckyWheelSpin.count({
        where: {
          userId: session.userId,
          createdAt: { gte: today, lt: tomorrow }
        }
      })

      todaySpins = spinsToday
      canSpin = spinsToday === 0 // 1 spin per day free

      const lastSpinRecord = await prisma.luckyWheelSpin.findFirst({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
      lastSpin = lastSpinRecord?.createdAt || null
    }

    return NextResponse.json({ prizes, canSpin, lastSpin, todaySpins })
  } catch (error) {
    console.error('Failed to get lucky wheel:', error)
    return NextResponse.json({ error: 'Failed to get lucky wheel' }, { status: 500 })
  }
}

// POST - Spin the wheel
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    // Check if user already spun today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const spinsToday = await prisma.luckyWheelSpin.count({
      where: {
        userId: session.userId,
        createdAt: { gte: today, lt: tomorrow }
      }
    })

    if (spinsToday > 0) {
      return NextResponse.json({ error: 'คุณหมุนกงล้อวันนี้แล้ว กลับมาใหม่พรุ่งนี้นะ!' }, { status: 429 })
    }

    // Get active prizes
    const prizes = await prisma.luckyWheelPrize.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    if (prizes.length === 0) {
      return NextResponse.json({ error: 'ยังไม่มีรางวัลในกงล้อ' }, { status: 400 })
    }

    // Weighted random selection
    const totalWeight = prizes.reduce((sum, p) => sum + p.probability, 0)
    let random = Math.random() * totalWeight
    let selectedPrize = prizes[0]

    for (const prize of prizes) {
      random -= prize.probability
      if (random <= 0) {
        selectedPrize = prize
        break
      }
    }

    // Record the spin
    const spin = await prisma.luckyWheelSpin.create({
      data: {
        userId: session.userId,
        prizeId: selectedPrize.id,
        prizeLabel: selectedPrize.label,
        prizeType: selectedPrize.type,
        prizeValue: selectedPrize.value
      }
    })

    // Apply reward
    let rewardMessage = ''
    if (selectedPrize.type === 'credit' && selectedPrize.value > 0) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { balance: { increment: selectedPrize.value } }
      })
      rewardMessage = `ได้รับเครดิต ${selectedPrize.value} บาท!`
    } else if (selectedPrize.type === 'discount' && selectedPrize.value > 0) {
      rewardMessage = `ได้รับส่วนลด ${selectedPrize.value}%! (ใช้ได้ในการซื้อครั้งถัดไป)`
    } else if (selectedPrize.type === 'vpn_days' && selectedPrize.value > 0) {
      rewardMessage = `ได้รับ VPN ฟรี ${selectedPrize.value} วัน! (ติดต่อแอดมินเพื่อรับสิทธิ์)`
    } else {
      rewardMessage = 'เสียใจด้วย ไม่ได้รางวัล ลองใหม่พรุ่งนี้นะ!'
    }

    return NextResponse.json({
      success: true,
      prize: {
        id: selectedPrize.id,
        label: selectedPrize.label,
        type: selectedPrize.type,
        value: selectedPrize.value,
        color: selectedPrize.color
      },
      rewardMessage,
      spinId: spin.id
    })
  } catch (error) {
    console.error('Failed to spin wheel:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' }, { status: 500 })
  }
}
