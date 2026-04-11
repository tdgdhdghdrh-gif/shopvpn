import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin from database
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        isAdmin: true,
        isSuperAdmin: true,
        isRevenueAdmin: true,
        isAgent: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
        discountExpiry: true,
        createdAt: true,
        avatar: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!admin?.isSuperAdmin && !admin?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, password, balance = 0, role = 'user' } = body

    // Only superAdmin can assign admin roles
    if (role !== 'user' && !admin?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'เฉพาะแอดมินสูงสุดเท่านั้นที่สามารถกำหนดยศได้' },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // Convert role string to boolean flags
    const isSuperAdmin = role === 'superAdmin'
    const isAdmin = role === 'admin'
    const isRevenueAdmin = role === 'revenueAdmin'
    const isAgent = role === 'agent'

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้แล้ว' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        balance,
        isSuperAdmin,
        isAdmin,
        isRevenueAdmin,
        isAgent,
      },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        isSuperAdmin: true,
        isAdmin: true,
        isRevenueAdmin: true,
        isAgent: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: newUser,
      message: 'สร้างผู้ใช้สำเร็จ'
    })
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!admin?.isSuperAdmin && !admin?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, name, email, password, balance, role } = body

    if (!id) {
      return NextResponse.json(
        { error: 'กรุณาระบุรหัสผู้ใช้' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    // Only superAdmin can change roles
    if (role !== undefined && !admin?.isSuperAdmin) {
      // Determine the current role of the target user
      const currentRole = existingUser.isSuperAdmin ? 'superAdmin'
        : existingUser.isAdmin ? 'admin'
        : existingUser.isAgent ? 'agent'
        : existingUser.isRevenueAdmin ? 'revenueAdmin'
        : 'user'
      
      if (role !== currentRole) {
        return NextResponse.json(
          { error: 'เฉพาะแอดมินสูงสุดเท่านั้นที่สามารถเปลี่ยนยศได้' },
          { status: 403 }
        )
      }
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      if (emailExists) {
        return NextResponse.json(
          { error: 'อีเมลนี้ถูกใช้แล้ว' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      balance,
    }

    // Only superAdmin can set role fields
    if (admin?.isSuperAdmin && role !== undefined) {
      updateData.isSuperAdmin = role === 'superAdmin'
      updateData.isAdmin = role === 'admin'
      updateData.isRevenueAdmin = role === 'revenueAdmin'
      updateData.isAgent = role === 'agent'
    }

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        isSuperAdmin: true,
        isAdmin: true,
        isRevenueAdmin: true,
        isAgent: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: 'อัปเดตผู้ใช้สำเร็จ'
    })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true }
    })

    if (!admin?.isSuperAdmin && !admin?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'กรุณาระบุรหัสผู้ใช้' },
        { status: 400 }
      )
    }

    // Prevent deleting yourself
    if (id === session.userId) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบบัญชีตัวเองได้' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'ลบผู้ใช้สำเร็จ'
    })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
