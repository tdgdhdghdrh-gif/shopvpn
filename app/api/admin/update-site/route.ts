import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Helper: หา remote ที่ใช้ pull ได้ (codevpnshop > origin)
async function getGitRemote(cwd: string): Promise<string> {
  try {
    const { stdout } = await execAsync('git remote', { cwd })
    const remotes = stdout.trim().split('\n').map(r => r.trim())
    if (remotes.includes('codevpnshop')) return 'codevpnshop'
    if (remotes.includes('origin')) return 'origin'
    return remotes[0] || 'origin'
  } catch {
    return 'origin'
  }
}

// POST - Pull latest code, install deps, build, restart
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, username: true }
    })

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 })
    }

    const projectDir = process.cwd()
    const logs: string[] = []
    const addLog = (step: string, output: string) => {
      logs.push(`[${step}] ${output.trim()}`)
    }
    const startTime = Date.now()
    const remote = await getGitRemote(projectDir)

    // บันทึก commit ก่อนอัพเดท
    let commitBefore = ''
    try {
      const { stdout } = await execAsync('git rev-parse --short HEAD', { cwd: projectDir })
      commitBefore = stdout.trim()
    } catch {}

    // Step 1: Git pull
    try {
      const { stdout, stderr } = await execAsync(`git pull ${remote} main`, {
        cwd: projectDir,
        timeout: 60000,
      })
      addLog('GIT PULL', `[${remote}] ${stdout || stderr || 'Done'}`)
    } catch (err: any) {
      addLog('GIT PULL ERROR', err.message || String(err))
      await saveUpdateLog({
        success: false,
        commitBefore,
        error: 'Git pull failed',
        logs,
        startTime,
        username: user.username,
      })
      return NextResponse.json({ 
        success: false, 
        error: 'Git pull failed', 
        logs 
      }, { status: 500 })
    }

    // Step 2: npm install
    try {
      const { stdout, stderr } = await execAsync('npm install --production=false', {
        cwd: projectDir,
        timeout: 120000,
      })
      addLog('NPM INSTALL', stdout?.slice(-500) || stderr?.slice(-500) || 'Done')
    } catch (err: any) {
      addLog('NPM INSTALL ERROR', err.message?.slice(-500) || String(err))
      await saveUpdateLog({
        success: false,
        commitBefore,
        error: 'npm install failed',
        logs,
        startTime,
        username: user.username,
      })
      return NextResponse.json({ 
        success: false, 
        error: 'npm install failed', 
        logs 
      }, { status: 500 })
    }

    // Step 3: Prisma generate (in case schema changed)
    try {
      const { stdout, stderr } = await execAsync('npx prisma generate', {
        cwd: projectDir,
        timeout: 60000,
      })
      addLog('PRISMA GENERATE', stdout?.slice(-300) || stderr?.slice(-300) || 'Done')
    } catch (err: any) {
      addLog('PRISMA GENERATE WARNING', err.message?.slice(-300) || String(err))
    }

    // Step 3.5: Prisma db push (sync new schema fields to database)
    try {
      const { stdout, stderr } = await execAsync('npx prisma db push --skip-generate --accept-data-loss', {
        cwd: projectDir,
        timeout: 60000,
      })
      addLog('PRISMA DB PUSH', stdout?.slice(-300) || stderr?.slice(-300) || 'Done')
    } catch (err: any) {
      addLog('PRISMA DB PUSH WARNING', err.message?.slice(-300) || String(err))
    }

    // Step 4: Build
    try {
      const { stdout, stderr } = await execAsync('npx next build', {
        cwd: projectDir,
        timeout: 300000,
      })
      addLog('BUILD', stdout?.slice(-500) || stderr?.slice(-500) || 'Done')
    } catch (err: any) {
      addLog('BUILD ERROR', err.message?.slice(-1000) || String(err))
      await saveUpdateLog({
        success: false,
        commitBefore,
        error: 'Build failed',
        logs,
        startTime,
        username: user.username,
      })
      return NextResponse.json({ 
        success: false, 
        error: 'Build failed', 
        logs 
      }, { status: 500 })
    }

    // Step 5: Restart PM2 (shop process)
    try {
      const { stdout, stderr } = await execAsync('pm2 restart shop', {
        cwd: projectDir,
        timeout: 30000,
      })
      addLog('PM2 RESTART', stdout || stderr || 'Done')
    } catch (err: any) {
      addLog('PM2 RESTART ERROR', err.message || String(err))
      await saveUpdateLog({
        success: false,
        commitBefore,
        error: 'PM2 restart failed',
        logs,
        startTime,
        username: user.username,
      })
      return NextResponse.json({ 
        success: false, 
        error: 'PM2 restart failed (but code is updated & built)', 
        logs 
      }, { status: 500 })
    }

    // สำเร็จ - ดึงข้อมูลหลังอัพเดท
    let commitAfter = ''
    let changesCount = 0
    let commitMessages = ''
    let changesSummary = ''

    try {
      const { stdout } = await execAsync('git rev-parse --short HEAD', { cwd: projectDir })
      commitAfter = stdout.trim()
    } catch {}

    // ดึง commit messages ระหว่าง commit เก่า -> ใหม่
    if (commitBefore && commitAfter && commitBefore !== commitAfter) {
      try {
        const { stdout } = await execAsync(`git log ${commitBefore}..${commitAfter} --format="%s" --reverse`, { cwd: projectDir })
        commitMessages = stdout.trim()
      } catch {}

      // นับไฟล์ที่เปลี่ยน
      try {
        const { stdout } = await execAsync(`git diff --stat ${commitBefore}..${commitAfter} --shortstat`, { cwd: projectDir })
        const match = stdout.match(/(\d+) files? changed/)
        if (match) changesCount = parseInt(match[1])
      } catch {}

      // สร้างสรุปภาษาไทย จาก commit messages
      changesSummary = generateThaiSummary(commitMessages)
    } else {
      changesSummary = 'อัพเดทสำเร็จ (ไม่มีการเปลี่ยนแปลงใหม่)'
    }

    await saveUpdateLog({
      success: true,
      commitBefore,
      commitAfter,
      changesCount,
      changesSummary,
      commitMessages,
      logs,
      startTime,
      username: user.username,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Site updated successfully!',
      logs 
    })

  } catch (error: any) {
    console.error('Update site error:', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}

// GET - Check current git status + update history
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true }
    })

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const projectDir = process.cwd()

    // Get current commit info
    let currentCommit = ''
    let currentBranch = ''
    
    try {
      const { stdout: commit } = await execAsync('git log -1 --format="%h - %s (%cr)"', { cwd: projectDir })
      currentCommit = commit.trim()
    } catch { currentCommit = 'unknown' }

    try {
      const { stdout: branch } = await execAsync('git branch --show-current', { cwd: projectDir })
      currentBranch = branch.trim()
    } catch { currentBranch = 'unknown' }

    // Check for updates
    let hasUpdates = false
    let remoteCommit = ''
    const remote = await getGitRemote(projectDir)
    try {
      await execAsync(`git fetch ${remote} main`, { cwd: projectDir, timeout: 15000 })
      const { stdout: diff } = await execAsync(`git log HEAD..${remote}/main --oneline`, { cwd: projectDir })
      hasUpdates = diff.trim().length > 0
      remoteCommit = diff.trim()
    } catch {}

    // ดึงประวัติการอัพเดท 20 รายการล่าสุด
    const updateHistory = await prisma.siteUpdateLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      currentCommit,
      currentBranch,
      hasUpdates,
      remoteCommit: remoteCommit || null,
      updateHistory,
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}

// ── Helper: บันทึกประวัติอัพเดทลง DB ──
async function saveUpdateLog(params: {
  success: boolean
  commitBefore?: string
  commitAfter?: string
  changesCount?: number
  changesSummary?: string
  commitMessages?: string
  error?: string
  logs: string[]
  startTime: number
  username?: string
}) {
  try {
    await prisma.siteUpdateLog.create({
      data: {
        success: params.success,
        commitBefore: params.commitBefore || null,
        commitAfter: params.commitAfter || null,
        changesCount: params.changesCount || 0,
        changesSummary: params.changesSummary || null,
        commitMessages: params.commitMessages || null,
        error: params.error || null,
        logs: JSON.stringify(params.logs),
        duration: Math.round((Date.now() - params.startTime) / 1000),
        updatedBy: params.username || null,
      },
    })
  } catch (e) {
    console.error('Failed to save update log:', e)
  }
}

// ── Helper: แปลง commit messages เป็นสรุปภาษาไทย ──
function generateThaiSummary(commitMessages: string): string {
  if (!commitMessages) return ''

  const lines = commitMessages.split('\n').filter(l => l.trim())
  const summaries: string[] = []

  for (const line of lines) {
    const lower = line.toLowerCase().trim()

    // ตรวจ keyword แล้วแปลเป็นไทย
    if (lower.startsWith('fix:') || lower.startsWith('fix ') || lower.startsWith('bugfix')) {
      summaries.push('แก้ไขบัค: ' + cleanMsg(line))
    } else if (lower.startsWith('add:') || lower.startsWith('add ') || lower.startsWith('feat')) {
      summaries.push('เพิ่มฟีเจอร์: ' + cleanMsg(line))
    } else if (lower.startsWith('update') || lower.startsWith('improve') || lower.startsWith('enhance')) {
      summaries.push('ปรับปรุง: ' + cleanMsg(line))
    } else if (lower.startsWith('remove') || lower.startsWith('delete')) {
      summaries.push('ลบออก: ' + cleanMsg(line))
    } else if (lower.startsWith('refactor')) {
      summaries.push('ปรับโครงสร้าง: ' + cleanMsg(line))
    } else if (lower.startsWith('style') || lower.startsWith('ui') || lower.startsWith('design')) {
      summaries.push('ปรับ UI: ' + cleanMsg(line))
    } else if (lower.startsWith('hide')) {
      summaries.push('ซ่อน: ' + cleanMsg(line))
    } else {
      summaries.push('อัพเดท: ' + cleanMsg(line))
    }
  }

  return summaries.join('\n')
}

function cleanMsg(msg: string): string {
  // ลบ prefix เช่น "Fix:", "Add:", "feat:" ออก
  return msg
    .replace(/^(fix|add|feat|update|improve|enhance|remove|delete|refactor|style|ui|design|hide|bugfix)\s*[:(-]\s*/i, '')
    .trim()
}
