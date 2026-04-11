import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, checkImpersonation } from '@/lib/session'

// GET - List active premium apps (public)
export async function GET() {
  try {
    const apps = await prisma.premiumApp.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        platform: true,
        features: true,
        stock: true,
        sold: true,
        isFeatured: true,
        sortOrder: true,
      }
    })

    return NextResponse.json({ success: true, apps })
  } catch (error) {
    console.error('GET public premium-apps error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - Buy a premium app
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    const { appId } = await request.json()
    if (!appId) return NextResponse.json({ success: false, error: 'ไม่พบสินค้าที่ต้องการซื้อ' }, { status: 400 })

    // Use interactive transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Find the app (lock row for update via transaction)
      const app = await tx.premiumApp.findUnique({ where: { id: appId } })
      if (!app || !app.isActive) {
        throw new Error('ไม่พบสินค้านี้หรือหยุดจำหน่ายแล้ว')
      }

      // Parse stockCodes — extract top line
      const stockLines = (app.stockCodes || '').split('\n').filter(line => line.trim() !== '')
      
      if (stockLines.length === 0) {
        throw new Error('สินค้าหมดแล้ว')
      }

      // Pop the top line as the delivered code
      const deliveredCode = stockLines[0].trim()
      const remainingLines = stockLines.slice(1)
      const newStockCodes = remainingLines.length > 0 ? remainingLines.join('\n') : null
      const newStock = remainingLines.length

      // Check user balance
      const user = await tx.user.findUnique({ where: { id: session.userId! }, select: { id: true, balance: true } })
      if (!user) throw new Error('ไม่พบผู้ใช้')

      if (user.balance < app.price) {
        throw new Error(`NEED_TOPUP:ยอดเงินไม่เพียงพอ (ต้องการ ${app.price} ฿, มี ${user.balance} ฿)`)
      }

      // Create order with deliveredCode
      const order = await tx.premiumAppOrder.create({
        data: {
          userId: session.userId!,
          appId: app.id,
          appName: app.name,
          price: app.price,
          deliveredCode,
        }
      })

      // Deduct user balance
      await tx.user.update({
        where: { id: session.userId! },
        data: { balance: { decrement: app.price } }
      })

      // Update app: remove used code, update stock, increment sold
      await tx.premiumApp.update({
        where: { id: app.id },
        data: {
          stockCodes: newStockCodes,
          stock: newStock,
          sold: { increment: 1 },
        }
      })

      return {
        order,
        deliveredCode,
        downloadUrl: app.downloadUrl,
        instructions: app.instructions,
      }
    })

    return NextResponse.json({ 
      success: true, 
      order: result.order,
      deliveredCode: result.deliveredCode,
      downloadUrl: result.downloadUrl || null,
      instructions: result.instructions || null,
    })
  } catch (error: any) {
    console.error('POST buy premium-app error:', error)
    const msg = error?.message || 'เกิดข้อผิดพลาดในการซื้อ'
    
    if (msg.startsWith('NEED_TOPUP:')) {
      return NextResponse.json({ 
        success: false, 
        error: msg.replace('NEED_TOPUP:', ''),
        needTopup: true
      }, { status: 400 })
    }
    
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
