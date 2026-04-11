import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - อันดับนักแนะนำ + ข้อมูลส่วนตัว
export async function GET() {
  try {
    const session = await getSession()

    // Top 50 ผู้แนะนำมากที่สุด
    const topReferrers = await prisma.user.findMany({
      where: { referralCount: { gt: 0 } },
      select: {
        id: true,
        name: true,
        avatar: true,
        referralCount: true,
        totalReferralEarned: true,
        createdAt: true,
      },
      orderBy: [
        { referralCount: 'desc' },
        { totalReferralEarned: 'desc' },
      ],
      take: 50,
    })

    // Badge tiers
    // Bronze: 1-4, Silver: 5-14, Gold: 15-29, Diamond: 30+
    const leaderboard = topReferrers.map((user, index) => {
      let badge = 'Bronze'
      let badgeColor = '#CD7F32'
      if (user.referralCount >= 30) { badge = 'Diamond'; badgeColor = '#B9F2FF' }
      else if (user.referralCount >= 15) { badge = 'Gold'; badgeColor = '#FFD700' }
      else if (user.referralCount >= 5) { badge = 'Silver'; badgeColor = '#C0C0C0' }

      return {
        rank: index + 1,
        name: user.name,
        avatar: user.avatar,
        referralCount: user.referralCount,
        totalEarned: user.totalReferralEarned,
        badge,
        badgeColor,
        joinedAt: user.createdAt,
      }
    })

    // ข้อมูลส่วนตัวถ้า login
    let myStats = null
    if (session.isLoggedIn && session.userId) {
      const me = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          referralCode: true,
          referralCount: true,
          totalReferralEarned: true,
        },
      })
      if (me) {
        const myRank = topReferrers.findIndex(u => u.id === session.userId)
        let badge = 'Bronze'
        if (me.referralCount >= 30) badge = 'Diamond'
        else if (me.referralCount >= 15) badge = 'Gold'
        else if (me.referralCount >= 5) badge = 'Silver'
        else if (me.referralCount === 0) badge = 'ยังไม่มี'

        // ดึงประวัติ referral ล่าสุด
        const recentReferrals = await prisma.referralHistory.findMany({
          where: { referrerId: session.userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            referredName: true,
            amount: true,
            type: true,
            createdAt: true,
          },
        })

        myStats = {
          referralCode: me.referralCode,
          referralCount: me.referralCount,
          totalEarned: me.totalReferralEarned,
          rank: myRank >= 0 ? myRank + 1 : null,
          badge,
          recentReferrals,
        }
      }
    }

    // Stats รวม
    const totalReferrals = await prisma.user.aggregate({
      _sum: { referralCount: true },
    })
    const totalEarnings = await prisma.user.aggregate({
      _sum: { totalReferralEarned: true },
    })
    const totalReferrers = await prisma.user.count({
      where: { referralCount: { gt: 0 } },
    })

    return NextResponse.json({
      leaderboard,
      myStats,
      globalStats: {
        totalReferrals: totalReferrals._sum.referralCount || 0,
        totalEarnings: totalEarnings._sum.totalReferralEarned || 0,
        totalReferrers,
      },
    })
  } catch (error) {
    console.error('Referral leaderboard error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
