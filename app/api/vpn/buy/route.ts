import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, updateBalance, checkImpersonation } from '@/lib/session'
import https from 'https'
import http from 'http'
import crypto from 'crypto'

// Simple in-memory rate limiter to prevent rapid repeated requests
const requestTimestamps = new Map<string, number>()
const RATE_LIMIT_MS = 3000 // 3 seconds between requests per user

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const lastRequest = requestTimestamps.get(userId)
  if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
    return true
  }
  requestTimestamps.set(userId, now)
  // Clean up old entries periodically (keep map small)
  if (requestTimestamps.size > 1000) {
    const cutoff = now - RATE_LIMIT_MS * 2
    for (const [key, ts] of requestTimestamps) {
      if (ts < cutoff) requestTimestamps.delete(key)
    }
  }
  return false
}

// VPN Panel API Class
class VpnPanelAPI {
  private host: string
  private port: number
  private path: string
  private username: string
  private password: string
  private cookies: string[] = []
  private useHttp: boolean

  constructor(host: string, port: number, path: string, username: string, password: string, useHttp: boolean = false) {
    this.host = host
    this.port = port
    this.path = path
    this.username = username
    this.password = password
    this.useHttp = useHttp
  }

  // Try to detect if server uses HTTP or HTTPS
  static async detectProtocol(host: string, port: number, path: string): Promise<boolean> {
    const httpPorts = [80, 8080, 8888, 5000, 3000]
    if (httpPorts.includes(port)) {
      return true
    }
    
    try {
      await new Promise<void>((resolve, reject) => {
        const req = https.request({
          hostname: host,
          port: port,
          path: path + '/login',
          method: 'HEAD',
          rejectUnauthorized: false,
          timeout: 5000,
        }, (res) => {
          if (res.statusCode && res.statusCode < 500) {
            resolve()
          } else {
            reject(new Error('HTTPS not available'))
          }
        })
        req.on('error', reject)
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
        req.end()
      })
      return false
    } catch {
      try {
        await new Promise<void>((resolve, reject) => {
          const req = http.request({
            hostname: host,
            port: port,
            path: path + '/login',
            method: 'HEAD',
            timeout: 5000,
          }, (res) => {
            if (res.statusCode && res.statusCode < 500) {
              resolve()
            } else {
              reject(new Error('HTTP not available'))
            }
          })
          req.on('error', reject)
          req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
          req.end()
        })
        return true
      } catch {
        return false
      }
    }
  }

  private getBaseUrl(): string {
    const protocol = this.useHttp ? 'http' : 'https'
    return `${protocol}://${this.host}:${this.port}${this.path}`
  }

  private getCookieHeader(): string {
    return this.cookies.join('; ')
  }

  private setCookie(cookieString: string) {
    const parts = cookieString.split(';')[0]
    if (parts && !this.cookies.includes(parts)) {
      this.cookies.push(parts)
    }
  }

  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    body: any = null,
    headers: Record<string, string> = {}
  ): Promise<any> {
    return new Promise((resolve) => {
      try {
        const urlString = endpoint.startsWith('http') ? endpoint : `${this.getBaseUrl()}${endpoint}`
        const url = new URL(urlString)

        const isFormData = headers['Content-Type']?.includes('x-www-form-urlencoded')

        const defaultHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/html, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...headers,
        }

        if (this.cookies.length > 0) {
          defaultHeaders['Cookie'] = this.getCookieHeader()
        }

        let bodyString = ''
        if (body) {
          if (isFormData) {
            bodyString = body
          } else {
            bodyString = JSON.stringify(body)
          }
          defaultHeaders['Content-Length'] = Buffer.byteLength(bodyString).toString()
        }

        const options = {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method: method,
          headers: defaultHeaders,
          rejectUnauthorized: false,
          timeout: 30000,
        }

        const isHttps = url.protocol === 'https:'
        const client = isHttps ? https : http

        const req = client.request(options, (res) => {
          let data = ''

          if (res.headers['set-cookie']) {
            res.headers['set-cookie'].forEach((cookie: string) => this.setCookie(cookie))
          }

          res.on('data', (chunk) => { data += chunk })
          res.on('end', () => {
            try {
              if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
                const parsedData = JSON.parse(data)
                resolve(parsedData)
              } else {
                resolve({
                  success: res.statusCode && res.statusCode < 400,
                  raw: data,
                  statusCode: res.statusCode
                })
              }
            } catch (error) {
              resolve({
                success: res.statusCode && res.statusCode < 400,
                raw: data,
                statusCode: res.statusCode
              })
            }
          })
        })

        req.on('error', (err) => {
          console.error('VPN API request error:', err.message)
          resolve(null)
        })

        req.on('timeout', () => {
          console.error('VPN API request timeout')
          req.destroy()
          resolve(null)
        })

        if (body) req.write(bodyString)
        req.end()
      } catch (error) {
        console.error('VPN API request exception:', error)
        resolve(null)
      }
    })
  }

  async login(): Promise<boolean> {
    try {
      // Clear old cookies
      this.cookies = []
      
      const formData = new URLSearchParams()
      formData.append('username', this.username)
      formData.append('password', this.password)

      const response = await this.makeRequest(
        '/login',
        'POST',
        formData.toString(),
        {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/plain, */*',
          'X-Requested-With': 'XMLHttpRequest'
        }
      )

      console.log('VPN Panel login response: [redacted]')

      // Check multiple success indicators
      const hasSuccessFlag = response && (response.success === true || response.success === 'true')
      const hasSuccessMsg = response?.msg?.toLowerCase()?.includes('success') || response?.msg?.toLowerCase()?.includes('welcome')
      const hasCookies = this.cookies.length > 0 && this.cookies.some(c => 
        c.includes('3x-ui') || c.includes('session') || c.includes('token') || c.includes('auth')
      )

      if (hasSuccessFlag || hasSuccessMsg || hasCookies) {
        return true
      }
      
      // Try alternative: check if we can access panel after login attempt
      const checkResponse = await this.makeRequest('/panel/', 'GET')
      if (checkResponse && 
          checkResponse.statusCode !== 307 && 
          checkResponse.statusCode !== 302 && 
          checkResponse.statusCode !== 301 &&
          !checkResponse.raw?.includes('login') &&
          !checkResponse.raw?.includes('Redirect')) {
        console.log('Alternative login check passed')
        return true
      }
      
      console.error('VPN Panel login failed - response:', JSON.stringify(response))
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async addClient(inboundId: number, expiryDays: number, remark: string, ipLimit: number = 0): Promise<{ success: boolean; uuid?: string; subId?: string; error?: string }> {
    // Always login first to get fresh cookies
    const loggedIn = await this.login()
    if (!loggedIn) return { success: false, error: 'Login failed' }

    const clientUUID = crypto.randomUUID()
    const subId = Math.random().toString(36).substring(2, 18)
    const expiryTime = Date.now() + (expiryDays * 24 * 60 * 60 * 1000)

    const clientData = {
      id: clientUUID,
      flow: '',
      email: remark,
      limitIp: ipLimit,
      totalGB: 0,
      expiryTime: expiryTime,
      enable: true,
      tgId: '',
      subId: subId,
      reset: 0
    }

    const response = await this.makeRequest('/panel/api/inbounds/addClient', 'POST', {
      id: inboundId,
      settings: JSON.stringify({ clients: [clientData] })
    })

    if (response && response.success) {
      return { success: true, uuid: clientUUID, subId }
    }
    console.error('addClient failed - inboundId:', inboundId, 'response:', JSON.stringify(response))
    return { success: false, error: response?.msg || 'Failed to add client' }
  }

  generateVlessLink(uuid: string, remark: string, clientPort: number = 443): string {
    return `vless://${uuid}@${this.host}:${clientPort}?type=ws&encryption=none&path=%2F&host=speedtest.net&security=none#${remark}`
  }

  generateDynamicVlessLink(uuid: string, remark: string, config: {
    protocol: string
    port: number
    network: string
    security: string
    wsPath: string
    wsHost: string
    flow: string
    realityPbk: string
    realityFp: string
    realitySni: string
    realitySid: string
    realitySpx: string
    tlsServerName: string
    grpcServiceName: string
    customAddress?: string
    customWsHost?: string
    customPort?: number | null
  }, clientPort?: number): string {
    // Use customAddress override if set, otherwise use server host
    const host = config.customAddress || this.host
    // Use customPort override if set, then clientPort, then config.port
    const port = config.customPort || clientPort || config.port
    const params: string[] = []

    // Network type
    params.push(`type=${config.network || 'ws'}`)
    params.push(`encryption=none`)

    // Network-specific settings
    if (config.network === 'ws') {
      if (config.wsPath) params.push(`path=${encodeURIComponent(config.wsPath)}`)
      // Use customWsHost override if set, otherwise use wsHost from API
      const effectiveWsHost = config.customWsHost || config.wsHost
      if (effectiveWsHost) params.push(`host=${effectiveWsHost}`)
    } else if (config.network === 'grpc') {
      if (config.grpcServiceName) params.push(`serviceName=${config.grpcServiceName}`)
      params.push(`mode=gun`)
    } else if (config.network === 'tcp') {
      // tcp doesn't need extra params usually
    } else if (config.network === 'kcp' || config.network === 'mkcp') {
      // minimal kcp support
    }

    // Security
    if (config.security === 'reality') {
      params.push(`security=reality`)
      if (config.realityPbk) params.push(`pbk=${config.realityPbk}`)
      if (config.realityFp) params.push(`fp=${config.realityFp}`)
      if (config.realitySni) params.push(`sni=${config.realitySni}`)
      if (config.realitySid) params.push(`sid=${config.realitySid}`)
      if (config.realitySpx) params.push(`spx=${encodeURIComponent(config.realitySpx)}`)
      if (config.flow) params.push(`flow=${config.flow}`)
    } else if (config.security === 'tls') {
      params.push(`security=tls`)
      if (config.tlsServerName) params.push(`sni=${config.tlsServerName}`)
      if (config.flow) params.push(`flow=${config.flow}`)
    } else {
      params.push(`security=none`)
    }

    return `vless://${uuid}@${host}:${port}?${params.join('&')}#${encodeURIComponent(remark)}`
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    // Rate limit: prevent rapid repeated requests
    if (isRateLimited(session.userId)) {
      return NextResponse.json({ success: false, error: 'กรุณารอสักครู่แล้วลองใหม่' })
    }

    const formData = await request.formData()
    const serverId = formData.get('serverId') as string
    const isTrial = formData.get('trial') === 'true'
    const days = parseInt(formData.get('days') as string || '1')
    const customName = formData.get('customName') as string
    const ipLimitRaw = formData.get('ipLimit') as string
    const ipLimit = ipLimitRaw ? Math.max(0, Math.min(10, parseInt(ipLimitRaw) || 0)) : 0
    const selectedInboundIdRaw = formData.get('selectedInboundId') as string || ''
    const selectedInboundId = selectedInboundIdRaw ? parseInt(selectedInboundIdRaw) : null

    if (!serverId) {
      return NextResponse.json({ success: false, error: 'ไม่พบเซิร์ฟเวอร์' })
    }

    // Validate name for paid orders
    if (!isTrial && (!customName || !customName.trim())) {
      return NextResponse.json({ success: false, error: 'กรุณาตั้งชื่อบัญชี' })
    }

    // Sanitize customName - remove any potentially dangerous characters
    const sanitizedName = isTrial ? '' : customName.trim()
      .replace(/[<>\"'&\\\/\x00-\x1f]/g, '') // strip HTML, control chars, quotes, backslashes
      .substring(0, 30) // enforce max length server-side

    // Check trial
    if (isTrial) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const existingTrialToday = await prisma.vpnOrder.findFirst({
        where: {
          userId: session.userId,
          serverId: serverId,
          packageType: 'TRIAL',
          createdAt: { gte: today }
        }
      })
      
      if (existingTrialToday) {
        return NextResponse.json({ success: false, error: 'คุณใช้สิทธิ์ทดลองฟรีเซิร์ฟเวอร์นี้วันนี้ไปแล้ว กรุณารอรีเซ็ตเที่ยงคืนหรือลองเซิร์ฟเวอร์อื่น' })
      }
    } else if (!days || days < 1 || days > 30) {
      return NextResponse.json({ success: false, error: 'กรุณาเลือกจำนวนวัน 1-30 วัน' })
    }

    // Get server details
    const server = await prisma.vpnServer.findUnique({
      where: { id: serverId },
      include: {
        _count: {
          select: {
            orders: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!server) {
      return NextResponse.json({ success: false, error: 'ไม่พบเซิร์ฟเวอร์' })
    }

    // Check maxClients limit (0 = unlimited)
    if (server.maxClients > 0 && server._count.orders >= server.maxClients) {
      return NextResponse.json({ success: false, error: 'เซิร์ฟเวอร์นี้เต็มแล้ว (ถึงจำนวนผู้ใช้สูงสุด)' })
    }

    // Apply server's default IP limit if user didn't specify one
    const effectiveIpLimit = ipLimit > 0 ? ipLimit : (server.defaultIpLimit ?? 0)

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'ไม่พบผู้ใช้' })
    }

    // Check discount (only for paid orders)
    const hasDiscount = user.discountExpiry ? new Date(user.discountExpiry) > new Date() : false
    
    // Use per-server pricing instead of hardcoded value
    let pricePerDay = server.pricePerDay ?? 2
    if (hasDiscount) {
      pricePerDay = Math.max(0.5, pricePerDay * 0.5) // 50% discount
    }

    // Apply promo discount if user has one (permanent percentage discount)
    const promoPercent = user.promoDiscountPercent || 0
    if (promoPercent > 0) {
      pricePerDay = Math.max(0.5, Math.round(pricePerDay * (100 - promoPercent) / 100 * 100) / 100)
    }

    // Calculate total price using server package pricing or per-day calculation
    let totalPrice = 0
    if (!isTrial) {
      // Check for package pricing (weekly = 7 days, monthly = 30 days)
      if (days === 7 && server.priceWeekly != null) {
        totalPrice = hasDiscount ? server.priceWeekly * 0.5 : server.priceWeekly
        if (promoPercent > 0) {
          totalPrice = Math.max(0.5, Math.round(totalPrice * (100 - promoPercent) / 100 * 100) / 100)
        }
      } else if (days === 30 && server.priceMonthly != null) {
        totalPrice = hasDiscount ? server.priceMonthly * 0.5 : server.priceMonthly
        if (promoPercent > 0) {
          totalPrice = Math.max(0.5, Math.round(totalPrice * (100 - promoPercent) / 100 * 100) / 100)
        }
      } else {
        totalPrice = days * pricePerDay
      }
      // Add IP limit surcharge
      totalPrice += (effectiveIpLimit > 0 ? effectiveIpLimit * 1 : 0)
    }

    // Check balance (only for paid orders)
    if (!isTrial && user.balance < totalPrice) {
      return NextResponse.json({ success: false, error: `เครดิตไม่เพียงพอ (ต้องการ ${totalPrice} ฿)` })
    }

    // Detect protocol and connect to panel
    const useHttp = await VpnPanelAPI.detectProtocol(server.host, server.port, server.path)
    
    const panel = new VpnPanelAPI(
      server.host,
      server.port,
      server.path,
      server.username,
      server.password,
      useHttp
    )

    // Test login first
    const loginSuccess = await panel.login()
    
    if (!loginSuccess) {
      return NextResponse.json({ 
        success: false, 
        error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ VPN ได้ (Login failed) - กรุณาตรวจสอบข้อมูลรับรองในระบบ' 
      })
    }

    const remark = isTrial ? ('TRIAL_' + Math.random().toString(36).substring(2, 10)) : sanitizedName
    const expiryDays = isTrial ? (1 / 24) : days // 1 hour for trial

    // Determine which inbound to use based on selectedInboundId + inboundConfigs
    let targetInboundId = server.inboundId
    let inboundConfig: any = null

    const configs = server.inboundConfigs as any[] | null
    if (configs && configs.length > 0 && selectedInboundId !== null) {
      // Find the matching inbound config by inboundId
      inboundConfig = configs.find((c: any) => c.inboundId === selectedInboundId && c.enable !== false)
      if (inboundConfig) {
        targetInboundId = inboundConfig.inboundId
      }
    } else if (configs && configs.length > 0 && selectedInboundId === null) {
      // No specific inbound selected, use the first enabled config
      inboundConfig = configs.find((c: any) => c.enable !== false)
      if (inboundConfig) {
        targetInboundId = inboundConfig.inboundId
      }
    }

    const result = await panel.addClient(targetInboundId, expiryDays, remark, isTrial ? 0 : effectiveIpLimit)

    if (!result.success) {
      console.error('Add client failed:', result.error)
      return NextResponse.json({ success: false, error: result.error || 'ไม่สามารถสร้างบัญชีได้' })
    }

    // Calculate expiry
    const expiryTime = new Date()
    if (isTrial) {
      expiryTime.setHours(expiryTime.getHours() + 1) // 1 hour for trial
    } else {
      expiryTime.setDate(expiryTime.getDate() + days)
    }

    // Generate VLESS link - dynamic if we have inbound config, legacy fallback otherwise
    let vlessLink: string
    if (inboundConfig) {
      vlessLink = panel.generateDynamicVlessLink(result.uuid!, remark, {
        protocol: inboundConfig.protocol || 'vless',
        port: inboundConfig.port || server.clientPort,
        network: inboundConfig.network || 'ws',
        security: inboundConfig.security || 'none',
        wsPath: inboundConfig.wsPath || '/',
        wsHost: inboundConfig.wsHost || '',
        flow: inboundConfig.flow || '',
        realityPbk: inboundConfig.realityPbk || '',
        realityFp: inboundConfig.realityFp || '',
        realitySni: inboundConfig.realitySni || '',
        realitySid: inboundConfig.realitySid || '',
        realitySpx: inboundConfig.realitySpx || '',
        tlsServerName: inboundConfig.tlsServerName || '',
        grpcServiceName: inboundConfig.grpcServiceName || '',
        customAddress: inboundConfig.customAddress || '',
        customWsHost: inboundConfig.customWsHost || '',
        customPort: inboundConfig.customPort ?? null,
      }, server.clientPort)
    } else {
      // Legacy fallback - hardcoded ws+none format
      vlessLink = panel.generateVlessLink(result.uuid!, remark, server.clientPort)
    }

    // Create order and deduct balance in transaction (only deduct if not trial)
    const transactionOps: any[] = [
      prisma.vpnOrder.create({
        data: {
          userId: session.userId,
          serverId: serverId,
          packageType: isTrial ? 'TRIAL' : 'CUSTOM',
          price: totalPrice,
          duration: isTrial ? 1 : days,
          clientUUID: result.uuid!,
          remark: remark,
          subId: result.subId!,
          vlessLink: vlessLink,
          expiryTime: expiryTime,
          isActive: true,
          ipLimit: isTrial ? 0 : effectiveIpLimit
        }
      })
    ]
    
    // Only deduct balance if not trial
    if (!isTrial) {
      transactionOps.push(
        prisma.user.update({
          where: { id: session.userId },
          data: { balance: { decrement: totalPrice } }
        })
      )
    }
    
    await prisma.$transaction(transactionOps)

    // Update session balance (only if not trial)
    if (!isTrial) {
      const newBalance = user.balance - totalPrice
      await updateBalance(newBalance)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Buy VPN error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' })
  }
}
