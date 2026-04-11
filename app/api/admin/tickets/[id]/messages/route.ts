import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// POST - admin reply to ticket
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isSuperAdmin: true, isAdmin: true },
  })

  if (!user?.isSuperAdmin && !user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { message } = await req.json()

  if (!message) {
    return NextResponse.json({ error: 'กรุณากรอกข้อความ' }, { status: 400 })
  }

  const ticket = await prisma.ticket.findUnique({ where: { id } })

  if (!ticket) {
    return NextResponse.json({ error: 'ไม่พบ Ticket' }, { status: 404 })
  }

  const [newMessage] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId: id,
        userId: session.userId,
        message,
        isAdmin: true,
      },
    }),
    prisma.ticket.update({
      where: { id },
      data: { status: 'answered', updatedAt: new Date() },
    }),
  ])

  return NextResponse.json(newMessage)
}
