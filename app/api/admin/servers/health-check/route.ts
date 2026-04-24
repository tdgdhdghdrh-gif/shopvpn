import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import https from 'https'
import http from 'http'

// Simple panel health check: try to connect and login
async function checkServerHealth(
  host: string,
  port: number,
  path: string,
  username: string,
  password: string
): Promise<{ healthy: boolean; error?: string }> {
  const cleanHost = host.trim()
  let normalizedPath = path.trim()
  if (!normalizedPath.startsWith('/')) normalizedPath = `/${normalizedPath}`
  if (normalizedPath.endsWith('/') && normalizedPath.length > 1) {
    normalizedPath = normalizedPath.slice(0, -1)
  }

  const formData = new URLSearchParams()
  formData.append('username', username.trim())
  formData.append('password', password.trim())
  const formPayload = formData.toString()

  async function tryProtocol(useHttp: boolean): Promise<boolean> {
    const client = useHttp ? http : https
    return new Promise((resolve) => {
      try {
        const req = client.request(
          {
            hostname: cleanHost,
            port: port,
            path: `${normalizedPath}/login`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(formPayload),
              'Accept': 'application/json, text/plain, */*',
              'X-Requested-With': 'XMLHttpRequest',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            rejectUnauthorized: false,
            timeout: 10000,
          },
          (res) => {
            let data = ''
            res.on('data', (chunk) => (data += chunk))
            res.on('end', () => {
              try {
                const json = JSON.parse(data)
                resolve(json.success === true)
              } catch {
                resolve(
                  data.includes('"success":true') || res.statusCode === 302
                )
              }
            })
          }
        )
        req.on('error', () => resolve(false))
        req.on('timeout', () => {
          req.destroy()
          resolve(false)
        })
        req.write(formPayload)
        req.end()
      } catch {
        resolve(false)
      }
    })
  }

  const httpsOk = await tryProtocol(false)
  if (httpsOk) return { healthy: true }

  const httpOk = await tryProtocol(true)
  if (httpOk) return { healthy: true }

  return { healthy: false, error: 'Cannot connect or login to panel' }
}

// POST - Run health check on all servers (or specific server)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true, isAgent: true },
    })

    if (!user?.isSuperAdmin && !user?.isAdmin && !user?.isAgent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const serverId = body?.serverId as string | undefined

    // If agent, limit to own servers
    const isAgentOnly = user.isAgent && !user.isSuperAdmin && !user.isAdmin
    const where = isAgentOnly
      ? { agentId: session.userId }
      : serverId
      ? { id: serverId }
      : {}

    const servers = await prisma.vpnServer.findMany({
      where,
      select: {
        id: true,
        name: true,
        host: true,
        port: true,
        path: true,
        username: true,
        password: true,
      },
    })

    const results = []
    const now = new Date()

    for (const server of servers) {
      const check = await checkServerHealth(
        server.host,
        server.port,
        server.path,
        server.username,
        server.password
      )

      const healthStatus = check.healthy ? 'healthy' : 'unhealthy'

      // Auto-hide unhealthy servers from user view
      await prisma.vpnServer.update({
        where: { id: server.id },
        data: {
          healthStatus,
          lastHealthCheck: now,
          isHidden: check.healthy ? undefined : true,
        },
      })

      results.push({
        id: server.id,
        name: server.name,
        healthy: check.healthy,
        error: check.error,
      })
    }

    const healthyCount = results.filter((r) => r.healthy).length
    const unhealthyCount = results.length - healthyCount

    return NextResponse.json({
      success: true,
      checked: results.length,
      healthy: healthyCount,
      unhealthy: unhealthyCount,
      results,
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    )
  }
}
