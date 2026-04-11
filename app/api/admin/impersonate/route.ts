import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// POST — Start impersonating a user (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Cannot start impersonation while already impersonating
    if (session.isImpersonating) {
      return NextResponse.json({ error: 'กรุณาออกจากโหมดดูก่อน' }, { status: 400 })
    }

    // Check that the current user is a Super Admin
    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, isSuperAdmin: true }
    })

    if (!admin || !admin.isSuperAdmin) {
      return NextResponse.json({ error: 'เฉพาะ Super Admin เท่านั้น' }, { status: 403 })
    }

    const { userId } = await request.json()
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'ต้องระบุ userId' }, { status: 400 })
    }

    // Cannot impersonate yourself
    if (userId === admin.id) {
      return NextResponse.json({ error: 'ไม่สามารถเข้าดูบัญชีตัวเองได้' }, { status: 400 })
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, balance: true, isSuperAdmin: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }

    // Cannot impersonate another Super Admin
    if (targetUser.isSuperAdmin) {
      return NextResponse.json({ error: 'ไม่สามารถเข้าดูบัญชี Super Admin ได้' }, { status: 403 })
    }

    // Save admin's real identity, then switch session to target user
    session.realAdminId = admin.id
    session.realAdminEmail = admin.email
    session.isImpersonating = true
    session.userId = targetUser.id
    session.email = targetUser.email
    session.name = targetUser.name
    session.balance = targetUser.balance
    await session.save()

    return NextResponse.json({ 
      success: true, 
      message: `กำลังดูในฐานะ ${targetUser.name}`,
      userName: targetUser.name
    })
  } catch (error) {
    console.error('Impersonate error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE — Stop impersonating, return to admin account
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.isImpersonating || !session.realAdminId) {
      return NextResponse.json({ error: 'ไม่ได้อยู่ในโหมดดูบัญชี' }, { status: 400 })
    }

    // Restore admin session
    const admin = await prisma.user.findUnique({
      where: { id: session.realAdminId },
      select: { id: true, email: true, name: true, balance: true }
    })

    if (!admin) {
      // If somehow the admin was deleted, just log out
      session.userId = undefined
      session.email = undefined
      session.name = undefined
      session.balance = undefined
      session.isLoggedIn = false
      session.isImpersonating = undefined
      session.realAdminId = undefined
      session.realAdminEmail = undefined
      await session.save()
      return NextResponse.json({ error: 'ไม่พบบัญชีแอดมิน' }, { status: 404 })
    }

    // Restore to admin
    session.userId = admin.id
    session.email = admin.email
    session.name = admin.name
    session.balance = admin.balance
    session.isImpersonating = undefined
    session.realAdminId = undefined
    session.realAdminEmail = undefined
    await session.save()

    return NextResponse.json({ 
      success: true, 
      message: 'กลับสู่บัญชีแอดมินแล้ว' 
    })
  } catch (error) {
    console.error('Exit impersonate error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// GET — Check impersonation status
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ isImpersonating: false })
    }

    if (session.isImpersonating && session.realAdminId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, email: true, balance: true, avatar: true }
      })

      return NextResponse.json({
        isImpersonating: true,
        targetUser: targetUser ? {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          balance: targetUser.balance,
          avatar: targetUser.avatar,
        } : null,
        realAdminEmail: session.realAdminEmail,
      })
    }

    return NextResponse.json({ isImpersonating: false })
  } catch (error) {
    return NextResponse.json({ isImpersonating: false })
  }
}
