import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET: ดึงรีวิวทั้งหมด (public) + สถานะไลค์ถ้า login
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    const userId = session?.userId || null

    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        likes: userId ? {
          where: { userId },
          select: { id: true }
        } : false,
        _count: {
          select: { likes: true }
        }
      }
    })

    // Summary stats
    const [totalReviews, avgRating, ratingDistribution] = await Promise.all([
      prisma.review.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.review.groupBy({
        by: ['rating'],
        _count: { rating: true },
        orderBy: { rating: 'desc' }
      })
    ])

    // Check if current user can write reviews (has at least 1 successful topup)
    let canReview = false
    let hasReviewed = false
    if (userId) {
      const topupCount = await prisma.topUp.count({
        where: { userId, status: 'SUCCESS', amount: { gt: 0 } }
      })
      canReview = topupCount > 0

      // Check if user already reviewed
      const existingReview = await prisma.review.findFirst({
        where: { userId }
      })
      hasReviewed = !!existingReview
    }

    const formattedReviews = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      message: r.message,
      imageUrl: r.imageUrl,
      createdAt: r.createdAt,
      user: {
        name: maskName(r.user.name),
        avatar: r.user.avatar,
        isOwner: r.user.id === userId,
      },
      likeCount: r._count.likes,
      isLiked: userId && r.likes ? r.likes.length > 0 : false,
    }))

    // Distribution as object { 5: count, 4: count, ... }
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDistribution.forEach(r => { dist[r.rating] = r._count.rating })

    return Response.json({
      success: true,
      reviews: formattedReviews,
      stats: {
        totalReviews,
        avgRating: avgRating._avg.rating || 0,
        distribution: dist,
      },
      canReview,
      hasReviewed,
      isLoggedIn: !!userId,
    })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST: สร้างรีวิวใหม่ (ต้อง login + เคยเติมเงิน)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const userId = session.userId

    // Check topup history
    const topupCount = await prisma.topUp.count({
      where: { userId, status: 'SUCCESS', amount: { gt: 0 } }
    })
    if (topupCount === 0) {
      return Response.json({ success: false, error: 'เฉพาะผู้ที่เคยเติมเงินเท่านั้นที่สามารถรีวิวได้' }, { status: 403 })
    }

    // Check if already reviewed (1 review per user)
    const existingReview = await prisma.review.findFirst({
      where: { userId }
    })
    if (existingReview) {
      return Response.json({ success: false, error: 'คุณรีวิวไปแล้ว สามารถรีวิวได้เพียง 1 ครั้ง' }, { status: 400 })
    }

    const { rating, message, imageUrl } = await req.json()

    // Validate
    if (!rating || rating < 1 || rating > 5) {
      return Response.json({ success: false, error: 'กรุณาให้คะแนน 1-5 ดาว' }, { status: 400 })
    }
    if (!message || message.trim().length < 5) {
      return Response.json({ success: false, error: 'กรุณาเขียนรีวิวอย่างน้อย 5 ตัวอักษร' }, { status: 400 })
    }
    if (message.trim().length > 500) {
      return Response.json({ success: false, error: 'รีวิวยาวเกินไป (สูงสุด 500 ตัวอักษร)' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        userId,
        rating: Math.round(rating),
        message: message.trim(),
        imageUrl: imageUrl || null,
      },
      include: {
        user: { select: { name: true, avatar: true } },
        _count: { select: { likes: true } }
      }
    })

    return Response.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        message: review.message,
        imageUrl: review.imageUrl,
        createdAt: review.createdAt,
        user: {
          name: maskName(review.user.name),
          avatar: review.user.avatar,
          isOwner: true,
        },
        likeCount: 0,
        isLiked: false,
      }
    })
  } catch (error) {
    console.error('Reviews POST error:', error)
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// mask name: show first 2 chars + ****
function maskName(name: string): string {
  if (name.length <= 2) return name + '****'
  return name.slice(0, 2) + '****'
}
