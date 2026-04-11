import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import https from 'https'
import http from 'http'

// Fetch inbounds list from a 3X-UI panel
async function fetchPanelInbounds(
  host: string,
  port: number,
  path: string,
  username: string,
  password: string
): Promise<{ success: boolean; inbounds?: any[]; error?: string }> {
  const cleanHost = host.trim()
  let normalizedPath = path.trim()
  if (!normalizedPath.startsWith('/')) normalizedPath = `/${normalizedPath}`
  if (normalizedPath.endsWith('/') && normalizedPath.length > 1) {
    normalizedPath = normalizedPath.slice(0, -1)
  }

  // Step 1: Login to get session cookies
  const formData = new URLSearchParams()
  formData.append('username', username.trim())
  formData.append('password', password.trim())
  const formPayload = formData.toString()

  const cookies: string[] = []

  async function tryProtocol(useHttp: boolean): Promise<{ success: boolean; inbounds?: any[]; error?: string }> {
    const client = useHttp ? http : https
    const protocol = useHttp ? 'http' : 'https'

    // Login
    const loginResult = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      try {
        const req = client.request({
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
          timeout: 15000,
        }, (res) => {
          let data = ''
          if (res.headers['set-cookie']) {
            res.headers['set-cookie'].forEach((c: string) => {
              const part = c.split(';')[0]
              if (part && !cookies.includes(part)) cookies.push(part)
            })
          }
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            try {
              const json = JSON.parse(data)
              if (json.success === true) {
                resolve({ success: true })
              } else {
                resolve({ success: false, error: json.msg || 'Login failed' })
              }
            } catch {
              resolve({ success: false, error: 'Invalid login response' })
            }
          })
        })
        req.on('error', (err) => resolve({ success: false, error: err.message }))
        req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Login timeout' }) })
        req.write(formPayload)
        req.end()
      } catch (err: any) {
        resolve({ success: false, error: err.message })
      }
    })

    if (!loginResult.success) {
      return { success: false, error: loginResult.error }
    }

    // Step 2: Fetch inbounds list
    const inboundsResult = await new Promise<{ success: boolean; inbounds?: any[]; error?: string }>((resolve) => {
      try {
        const req = client.request({
          hostname: cleanHost,
          port: port,
          path: `${normalizedPath}/panel/api/inbounds/list`,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cookie': cookies.join('; '),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          rejectUnauthorized: false,
          timeout: 15000,
        }, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            try {
              const json = JSON.parse(data)
              if (json.success && json.obj) {
                // Parse each inbound's settings
                const inbounds = json.obj.map((inbound: any) => {
                  let streamSettings: any = {}
                  let settings: any = {}
                  try { streamSettings = JSON.parse(inbound.streamSettings || '{}') } catch {}
                  try { settings = JSON.parse(inbound.settings || '{}') } catch {}

                  return {
                    id: inbound.id,
                    remark: inbound.remark || `Inbound #${inbound.id}`,
                    protocol: inbound.protocol,
                    port: inbound.port,
                    enable: inbound.enable,
                    // Stream settings parsed
                    network: streamSettings.network || 'tcp',
                    security: streamSettings.security || 'none',
                    // WS settings
                    wsPath: streamSettings.wsSettings?.path || '/',
                    wsHost: streamSettings.wsSettings?.headers?.Host || '',
                    // TCP settings
                    tcpType: streamSettings.tcpSettings?.header?.type || 'none',
                    // gRPC settings
                    grpcServiceName: streamSettings.grpcSettings?.serviceName || '',
                    // TLS settings
                    tlsServerName: streamSettings.tlsSettings?.serverName || '',
                    // Reality settings
                    realityPbk: streamSettings.realitySettings?.publicKey || streamSettings.realitySettings?.settings?.publicKey || '',
                    realityFp: streamSettings.realitySettings?.fingerprint || streamSettings.realitySettings?.settings?.fingerprint || 'chrome',
                    realitySni: streamSettings.realitySettings?.serverNames?.[0] || '',
                    realitySid: streamSettings.realitySettings?.shortIds?.[0] || '',
                    realitySpx: streamSettings.realitySettings?.spiderX || '',
                    // Flow from client settings
                    flow: settings.clients?.[0]?.flow || '',
                    // Client count
                    clientCount: settings.clients?.length || 0,
                  }
                })
                resolve({ success: true, inbounds })
              } else {
                resolve({ success: false, error: json.msg || 'Failed to fetch inbounds' })
              }
            } catch {
              resolve({ success: false, error: 'Invalid inbounds response' })
            }
          })
        })
        req.on('error', (err) => resolve({ success: false, error: err.message }))
        req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Inbounds fetch timeout' }) })
        req.end()
      } catch (err: any) {
        resolve({ success: false, error: err.message })
      }
    })

    return inboundsResult
  }

  // Try HTTPS first, then HTTP
  const httpsResult = await tryProtocol(false)
  if (httpsResult.success) return httpsResult

  const httpResult = await tryProtocol(true)
  if (httpResult.success) return httpResult

  return { success: false, error: httpsResult.error || httpResult.error || 'Cannot connect to panel' }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true, isAgent: true }
    })

    if (!user?.isSuperAdmin && !user?.isAdmin && !user?.isAgent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { host, port, path, username, password } = body

    if (!host || !port || !path || !username || !password) {
      return NextResponse.json({ error: 'Missing connection details' }, { status: 400 })
    }

    const result = await fetchPanelInbounds(host, port, path, username, password)

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to fetch inbounds' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      inbounds: result.inbounds 
    })
  } catch (error) {
    console.error('Fetch inbounds error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
