import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, checkImpersonation } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    const body = await request.json()
    const { vlessLink, country, flag, hostname } = body

    if (!vlessLink) {
      return NextResponse.json({ error: 'Missing VLESS link' }, { status: 400 })
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.balance < 1) {
      return NextResponse.json({ error: 'เครดิตไม่พอ (ต้องการ 1 ฿)' }, { status: 400 })
    }

    // Generate order ID
    const orderId = `VL-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create order and deduct balance in transaction
    const [, updatedUser] = await prisma.$transaction([
      // Create order record
      prisma.order.create({
        data: {
          id: orderId,
          buyerId: user.id,
          productId: 'public-vless',
          productName: `VLESS ${flag} ${country} (${hostname})`,
          productPrice: 1,
          productImage: null,
          status: 'COMPLETED'
        }
      }),
      // Deduct balance
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: 1 } }
      })
    ])

    return NextResponse.json({ 
      success: true, 
      orderId,
      vlessLink,
      newBalance: updatedUser.balance,
      message: 'ซื้อสำเร็จ'
    })

  } catch (error) {
    console.error('Buy VLESS error:', error)
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    )
  }
}
