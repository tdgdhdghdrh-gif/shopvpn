'use server'

import https from 'https'
import http from 'http'
import { URL } from 'url'
import crypto from 'crypto'
import { prisma } from './prisma'
import { updateBalance } from './session'

// Panel Proxy Configuration
const USE_PROXY = process.env.USE_PANEL_PROXY === 'true'
const PROXY_URL = process.env.PANEL_PROXY_URL || 'http://103.253.72.93:3001'
const PROXY_API_KEY = process.env.PANEL_PROXY_API_KEY || ''

// ===== Helper Functions =====
function generateUUID() {
  return crypto.randomUUID()
}

function generateRandomString(length: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ===== Proxy API Client =====
async function proxyRequest(endpoint: string, method: string = 'POST', body: any = null, cookies: string = ''): Promise<any> {
  return new Promise((resolve) => {
    try {
      const url = new URL(`${PROXY_URL}${endpoint}`)
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': PROXY_API_KEY,
          ...(cookies && { 'Cookie': cookies })
        },
        timeout: 30000,
      }

      const isHttps = url.protocol === 'https:'
      const client = isHttps ? https : http
      
      const req = client.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data)
            // Forward cookies from proxy response
            if (res.headers['set-cookie']) {
              parsed._cookies = res.headers['set-cookie']
            }
            resolve(parsed)
          } catch {
            resolve({ success: false, raw: data })
          }
        })
      })

      req.on('error', (err) => {
        console.error('[Proxy] Request error:', err.message)
        resolve(null)
      })
      
      req.on('timeout', () => {
        req.destroy()
        resolve(null)
      })
      
      if (body) req.write(JSON.stringify(body))
      req.end()
    } catch (error) {
      console.error('[Proxy] Exception:', error)
      resolve(null)
    }
  })
}

// ===== VPN Server API Class =====
class VpnPanelAPI {
  private host: string
  private port: number
  private path: string
  private username: string
  private password: string
  private useHttp: boolean
  private cookies: string[] = []
  private isLoggedIn: boolean = false
  private useProxy: boolean
  private loginPromise: Promise<boolean> | null = null

  constructor(host: string, port: number, path: string, username: string, password: string, useHttp: boolean = false) {
    this.host = host
    this.port = port
    this.path = path
    this.username = username
    this.password = password
    this.useHttp = useHttp
    this.useProxy = USE_PROXY
  }

  private getBaseUrl(): string {
    const protocol = this.useHttp ? 'http' : 'https'
    return `${protocol}://${this.host}:${this.port}${this.path}`
  }

  // Try to detect if server uses HTTP or HTTPS (skip if using proxy)
  static async detectProtocol(host: string, port: number, path: string): Promise<boolean> {
    // If using proxy, always return false (HTTPS is handled by proxy)
    if (USE_PROXY) {
      return false
    }
    
    // Common HTTP ports
    const httpPorts = [80, 8080, 8888, 5000, 3000]
    if (httpPorts.includes(port)) {
      return true // Use HTTP
    }
    
    // Try HTTPS first
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
      return false // Use HTTPS
    } catch {
      // HTTPS failed, try HTTP
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
        return true // Use HTTP
      } catch {
        return false // Default to HTTPS
      }
    }
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
    headers: Record<string, string> = {},
    redirectCount: number = 0
  ): Promise<any> {
    if (redirectCount > 5) return null

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
            // Body is already form-data string
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

        // Choose http or https based on URL protocol
        const isHttps = url.protocol === 'https:'
        const client = isHttps ? https : http
        
        const req = client.request(options, (res) => {
          let data = ''
          
          if (res.headers['set-cookie']) {
            res.headers['set-cookie'].forEach((cookie: string) => this.setCookie(cookie))
          }

          // Handle redirect - but don't follow redirect for login POST
          if ([301, 302, 307, 308].includes(res.statusCode || 0) && res.headers.location) {
            let nextUrl = res.headers.location
            if (!nextUrl.startsWith('http')) {
              nextUrl = `${url.protocol}//${url.host}${nextUrl}`
            }
            resolve(this.makeRequest(nextUrl, method, body, headers, redirectCount + 1))
            return
          }

          res.on('data', (chunk) => { data += chunk })
          res.on('end', () => {
            try {
              // Try to parse as JSON first
              if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
                const parsedData = JSON.parse(data)
                resolve(parsedData)
              } else {
                // Not JSON, return as raw with success flag based on status code
                resolve({ 
                  success: res.statusCode && res.statusCode < 400, 
                  raw: data,
                  statusCode: res.statusCode 
                })
              }
            } catch (error) {
              // JSON parse error, return raw data
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
    if (this.isLoggedIn) return true

    // Prevent concurrent login attempts (race condition from Promise.all)
    if (this.loginPromise) return this.loginPromise

    this.loginPromise = this._doLogin()
    try {
      return await this.loginPromise
    } finally {
      this.loginPromise = null
    }
  }

  private async _doLogin(): Promise<boolean> {
    // Clear old cookies before login
    this.cookies = []

    // Use proxy if enabled
    if (this.useProxy) {
      console.log(`[VPN API] Logging in via proxy: ${PROXY_URL}/login`)
      
      const response = await proxyRequest('/login', 'POST', {
        username: this.username,
        password: this.password,
        twoFactorCode: ''
      })

      console.log(`[VPN API] Proxy login response:`, JSON.stringify(response, null, 2))

      if (response?._cookies) {
        response._cookies.forEach((cookie: string) => this.setCookie(cookie))
      }

      if (response?.success === true) {
        this.isLoggedIn = true
        console.log(`[VPN API] Login via proxy successful!`)
        return true
      }
      
      console.log(`[VPN API] Login via proxy failed!`)
      return false
    }

    // Direct connection (fallback)
    console.log(`[VPN API] Logging in directly to ${this.getBaseUrl()}/login`)

    // Use form-data for 3X-UI login
    const formData = new URLSearchParams()
    formData.append('username', this.username)
    formData.append('password', this.password)
    formData.append('twoFactorCode', '')

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

    const hasSuccessFlag = response && (response.success === true || response.success === 'true')
    const hasSuccessText = response?.raw?.toLowerCase()?.includes('success')
    const hasCookies = this.cookies.length > 0 && this.cookies.some(c => c.includes('3x-ui') || c.includes('session'))
    
    if (hasSuccessFlag || hasSuccessText || hasCookies) {
      this.isLoggedIn = true
      return true
    }
    
    return false
  }

  async getInboundDetails(inboundId: number): Promise<any> {
    if (!this.isLoggedIn) await this.login()
    
    const response = await this.makeRequest(`/panel/api/inbounds/get/${inboundId}`, 'GET')
    return response && response.success ? response.obj : null
  }

  async addClient(inboundId: number, expiryDays: number = 1): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.isLoggedIn) {
      const loggedIn = await this.login()
      if (!loggedIn) return { success: false, error: 'Login failed' }
    }

    const clientUUID = generateUUID()
    const remark = 'VPN_' + generateRandomString(8)
    const subId = generateRandomString(16)
    const expiryTime = Date.now() + (expiryDays * 24 * 60 * 60 * 1000) // Use expiryDays parameter

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

    // Use proxy if enabled
    if (this.useProxy) {
      const response = await proxyRequest('/addClient', 'POST', {
        id: inboundId,
        settings: JSON.stringify({ clients: [clientData] })
      }, this.getCookieHeader())

      if (response?.success) {
        return {
          success: true,
          data: {
            uuid: clientUUID,
            remark,
            subId,
            expiryTime
          }
        }
      } else {
        return { success: false, error: response?.msg || 'Failed to add client via proxy' }
      }
    }

    // Direct connection
    const response = await this.makeRequest('/panel/api/inbounds/addClient', 'POST', {
      id: inboundId,
      settings: JSON.stringify({ clients: [clientData] })
    })

    if (response && response.success) {
      return {
        success: true,
        data: {
          uuid: clientUUID,
          remark,
          subId,
          expiryTime
        }
      }
    } else {
      return { success: false, error: response?.msg || 'Failed to add client' }
    }
  }

  generateVlessLink(uuid: string, remark: string, clientPort: number = 443): string {
    // Use clientPort from database (could be 443, 8443, 2053, etc.)
    return `vless://${uuid}@${this.host}:${clientPort}?type=ws&encryption=none&path=%2F&host=speedtest.net&security=none#${remark}`
  }

  // Get all inbounds list
  async listInbounds(): Promise<any> {
    if (!this.isLoggedIn) await this.login()

    if (this.useProxy) {
      const response = await proxyRequest('/inbounds', 'GET', null, this.getCookieHeader())
      return response
    }

    return this.makeRequest('/panel/api/inbounds/list', 'GET')
  }

  // Get client IPs by email (remark)
  async getClientIps(email: string): Promise<any> {
    if (!this.isLoggedIn) {
      const loggedIn = await this.login()
      console.log(`[getClientIps] Login result for ${this.host}: ${loggedIn}`)
    }

    if (this.useProxy) {
      const response = await proxyRequest(`/clientIps/${encodeURIComponent(email)}`, 'GET', null, this.getCookieHeader())
      console.log(`[getClientIps] Proxy response for ${email}:`, JSON.stringify(response))
      return response
    }

    const result = await this.makeRequest(`/panel/api/inbounds/clientIps/${encodeURIComponent(email)}`, 'POST')
    console.log(`[getClientIps] Direct response for ${email}:`, JSON.stringify(result))
    return result
  }

  // Get client traffic by email
  async getClientTraffics(email: string): Promise<any> {
    if (!this.isLoggedIn) {
      const loggedIn = await this.login()
      console.log(`[getClientTraffics] Login result for ${this.host}: ${loggedIn}`)
    }

    if (this.useProxy) {
      const response = await proxyRequest(`/clientTraffics/${encodeURIComponent(email)}`, 'GET', null, this.getCookieHeader())
      console.log(`[getClientTraffics] Proxy response for ${email}:`, JSON.stringify(response))
      return response
    }

    const result = await this.makeRequest(`/panel/api/inbounds/getClientTraffics/${encodeURIComponent(email)}`, 'GET')
    console.log(`[getClientTraffics] Direct response for ${email}:`, JSON.stringify(result))
    return result
  }

  // Get online clients
  async getOnlineClients(): Promise<any> {
    if (!this.isLoggedIn) {
      const loggedIn = await this.login()
      console.log(`[getOnlineClients] Login result for ${this.host}: ${loggedIn}`)
    }

    if (this.useProxy) {
      const response = await proxyRequest('/onlines', 'POST', {}, this.getCookieHeader())
      console.log(`[getOnlineClients] Proxy response:`, JSON.stringify(response))
      return response
    }

    const result = await this.makeRequest('/panel/api/inbounds/onlines', 'POST')
    console.log(`[getOnlineClients] Direct response:`, JSON.stringify(result))
    return result
  }

  // Update client (enable/disable, change settings) - does NOT change expiryTime
  async updateClient(inboundId: number, clientUUID: string, clientData: any): Promise<{ success: boolean; error?: string }> {
    if (!this.isLoggedIn) {
      const loggedIn = await this.login()
      if (!loggedIn) return { success: false, error: 'Login failed' }
    }

    const payload = {
      id: inboundId,
      settings: JSON.stringify({ clients: [clientData] })
    }

    if (this.useProxy) {
      const response = await proxyRequest(`/updateClient/${clientUUID}`, 'POST', payload, this.getCookieHeader())
      if (response?.success) {
        return { success: true }
      }
      return { success: false, error: response?.msg || 'Failed to update client via proxy' }
    }

    const response = await this.makeRequest(`/panel/api/inbounds/updateClient/${clientUUID}`, 'POST', payload)
    if (response && response.success) {
      return { success: true }
    }
    return { success: false, error: response?.msg || 'Failed to update client' }
  }

  // Delete client
  async deleteClient(inboundId: number, clientUUID: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isLoggedIn) {
      const loggedIn = await this.login()
      if (!loggedIn) return { success: false, error: 'Login failed' }
    }

    const payload = {
      id: inboundId,
      clientId: clientUUID,
    }

    if (this.useProxy) {
      const response = await proxyRequest(`/delClient`, 'POST', payload, this.getCookieHeader())
      if (response?.success) {
        return { success: true }
      }
      return { success: false, error: response?.msg || 'Failed to delete client via proxy' }
    }

    const response = await this.makeRequest(`/panel/api/inbounds/${inboundId}/delClient/${clientUUID}`, 'POST', payload)
    if (response && response.success) {
      return { success: true }
    }
    return { success: false, error: response?.msg || 'Failed to delete client' }
  }

  // Reset all client traffics for a specific inbound
  async resetAllClientTraffics(inboundId: number): Promise<{ success: boolean; error?: string }> {
    if (!this.isLoggedIn) {
      const loggedIn = await this.login()
      if (!loggedIn) return { success: false, error: 'Login failed' }
    }

    if (this.useProxy) {
      const response = await proxyRequest(`/resetAllClientTraffics/${inboundId}`, 'POST', {}, this.getCookieHeader())
      if (response?.success) {
        return { success: true }
      }
      return { success: false, error: response?.msg || 'Failed to reset traffics via proxy' }
    }

    const response = await this.makeRequest(`/panel/api/inbounds/resetAllClientTraffics/${inboundId}`, 'POST')
    if (response && response.success) {
      return { success: true }
    }
    return { success: false, error: response?.msg || 'Failed to reset traffics' }
  }

  // Reset all inbound traffics
  async resetAllTraffics(): Promise<{ success: boolean; error?: string }> {
    if (!this.isLoggedIn) {
      const loggedIn = await this.login()
      if (!loggedIn) return { success: false, error: 'Login failed' }
    }

    if (this.useProxy) {
      const response = await proxyRequest(`/resetAllTraffics`, 'POST', {}, this.getCookieHeader())
      if (response?.success) {
        return { success: true }
      }
      return { success: false, error: response?.msg || 'Failed to reset all traffics via proxy' }
    }

    const response = await this.makeRequest(`/panel/api/inbounds/resetAllTraffics`, 'POST')
    if (response && response.success) {
      return { success: true }
    }
    return { success: false, error: response?.msg || 'Failed to reset all traffics' }
  }
}

// ===== Server Actions =====

// Get all active VPN servers
export async function getVpnServers() {
  return prisma.vpnServer.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { ping: 'asc' }],
    select: {
      id: true,
      name: true,
      flag: true,
      // Sensitive fields (host, port, path, username, password) are NOT exposed here.
      // API routes fetch them directly from the database when needed.
      protocol: true,
      tlsType: true,
      flow: true,
      sni: true,
      network: true,
      ping: true,
      load: true,
      status: true,
      isActive: true,
      supportsAis: true,
      supportsTrue: true,
      supportsDtac: true,
      category: true,
      speed: true,
      clientPort: true,
      inboundConfigs: true,
      createdAt: true,
      updatedAt: true,
      // Per-server pricing
      pricePerDay: true,
      priceWeekly: true,
      priceMonthly: true,
      customPackages: true,
      // Decoration
      description: true,
      badge: true,
      tags: true,
      features: true,
      themeColor: true,
      themeGradient: true,
      imageUrl: true,
      sortOrder: true,
      // Limits
      maxClients: true,
      defaultIpLimit: true,
      _count: {
        select: {
          orders: {
            where: { isActive: true }
          }
        }
      }
    }
  })
}

// Get server by ID
export async function getVpnServerById(serverId: string) {
  return prisma.vpnServer.findUnique({
    where: { id: serverId }
  })
}

// Helper function to check if user has active discount
export async function hasActiveDiscount(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { discountExpiry: true }
  })
  
  if (!user?.discountExpiry) return false
  
  return new Date(user.discountExpiry) > new Date()
}

// Get discounted price (1 THB per day)
export async function getDiscountedPrice(packageType: string): Promise<number> {
  const discountPrices: Record<string, number> = {
    'TRIAL': 0,
    'DAILY': 1,    // 1 บาทต่อวัน
    'WEEKLY': 7,   // 7 บาทสำหรับ 7 วัน
    'MONTHLY': 30  // 30 บาทสำหรับ 30 วัน
  }
  return discountPrices[packageType] ?? 0
}

// Create VPN order
export async function createVpnOrder(serverId: string, packageType: string, userId: string) {
  try {
    // Package pricing
    const packages: Record<string, { price: number; days: number; hours?: number }> = {
      'TRIAL': { price: 0, days: 0, hours: 1 },
      'DAILY': { price: 4, days: 1 },
      'WEEKLY': { price: 30, days: 7 },
      'MONTHLY': { price: 50, days: 30 }
    }

    const pkg = packages[packageType]
    if (!pkg) {
      return { success: false, error: 'แพ็คเกจไม่ถูกต้อง' }
    }

    // Get server details
    const server = await prisma.vpnServer.findUnique({
      where: { id: serverId }
    })

    if (!server) {
      return { success: false, error: 'ไม่พบเซิร์ฟเวอร์' }
    }

    // Check user balance and discount status
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    


    if (!user) {
      return { success: false, error: 'ไม่พบผู้ใช้' }
    }
    
    // Check if user has active discount
    const hasDiscount = user.discountExpiry ? new Date(user.discountExpiry) > new Date() : false
    const finalPrice = hasDiscount ? await getDiscountedPrice(packageType) : pkg.price
    
    // Check if user already used trial today (for TRIAL package)
    if (packageType === 'TRIAL') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const existingTrialToday = await prisma.vpnOrder.findFirst({
        where: {
          userId,
          serverId,
          packageType: 'TRIAL',
          createdAt: {
            gte: today
          }
        }
      })
      
      if (existingTrialToday) {
        return { success: false, error: 'คุณใช้สิทธิ์ทดลองฟรีเซิร์ฟเวอร์นี้วันนี้ไปแล้ว กรุณารอรีเซ็ตเที่ยงคืนหรือลองเซิร์ฟเวอร์อื่น' }
      }
    }
    
    // Check balance for paid packages
    if (finalPrice > 0 && user.balance < finalPrice) {
      return { success: false, error: `เครดิตไม่เพียงพอ (มี: ${user.balance} ฿, ต้องการ: ${finalPrice} ฿)` }
    }

    // Detect protocol (HTTP or HTTPS) and connect to panel
    const useHttp = await VpnPanelAPI.detectProtocol(server.host, server.port, server.path)
    console.log(`Connecting to ${server.host}:${server.port} using ${useHttp ? 'HTTP' : 'HTTPS'}`)
    
    const panel = new VpnPanelAPI(
      server.host,
      server.port,
      server.path,
      server.username,
      server.password,
      useHttp
    )

    // Calculate expiry days for API (convert hours to fractional days if needed)
    const expiryDays = packageType === 'TRIAL' && pkg.hours ? pkg.hours / 24 : pkg.days
    
    const result = await panel.addClient(server.inboundId, expiryDays)
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to create VPN' }
    }

    // Calculate expiry for database
    const expiryTime = new Date()
    if (packageType === 'TRIAL' && pkg.hours) {
      expiryTime.setHours(expiryTime.getHours() + pkg.hours)
    } else {
      expiryTime.setDate(expiryTime.getDate() + pkg.days)
    }

    // Generate VLESS link (uses clientPort from server config - could be 443, 8443, etc.)
    const vlessLink = panel.generateVlessLink(
      result.data!.uuid,
      result.data!.remark,
      server.clientPort
    )

    // Use transaction to ensure atomicity
    const [order, updatedUser] = await prisma.$transaction([
      // Create order
      prisma.vpnOrder.create({
        data: {
          userId,
          serverId,
          packageType,
          price: finalPrice,
          duration: packageType === 'TRIAL' ? (pkg.hours || 1) : pkg.days,
          clientUUID: result.data!.uuid,
          remark: result.data!.remark,
          subId: result.data!.subId,
          vlessLink,
          expiryTime
        }
      }),
      // Deduct balance
      prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: finalPrice } }
      })
    ])

    // Update session balance
    await updateBalance(updatedUser.balance)

    return { success: true, order }
  } catch (error) {
    console.error('Create VPN order error:', error)
    return { success: false, error: 'Failed to create order' }
  }
}

// Get user's VPN orders
export async function getMyVpnOrders(userId: string) {
  return prisma.vpnOrder.findMany({
    where: { userId },
    include: { server: { select: { name: true, flag: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

// ===== Admin Actions =====

// Add VPN server (admin only)
export async function addVpnServer(formData: FormData) {
  'use server'
  
  const name = formData.get('name') as string
  const flag = formData.get('flag') as string
  const host = formData.get('host') as string
  const port = parseInt(formData.get('port') as string)
  const path = formData.get('path') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const inboundId = parseInt(formData.get('inboundId') as string)
  const protocol = formData.get('protocol') as string || 'vless'
  const tlsType = formData.get('tlsType') as string || 'Reality'
  const flow = formData.get('flow') as string || 'xtls-rprx'
  const sni = formData.get('sni') as string || 'google.co.th'
  const clientPort = parseInt(formData.get('clientPort') as string) || 443

  if (!name || !host || !port || !path || !username || !password || !inboundId) {
    throw new Error('Missing required fields')
  }

  await prisma.vpnServer.create({
    data: {
      name,
      flag: flag || '🌐',
      host,
      port,
      path,
      username,
      password,
      inboundId,
      protocol,
      tlsType,
      flow,
      sni,
      clientPort,
      isActive: true
    }
  })
}

// Delete VPN server (admin only)
export async function deleteVpnServer(serverId: string) {
  'use server'
  await prisma.vpnServer.delete({
    where: { id: serverId }
  })
}

// Get all VPN servers for admin
export async function getAllVpnServers() {
  return prisma.vpnServer.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      flag: true,
      host: true,
      port: true,
      path: true,
      username: true,
      password: true,
      inboundId: true,
      protocol: true,
      tlsType: true,
      flow: true,
      sni: true,
      network: true,
      ping: true,
      load: true,
      status: true,
      isActive: true,
      supportsAis: true,
      supportsTrue: true,
      supportsDtac: true,
      clientPort: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

// ===== Panel Management Actions =====

// Create a panel API instance for a given server
export async function createPanelApi(serverId: string) {
  const server = await prisma.vpnServer.findUnique({ where: { id: serverId } })
  if (!server) return null
  
  const useHttp = await VpnPanelAPI.detectProtocol(server.host, server.port, server.path)
  const panel = new VpnPanelAPI(
    server.host, server.port, server.path,
    server.username, server.password, useHttp
  )
  return { panel, server }
}

// Admin: List inbounds for a server
export async function adminListInbounds(serverId: string) {
  const ctx = await createPanelApi(serverId)
  if (!ctx) return { success: false, error: 'Server not found' }
  
  const result = await ctx.panel.listInbounds()
  if (result && result.success) {
    return { success: true, data: result.obj }
  }
  return { success: false, error: result?.msg || 'Failed to list inbounds' }
}

// Admin: Get inbound details 
export async function adminGetInbound(serverId: string, inboundId: number) {
  const ctx = await createPanelApi(serverId)
  if (!ctx) return { success: false, error: 'Server not found' }
  
  const data = await ctx.panel.getInboundDetails(inboundId)
  if (data) {
    return { success: true, data }
  }
  return { success: false, error: 'Failed to get inbound' }
}

// Admin: Get client IPs
export async function adminGetClientIps(serverId: string, email: string) {
  const ctx = await createPanelApi(serverId)
  if (!ctx) return { success: false, error: 'Server not found' }
  
  const result = await ctx.panel.getClientIps(email)
  if (result && result.success) {
    return { success: true, data: result.obj }
  }
  return { success: false, error: result?.msg || 'Failed to get client IPs', data: null }
}

// Admin: Get client traffic
export async function adminGetClientTraffic(serverId: string, email: string) {
  const ctx = await createPanelApi(serverId)
  if (!ctx) return { success: false, error: 'Server not found' }
  
  const result = await ctx.panel.getClientTraffics(email)
  if (result && result.success) {
    return { success: true, data: result.obj }
  }
  return { success: false, error: result?.msg || 'Failed to get client traffic', data: null }
}

// Admin: Get online clients
export async function adminGetOnlineClients(serverId: string) {
  const ctx = await createPanelApi(serverId)
  if (!ctx) return { success: false, error: 'Server not found' }
  
  const result = await ctx.panel.getOnlineClients()
  if (result && result.success) {
    return { success: true, data: result.obj }
  }
  return { success: false, error: result?.msg || 'Failed to get online clients', data: null }
}

// Admin: Toggle client enable/disable (preserves expiryTime)
export async function adminToggleClient(serverId: string, inboundId: number, clientData: any, enable: boolean) {
  const ctx = await createPanelApi(serverId)
  if (!ctx) return { success: false, error: 'Server not found' }
  
  const updatedClient = { ...clientData, enable }
  return ctx.panel.updateClient(inboundId, clientData.id, updatedClient)
}

// Admin: Update client settings
export async function adminUpdateClient(serverId: string, inboundId: number, clientUUID: string, clientData: any) {
  const ctx = await createPanelApi(serverId)
  if (!ctx) return { success: false, error: 'Server not found' }
  
  return ctx.panel.updateClient(inboundId, clientUUID, clientData)
}

// Admin: Delete client
export async function adminDeleteClient(serverId: string, inboundId: number, clientUUID: string) {
  const ctx = await createPanelApi(serverId)
  if (!ctx) return { success: false, error: 'Server not found' }
  
  return ctx.panel.deleteClient(inboundId, clientUUID)
}

// Admin: Reset all client traffics for an inbound
export async function adminResetInboundTraffics(serverId: string, inboundId: number) {
  const ctx = await createPanelApi(serverId)
  if (!ctx) return { success: false, error: 'Server not found' }
  
  return ctx.panel.resetAllClientTraffics(inboundId)
}

// Admin: Reset all traffics
export async function adminResetAllTraffics(serverId: string) {
  const ctx = await createPanelApi(serverId)
  if (!ctx) return { success: false, error: 'Server not found' }
  
  return ctx.panel.resetAllTraffics()
}

// ===== User Connection Info =====

// Get user connection info: IPs, traffic, online status for all their VPN orders
export async function getUserConnectionInfo(userId: string) {
  console.log(`[getUserConnectionInfo] Fetching for userId: ${userId}`)
  console.log(`[getUserConnectionInfo] USE_PROXY=${USE_PROXY}, PROXY_URL=${PROXY_URL}`)
  
  const orders = await prisma.vpnOrder.findMany({
    where: { userId },
    include: { server: true },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`[getUserConnectionInfo] Found ${orders.length} orders`)

  const results = []

  for (const order of orders) {
    console.log(`[getUserConnectionInfo] Processing order ${order.id}: remark=${order.remark}, server=${order.server.name} (${order.server.host}:${order.server.port})`)
    
    try {
      const useHttp = await VpnPanelAPI.detectProtocol(order.server.host, order.server.port, order.server.path)
      console.log(`[getUserConnectionInfo] Protocol detection: useHttp=${useHttp} for ${order.server.host}:${order.server.port}`)
      
      const panel = new VpnPanelAPI(
        order.server.host, order.server.port, order.server.path,
        order.server.username, order.server.password, useHttp
      )

      // Login first and log the result
      const loginSuccess = await panel.login()
      console.log(`[getUserConnectionInfo] Login result for ${order.server.host}: ${loginSuccess}`)

      if (!loginSuccess) {
        console.error(`[getUserConnectionInfo] LOGIN FAILED for server ${order.server.host}:${order.server.port}${order.server.path}`)
        results.push({
          orderId: order.id,
          serverId: order.serverId,
          serverName: order.server.name,
          serverFlag: order.server.flag,
          remark: order.remark,
          clientUUID: order.clientUUID,
          inboundId: order.server.inboundId,
          packageType: order.packageType,
          vlessLink: order.vlessLink,
          expiryTime: order.expiryTime,
          isActive: order.isActive,
          createdAt: order.createdAt,
          ips: [],
          traffic: null,
          isOnline: false,
          clientEnabled: true,
          error: `Login failed to panel ${order.server.host}`
        })
        continue
      }

      // Get IPs, traffic, and online status in parallel
      const [ipsResult, trafficResult, onlineResult] = await Promise.all([
        panel.getClientIps(order.remark).catch((e) => { console.error(`[getUserConnectionInfo] getClientIps error:`, e); return null }),
        panel.getClientTraffics(order.remark).catch((e) => { console.error(`[getUserConnectionInfo] getClientTraffics error:`, e); return null }),
        panel.getOnlineClients().catch((e) => { console.error(`[getUserConnectionInfo] getOnlineClients error:`, e); return null }),
      ])

      console.log(`[getUserConnectionInfo] Raw ipsResult for ${order.remark}:`, JSON.stringify(ipsResult))
      console.log(`[getUserConnectionInfo] Raw trafficResult for ${order.remark}:`, JSON.stringify(trafficResult))
      console.log(`[getUserConnectionInfo] Raw onlineResult for ${order.remark}:`, JSON.stringify(onlineResult))

      // Parse IPs (filter out 3X-UI's "No IP Record" response when no client has connected)
      let ips: string[] = []
      if (ipsResult?.success && ipsResult.obj && ipsResult.obj !== 'No IP Record') {
        if (typeof ipsResult.obj === 'string') {
          try { ips = JSON.parse(ipsResult.obj) } catch { ips = ipsResult.obj.split(',').map((s: string) => s.trim()).filter(Boolean) }
        } else if (Array.isArray(ipsResult.obj)) {
          ips = ipsResult.obj
        }
      }
      console.log(`[getUserConnectionInfo] Parsed IPs for ${order.remark}: [${ips.join(', ')}] (count: ${ips.length})`)

      // Parse traffic
      const traffic = trafficResult?.success ? trafficResult.obj : null

      // Check online status (3x-ui returns a flat array of email strings)
      let isOnline = false
      if (onlineResult?.success && Array.isArray(onlineResult.obj)) {
        isOnline = onlineResult.obj.includes(order.remark)
      }
      console.log(`[getUserConnectionInfo] Online status for ${order.remark}: ${isOnline}`)

      // Get full inbound details to find the client's current state
      let clientState = null
      try {
        const inboundData = await panel.getInboundDetails(order.server.inboundId)
        if (inboundData?.settings) {
          const settings = typeof inboundData.settings === 'string' ? JSON.parse(inboundData.settings) : inboundData.settings
          clientState = settings.clients?.find((c: any) => c.id === order.clientUUID || c.email === order.remark)
        }
        console.log(`[getUserConnectionInfo] Client state for ${order.remark}: enabled=${clientState?.enable}`)
      } catch (e) {
        console.error(`[getUserConnectionInfo] getInboundDetails error for ${order.remark}:`, e)
      }

      results.push({
        orderId: order.id,
        serverId: order.serverId,
        serverName: order.server.name,
        serverFlag: order.server.flag,
        remark: order.remark,
        clientUUID: order.clientUUID,
        inboundId: order.server.inboundId,
        packageType: order.packageType,
        vlessLink: order.vlessLink,
        expiryTime: order.expiryTime,
        isActive: order.isActive,
        createdAt: order.createdAt,
        ips,
        traffic,
        isOnline,
        clientEnabled: clientState?.enable ?? true,
      })
    } catch (error) {
      console.error(`[getUserConnectionInfo] EXCEPTION for order ${order.id} (${order.remark}):`, error)
      results.push({
        orderId: order.id,
        serverId: order.serverId,
        serverName: order.server.name,
        serverFlag: order.server.flag,
        remark: order.remark,
        clientUUID: order.clientUUID,
        inboundId: order.server.inboundId,
        packageType: order.packageType,
        vlessLink: order.vlessLink,
        expiryTime: order.expiryTime,
        isActive: order.isActive,
        createdAt: order.createdAt,
        ips: [],
        traffic: null,
        isOnline: false,
        clientEnabled: true,
        error: 'Failed to fetch data from panel'
      })
    }
  }

  console.log(`[getUserConnectionInfo] Done. Returning ${results.length} results`)
  return results
}

// User: Toggle their own client enable/disable (preserves expiryTime)
export async function userToggleClient(userId: string, orderId: string, enable: boolean) {
  const order = await prisma.vpnOrder.findFirst({
    where: { id: orderId, userId },
    include: { server: true }
  })

  if (!order) return { success: false, error: 'Order not found' }

  const useHttp = await VpnPanelAPI.detectProtocol(order.server.host, order.server.port, order.server.path)
  const panel = new VpnPanelAPI(
    order.server.host, order.server.port, order.server.path,
    order.server.username, order.server.password, useHttp
  )

  // First get current client state from the panel to preserve expiryTime
  const inboundData = await panel.getInboundDetails(order.server.inboundId)
  if (!inboundData?.settings) {
    return { success: false, error: 'Cannot read inbound settings' }
  }

  const settings = typeof inboundData.settings === 'string' ? JSON.parse(inboundData.settings) : inboundData.settings
  const client = settings.clients?.find((c: any) => c.id === order.clientUUID || c.email === order.remark)

  if (!client) {
    return { success: false, error: 'Client not found on panel' }
  }

  // Toggle enable but keep everything else (especially expiryTime)
  const updatedClient = { ...client, enable }
  return panel.updateClient(order.server.inboundId, order.clientUUID, updatedClient)
}
