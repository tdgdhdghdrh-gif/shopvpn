import { prisma } from '@/lib/prisma'
import { login } from '@/lib/session'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

function getClientIP(request: NextRequest): string {
  // Get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const captchaToken = formData.get('captchaToken') as string
    const referralCode = formData.get('referralCode') as string
    
    // Get client IP
    const clientIP = getClientIP(request)

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบ' })
    }

    // Check if reCAPTCHA is enabled
    const settings = await prisma.settings.findFirst()
    const isRecaptchaEnabled = settings?.recaptchaEnabled ?? false

    // Verify reCAPTCHA only if enabled
    if (isRecaptchaEnabled) {
      if (!captchaToken) {
        return NextResponse.json({ success: false, error: 'กรุณายืนยัน reCAPTCHA' })
      }

      const secretKey = settings?.recaptchaSecretKey || process.env.RECAPTCHA_SECRET_KEY
      if (!secretKey) {
        console.error('RECAPTCHA_SECRET_KEY is not set')
        return NextResponse.json({ success: false, error: 'ระบบ reCAPTCHA ไม่พร้อมใช้งาน' })
      }

      // Verify with Google reCAPTCHA
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secretKey}&response=${captchaToken}`,
      })

      const captchaData = await response.json()

      if (!captchaData.success) {
        console.error('reCAPTCHA verification failed:', captchaData)
        return NextResponse.json({ success: false, error: 'การยืนยัน reCAPTCHA ล้มเหลว กรุณาลองใหม่' })
      }
    }

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'อีเมลนี้ถูกใช้แล้ว' })
    }

    // Check IP tracking for duplicate (prevent farming)
    if (clientIP !== 'unknown') {
      const existingIP = await prisma.referralIPTracking.findFirst({
        where: { 
          ipAddress: clientIP,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        }
      })

      if (existingIP) {
        return NextResponse.json({ 
          success: false, 
          error: 'ผู้ใช้คนเดิม - อุปกรณ์นี้เคยมีการสมัครแล้ว' 
        })
      }
    }

    // Generate unique referral code for new user
    let newReferralCode = generateReferralCode()
    let codeExists = await prisma.user.findUnique({
      where: { referralCode: newReferralCode }
    })
    while (codeExists) {
      newReferralCode = generateReferralCode()
      codeExists = await prisma.user.findUnique({
        where: { referralCode: newReferralCode }
      })
    }

    // Handle referral
    let referrerId: string | undefined
    let referralBonus = 0

    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode }
      })

      if (referrer && referrer.email !== email) {
        referrerId = referrer.id
        referralBonus = 0.50 // Bonus for new user
      }
    }

    // Create user with referral info
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        referralCode: newReferralCode,
        referredBy: referrerId,
        balance: referralBonus, // Give bonus immediately
        referredByIP: clientIP !== 'unknown' ? clientIP : undefined,
      }
    })

    // Track IP if referral exists
    if (clientIP !== 'unknown') {
      await prisma.referralIPTracking.create({
        data: {
          ipAddress: clientIP,
          userId: user.id,
          referrerId: referrerId || null
        }
      })
    }

    // Update referrer stats if referral exists
    if (referrerId) {
      await prisma.user.update({
        where: { id: referrerId },
        data: {
          referralCount: { increment: 1 }
        }
      })

      // Create referral history for the new user bonus
      await prisma.referralHistory.create({
        data: {
          referrerId: referrerId,
          referredId: user.id,
          referredName: name,
          amount: 0.50,
          type: 'REFERRED_BONUS'
        }
      })
    }

    // Login
    await login(user.id, user.email, user.name, user.balance)

    return NextResponse.json({ 
      success: true,
      message: referralBonus > 0 ? `ได้รับเครดิตฟรี ${referralBonus} จากการถูกเชิญ!` : undefined
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' })
  }
}
