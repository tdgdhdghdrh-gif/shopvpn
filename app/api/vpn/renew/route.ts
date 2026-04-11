import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, updateBalance, checkImpersonation } from '@/lib/session'
import https from 'https'
import http from 'http'

// VPN Panel API for updateClient
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

  async updateClient(inboundId: number, clientUUID: string, newExpiryTime: number, remark: string, subId: string): Promise<{ success: boolean; error?: string }> {
    const loggedIn = await this.login()
    if (!loggedIn) return { success: false, error: 'Login failed' }

    const inbound = await this.getInboundDetails(inboundId)

    let clientSettings: any = null
    if (inbound && inbound.settings) {
      try {
        const settings = JSON.parse(inbound.settings)
        clientSettings = settings.clients?.find((c: any) => c.id === clientUUID || c.email === remark)
      } catch { /* ignore */ }
    }

    const clientData = {
      id: clientUUID,
      flow: clientSettings?.flow || '',
      email: remark,
      limitIp: clientSettings?.limitIp ?? 0,
      totalGB: clientSettings?.totalGB ?? 0,
      expiryTime: newExpiryTime,
      enable: true,
      tgId: clientSettings?.tgId || '',
      subId: subId,
      reset: clientSettings?.reset ?? 0
    }

    const response = await this.makeRequest(`/panel/api/inbounds/updateClient/${clientUUID}`, 'POST', {
      id: inboundId,
      settings: JSON.stringify({ clients: [clientData] })
    })

    if (response && response.success) {
      return { success: true }
    }
    return { success: false, error: response?.msg || 'Failed to update client on panel' }
  }
}

// GET - Fetch current user's VPN orders
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, balance: true, discountExpiry: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }

    const vpnOrders = await prisma.vpnOrder.findMany({
      where: { userId: session.userId },
      include: {
        server: {
          select: { id: true, name: true, flag: true, isActive: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const hasDiscount = user.discountExpiry ? new Date(user.discountExpiry) > new Date() : false
    const pricePerDay = hasDiscount ? 1 : 2

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        balance: user.balance,
        hasDiscount,
        pricePerDay
      },
      vpnOrders
    })
  } catch (error) {
    console.error('Failed to fetch VPN orders:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - Renew own VPN code
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
    const { orderId, days } = body

    if (!orderId || !days || days < 1 || days > 30) {
      return NextResponse.json({ error: 'กรุณาระบุจำนวนวัน (1-30)' }, { status: 400 })
    }

    // Get the VPN order - must belong to the current user
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

    if (!order.server) {
      return NextResponse.json({ error: 'ไม่พบเซิร์ฟเวอร์' }, { status: 404 })
    }

    // Calculate price (same as buy)
    const hasDiscount = order.user.discountExpiry ? new Date(order.user.discountExpiry) > new Date() : false
    const pricePerDay = hasDiscount ? 1 : 2
    const totalPrice = days * pricePerDay

    // Check balance
    if (order.user.balance < totalPrice) {
      return NextResponse.json({
        error: `เครดิตไม่เพียงพอ (มี: ${order.user.balance} ฿, ต้องการ: ${totalPrice} ฿)`
      }, { status: 400 })
    }

    // Connect to 3x-ui panel
    const useHttp = await VpnPanelAPI.detectProtocol(order.server.host, order.server.port, order.server.path)
    const panel = new VpnPanelAPI(
      order.server.host,
      order.server.port,
      order.server.path,
      order.server.username,
      order.server.password,
      useHttp
    )

    // Calculate new expiry: extend from current expiry if still active, from now if expired
    const now = new Date()
    const currentExpiry = new Date(order.expiryTime)
    const baseTime = currentExpiry > now ? currentExpiry : now
    const newExpiryTime = new Date(baseTime.getTime() + (days * 24 * 60 * 60 * 1000))

    // Update on 3x-ui panel
    const updateResult = await panel.updateClient(
      order.server.inboundId,
      order.clientUUID,
      newExpiryTime.getTime(),
      order.remark,
      order.subId
    )

    if (!updateResult.success) {
      console.error('Panel updateClient failed:', updateResult.error)
      return NextResponse.json({
        error: `ไม่สามารถอัปเดตบนเซิร์ฟเวอร์ VPN ได้`
      }, { status: 500 })
    }

    // Update database in transaction
    const [, updatedUser] = await prisma.$transaction([
      prisma.vpnOrder.update({
        where: { id: orderId },
        data: {
          expiryTime: newExpiryTime,
          isActive: true,
          duration: { increment: days }
        }
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: { balance: { decrement: totalPrice } }
      })
    ])

    // Update session balance
    await updateBalance(updatedUser.balance)

    return NextResponse.json({
      success: true,
      message: `ต่ออายุสำเร็จ ${days} วัน`,
      newExpiry: newExpiryTime.toISOString(),
      deducted: totalPrice,
      newBalance: updatedUser.balance
    })
  } catch (error) {
    console.error('Failed to renew VPN:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
