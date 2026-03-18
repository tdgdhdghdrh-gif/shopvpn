import { prisma } from '@/lib/prisma'
import { login } from '@/lib/session'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกอีเมล/ชื่อผู้ใช้และรหัสผ่าน' })
    }

    // Find user by email OR name (username)
    let user = await prisma.user.findUnique({
      where: { email: username }
    })

    // If not found by email, try finding by name
    if (!user) {
      user = await prisma.user.findFirst({
        where: { name: username }
      })
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'ไม่พบบัญชีผู้ใช้' })
    }

    // Check password
    let passwordValid = false
    
    if (user.password && user.password.startsWith('$2')) {
      // Hashed password
      passwordValid = await bcrypt.compare(password, user.password)
    } else {
      // Plain text password (for legacy users)
      passwordValid = user.password === password
    }

    if (!passwordValid) {
      return NextResponse.json({ success: false, error: 'รหัสผ่านไม่ถูกต้อง' })
    }

    // Login
    await login(user.id, user.email, user.name, user.balance)

    return NextResponse.json({ 
      success: true, 
      isAdmin: user.isAdmin 
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
  }
}
