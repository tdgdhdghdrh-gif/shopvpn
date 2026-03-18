import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, updateBalance } from '@/lib/session'
import https from 'https'
import http from 'http'

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

      console.log('VPN Panel login response:', JSON.stringify(response, null, 2))
      console.log('Cookies after login:', this.cookies)

      // Check multiple success indicators
      const hasSuccessFlag = response && (response.success === true || response.success === 'true')
      const hasSuccessMsg = response?.msg?.toLowerCase()?.includes('success') || response?.msg?.toLowerCase()?.includes('welcome')
      const hasCookies = this.cookies.length > 0 && this.cookies.some(c => 
        c.includes('3x-ui') || c.includes('session') || c.includes('token') || c.includes('auth')
      )

      console.log('Login check - successFlag:', hasSuccessFlag, 'successMsg:', hasSuccessMsg, 'cookies:', hasCookies)

      if (hasSuccessFlag || hasSuccessMsg || hasCookies) {
        return true
      }
      
      // Try alternative: check if we can access panel after login attempt
      const checkResponse = await this.makeRequest('/panel/', 'GET')
      if (checkResponse && !checkResponse.raw?.includes('login')) {
        console.log('Alternative login check passed')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async addClient(inboundId: number, expiryDays: number, remark: string): Promise<{ success: boolean; uuid?: string; subId?: string; error?: string }> {
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
      limitIp: 0,
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
    return { success: false, error: response?.msg || 'Failed to add client' }
  }

  generateVlessLink(uuid: string, remark: string, clientPort: number = 443): string {
    return `vless://${uuid}@${this.host}:${clientPort}?type=ws&encryption=none&path=%2F&host=speedtest.net&security=none#${remark}`
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' })
    }

    const formData = await request.formData()
    const serverId = formData.get('serverId') as string
    const isTrial = formData.get('trial') === 'true'
    const days = parseInt(formData.get('days') as string || '1')
    const customName = formData.get('customName') as string

    if (!serverId) {
      return NextResponse.json({ success: false, error: 'ไม่พบเซิร์ฟเวอร์' })
    }

    // Check trial
    if (isTrial) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const existingTrialToday = await prisma.vpnOrder.findFirst({
        where: {
          userId: session.userId,
          packageType: 'TRIAL',
          createdAt: { gte: today }
        }
      })
      
      if (existingTrialToday) {
        return NextResponse.json({ success: false, error: 'คุณใช้สิทธิ์ทดลองฟรีวันนี้ไปแล้ว กรุณารอรีเซ็ตเที่ยงคืน' })
      }
    } else if (!days || days < 1 || days > 30) {
      return NextResponse.json({ success: false, error: 'กรุณาเลือกจำนวนวัน 1-30 วัน' })
    }

    // Get server details
    const server = await prisma.vpnServer.findUnique({
      where: { id: serverId }
    })

    if (!server) {
      return NextResponse.json({ success: false, error: 'ไม่พบเซิร์ฟเวอร์' })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'ไม่พบผู้ใช้' })
    }

    // Check discount (only for paid orders)
    const hasDiscount = user.discountExpiry ? new Date(user.discountExpiry) > new Date() : false
    const pricePerDay = hasDiscount ? 1 : 2
    const totalPrice = isTrial ? 0 : days * pricePerDay

    // Check balance (only for paid orders)
    if (!isTrial && user.balance < totalPrice) {
      return NextResponse.json({ success: false, error: `เครดิตไม่เพียงพอ (ต้องการ ${totalPrice} ฿)` })
    }

    // Detect protocol and connect to panel
    const useHttp = await VpnPanelAPI.detectProtocol(server.host, server.port, server.path)
    console.log(`Connecting to ${server.host}:${server.port}${server.path} using ${useHttp ? 'HTTP' : 'HTTPS'}`)
    console.log(`Server credentials - Username: ${server.username}, InboundID: ${server.inboundId}`)
    
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
    console.log('Panel login result:', loginSuccess)
    
    if (!loginSuccess) {
      return NextResponse.json({ 
        success: false, 
        error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ VPN ได้ (Login failed) - กรุณาตรวจสอบข้อมูลรับรองในระบบ' 
      })
    }

    const remark = customName && customName.trim() ? customName.trim() : 'VPN_' + Math.random().toString(36).substring(2, 10)
    const expiryDays = isTrial ? (1 / 24) : days // 1 hour for trial
    const result = await panel.addClient(server.inboundId, expiryDays, remark)

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

    // Generate VLESS link
    const vlessLink = panel.generateVlessLink(result.uuid!, remark, server.clientPort)

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
          isActive: true
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
