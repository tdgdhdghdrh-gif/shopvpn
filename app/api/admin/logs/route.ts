import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Auto-detect PM2 logs directory
function detectPm2LogDir(): string {
  // 1. Check env override
  if (process.env.PM2_LOG_DIR && fs.existsSync(process.env.PM2_LOG_DIR)) {
    return process.env.PM2_LOG_DIR
  }

  // 2. Check current user's home
  const homeDir = os.homedir()
  const userPm2 = path.join(homeDir, '.pm2', 'logs')
  if (fs.existsSync(userPm2)) {
    return userPm2
  }

  // 3. Check /root/.pm2/logs (common for root VPS)
  if (fs.existsSync('/root/.pm2/logs')) {
    return '/root/.pm2/logs'
  }

  // 4. Check /home/*/.pm2/logs (other users)
  try {
    const homeDirs = fs.readdirSync('/home')
    for (const dir of homeDirs) {
      const pm2Path = path.join('/home', dir, '.pm2', 'logs')
      if (fs.existsSync(pm2Path)) {
        return pm2Path
      }
    }
  } catch {
    // ignore
  }

  // 5. Check current working directory
  const cwdPm2 = path.join(process.cwd(), '..', '.pm2', 'logs')
  if (fs.existsSync(cwdPm2)) {
    return cwdPm2
  }

  // Fallback - return standard path even if not exists
  return path.join(homeDir, '.pm2', 'logs')
}

// Scan available log files dynamically
function scanLogFiles(logDir: string): { key: string; label: string; file: string }[] {
  const files: { key: string; label: string; file: string }[] = []

  if (!fs.existsSync(logDir)) {
    return files
  }

  try {
    const entries = fs.readdirSync(logDir)
    for (const entry of entries) {
      if (!entry.endsWith('.log')) continue

      const isError = entry.includes('-error')
      const isOut = entry.includes('-out')
      const baseName = entry.replace(/-error\.log$|-out\.log$/, '')

      // Determine label
      let label = baseName
      if (baseName === 'simonvpn') label = 'SimonVPN'
      else if (baseName === 'apivip') label = 'API VIP'
      else if (baseName === 'next') label = 'Next.js'

      const typeLabel = isError ? 'Error' : isOut ? 'Output' : 'Log'
      const key = entry.replace('.log', '')

      files.push({
        key,
        label: `${label} ${typeLabel}`,
        file: entry,
      })
    }
  } catch {
    // ignore
  }

  // Sort: errors first, then by name
  files.sort((a, b) => {
    const aIsErr = a.file.includes('-error')
    const bIsErr = b.file.includes('-error')
    if (aIsErr && !bIsErr) return -1
    if (!aIsErr && bIsErr) return 1
    return a.file.localeCompare(b.file)
  })

  return files
}

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

    const logDir = detectPm2LogDir()
    const availableFiles = scanLogFiles(logDir)

    const { searchParams } = new URL(request.url)
    const fileKey = searchParams.get('file') || (availableFiles[0]?.key ?? '')
    const lines = parseInt(searchParams.get('lines') || '200')

    const logDef = availableFiles.find((l) => l.key === fileKey)

    let content = ''
    let size = 0
    let filePath = ''

    if (logDef) {
      filePath = path.join(logDir, logDef.file)
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
        const allLines = content.split('\n')
        content = allLines.slice(-lines).join('\n')
      }
    }

    return NextResponse.json({
      success: true,
      logDir,
      files: availableFiles,
      current: logDef || null,
      content,
      size,
      lines: content.split('\n').length,
    })
  } catch (error: any) {
    console.error('Failed to read logs:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to read logs' },
      { status: 500 }
    )
  }
}
