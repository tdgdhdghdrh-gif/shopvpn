import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/chat - Get recent messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const messages = await prisma.chatMessage.findMany({
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isAdmin: true
          }
        }
      }
    })
    
    return NextResponse.json({ success: true, messages })
  } catch (error) {
    console.error('Get chat messages error:', error)
    return NextResponse.json({ success: false, error: 'Failed to get messages' }, { status: 500 })
  }
}

// POST /api/chat - Send a message
export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }
    
    if (message.trim().length > 500) {
      return NextResponse.json({ success: false, error: 'Message too long (max 500 chars)' }, { status: 400 })
    }
    
    // Get user to check if admin
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isAdmin: true }
    })
    
    const chatMessage = await prisma.chatMessage.create({
      data: {
        userId: session.userId,
        message: message.trim(),
        isAdmin: user?.isAdmin || false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isAdmin: true
          }
        }
      }
    })
    
    return NextResponse.json({ success: true, message: chatMessage })
  } catch (error) {
    console.error('Send chat message error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 })
  }
}
