import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// POST: toggle like/unlike
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const { reviewId } = await req.json()
    if (!reviewId) {
      return Response.json({ success: false, error: 'ไม่พบรีวิว' }, { status: 400 })
    }

    const userId = session.userId

    // Check if review exists
    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) {
      return Response.json({ success: false, error: 'ไม่พบรีวิว' }, { status: 404 })
    }

    // Toggle like
    const existingLike = await prisma.reviewLike.findUnique({
      where: { reviewId_userId: { reviewId, userId } }
    })

    if (existingLike) {
      // Unlike
      await prisma.reviewLike.delete({ where: { id: existingLike.id } })
      const newCount = await prisma.reviewLike.count({ where: { reviewId } })
      return Response.json({ success: true, isLiked: false, likeCount: newCount })
    } else {
      // Like
      await prisma.reviewLike.create({ data: { reviewId, userId } })
      const newCount = await prisma.reviewLike.count({ where: { reviewId } })
      return Response.json({ success: true, isLiked: true, likeCount: newCount })
    }
  } catch (error) {
    console.error('Review like error:', error)
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
