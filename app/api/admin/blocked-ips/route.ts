import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

// GET - ดู blocked IPs (admin only)
export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isAdmin: true, isSuperAdmin: true }
    })

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const blockedIPs = await prisma.blockedIP.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ blockedIPs })
  } catch (error) {
    console.error('[Blocked IPs] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST - บล็อก IP ใหม่ (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isAdmin: true, isSuperAdmin: true }
    })

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { ipAddress, reason, expiresInHours } = await request.json()

    if (!ipAddress) {
      return NextResponse.json({ error: 'กรุณาระบุ IP' }, { status: 400 })
    }

    // เช็คว่าบล็อกอยู่แล้วหรือไม่
    const existing = await prisma.blockedIP.findUnique({
      where: { ipAddress }
    })

    if (existing) {
      return NextResponse.json({ error: 'IP นี้ถูกบล็อกอยู่แล้ว' }, { status: 400 })
    }

    const blocked = await prisma.blockedIP.create({
      data: {
        ipAddress,
        reason: reason || 'บล็อกโดยแอดมิน',
        blockedBy: session.userId,
        expiresAt: expiresInHours 
          ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000) 
          : null, // null = บล็อกถาวร
      }
    })

    return NextResponse.json({ success: true, blocked })
  } catch (error) {
    console.error('[Block IP] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE - ปลดบล็อก IP (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isAdmin: true, isSuperAdmin: true }
    })

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { ipAddress } = await request.json()

    if (!ipAddress) {
      return NextResponse.json({ error: 'กรุณาระบุ IP' }, { status: 400 })
    }

    await prisma.blockedIP.delete({
      where: { ipAddress }
    })

    return NextResponse.json({ success: true, message: `ปลดบล็อก ${ipAddress} แล้ว` })
  } catch (error) {
    console.error('[Unblock IP] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
