import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getUserConnectionInfo, userToggleClient } from '@/lib/vpn-api'

// GET: Get user's connection info (IPs, traffic, online status)
export async function GET() {
  try {
    const session = await requireAuth()
    const connections = await getUserConnectionInfo(session.userId!)
    return NextResponse.json({ success: true, connections })
  } catch (error: any) {
    console.error('User connections GET error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST: Toggle client enable/disable
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const { orderId, enable } = body

    if (!orderId || typeof enable !== 'boolean') {
      return NextResponse.json({ success: false, error: 'orderId and enable are required' }, { status: 400 })
    }

    const result = await userToggleClient(session.userId!, orderId, enable)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('User connections POST error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
