import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import fs from 'fs'
import path from 'path'

const LOG_DIR = '/root/.pm2/logs'

const LOG_FILES = [
  { key: 'simonvpn-error', label: 'SimonVPN Error', file: 'simonvpn-error.log' },
  { key: 'simonvpn-out', label: 'SimonVPN Output', file: 'simonvpn-out.log' },
  { key: 'apivip-error', label: 'API VIP Error', file: 'apivip-error.log' },
  { key: 'apivip-out', label: 'API VIP Output', file: 'apivip-out.log' },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
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

    const { searchParams } = new URL(request.url)
    const fileKey = searchParams.get('file') || 'simonvpn-error'
    const lines = parseInt(searchParams.get('lines') || '200')

    const logDef = LOG_FILES.find(l => l.key === fileKey)
    if (!logDef) {
      return NextResponse.json({ error: 'Invalid log file' }, { status: 400 })
    }

    const filePath = path.join(LOG_DIR, logDef.file)
    let content = ''
    let size = 0

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      size = stats.size
      const maxRead = 1024 * 1024 // 1MB max
      const readSize = Math.min(size, maxRead)
      const fd = fs.openSync(filePath, 'r')
      const buffer = Buffer.alloc(readSize)
      fs.readSync(fd, buffer, 0, readSize, size - readSize)
      fs.closeSync(fd)
      content = buffer.toString('utf-8')
      // Keep only last N lines
      const allLines = content.split('\n')
      content = allLines.slice(-lines).join('\n')
    }

    return NextResponse.json({
      success: true,
      files: LOG_FILES,
      current: logDef,
      content,
      size,
      lines: content.split('\n').length,
    })
  } catch (error: any) {
    console.error('Failed to read logs:', error)
    return NextResponse.json({ error: error?.message || 'Failed to read logs' }, { status: 500 })
  }
}
