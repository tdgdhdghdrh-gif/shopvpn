import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ success: false, error: 'No code provided' })
    }

    const user = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { name: true, id: true }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid code' })
    }

    return NextResponse.json({ 
      success: true, 
      name: user.name,
      id: user.id
    })

  } catch (error) {
    console.error('Check referral error:', error)
    return NextResponse.json({ success: false, error: 'Failed to check' })
  }
}
