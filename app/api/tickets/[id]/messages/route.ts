import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - get messages for a ticket
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const ticket = await prisma.ticket.findFirst({
    where: { id, userId: session.userId },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'ไม่พบ Ticket' }, { status: 404 })
  }

  const messages = await prisma.ticketMessage.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}

// POST - send message to ticket
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { message } = await req.json()

  if (!message) {
    return NextResponse.json({ error: 'กรุณากรอกข้อความ' }, { status: 400 })
  }

  const ticket = await prisma.ticket.findFirst({
    where: { id, userId: session.userId },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'ไม่พบ Ticket' }, { status: 404 })
  }

  if (ticket.status === 'closed') {
    return NextResponse.json({ error: 'Ticket นี้ถูกปิดแล้ว' }, { status: 400 })
  }

  const [newMessage] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId: id,
        userId: session.userId,
        message,
        isAdmin: false,
      },
    }),
    prisma.ticket.update({
      where: { id },
      data: { status: 'open', updatedAt: new Date() },
    }),
  ])

  return NextResponse.json(newMessage)
}
