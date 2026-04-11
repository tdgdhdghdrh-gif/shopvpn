'use server'

import { redirect } from 'next/navigation'
import { prisma } from './prisma'
import { login } from './session'
import bcrypt from 'bcryptjs'

// Register
export async function register(formData: FormData): Promise<void> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    throw new Error('กรุณากรอกข้อมูลให้ครบ')
  }

  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    throw new Error('อีเมลนี้ถูกใช้แล้ว')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    }
  })

  await login(user.id, user.email, user.name, user.balance)
  redirect('/')
}

// Login
export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    throw new Error('กรุณากรอกอีเมลและรหัสผ่าน')
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  }

  await login(user.id, user.email, user.name, user.balance)
  
  if (user.isAdmin) {
    redirect('/admin')
  }
  
  redirect('/')
}

// Logout
export async function logoutAction(): Promise<void> {
  const { getSession, logout } = await import('./session')
  const session = await getSession()
  
  // If impersonating, exit impersonation instead of logging out
  if (session.isImpersonating && session.realAdminId) {
    const { prisma: db } = await import('./prisma')
    const admin = await db.user.findUnique({
      where: { id: session.realAdminId },
      select: { id: true, email: true, name: true, balance: true }
    })
    if (admin) {
      session.userId = admin.id
      session.email = admin.email
      session.name = admin.name
      session.balance = admin.balance
      session.isImpersonating = undefined
      session.realAdminId = undefined
      session.realAdminEmail = undefined
      await session.save()
      redirect('/admin/users')
    }
  }
  
  await logout()
  redirect('/login')
}

// Get my orders
export async function getMyOrders() {
  const { requireAuth } = await import('./session')
  const session = await requireAuth()
  
  return prisma.order.findMany({
    where: { buyerId: session.userId },
    orderBy: { createdAt: 'desc' }
  })
}

// Get my topups
export async function getMyTopups() {
  const { requireAuth } = await import('./session')
  const session = await requireAuth()
  
  return prisma.topUp.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' }
  })
}
