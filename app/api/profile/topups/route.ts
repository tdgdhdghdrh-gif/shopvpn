import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const topups = await prisma.topUp.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        note: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ topups })
  } catch (error) {
    console.error('Failed to fetch topups:', error)
    return NextResponse.json({ error: 'Failed to fetch topups' }, { status: 500 })
  }
}
