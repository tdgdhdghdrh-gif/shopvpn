import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - get single ticket with all messages (admin)
export async function GET(
  _req: NextRequest,
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

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, balance: true, createdAt: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'ไม่พบ Ticket' }, { status: 404 })
  }

  return NextResponse.json(ticket)
}

// PATCH - update ticket status (admin)
export async function PATCH(
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
  const { status } = await req.json()

  if (!['open', 'answered', 'closed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json(ticket)
}

// DELETE - delete ticket (admin)
export async function DELETE(
  _req: NextRequest,
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

  await prisma.ticket.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
