import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// Define all missions/achievements
const MISSIONS = [
  // One-time achievements
  { id: 'first_topup', category: 'achievement', icon: '💰', title: 'เติมเงินครั้งแรก', description: 'เติมเงินเข้าระบบครั้งแรก', type: 'topup_count', target: 1 },
  { id: 'first_vpn', category: 'achievement', icon: '🌐', title: 'ซื้อ VPN ครั้งแรก', description: 'ซื้อ VPN เซิร์ฟเวอร์ครั้งแรก', type: 'vpn_count', target: 1 },
  { id: 'first_review', category: 'achievement', icon: '⭐', title: 'นักรีวิว', description: 'เขียนรีวิวครั้งแรก', type: 'review_count', target: 1 },
  { id: 'first_referral', category: 'achievement', icon: '🤝', title: 'นักชวน', description: 'ชวนเพื่อนสำเร็จ 1 คน', type: 'referral_count', target: 1 },
  { id: 'first_checkin', category: 'achievement', icon: '📅', title: 'เช็คอินครั้งแรก', description: 'เช็คอินรายวันครั้งแรก', type: 'checkin_count', target: 1 },
  { id: 'first_spin', category: 'achievement', icon: '🎡', title: 'นักหมุน', description: 'หมุนกงล้อนำโชคครั้งแรก', type: 'spin_count', target: 1 },

  // Milestone achievements
  { id: 'topup_5', category: 'milestone', icon: '🔥', title: 'ขาประจำ', description: 'เติมเงิน 5 ครั้ง', type: 'topup_count', target: 5 },
  { id: 'topup_20', category: 'milestone', icon: '💎', title: 'VIP ตัวจริง', description: 'เติมเงิน 20 ครั้ง', type: 'topup_count', target: 20 },
  { id: 'topup_500', category: 'milestone', icon: '💵', title: 'เศรษฐีน้อย', description: 'เติมเงินรวม 500 บาท', type: 'topup_amount', target: 500 },
  { id: 'topup_2000', category: 'milestone', icon: '🏆', title: 'เศรษฐีทอง', description: 'เติมเงินรวม 2,000 บาท', type: 'topup_amount', target: 2000 },
  { id: 'topup_5000', category: 'milestone', icon: '👑', title: 'เศรษฐีเพชร', description: 'เติมเงินรวม 5,000 บาท', type: 'topup_amount', target: 5000 },
  { id: 'vpn_5', category: 'milestone', icon: '🛡️', title: 'ผู้ใช้ VPN ตัวยง', description: 'ซื้อ VPN 5 ครั้ง', type: 'vpn_count', target: 5 },
  { id: 'referral_3', category: 'milestone', icon: '🌟', title: 'นักชวนมือทอง', description: 'ชวนเพื่อนสำเร็จ 3 คน', type: 'referral_count', target: 3 },
  { id: 'referral_10', category: 'milestone', icon: '🎯', title: 'นักชวนมือเพชร', description: 'ชวนเพื่อนสำเร็จ 10 คน', type: 'referral_count', target: 10 },
  { id: 'checkin_7', category: 'milestone', icon: '🔥', title: 'Streak 7 วัน', description: 'เช็คอินรายวัน 7 ครั้ง', type: 'checkin_count', target: 7 },
  { id: 'checkin_30', category: 'milestone', icon: '🏅', title: 'เช็คอิน 30 วัน', description: 'เช็คอินรวม 30 วัน', type: 'checkin_count', target: 30 },
  { id: 'member_30', category: 'milestone', icon: '📆', title: 'สมาชิก 30 วัน', description: 'เป็นสมาชิกครบ 30 วัน', type: 'member_days', target: 30 },
  { id: 'member_365', category: 'milestone', icon: '🎂', title: 'ครบรอบ 1 ปี', description: 'เป็นสมาชิกครบ 1 ปี', type: 'member_days', target: 365 },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ missions: MISSIONS.map(m => ({ ...m, progress: 0, completed: false })) })
    }

    // Fetch all stats in parallel
    const [
      topupCount,
      topupAmount,
      vpnCount,
      reviewCount,
      referralCount,
      checkinCount,
      spinCount,
      user
    ] = await Promise.all([
      prisma.topUp.count({ where: { userId: session.userId, status: 'SUCCESS' } }),
      prisma.topUp.aggregate({ where: { userId: session.userId, status: 'SUCCESS' }, _sum: { amount: true } }),
      prisma.vpnOrder.count({ where: { userId: session.userId } }),
      prisma.review.count({ where: { userId: session.userId } }),
      prisma.user.findUnique({ where: { id: session.userId }, select: { referralCount: true } }),
      prisma.dailyCheckin.count({ where: { userId: session.userId } }),
      prisma.luckyWheelSpin.count({ where: { userId: session.userId } }),
      prisma.user.findUnique({ where: { id: session.userId }, select: { createdAt: true } }),
    ])

    const totalTopup = topupAmount._sum.amount || 0
    const referrals = referralCount?.referralCount || 0
    const memberDays = user ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0

    // Calculate progress for each mission
    const missionsWithProgress = MISSIONS.map(mission => {
      let progress = 0
      switch (mission.type) {
        case 'topup_count': progress = topupCount; break
        case 'topup_amount': progress = totalTopup; break
        case 'vpn_count': progress = vpnCount; break
        case 'review_count': progress = reviewCount; break
        case 'referral_count': progress = referrals; break
        case 'checkin_count': progress = checkinCount; break
        case 'spin_count': progress = spinCount; break
        case 'member_days': progress = memberDays; break
      }
      return {
        ...mission,
        progress: Math.min(progress, mission.target),
        completed: progress >= mission.target,
        percent: Math.min(100, Math.round((progress / mission.target) * 100))
      }
    })

    const completedCount = missionsWithProgress.filter(m => m.completed).length
    const totalCount = missionsWithProgress.length

    return NextResponse.json({
      missions: missionsWithProgress,
      completedCount,
      totalCount,
      completionPercent: Math.round((completedCount / totalCount) * 100)
    })
  } catch (error) {
    console.error('Failed to get missions:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
