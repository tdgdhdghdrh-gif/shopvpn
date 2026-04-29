import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function checkAdmin() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true },
  })
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

export async function GET() {
  try {
    const admin = await checkAdmin()
    if (!admin) return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })

    const settings = await prisma.settings.findFirst({
      select: {
        desktopPetEnabled: true,
        desktopPetImageUrl: true,
        desktopPetSize: true,
        desktopPetSpeed: true,
        desktopPetGravity: true,
        desktopPetJumpPower: true,
      },
    })

    return NextResponse.json({
      desktopPetEnabled: settings?.desktopPetEnabled ?? false,
      desktopPetImageUrl: settings?.desktopPetImageUrl || '',
      desktopPetSize: settings?.desktopPetSize ?? 60,
      desktopPetSpeed: settings?.desktopPetSpeed ?? 2,
      desktopPetGravity: settings?.desktopPetGravity ?? 0.4,
      desktopPetJumpPower: settings?.desktopPetJumpPower ?? 10,
    })
  } catch (error) {
    console.error('Desktop pet GET error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })

    const body = await req.json()
    const {
      desktopPetEnabled,
      desktopPetImageUrl,
      desktopPetSize,
      desktopPetSpeed,
      desktopPetGravity,
      desktopPetJumpPower,
    } = body

    const settings = await prisma.settings.findFirst()
    if (settings) {
      await prisma.settings.update({
        where: { id: settings.id },
        data: {
          ...(desktopPetEnabled !== undefined && { desktopPetEnabled: !!desktopPetEnabled }),
          ...(desktopPetImageUrl !== undefined && { desktopPetImageUrl: desktopPetImageUrl || null }),
          ...(desktopPetSize !== undefined && { desktopPetSize: Math.max(20, Math.min(300, parseInt(desktopPetSize) || 60)) }),
          ...(desktopPetSpeed !== undefined && { desktopPetSpeed: Math.max(0.1, Math.min(20, parseFloat(desktopPetSpeed) || 2)) }),
          ...(desktopPetGravity !== undefined && { desktopPetGravity: Math.max(0.1, Math.min(2, parseFloat(desktopPetGravity) || 0.4)) }),
          ...(desktopPetJumpPower !== undefined && { desktopPetJumpPower: Math.max(1, Math.min(50, parseFloat(desktopPetJumpPower) || 10)) }),
        },
      })
    } else {
      await prisma.settings.create({
        data: {
          desktopPetEnabled: !!desktopPetEnabled,
          desktopPetImageUrl: desktopPetImageUrl || null,
          desktopPetSize: Math.max(20, Math.min(300, parseInt(desktopPetSize) || 60)),
          desktopPetSpeed: Math.max(0.1, Math.min(20, parseFloat(desktopPetSpeed) || 2)),
          desktopPetGravity: Math.max(0.1, Math.min(2, parseFloat(desktopPetGravity) || 0.4)),
          desktopPetJumpPower: Math.max(1, Math.min(50, parseFloat(desktopPetJumpPower) || 10)),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Desktop pet POST error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
