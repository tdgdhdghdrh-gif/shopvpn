import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/license/check?key=LIC-XXXXX
// API สาธารณะ - ให้เว็บลูกค้าเรียกเช็คอายุ license
// จะบันทึก IP, domain ของเว็บที่เรียกมาด้วย
export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    
    if (!key) {
      return NextResponse.json({ 
        valid: false, 
        error: 'License key is required' 
      }, { status: 400 })
    }

    // ดึง IP ของ server ที่เรียกมา
    const callerIp = request.headers.get('cf-connecting-ip') 
      || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    
    // ดึง domain/origin ที่เรียกมา
    const callerOrigin = request.headers.get('origin') || request.headers.get('referer') || null
    let callerDomain: string | null = null
    if (callerOrigin) {
      try { callerDomain = new URL(callerOrigin).hostname } catch {}
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

    // อัพเดทข้อมูล IP/domain ที่เรียกมา + last check
    const updateData: any = {
      lastCheckAt: now,
      lastCheckIp: callerIp,
    }
    
    // ถ้ายังไม่เคย activate -> บันทึก IP และ domain ครั้งแรก
    if (!license.activatedAt) {
      updateData.activatedAt = now
      updateData.serverIp = callerIp
      if (callerDomain) updateData.domain = callerDomain
    } 
    // ถ้า activate แล้วแต่ยังไม่มี domain -> อัพเดท
    else if (!license.domain && callerDomain) {
      updateData.domain = callerDomain
    }
    // อัพเดท IP ล่าสุดเสมอ (เผื่อ IP เปลี่ยน)
    if (callerIp !== 'unknown') {
      updateData.serverIp = callerIp
    }

    await prisma.siteLicense.update({
      where: { id: license.id },
      data: updateData,
    })

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
