import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

// GET - Public: ตรวจสอบว่ามี overlay อยู่ไหม (สำหรับลูกค้า)
export async function GET(request: NextRequest) {
  try {
    const update = await prisma.siteUpdate.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    if (!update || !update.isEnabled) {
      return NextResponse.json({ update: null })
    }

    const clientIp = getClientIp(request)
    const bypassIps = update.bypassIps || []
    const isBypassed = bypassIps.some(
      (ip) => ip.trim() === clientIp || ip.trim() === '*'
    )

    if (isBypassed) {
      return NextResponse.json({ update: null, bypassed: true })
    }

    return NextResponse.json({ update })
  } catch (error) {
    console.error('Failed to fetch site update:', error)
    return NextResponse.json({ update: null })
  }
}
