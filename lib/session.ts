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
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'shop-session',
  cookieOptions: {
    secure: false,
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
  return session
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    redirect('/login')
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, isAdmin: true, balance: true }
  })
  
  if (!user || !user.isAdmin) {
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
