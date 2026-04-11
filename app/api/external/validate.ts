import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface ValidatedApiKey {
  id: string
  key: string
  name: string
  permissions: string[]
}

/**
 * ตรวจสอบ API key จาก header Authorization: Bearer sk_xxx
 * Return apiKey object ถ้าถูกต้อง หรือ null + NextResponse error
 */
export async function validateApiKey(
  request: NextRequest,
  requiredPermission: string
): Promise<{ apiKey: ValidatedApiKey; error?: never } | { apiKey?: never; error: NextResponse }> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Missing or invalid Authorization header. Use: Bearer sk_xxx' },
        { status: 401 }
      ),
    }
  }

  const key = authHeader.replace('Bearer ', '').trim()

  const apiKey = await prisma.apiKey.findUnique({ where: { key } })

  if (!apiKey) {
    return {
      error: NextResponse.json({ success: false, error: 'Invalid API key' }, { status: 401 }),
    }
  }

  if (!apiKey.isActive) {
    return {
      error: NextResponse.json({ success: false, error: 'API key is disabled' }, { status: 403 }),
    }
  }

  // เช็คหมดอายุ
  if (apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt)) {
    return {
      error: NextResponse.json({ success: false, error: 'API key has expired' }, { status: 403 }),
    }
  }

  // เช็คจำนวนครั้งเรียกใช้
  if (apiKey.maxUsage !== null && apiKey.usageCount >= apiKey.maxUsage) {
    return {
      error: NextResponse.json({ success: false, error: 'API key usage limit reached' }, { status: 429 }),
    }
  }

  // เช็คสิทธิ์
  if (!apiKey.permissions.includes(requiredPermission)) {
    return {
      error: NextResponse.json(
        { success: false, error: `API key does not have permission: ${requiredPermission}` },
        { status: 403 }
      ),
    }
  }

  return { apiKey }
}

/**
 * บันทึก log การเรียก API + เพิ่ม usageCount
 */
export async function logApiUsage(
  apiKeyId: string,
  action: string,
  targetUser: string | null,
  detail: string | null,
  ipAddress: string | null,
  success: boolean
) {
  await prisma.$transaction([
    prisma.apiKeyLog.create({
      data: { apiKeyId, action, targetUser, detail, ipAddress, success },
    }),
    prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { usageCount: { increment: 1 } },
    }),
  ])
}
