import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - get single ticket with messages
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
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'ไม่พบ Ticket' }, { status: 404 })
  }

  return NextResponse.json(ticket)
}

// PATCH - close ticket (user can close own ticket)
export async function PATCH(
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

  const updated = await prisma.ticket.update({
    where: { id },
    data: { status: 'closed' },
  })

  return NextResponse.json(updated)
}
