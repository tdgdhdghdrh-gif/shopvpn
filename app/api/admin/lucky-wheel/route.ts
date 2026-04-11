import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function requireAdmin() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isSuperAdmin: true, isAdmin: true }
  })
  if (!user?.isSuperAdmin && !user?.isAdmin) return null
  return user
}

// GET - List all prizes (admin)
export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const prizes = await prisma.luckyWheelPrize.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { spins: true } } }
    })

    // Recent spins
    const recentSpins = await prisma.luckyWheelSpin.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    })

    // Stats
    const totalSpins = await prisma.luckyWheelSpin.count()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todaySpins = await prisma.luckyWheelSpin.count({
      where: { createdAt: { gte: todayStart } }
    })

    return NextResponse.json({ prizes, recentSpins, stats: { totalSpins, todaySpins } })
  } catch (error) {
    console.error('Failed to get prizes:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Create/Update/Delete prize
export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, id, label, type, value, color, probability, isActive, sortOrder } = body

    if (action === 'delete' && id) {
      await prisma.luckyWheelPrize.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    if (action === 'update' && id) {
      const prize = await prisma.luckyWheelPrize.update({
        where: { id },
        data: {
          ...(label !== undefined && { label }),
          ...(type !== undefined && { type }),
          ...(value !== undefined && { value: Number(value) }),
          ...(color !== undefined && { color }),
          ...(probability !== undefined && { probability: Number(probability) }),
          ...(isActive !== undefined && { isActive }),
          ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        }
      })
      return NextResponse.json({ success: true, prize })
    }

    // Create
    if (!label || !type) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อรางวัลและประเภท' }, { status: 400 })
    }

    const prize = await prisma.luckyWheelPrize.create({
      data: {
        label,
        type,
        value: Number(value || 0),
        color: color || '#3B82F6',
        probability: Number(probability || 10),
        isActive: isActive !== false,
        sortOrder: Number(sortOrder || 0)
      }
    })

    return NextResponse.json({ success: true, prize })
  } catch (error) {
    console.error('Failed to manage prize:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
