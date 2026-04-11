import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// POST - Give discount to user
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!admin?.isSuperAdmin && !admin?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, days } = body

    if (!userId || !days || days < 1 || days > 30) {
      return NextResponse.json(
        { error: 'กรุณาระบุผู้ใช้และจำนวนวัน (1-30 วัน)' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    // Calculate discount expiry date
    const now = new Date()
    const discountExpiry = new Date(now)
    discountExpiry.setDate(discountExpiry.getDate() + parseInt(days))

    // Update user with discount
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { discountExpiry },
      select: {
        id: true,
        name: true,
        email: true,
        discountExpiry: true,
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: `ให้ส่วนลดสำเร็จ ${days} วัน (หมดอายุ ${discountExpiry.toLocaleDateString('th-TH')})`
    })
  } catch (error) {
    console.error('Failed to give discount:', error)
    return NextResponse.json(
      { error: 'Failed to give discount' },
      { status: 500 }
    )
  }
}

// DELETE - Remove discount from user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!admin?.isSuperAdmin && !admin?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'กรุณาระบุรหัสผู้ใช้' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    // Remove discount
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { discountExpiry: null },
      select: {
        id: true,
        name: true,
        email: true,
        discountExpiry: true,
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: 'ยกเลิกส่วนลดสำเร็จ'
    })
  } catch (error) {
    console.error('Failed to remove discount:', error)
    return NextResponse.json(
      { error: 'Failed to remove discount' },
      { status: 500 }
    )
  }
}
