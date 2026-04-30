import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true },
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all'
    const skip = (page - 1) * limit

    const where: any = {}

    if (filter === 'active') {
      where.isActive = true
    } else if (filter === 'expired') {
      where.isActive = false
    }

    if (search.trim()) {
      const q = search.trim()
      where.OR = [
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { server: { name: { contains: q, mode: 'insensitive' } } },
        { remark: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.vpnOrder.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          server: { select: { name: true, flag: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.vpnOrder.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
