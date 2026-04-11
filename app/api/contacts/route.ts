import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - ดึงรายชื่อแอดมินที่ active (สำหรับหน้าผู้ใช้)
export async function GET() {
  try {
    const contacts = await prisma.adminContact.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nickname: true,
        role: true,
        avatar: true,
        facebookUrl: true,
        availableFrom: true,
        availableTo: true,
        description: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Get public contacts error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
