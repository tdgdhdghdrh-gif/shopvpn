import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import crypto from 'crypto'

// Generate unique referral code
function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

// GET - Get user's referral info
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create referral code
    let user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        referralCode: true,
        referralCount: true,
        totalReferralEarned: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate referral code if not exists
    if (!user.referralCode) {
      let newCode = generateReferralCode()
      let existing = await prisma.user.findUnique({
        where: { referralCode: newCode }
      })
      
      // Ensure unique code
      while (existing) {
        newCode = generateReferralCode()
        existing = await prisma.user.findUnique({
          where: { referralCode: newCode }
        })
      }

      user = await prisma.user.update({
        where: { id: session.userId },
        data: { referralCode: newCode },
        select: {
          id: true,
          referralCode: true,
          referralCount: true,
          totalReferralEarned: true
        }
      })
    }

    // Get referral history
    const history = await prisma.referralHistory.findMany({
      where: { referrerId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get domain from request
    const host = request.headers.get('host') || 'simonvpn.darkx.shop'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const referralUrl = `${protocol}://${host}/register?ref=${user.referralCode}`

    return NextResponse.json({
      success: true,
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      totalEarned: user.totalReferralEarned || 0,
      referralUrl,
      history: history.map(h => ({
        id: h.id,
        referredName: h.referredName || 'ผู้ใช้ที่ถูกเชิญ',
        amount: h.amount,
        createdAt: h.createdAt
      }))
    })

  } catch (error) {
    console.error('Get referral error:', error)
    return NextResponse.json({ error: 'Failed to get referral info' }, { status: 500 })
  }
}
