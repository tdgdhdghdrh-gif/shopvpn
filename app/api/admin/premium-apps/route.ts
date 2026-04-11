import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function requireAdminSession() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true }
  })
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

/** Count non-empty lines in stockCodes text */
function countStockLines(stockCodes: string | null | undefined): number {
  if (!stockCodes || !stockCodes.trim()) return 0
  return stockCodes.split('\n').filter(line => line.trim() !== '').length
}

// GET - List all premium apps (admin sees all including inactive)
export async function GET() {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apps = await prisma.premiumApp.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { orders: true } }
      }
    })

    return NextResponse.json({ success: true, apps })
  } catch (error) {
    console.error('GET premium-apps error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - Create new premium app
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, description, price, imageUrl, category, platform, features, downloadUrl, instructions, stockCodes, isActive, isFeatured, sortOrder } = body

    if (!name?.trim()) return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อสินค้า' }, { status: 400 })
    if (price === undefined || price < 0) return NextResponse.json({ success: false, error: 'กรุณาระบุราคา' }, { status: 400 })
    if (!imageUrl?.trim()) return NextResponse.json({ success: false, error: 'กรุณาใส่รูปภาพ' }, { status: 400 })

    // Auto-calculate stock from stockCodes lines
    const stockCodesStr = stockCodes?.trim() || null
    const stock = countStockLines(stockCodesStr)

    const app = await prisma.premiumApp.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        price: parseFloat(price),
        imageUrl: imageUrl.trim(),
        category: category || 'general',
        platform: platform || 'all',
        features: features || null,
        downloadUrl: downloadUrl?.trim() || null,
        instructions: instructions?.trim() || null,
        stockCodes: stockCodesStr,
        stock,
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
        sortOrder: sortOrder || 0,
      }
    })

    return NextResponse.json({ success: true, app })
  } catch (error) {
    console.error('POST premium-apps error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - Update premium app
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, ...fields } = body

    if (!id) return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })

    const data: any = {}
    if (fields.name !== undefined) data.name = fields.name.trim()
    if (fields.description !== undefined) data.description = fields.description.trim()
    if (fields.price !== undefined) data.price = parseFloat(fields.price)
    if (fields.imageUrl !== undefined) data.imageUrl = fields.imageUrl.trim()
    if (fields.category !== undefined) data.category = fields.category
    if (fields.platform !== undefined) data.platform = fields.platform
    if (fields.features !== undefined) data.features = fields.features
    if (fields.downloadUrl !== undefined) data.downloadUrl = fields.downloadUrl?.trim() || null
    if (fields.instructions !== undefined) data.instructions = fields.instructions?.trim() || null
    if (fields.isActive !== undefined) data.isActive = fields.isActive
    if (fields.isFeatured !== undefined) data.isFeatured = fields.isFeatured
    if (fields.sortOrder !== undefined) data.sortOrder = fields.sortOrder

    // If stockCodes is being updated, auto-calculate stock
    if (fields.stockCodes !== undefined) {
      const stockCodesStr = fields.stockCodes?.trim() || null
      data.stockCodes = stockCodesStr
      data.stock = countStockLines(stockCodesStr)
    }

    const app = await prisma.premiumApp.update({ where: { id }, data })

    return NextResponse.json({ success: true, app })
  } catch (error) {
    console.error('PUT premium-apps error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - Delete premium app
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdminSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })

    await prisma.premiumApp.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE premium-apps error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
