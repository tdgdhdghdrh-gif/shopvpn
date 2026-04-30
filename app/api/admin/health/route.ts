import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getVpnServers } from '@/lib/vpn-api'
import os from 'os'
import { execSync } from 'child_process'

// Get local system stats
function getLocalStats() {
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const memPercent = Math.round((usedMem / totalMem) * 100)

  const loadAvg = os.loadavg()
  const cpuCores = os.cpus().length
  const cpuPercent = Math.round((loadAvg[0] / cpuCores) * 100)

  // Get disk usage
  let diskPercent = 0
  try {
    const output = execSync("df -h / | tail -1 | awk '{print $5}' | tr -d '%'", { encoding: 'utf8' })
    diskPercent = parseInt(output.trim()) || 0
  } catch {
    diskPercent = 0
  }

  return {
    cpuPercent,
    memoryPercent: memPercent,
    diskPercent,
    uptime: os.uptime(),
    platform: os.platform(),
    hostname: os.hostname(),
  }
}

// Check if a panel is reachable
async function checkPanelHealth(server: any) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const protocol = server.host?.includes('http://') ? 'http' : 'https'
    const cleanHost = server.host?.replace(/^https?:\/\//, '')
    const url = `${protocol}://${cleanHost}:${server.port}${server.path || ''}/login`

    await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return { online: true, latencyMs: 0 }
  } catch {
    return { online: false, latencyMs: null }
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true },
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get local server stats
    const localStats = getLocalStats()

    // Get all VPN servers from DB
    const dbServers = await prisma.vpnServer.findMany({
      select: {
        id: true,
        name: true,
        flag: true,
        host: true,
        port: true,
        path: true,
        isActive: true,
      },
    })

    // Check each panel's health
    const serverHealth = await Promise.all(
      dbServers.map(async (server) => {
        const startTime = Date.now()
        const health = await checkPanelHealth(server)
        const latencyMs = health.online ? Date.now() - startTime : null

        // Count active users for this server
        const activeUsers = await prisma.vpnOrder.count({
          where: {
            serverId: server.id,
            isActive: true,
            expiryTime: { gt: new Date() },
          },
        })

        return {
          id: server.id,
          name: server.name,
          flag: server.flag,
          isActive: server.isActive,
          isOnline: health.online,
          latencyMs,
          activeUsers,
          // Use local stats for the web server itself
          cpuPercent: localStats.cpuPercent,
          memoryPercent: localStats.memoryPercent,
          diskPercent: localStats.diskPercent,
        }
      })
    )

    // Overall stats
    const totalOrders = await prisma.vpnOrder.count({
      where: { isActive: true, expiryTime: { gt: new Date() } },
    })
    const totalUsers = await prisma.user.count()
    const todayRevenue = await prisma.topUp.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      _sum: { amount: true },
    })

    // Save health log
    for (const server of serverHealth) {
      await prisma.serverHealthLog.create({
        data: {
          serverName: server.name,
          serverId: server.id,
          cpuPercent: server.cpuPercent,
          memoryPercent: server.memoryPercent,
          diskPercent: server.diskPercent,
          latencyMs: server.latencyMs,
          activeUsers: server.activeUsers,
          isOnline: server.isOnline,
        },
      })
    }

    return NextResponse.json({
      success: true,
      localStats,
      servers: serverHealth,
      stats: {
        totalServers: dbServers.length,
        onlineServers: serverHealth.filter((s) => s.isOnline).length,
        totalActiveUsers: totalOrders,
        totalUsers,
        todayRevenue: todayRevenue._sum?.amount ?? 0,
      },
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
