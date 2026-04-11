import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, checkImpersonation } from '@/lib/session'

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0] // "YYYY-MM-DD"
}

function getYesterdayDate(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

// Streak bonus: day 1=1, day 2=1, day 3=2, day 4=2, day 5=3, day 6=3, day 7=5 (reset)
function getStreakReward(streak: number): number {
  if (streak >= 7) return 5
  if (streak >= 5) return 3
  if (streak >= 3) return 2
  return 1
}

// GET - Get checkin status & history
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = getTodayDate()

    // Check if already checked in today
    const todayCheckin = await prisma.dailyCheckin.findUnique({
      where: { userId_date: { userId: session.userId, date: today } }
    })

    // Get current streak
    let currentStreak = 0
    if (todayCheckin) {
      currentStreak = todayCheckin.streak
    } else {
      // Check yesterday's streak
      const yesterday = getYesterdayDate()
      const yesterdayCheckin = await prisma.dailyCheckin.findUnique({
        where: { userId_date: { userId: session.userId, date: yesterday } }
      })
      currentStreak = yesterdayCheckin ? yesterdayCheckin.streak : 0
    }

    // Get recent 30 days history
    const history = await prisma.dailyCheckin.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'desc' },
      take: 30,
      select: { date: true, reward: true, streak: true, createdAt: true }
    })

    // Total rewards earned
    const totalRewards = await prisma.dailyCheckin.aggregate({
      where: { userId: session.userId },
      _sum: { reward: true },
      _count: true
    })

    return NextResponse.json({
      checkedInToday: !!todayCheckin,
      currentStreak,
      nextReward: getStreakReward(todayCheckin ? currentStreak : currentStreak + 1),
      history,
      totalRewards: totalRewards._sum.reward || 0,
      totalDays: totalRewards._count || 0,
      today
    })
  } catch (error) {
    console.error('Failed to get checkin status:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Check in today
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    const today = getTodayDate()

    // Check if already checked in
    const existing = await prisma.dailyCheckin.findUnique({
      where: { userId_date: { userId: session.userId, date: today } }
    })

    if (existing) {
      return NextResponse.json({ error: 'คุณเช็คอินวันนี้แล้ว!' }, { status: 429 })
    }

    // Calculate streak
    const yesterday = getYesterdayDate()
    const yesterdayCheckin = await prisma.dailyCheckin.findUnique({
      where: { userId_date: { userId: session.userId, date: yesterday } }
    })

    let streak = 1
    if (yesterdayCheckin) {
      streak = yesterdayCheckin.streak >= 7 ? 1 : yesterdayCheckin.streak + 1 // reset after 7
    }

    const reward = getStreakReward(streak)

    // Create checkin + add credit
    const [checkin] = await prisma.$transaction([
      prisma.dailyCheckin.create({
        data: { userId: session.userId, date: today, reward, streak }
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: { balance: { increment: reward } }
      })
    ])

    return NextResponse.json({
      success: true,
      reward,
      streak,
      message: streak >= 7
        ? `🎉 เช็คอินครบ 7 วัน! ได้รับ ${reward} บาท (โบนัสพิเศษ!)`
        : `✅ เช็คอินสำเร็จ! ได้รับ ${reward} บาท (วันที่ ${streak}/7)`
    })
  } catch (error) {
    console.error('Failed to checkin:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' }, { status: 500 })
  }
}
