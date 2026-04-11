import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    
    const activeEvent = await prisma.discountEvent.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      }
    })
    
    if (!activeEvent) {
      return NextResponse.json({ success: true, event: null })
    }
    
    return NextResponse.json({ 
      success: true, 
      event: {
        id: activeEvent.id,
        name: activeEvent.name,
        description: activeEvent.description,
        marqueeText: activeEvent.marqueeText,
        discountPercent: activeEvent.discountPercent,
        minimumDays: activeEvent.minimumDays,
        endDate: activeEvent.endDate
      }
    })
  } catch (error) {
    console.error('Get active event error:', error)
    return NextResponse.json({ success: false, event: null })
  }
}
