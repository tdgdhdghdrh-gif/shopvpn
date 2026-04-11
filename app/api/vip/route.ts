import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// VIP Tiers based on total topup amount
const VIP_TIERS = [
  { tier: 'Bronze', minSpend: 0, icon: '🥉', color: '#CD7F32', discount: 0, referralBonus: 0, perks: ['เข้าถึงเซิร์ฟเวอร์ทั่วไป'] },
  { tier: 'Silver', minSpend: 500, icon: '🥈', color: '#C0C0C0', discount: 3, referralBonus: 5, perks: ['ส่วนลด 3% ทุกการซื้อ', 'โบนัสแนะนำเพิ่ม 5 บาท'] },
  { tier: 'Gold', minSpend: 2000, icon: '🥇', color: '#FFD700', discount: 5, referralBonus: 10, perks: ['ส่วนลด 5% ทุกการซื้อ', 'โบนัสแนะนำเพิ่ม 10 บาท', 'สิทธิ์ซัพพอร์ตเร่งด่วน'] },
  { tier: 'Diamond', minSpend: 5000, icon: '💎', color: '#B9F2FF', discount: 10, referralBonus: 20, perks: ['ส่วนลด 10% ทุกการซื้อ', 'โบนัสแนะนำเพิ่ม 20 บาท', 'สิทธิ์ซัพพอร์ตเร่งด่วน', 'เข้าถึงเซิร์ฟเวอร์ VIP', 'Badge Diamond หน้าโปรไฟล์'] },
]

function getTier(totalSpend: number) {
  let result = VIP_TIERS[0]
  for (const tier of VIP_TIERS) {
    if (totalSpend >= tier.minSpend) result = tier
  }
  return result
}

function getNextTier(totalSpend: number) {
  for (const tier of VIP_TIERS) {
    if (totalSpend < tier.minSpend) return tier
  }
  return null // Already max tier
}

// GET - Get VIP status
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      // Return tiers info for non-logged in users
      return NextResponse.json({ tiers: VIP_TIERS, currentTier: null })
    }

    // Calculate total topup amount
    const totalTopup = await prisma.topUp.aggregate({
      where: { userId: session.userId, status: 'SUCCESS' },
      _sum: { amount: true }
    })

    const totalSpend = totalTopup._sum.amount || 0
    const currentTier = getTier(totalSpend)
    const nextTier = getNextTier(totalSpend)
    const amountToNext = nextTier ? nextTier.minSpend - totalSpend : 0
    const progressPercent = nextTier
      ? Math.min(100, ((totalSpend - (VIP_TIERS.find(t => t.tier === currentTier.tier)?.minSpend || 0)) / (nextTier.minSpend - (VIP_TIERS.find(t => t.tier === currentTier.tier)?.minSpend || 0))) * 100)
      : 100

    // Get user's topup count
    const topupCount = await prisma.topUp.count({
      where: { userId: session.userId, status: 'SUCCESS' }
    })

    // Member since
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { createdAt: true, name: true, avatar: true }
    })

    return NextResponse.json({
      tiers: VIP_TIERS,
      currentTier,
      nextTier,
      totalSpend,
      amountToNext,
      progressPercent: Math.round(progressPercent),
      topupCount,
      memberSince: user?.createdAt,
      userName: user?.name,
      userAvatar: user?.avatar
    })
  } catch (error) {
    console.error('Failed to get VIP status:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
