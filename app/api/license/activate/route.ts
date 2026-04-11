import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - ดึง license key ที่บันทึกไว้ใน Settings (สำหรับ middleware ใช้เช็ค)
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.settings.findFirst({
      select: { licenseKey: true, licenseApiUrl: true }
    })
    
    return NextResponse.json({
      licenseKey: settings?.licenseKey || null,
      licenseApiUrl: settings?.licenseApiUrl || null,
      activated: !!settings?.licenseKey,
    })
  } catch (error: any) {
    return NextResponse.json({ 
      licenseKey: null,
      licenseApiUrl: null,
      activated: false,
      error: 'Internal error' 
    }, { status: 500 })
  }
}

// POST - ลงทะเบียน license key (ตอน setup ครั้งแรก)
// Body: { licenseKey: "LIC-XXXXX", licenseApiUrl?: "https://simonvpn.darkx.shop" }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseKey, licenseApiUrl } = body

    if (!licenseKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'กรุณาระบุ License Key' 
      }, { status: 400 })
    }

    // เช็คกับเว็บต้นทางก่อนว่า key ถูกต้องไหม
    const apiUrl = licenseApiUrl || 'https://simonvpn.darkx.shop'
    
    try {
      const checkRes = await fetch(`${apiUrl}/api/license/check?key=${licenseKey}`, {
        signal: AbortSignal.timeout(10000),
      })
      
      if (!checkRes.ok) {
        const errData = await checkRes.json().catch(() => ({}))
        return NextResponse.json({ 
          success: false, 
          error: errData.error || 'License Key ไม่ถูกต้อง' 
        }, { status: 400 })
      }
      
      const checkData = await checkRes.json()
      
      if (!checkData.valid) {
        return NextResponse.json({ 
          success: false, 
          error: checkData.error || 'License หมดอายุหรือถูกปิดใช้งาน' 
        }, { status: 400 })
      }

      // Key ถูกต้อง -> บันทึกลง Settings
      const settings = await prisma.settings.findFirst()
      
      if (settings) {
        await prisma.settings.update({
          where: { id: settings.id },
          data: { 
            licenseKey,
            licenseApiUrl: apiUrl,
          }
        })
      } else {
        await prisma.settings.create({
          data: {
            licenseKey,
            licenseApiUrl: apiUrl,
          }
        })
      }

      return NextResponse.json({ 
        success: true, 
        siteName: checkData.siteName,
        expiryDate: checkData.expiryDate,
        remaining: checkData.remaining,
        message: 'ลงทะเบียนสำเร็จ'
      })

    } catch (fetchError) {
      return NextResponse.json({ 
        success: false, 
        error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ license ได้ กรุณาตรวจสอบ URL'
      }, { status: 502 })
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Internal error' 
    }, { status: 500 })
  }
}
