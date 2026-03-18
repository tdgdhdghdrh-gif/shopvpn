import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, currentPassword, newPassword } = body

    // Validate name
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' 
      })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'ไม่พบผู้ใช้' 
      })
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim()
    }

    // Handle password change
    if (newPassword) {
      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json({ 
          success: false, 
          error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' 
        })
      }

      // Check current password
      if (!currentPassword) {
        return NextResponse.json({ 
          success: false, 
          error: 'กรุณากรอกรหัสผ่านปัจจุบัน' 
        })
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password)
      
      if (!validPassword) {
        return NextResponse.json({ 
          success: false, 
          error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' 
        })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateData.password = hashedPassword
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        isAdmin: true
      }
    })

    // Update session with new name
    session.name = updatedUser.name
    await session.save()

    return NextResponse.json({ 
      success: true,
      user: updatedUser
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' 
    })
  }
}
