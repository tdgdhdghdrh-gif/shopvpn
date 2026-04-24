import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export const runtime = 'nodejs'

// GET - Public: get current music
export async function GET() {
  try {
    const music = await prisma.siteMusic.findFirst({
      orderBy: { updatedAt: 'desc' },
    })
    if (!music || !music.isEnabled) {
      return NextResponse.json({ music: null })
    }
    return NextResponse.json({ music })
  } catch (error) {
    console.error('Failed to fetch music:', error)
    return NextResponse.json({ music: null })
  }
}

// POST - Admin save music URL
export async function POST(request: NextRequest) {
  console.log('[Music] Request received')
  try {
    const session = await getSession()
    console.log('[Music] Session:', session?.isLoggedIn, session?.userId)

    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true },
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const {
      fileUrl,
      isEnabled,
      autoPlay,
      volume,
    } = body as {
      fileUrl?: string
      isEnabled?: boolean
      autoPlay?: boolean
      volume?: number
    }

    if (typeof fileUrl !== 'string' || !fileUrl.trim()) {
      return NextResponse.json({ error: 'กรุณาใส่ลิงก์เพลง' }, { status: 400 })
    }

    const trimmedUrl = fileUrl.trim()
    if (!trimmedUrl.toLowerCase().endsWith('.mp3')) {
      return NextResponse.json({ error: 'ลิงก์ต้องลงท้ายด้วย .mp3' }, { status: 400 })
    }

    // Derive display name from URL path
    let safeName = 'music.mp3'
    try {
      const urlPath = new URL(trimmedUrl).pathname
      const rawName = urlPath.split('/').pop() || 'music.mp3'
      safeName = decodeURIComponent(rawName)
    } catch {
      // fallback
    }

    const existing = await prisma.siteMusic.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    let music
    if (existing) {
      music = await prisma.siteMusic.update({
        where: { id: existing.id },
        data: {
          fileName: safeName,
          fileUrl: trimmedUrl,
          isEnabled: isEnabled ?? existing.isEnabled,
          autoPlay: autoPlay ?? existing.autoPlay,
          volume: volume !== undefined ? volume : existing.volume,
        },
      })
    } else {
      music = await prisma.siteMusic.create({
        data: {
          fileName: safeName,
          fileUrl: trimmedUrl,
          isEnabled: isEnabled ?? false,
          autoPlay: autoPlay ?? true,
          volume: volume !== undefined ? volume : 0.5,
        },
      })
    }

    console.log('[Music] Saved to DB:', music.id)
    return NextResponse.json({ success: true, music })
  } catch (error: any) {
    console.error('[Music] CRITICAL ERROR:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Save failed' }, { status: 500 })
  }
}
