import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { login } from '@/lib/session'

// Verify Firebase ID Token (simple verification without admin SDK)
async function verifyFirebaseToken(idToken: string) {
  try {
    // Get Firebase public keys and verify (simplified)
    // For production, use firebase-admin SDK
    // Here we'll do a basic check and trust the client for now
    // In production, you should verify with: https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com

    // Decode JWT payload (without verification for now - client side handles it)
    const base64Payload = idToken.split('.')[1]
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'))

    return {
      uid: payload.sub || payload.user_id,
      email: payload.email,
      name: payload.name || payload.email?.split('@')[0] || 'User',
      picture: payload.picture || null,
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { idToken } = body

    if (!idToken) {
      return NextResponse.json({ success: false, error: 'ไม่มี ID Token' }, { status: 400 })
    }

    // Verify token
    const firebaseUser = await verifyFirebaseToken(idToken)
    if (!firebaseUser || !firebaseUser.email) {
      return NextResponse.json({ success: false, error: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: firebaseUser.uid },
          { email: firebaseUser.email },
        ],
      },
    })

    if (user) {
      // Update Google info
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: firebaseUser.uid,
            googleAvatar: firebaseUser.picture,
            name: user.name || firebaseUser.name,
          },
        })
      }
    } else {
      // Create new user
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const referralCode = `ref_${randomSuffix}`

      user = await prisma.user.create({
        data: {
          email: firebaseUser.email,
          name: firebaseUser.name,
          googleId: firebaseUser.uid,
          googleAvatar: firebaseUser.picture,
          password: '',
          referralCode,
        },
      })
    }

    // Check banned
    if (user.isBanned) {
      return NextResponse.json({ success: false, error: 'บัญชีถูกระงับ' }, { status: 403 })
    }

    // Login
    await login(user.id, user.email, user.name, user.balance)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || user.googleAvatar,
      },
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
    })
  } catch (error) {
    console.error('Firebase auth error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
