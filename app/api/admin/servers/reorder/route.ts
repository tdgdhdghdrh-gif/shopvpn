import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function ensureAdmin() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true },
  })
  if (!user?.isAdmin && !user?.isSuperAdmin) return null
  return user
}

export async function POST(request: NextRequest) {
  const user = await ensureAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const orderedIds: string[] = Array.isArray(body?.orderedIds) ? body.orderedIds : []
  if (orderedIds.length === 0) {
    return NextResponse.json({ error: 'orderedIds required' }, { status: 400 })
  }

  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.vpnServer.update({
        where: { id },
        data: { sortOrder: idx },
      })
    )
  )

  return NextResponse.json({ success: true, count: orderedIds.length })
}
