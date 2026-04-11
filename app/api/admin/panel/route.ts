import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import {
  adminListInbounds,
  adminGetInbound,
  adminGetClientIps,
  adminGetClientTraffic,
  adminGetOnlineClients,
  adminToggleClient,
  adminUpdateClient,
  adminDeleteClient,
  adminResetInboundTraffics,
  adminResetAllTraffics,
} from '@/lib/vpn-api'

// GET: List inbounds, get inbound details, get client IPs/traffic, get onlines
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const serverId = searchParams.get('serverId')

    if (!serverId) {
      return NextResponse.json({ success: false, error: 'serverId is required' }, { status: 400 })
    }

    switch (action) {
      case 'listInbounds': {
        const result = await adminListInbounds(serverId)
        return NextResponse.json(result)
      }
      case 'getInbound': {
        const inboundId = parseInt(searchParams.get('inboundId') || '0')
        if (!inboundId) return NextResponse.json({ success: false, error: 'inboundId is required' }, { status: 400 })
        const result = await adminGetInbound(serverId, inboundId)
        return NextResponse.json(result)
      }
      case 'clientIps': {
        const email = searchParams.get('email')
        if (!email) return NextResponse.json({ success: false, error: 'email is required' }, { status: 400 })
        const result = await adminGetClientIps(serverId, email)
        return NextResponse.json(result)
      }
      case 'clientTraffic': {
        const email = searchParams.get('email')
        if (!email) return NextResponse.json({ success: false, error: 'email is required' }, { status: 400 })
        const result = await adminGetClientTraffic(serverId, email)
        return NextResponse.json(result)
      }
      case 'onlines': {
        const result = await adminGetOnlineClients(serverId)
        return NextResponse.json(result)
      }
      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Admin panel GET error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST: Toggle client, update client, delete client, reset traffic
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const body = await req.json()
    const { action, serverId } = body

    if (!serverId) {
      return NextResponse.json({ success: false, error: 'serverId is required' }, { status: 400 })
    }

    switch (action) {
      case 'toggleClient': {
        const { inboundId, clientData, enable } = body
        if (!inboundId || !clientData) {
          return NextResponse.json({ success: false, error: 'inboundId and clientData are required' }, { status: 400 })
        }
        const result = await adminToggleClient(serverId, inboundId, clientData, enable)
        return NextResponse.json(result)
      }
      case 'updateClient': {
        const { inboundId, clientUUID, clientData } = body
        if (!inboundId || !clientUUID || !clientData) {
          return NextResponse.json({ success: false, error: 'inboundId, clientUUID and clientData are required' }, { status: 400 })
        }
        const result = await adminUpdateClient(serverId, inboundId, clientUUID, clientData)
        return NextResponse.json(result)
      }
      case 'deleteClient': {
        const { inboundId, clientUUID } = body
        if (!inboundId || !clientUUID) {
          return NextResponse.json({ success: false, error: 'inboundId and clientUUID are required' }, { status: 400 })
        }
        const result = await adminDeleteClient(serverId, inboundId, clientUUID)
        return NextResponse.json(result)
      }
      case 'resetInboundTraffics': {
        const { inboundId } = body
        if (!inboundId) {
          return NextResponse.json({ success: false, error: 'inboundId is required' }, { status: 400 })
        }
        const result = await adminResetInboundTraffics(serverId, inboundId)
        return NextResponse.json(result)
      }
      case 'resetAllTraffics': {
        const result = await adminResetAllTraffics(serverId)
        return NextResponse.json(result)
      }
      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Admin panel POST error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
