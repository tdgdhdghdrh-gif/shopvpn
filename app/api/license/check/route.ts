import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/license/check?key=LIC-XXXXX
// API สาธารณะ - ให้เว็บลูกค้าเรียกเช็คอายุ license
export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    
    if (!key) {
      return NextResponse.json({ 
        valid: false, 
        error: 'License key is required' 
      }, { status: 400 })
    }

    const license = await prisma.siteLicense.findUnique({
      where: { licenseKey: key }
    })

    if (!license) {
      return NextResponse.json({ 
        valid: false, 
        error: 'License not found' 
      }, { status: 404 })
    }

    if (!license.isActive) {
      return NextResponse.json({ 
        valid: false, 
        expired: true,
        siteName: license.siteName,
        error: 'License has been deactivated' 
      })
    }

    const now = new Date()
    const expiry = new Date(license.expiryDate)
    const isExpired = now > expiry

    if (isExpired) {
      return NextResponse.json({ 
        valid: false,
        expired: true,
        siteName: license.siteName,
        expiryDate: license.expiryDate,
        error: 'License has expired'
      })
    }

    // คำนวณเวลาคงเหลือ
    const diffMs = expiry.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return NextResponse.json({
      valid: true,
      expired: false,
      siteName: license.siteName,
      expiryDate: license.expiryDate,
      remaining: {
        days: diffDays,
        hours: diffHours,
        minutes: diffMinutes,
        totalMs: diffMs,
        text: diffDays > 0 
          ? `${diffDays} วัน ${diffHours} ชั่วโมง` 
          : `${diffHours} ชั่วโมง ${diffMinutes} นาที`
      }
    })

  } catch (error: any) {
    return NextResponse.json({ 
      valid: false, 
      error: 'Internal error' 
    }, { status: 500 })
  }
}
