import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { login } from '@/lib/session'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://simonvpn.darkx.shop'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      // Step 1: Redirect to Google OAuth
      if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json({ error: 'Google OAuth ไม่ได้ตั้งค่า' }, { status: 500 })
      }

      const redirectUri = `${BASE_URL}/api/auth/google`
      const state = Buffer.from(JSON.stringify({ redirect: '/vpn' })).toString('base64')
      
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
      googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
      googleAuthUrl.searchParams.set('response_type', 'code')
      googleAuthUrl.searchParams.set('scope', 'openid email profile')
      googleAuthUrl.searchParams.set('state', state)
      googleAuthUrl.searchParams.set('access_type', 'online')
      googleAuthUrl.searchParams.set('prompt', 'consent')

      return NextResponse.redirect(googleAuthUrl.toString())
    }

    // Step 2: Exchange code for token
    const redirectUri = `${BASE_URL}/api/auth/google`
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Google token error:', tokenData)
      return NextResponse.redirect(`${BASE_URL}/login?error=google_auth_failed`)
    }

    // Step 3: Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const userInfo = await userInfoResponse.json()
    if (!userInfoResponse.ok || !userInfo.email) {
      console.error('Google userinfo error:', userInfo)
      return NextResponse.redirect(`${BASE_URL}/login?error=google_userinfo_failed`)
    }

    // Step 4: Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: userInfo.id },
          { email: userInfo.email },
        ],
      },
    })

    if (user) {
      // Update Google info if needed
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: userInfo.id,
            googleAvatar: userInfo.picture,
            name: user.name || userInfo.name,
          },
        })
      }
    } else {
      // Create new user
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const referralCode = `ref_${randomSuffix}`
      
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name || userInfo.email.split('@')[0],
          googleId: userInfo.id,
          googleAvatar: userInfo.picture,
          password: '',
          referralCode,
        },
      })
    }

    // Check banned
    if (user.isBanned) {
      return NextResponse.redirect(`${BASE_URL}/login?error=banned`)
    }

    // Login
    await login(user.id, user.email, user.name, user.balance)

    return NextResponse.redirect(`${BASE_URL}/vpn`)
  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(`${BASE_URL}/login?error=google_auth_error`)
  }
}
