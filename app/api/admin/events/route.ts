import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

// Get all discount events
export async function GET() {
  try {
    await requireAdmin()
    
    const events = await prisma.discountEvent.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, events })
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}

// Create new event
export async function POST(req: Request) {
  try {
    await requireAdmin()
    
    const body = await req.json()
    const { name, description, marqueeText, discountPercent, minimumDays, startDate, endDate } = body
    
    if (!name || !discountPercent || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }
    
    const event = await prisma.discountEvent.create({
      data: {
        name,
        description,
        marqueeText: marqueeText || '🔥 ลดราคาพิเศษ! 🔥',
        discountPercent: parseInt(discountPercent),
        minimumDays: minimumDays ? parseInt(minimumDays) : 1,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true
      }
    })
    
    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' })
  }
}

// Update event
export async function PUT(req: Request) {
  try {
    await requireAdmin()
    
    const body = await req.json()
    const { id, name, description, marqueeText, discountPercent, minimumDays, startDate, endDate, isActive } = body
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสอีเวนท์' })
    }
    
    const event = await prisma.discountEvent.update({
      where: { id },
      data: {
        name,
        description,
        marqueeText,
        discountPercent: discountPercent ? parseInt(discountPercent) : undefined,
        minimumDays: minimumDays ? parseInt(minimumDays) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive
      }
    })
    
    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' })
  }
}

// Delete event
export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสอีเวนท์' })
    }
    
    await prisma.discountEvent.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' })
  }
}
