import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ isAdmin: false, error: 'Not logged in' })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, isAdmin: true }
    })
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ isAdmin: false, error: 'Not admin' })
    }
    
    return NextResponse.json({ isAdmin: true, user })
  } catch (error) {
    return NextResponse.json({ isAdmin: false, error: 'Server error' })
  }
}
