import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - list user's tickets
export async function GET() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.userId },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(tickets)
}

// POST - create new ticket
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subject, category, message, priority } = await req.json()

  if (!subject || !message) {
    return NextResponse.json({ error: 'กรุณากรอกหัวข้อและข้อความ' }, { status: 400 })
  }

  const ticket = await prisma.ticket.create({
    data: {
      userId: session.userId,
      subject,
      category: category || 'general',
      priority: priority || 'normal',
      messages: {
        create: {
          userId: session.userId,
          message,
          isAdmin: false,
        },
      },
    },
    include: { messages: true },
  })

  return NextResponse.json(ticket)
}
