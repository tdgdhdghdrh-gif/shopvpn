import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isSuperAdmin: true } })
    if (!user?.isSuperAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const chats = await prisma.aiChat.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { id: true, title: true, updatedAt: true },
    })

    return NextResponse.json({ success: true, chats })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
