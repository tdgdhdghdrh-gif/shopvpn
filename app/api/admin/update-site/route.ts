import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// POST - Pull latest code, install deps, build, restart
export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 })
    }

    const projectDir = process.cwd()
    const logs: string[] = []
    const addLog = (step: string, output: string) => {
      logs.push(`[${step}] ${output.trim()}`)
    }

    // Step 1: Git pull from codevpnshop
    try {
      const { stdout, stderr } = await execAsync('git pull codevpnshop main', {
        cwd: projectDir,
        timeout: 60000,
      })
      addLog('GIT PULL', stdout || stderr || 'Done')
    } catch (err: any) {
      addLog('GIT PULL ERROR', err.message || String(err))
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
      // Don't fail on this - might not have schema changes
    }

    // Step 4: Build
    try {
      const { stdout, stderr } = await execAsync('npx next build', {
        cwd: projectDir,
        timeout: 300000, // 5 min for build
      })
      addLog('BUILD', stdout?.slice(-500) || stderr?.slice(-500) || 'Done')
    } catch (err: any) {
      addLog('BUILD ERROR', err.message?.slice(-1000) || String(err))
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
      return NextResponse.json({ 
        success: false, 
        error: 'PM2 restart failed (but code is updated & built)', 
        logs 
      }, { status: 500 })
    }

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

// GET - Check current git status
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

    // Check for updates (remote URL is hidden for security)
    let hasUpdates = false
    let remoteCommit = ''
    try {
      await execAsync('git fetch codevpnshop main', { cwd: projectDir, timeout: 15000 })
      const { stdout: diff } = await execAsync('git log HEAD..codevpnshop/main --oneline', { cwd: projectDir })
      hasUpdates = diff.trim().length > 0
      remoteCommit = diff.trim()
    } catch { /* ignore fetch errors */ }

    return NextResponse.json({
      currentCommit,
      currentBranch,
      hasUpdates,
      remoteCommit: remoteCommit || null,
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
