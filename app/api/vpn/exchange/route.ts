import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, updateBalance, checkImpersonation } from '@/lib/session'
import https from 'https'
import http from 'http'
import crypto from 'crypto'

const EXCHANGE_FEE = 2 // ค่าบริการแลกเปลี่ยน 2 เครดิต

// VPN Panel API for exchange
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

  static async detectProtocol(host: string, port: number, path: string): Promise<boolean> {
    const httpPorts = [80, 8080, 8888, 5000, 3000]
    if (httpPorts.includes(port)) return true

    try {
      await new Promise<void>((resolve, reject) => {
        const req = https.request({
          hostname: host, port, path: path + '/login',
          method: 'HEAD', rejectUnauthorized: false, timeout: 5000,
        }, (res) => {
          if (res.statusCode && res.statusCode < 500) resolve()
          else reject(new Error('HTTPS not available'))
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
            hostname: host, port, path: path + '/login',
            method: 'HEAD', timeout: 5000,
          }, (res) => {
            if (res.statusCode && res.statusCode < 500) resolve()
            else reject(new Error('HTTP not available'))
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
    endpoint: string, method: string = 'GET',
    body: any = null, headers: Record<string, string> = {}
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
          bodyString = isFormData ? body : JSON.stringify(body)
          defaultHeaders['Content-Length'] = Buffer.byteLength(bodyString).toString()
        }

        const options = {
          hostname: url.hostname, port: url.port,
          path: url.pathname + url.search, method,
          headers: defaultHeaders, rejectUnauthorized: false, timeout: 30000,
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
                resolve(JSON.parse(data))
              } else {
                resolve({ success: res.statusCode && res.statusCode < 400, raw: data, statusCode: res.statusCode })
              }
            } catch {
              resolve({ success: res.statusCode && res.statusCode < 400, raw: data, statusCode: res.statusCode })
            }
          })
        })

        req.on('error', (err) => { console.error('VPN API error:', err.message); resolve(null) })
        req.on('timeout', () => { req.destroy(); resolve(null) })
        if (body) req.write(bodyString)
        req.end()
      } catch (error) { console.error('VPN API exception:', error); resolve(null) }
    })
  }

  async login(): Promise<boolean> {
    this.cookies = []
    const formData = new URLSearchParams()
    formData.append('username', this.username)
    formData.append('password', this.password)

    const response = await this.makeRequest('/login', 'POST', formData.toString(), {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json, text/plain, */*',
      'X-Requested-With': 'XMLHttpRequest'
    })

    const hasSuccessFlag = response && (response.success === true || response.success === 'true')
    const hasSuccessMsg = response?.msg?.toLowerCase()?.includes('success') || response?.msg?.toLowerCase()?.includes('welcome')
    const hasCookies = this.cookies.length > 0 && this.cookies.some((c: string) =>
      c.includes('3x-ui') || c.includes('session') || c.includes('token') || c.includes('auth')
    )

    return hasSuccessFlag || hasSuccessMsg || hasCookies
  }

  async getInboundDetails(inboundId: number): Promise<any> {
    const response = await this.makeRequest(`/panel/api/inbounds/get/${inboundId}`, 'GET')
    return response && response.success ? response.obj : null
  }

  async getClientSettings(inboundId: number, clientUUID: string, remark: string): Promise<{
    totalGB: number; limitIp: number; flow: string; tgId: string; subId: string; reset: number
  } | null> {
    const loggedIn = await this.login()
    if (!loggedIn) return null

    const inbound = await this.getInboundDetails(inboundId)
    if (!inbound?.settings) return null

    try {
      const settings = JSON.parse(inbound.settings)
      const client = settings.clients?.find((c: any) => c.id === clientUUID || c.email === remark)
      if (!client) return null
      return {
        totalGB: client.totalGB ?? 0,
        limitIp: client.limitIp ?? 0,
        flow: client.flow || '',
        tgId: client.tgId || '',
        subId: client.subId || '',
        reset: client.reset ?? 0
      }
    } catch {
      return null
    }
  }

  async deleteClient(inboundId: number, clientUUID: string): Promise<{ success: boolean; error?: string }> {
    const loggedIn = await this.login()
    if (!loggedIn) return { success: false, error: 'Login failed' }

    const response = await this.makeRequest(
      `/panel/api/inbounds/${inboundId}/delClient/${clientUUID}`,
      'POST'
    )

    if (response && response.success) {
      return { success: true }
    }
    return { success: false, error: response?.msg || 'Failed to delete client' }
  }

  async addClientWithSettings(
    inboundId: number,
    expiryTime: number,
    remark: string,
    options: { totalGB?: number; limitIp?: number; flow?: string; tgId?: string; reset?: number } = {}
  ): Promise<{ success: boolean; uuid?: string; subId?: string; error?: string }> {
    const loggedIn = await this.login()
    if (!loggedIn) return { success: false, error: 'Login failed' }

    const clientUUID = crypto.randomUUID()
    const subId = Math.random().toString(36).substring(2, 18)

    const clientData = {
      id: clientUUID,
      flow: options.flow || '',
      email: remark,
      limitIp: options.limitIp ?? 0,
      totalGB: options.totalGB ?? 0,
      expiryTime: expiryTime,
      enable: true,
      tgId: options.tgId || '',
      subId: subId,
      reset: options.reset ?? 0
    }

    const response = await this.makeRequest('/panel/api/inbounds/addClient', 'POST', {
      id: inboundId,
      settings: JSON.stringify({ clients: [clientData] })
    })

    if (response && response.success) {
      return { success: true, uuid: clientUUID, subId }
    }
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
    const host = config.customAddress || this.host
    const port = config.customPort || clientPort || config.port
    const params: string[] = []

    params.push(`type=${config.network || 'ws'}`)
    params.push(`encryption=none`)

    if (config.network === 'ws') {
      if (config.wsPath) params.push(`path=${encodeURIComponent(config.wsPath)}`)
      const effectiveWsHost = config.customWsHost || config.wsHost
      if (effectiveWsHost) params.push(`host=${effectiveWsHost}`)
    } else if (config.network === 'grpc') {
      if (config.grpcServiceName) params.push(`serviceName=${config.grpcServiceName}`)
      params.push(`mode=gun`)
    }

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

// GET - Fetch user's active VPN orders + available servers
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const [user, vpnOrders, servers] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, balance: true }
      }),
      prisma.vpnOrder.findMany({
        where: { userId: session.userId },
        include: {
          server: {
            select: { id: true, name: true, flag: true, isActive: true, host: true, clientPort: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.vpnServer.findMany({
        where: { isActive: true },
        select: { id: true, name: true, flag: true, host: true, clientPort: true, status: true },
        orderBy: { name: 'asc' }
      })
    ])

    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        balance: user.balance
      },
      vpnOrders,
      servers,
      exchangeFee: EXCHANGE_FEE
    })
  } catch (error) {
    console.error('Failed to fetch exchange data:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - Exchange server
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    const body = await request.json()
    const { orderId, newServerId } = body

    if (!orderId || !newServerId) {
      return NextResponse.json({ error: 'กรุณาระบุข้อมูลให้ครบถ้วน' }, { status: 400 })
    }

    // Get the VPN order with server info
    const order = await prisma.vpnOrder.findUnique({
      where: { id: orderId },
      include: { server: true, user: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'ไม่พบคำสั่งซื้อ' }, { status: 404 })
    }

    // Verify ownership
    if (order.userId !== session.userId) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })
    }

    // Check if order is expired
    if (new Date(order.expiryTime) <= new Date()) {
      return NextResponse.json({ error: 'โค้ดนี้หมดอายุแล้ว ไม่สามารถแลกเปลี่ยนได้' }, { status: 400 })
    }

    // Check if same server
    if (order.serverId === newServerId) {
      return NextResponse.json({ error: 'เซิร์ฟเวอร์ปลายทางต้องไม่ใช่เซิร์ฟเวอร์เดิม' }, { status: 400 })
    }

    // Get new server
    const newServer = await prisma.vpnServer.findUnique({
      where: { id: newServerId }
    })

    if (!newServer) {
      return NextResponse.json({ error: 'ไม่พบเซิร์ฟเวอร์ปลายทาง' }, { status: 404 })
    }

    if (!newServer.isActive) {
      return NextResponse.json({ error: 'เซิร์ฟเวอร์ปลายทางไม่พร้อมใช้งาน' }, { status: 400 })
    }

    // Check balance
    if (order.user.balance < EXCHANGE_FEE) {
      return NextResponse.json({
        error: `เครดิตไม่เพียงพอ (มี: ${order.user.balance} ฿, ต้องการ: ${EXCHANGE_FEE} ฿)`
      }, { status: 400 })
    }

    const oldServer = order.server

    // === Step 1: Get client settings from OLD server ===
    const oldUseHttp = await VpnPanelAPI.detectProtocol(oldServer.host, oldServer.port, oldServer.path)
    const oldPanel = new VpnPanelAPI(
      oldServer.host, oldServer.port, oldServer.path,
      oldServer.username, oldServer.password, oldUseHttp
    )

    const clientSettings = await oldPanel.getClientSettings(
      oldServer.inboundId, order.clientUUID, order.remark
    )

    // Use defaults if can't fetch (best effort)
    const totalGB = clientSettings?.totalGB ?? 0
    const limitIp = clientSettings?.limitIp ?? 0
    const flow = clientSettings?.flow ?? ''
    const tgId = clientSettings?.tgId ?? ''
    const reset = clientSettings?.reset ?? 0

    // === Step 2: Add client to NEW server (do this FIRST for safety) ===
    const newUseHttp = await VpnPanelAPI.detectProtocol(newServer.host, newServer.port, newServer.path)
    const newPanel = new VpnPanelAPI(
      newServer.host, newServer.port, newServer.path,
      newServer.username, newServer.password, newUseHttp
    )

    const expiryTimestamp = new Date(order.expiryTime).getTime()
    const addResult = await newPanel.addClientWithSettings(
      newServer.inboundId,
      expiryTimestamp,
      order.remark,
      { totalGB, limitIp, flow, tgId, reset }
    )

    if (!addResult.success) {
      console.error('Failed to add client to new server:', addResult.error)
      return NextResponse.json({
        error: 'ไม่สามารถสร้างบัญชีบนเซิร์ฟเวอร์ใหม่ได้ กรุณาลองใหม่อีกครั้ง'
      }, { status: 500 })
    }

    // === Step 3: Delete client from OLD server ===
    const deleteResult = await oldPanel.deleteClient(oldServer.inboundId, order.clientUUID)
    if (!deleteResult.success) {
      console.error('Failed to delete client from old server:', deleteResult.error)
      // Continue anyway - client was added to new server successfully
      // Old client will expire naturally
    }

    // === Step 4: Generate new VLESS link ===
    // Use dynamic generation with overrides if inboundConfigs available
    let newVlessLink: string
    const configs = newServer.inboundConfigs as any[] | null
    if (configs && configs.length > 0) {
      // Use first enabled config
      const inboundConfig = configs.find((c: any) => c.enable !== false)
      if (inboundConfig) {
        newVlessLink = newPanel.generateDynamicVlessLink(addResult.uuid!, order.remark, {
          protocol: inboundConfig.protocol || 'vless',
          port: inboundConfig.port || newServer.clientPort,
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
        }, newServer.clientPort)
      } else {
        newVlessLink = newPanel.generateVlessLink(addResult.uuid!, order.remark, newServer.clientPort)
      }
    } else {
      newVlessLink = newPanel.generateVlessLink(addResult.uuid!, order.remark, newServer.clientPort)
    }

    // === Step 5: Update database in transaction ===
    const [, updatedUser] = await prisma.$transaction([
      prisma.vpnOrder.update({
        where: { id: orderId },
        data: {
          serverId: newServerId,
          clientUUID: addResult.uuid!,
          subId: addResult.subId!,
          vlessLink: newVlessLink,
          // Keep same expiryTime, remark, duration, price, isActive
        }
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: { balance: { decrement: EXCHANGE_FEE } }
      })
    ])

    // === Step 6: Update session balance ===
    await updateBalance(updatedUser.balance)

    return NextResponse.json({
      success: true,
      message: `ย้ายเซิร์ฟเวอร์สำเร็จ`,
      newServer: newServer.name,
      newVlessLink,
      deducted: EXCHANGE_FEE,
      newBalance: updatedUser.balance
    })
  } catch (error) {
    console.error('Exchange VPN error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
