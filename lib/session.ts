import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'

export interface SessionData {
  userId?: string
  email?: string
  name?: string
  balance?: number
  isLoggedIn: boolean
  // Impersonation fields
  isImpersonating?: boolean
  realAdminId?: string
  realAdminEmail?: string
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'shop-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function login(userId: string, email: string, name: string, balance: number = 0) {
  const session = await getSession()
  session.userId = userId
  session.email = email
  session.name = name
  session.balance = balance
  session.isLoggedIn = true
  await session.save()
}

export async function logout() {
  const session = await getSession()
  session.userId = undefined
  session.email = undefined
  session.name = undefined
  session.balance = undefined
  session.isLoggedIn = false
  await session.save()
  await session.destroy()
}

export async function requireAuth() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    redirect('/login')
  }
  
  // Check if user is banned
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isBanned: true, banReason: true }
  })
  
  if (!user || user.isBanned) {
    // Destroy session and redirect to login
    session.userId = undefined
    session.email = undefined
    session.name = undefined
    session.balance = undefined
    session.isLoggedIn = false
    await session.save()
    await session.destroy()
    redirect('/login')
  }
  
  return session
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    redirect('/login')
  }

  // Block impersonated sessions from accessing admin
  if (session.isImpersonating) {
    redirect('/')
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, isAdmin: true, isSuperAdmin: true, isRevenueAdmin: true, isAgent: true, balance: true }
  })
  
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
    redirect('/')
  }
  
  return user
}

export async function requireSuperAdmin() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    redirect('/login')
  }

  // Block impersonated sessions from accessing admin
  if (session.isImpersonating) {
    redirect('/')
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, isAdmin: true, isSuperAdmin: true, isRevenueAdmin: true, isAgent: true, balance: true }
  })
  
  if (!user || !user.isSuperAdmin) {
    redirect('/')
  }
  
  return user
}

export async function requireAnyAdmin() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    redirect('/login')
  }

  // Block impersonated sessions from accessing admin
  if (session.isImpersonating) {
    redirect('/')
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, isAdmin: true, isSuperAdmin: true, isRevenueAdmin: true, isAgent: true, balance: true, adminMenuAccess: true }
  })
  
  if (!user || (!user.isSuperAdmin && !user.isAdmin && !user.isRevenueAdmin && !user.isAgent)) {
    redirect('/')
  }
  
  return user
}

export async function updateBalance(newBalance: number) {
  const session = await getSession()
  if (session.isLoggedIn) {
    session.balance = newBalance
    await session.save()
  }
}

export async function requireReseller() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    redirect('/login')
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, balance: true },
  })
  
  if (!user) {
    redirect('/')
  }

  const profile = await prisma.resellerProfile.findUnique({
    where: { userId: user.id },
  })

  if (!profile || profile.status !== 'approved') {
    redirect('/')
  }

  return { user, profile }
}

// === Impersonation helpers ===

/** Check if currently impersonating — returns a 403 NextResponse if yes, null if not */
export async function checkImpersonation(): Promise<Response | null> {
  const session = await getSession()
  if (session.isImpersonating) {
    return new Response(
      JSON.stringify({ success: false, error: 'ไม่สามารถทำรายการนี้ได้ขณะดูในฐานะผู้ใช้' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }
  return null
}

/** Get impersonation info for the current session */
export async function getImpersonationInfo() {
  const session = await getSession()
  return {
    isImpersonating: session.isImpersonating || false,
    realAdminId: session.realAdminId || null,
    realAdminEmail: session.realAdminEmail || null,
  }
}
