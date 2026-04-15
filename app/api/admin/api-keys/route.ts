import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/session'
import crypto from 'crypto'

// GET - ดึง API keys ทั้งหมด หรือ logs ของ key
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')

    // ดึง logs ของ API key
    if (keyId) {
      const logs = await prisma.apiKeyLog.findMany({
        where: { apiKeyId: keyId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      return NextResponse.json({ success: true, data: logs })
    }

    // ดึง API keys ทั้งหมด
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { logs: true } },
      },
    })

    return NextResponse.json({ success: true, data: apiKeys })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - สร้าง API key ใหม่
export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin()
    const body = await request.json()

    const { name, description, permissions, maxUsage, expiresAt } = body

    if (!name || !permissions || permissions.length === 0) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกชื่อและเลือกสิทธิ์อย่างน้อย 1 อย่าง' }, { status: 400 })
    }

    const validPermissions = ['user:read', 'credit:add', 'credit:deduct', 'promo:activate', 'vpn:codes', 'v2box:read', 'ip:manage']
    const filteredPermissions = permissions.filter((p: string) => validPermissions.includes(p))
    if (filteredPermissions.length === 0) {
      return NextResponse.json({ success: false, error: 'สิทธิ์ไม่ถูกต้อง' }, { status: 400 })
    }

    // สร้าง API key (format: sk_xxxxxxxxxxxx)
    const key = `sk_${crypto.randomUUID().replace(/-/g, '')}`

    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name,
        description: description || null,
        permissions: filteredPermissions,
        maxUsage: maxUsage ? parseInt(maxUsage) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: admin.id,
      },
    })

    return NextResponse.json({ success: true, data: apiKey })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - อัปเดต API key
export async function PUT(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const body = await request.json()

    const { id, name, description, permissions, isActive, maxUsage, expiresAt } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (permissions !== undefined) updateData.permissions = permissions
    if (isActive !== undefined) updateData.isActive = isActive
    if (maxUsage !== undefined) updateData.maxUsage = maxUsage === null || maxUsage === '' ? null : parseInt(maxUsage)
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: apiKey })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - ลบ API key
export async function DELETE(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบ ID' }, { status: 400 })
    }

    await prisma.apiKey.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
