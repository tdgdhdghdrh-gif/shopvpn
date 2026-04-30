import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// Helper to ensure single maintenance row exists
async function getMaintenance() {
  let m = await prisma.maintenanceMode.findFirst()
  if (!m) {
    m = await prisma.maintenanceMode.create({ data: {} })
  }
  return m
}

export async function GET() {
  try {
    const m = await getMaintenance()
    return NextResponse.json({ success: true, maintenance: m })
  } catch (error: any) {
    console.error('Maintenance GET error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true, name: true },
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const m = await getMaintenance()

    const updated = await prisma.maintenanceMode.update({
      where: { id: m.id },
      data: {
        enabled: body.enabled !== undefined ? Boolean(body.enabled) : m.enabled,
        message: body.message !== undefined ? body.message : m.message,
        startTime: body.startTime !== undefined ? (body.startTime ? new Date(body.startTime) : null) : m.startTime,
        endTime: body.endTime !== undefined ? (body.endTime ? new Date(body.endTime) : null) : m.endTime,
        allowedIps: body.allowedIps !== undefined ? body.allowedIps : m.allowedIps,
        updatedBy: session.userId,
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: body.enabled ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE',
        entity: 'MaintenanceMode',
        entityId: m.id,
        newValue: JSON.stringify({ enabled: updated.enabled, message: updated.message }),
        userId: session.userId,
        userName: user.name || 'Admin',
      },
    })

    return NextResponse.json({ success: true, maintenance: updated })
  } catch (error: any) {
    console.error('Maintenance POST error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
