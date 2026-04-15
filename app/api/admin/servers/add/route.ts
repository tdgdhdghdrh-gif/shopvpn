import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import https from 'https'
import http from 'http'

// Test connection to 3X-UI panel with JSON payload
async function testPanelConnection(
  host: string, 
  port: number, 
  path: string, 
  username: string, 
  password: string
): Promise<{ success: boolean; error?: string; useHttp?: boolean; msg?: string }> {
  
  // Normalize inputs to prevent ERR_UNESCAPED_CHARACTERS
  const cleanHost = host.trim()
  const cleanPath = path.trim()
  
  // Ensure path starts with / and remove trailing slash
  let normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
  if (normalizedPath.endsWith('/') && normalizedPath.length > 1) {
    normalizedPath = normalizedPath.substring(0, normalizedPath.length - 1)
  }
  
  // Form-data payload for 3X-UI (matching the working curl format)
  const formData = new URLSearchParams()
  formData.append('username', username.trim())
  formData.append('password', password.trim())
  formData.append('twoFactorCode', '')
  const formPayload = formData.toString()
  
  // Try HTTPS
  const tryHttps = () => {
    return new Promise<{ success: boolean; msg?: string }>((resolveHttps) => {
      try {
        const req = https.request({
          hostname: cleanHost,
          port: port,
          path: `${normalizedPath}/login`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(formPayload),
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': `https://${cleanHost}:${port}`,
            'Referer': `https://${cleanHost}:${port}${normalizedPath}/`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          rejectUnauthorized: false,
          timeout: 10000,
        }, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            try {
              const jsonResponse = JSON.parse(data)
              if (jsonResponse.success === true) {
                resolveHttps({ success: true, msg: jsonResponse.msg })
              } else {
                resolveHttps({ success: false, msg: jsonResponse.msg || 'Login failed' })
              }
            } catch {
              // Fallback to text check
              const success = data.includes('"success":true') || res.statusCode === 302
              resolveHttps({ success, msg: success ? 'Login successful' : 'Invalid response' })
            }
          })
        })
        
        req.on('error', (err) => resolveHttps({ success: false, msg: err.message }))
        req.on('timeout', () => { req.destroy(); resolveHttps({ success: false, msg: 'Timeout' }) })
        req.write(formPayload)
        req.end()
      } catch (err: any) {
        resolveHttps({ success: false, msg: err.message || 'Request failed' })
      }
    })
  }

  // Try HTTP
  const tryHttp = () => {
    return new Promise<{ success: boolean; msg?: string }>((resolveHttp) => {
      try {
        const req = http.request({
          hostname: cleanHost,
          port: port,
          path: `${normalizedPath}/login`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(formPayload),
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': `http://${cleanHost}:${port}`,
            'Referer': `http://${cleanHost}:${port}${normalizedPath}/`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000,
        }, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            try {
              const jsonResponse = JSON.parse(data)
              if (jsonResponse.success === true) {
                resolveHttp({ success: true, msg: jsonResponse.msg })
              } else {
                resolveHttp({ success: false, msg: jsonResponse.msg || 'Login failed' })
              }
            } catch {
              const success = data.includes('"success":true') || res.statusCode === 302
              resolveHttp({ success, msg: success ? 'Login successful' : 'Invalid response' })
            }
          })
        })
        
        req.on('error', (err) => resolveHttp({ success: false, msg: err.message }))
        req.on('timeout', () => { req.destroy(); resolveHttp({ success: false, msg: 'Timeout' }) })
        req.write(formPayload)
        req.end()
      } catch (err: any) {
        resolveHttp({ success: false, msg: err.message || 'Request failed' })
      }
    })
  }

  // Try HTTPS first
  const httpsResult = await tryHttps()
  if (httpsResult.success) {
    return { success: true, useHttp: false, msg: httpsResult.msg }
  }

  // Try HTTP if HTTPS fails
  const httpResult = await tryHttp()
  if (httpResult.success) {
    return { success: true, useHttp: true, msg: httpResult.msg }
  }

  return { 
    success: false, 
    error: httpsResult.msg || httpResult.msg || 'ไม่สามารถเชื่อมต่อกับ Panel ได้ กรุณาตรวจสอบข้อมูล' 
  }
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
    
    const { 
      name, flag, host, port, path, username, password, inboundId, 
      protocol, tlsType, flow, sni, clientPort,
      supportsAis, supportsTrue, supportsDtac, category, speed,
      skipConnectionTest, inboundConfigs,
      // Per-server pricing & decoration
      pricePerDay, priceWeekly, priceMonthly,
      price3Months, price6Months, price12Months,
      description, badge, tags, features, themeColor, themeGradient, imageUrl,
      sortOrder, maxClients, defaultIpLimit,
      vlessTemplate
    } = body

    if (!name || !host || !port || !path) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมด (ชื่อ, โฮสต์, พอร์ต, เส้นทาง)' }, { status: 400 })
    }

    // inboundId is required unless inboundConfigs provides one
    const effectiveInboundId = inboundId || (inboundConfigs?.[0]?.inboundId) || 0
    if (!effectiveInboundId) {
      return NextResponse.json({ error: 'กรุณาระบุ Inbound ID หรือดึง Inbound จาก Panel' }, { status: 400 })
    }

    // Test connection before saving (unless skipped)
    if (!skipConnectionTest) {
      const testResult = await testPanelConnection(host, port, path, username || '', password || '')
      
      if (!testResult.success) {
        return NextResponse.json({ 
          error: 'เชื่อมต่อไม่สำเร็จ: ' + (testResult.error || 'ตรวจสอบข้อมูลไม่ถูกต้อง'),
          details: 'ไม่สามารถเข้าสู่ระบบ Panel ได้ กรุณาตรวจสอบ:\n1. Host/IP ถูกต้อง\n2. Port ถูกต้อง\n3. Path ถูกต้อง (เช่น /xxx/)\n4. Username/Password ถูกต้อง\n\nหรือเลือก "ข้ามการตรวจสอบ" หากต้องการบันทึกโดยไม่ทดสอบ',
          connectionError: true
        }, { status: 400 })
      }
    }

    // ถ้าเป็นตัวแทน ให้ผูก agentId
    const isAgentOnly = user.isAgent && !user.isSuperAdmin && !user.isAdmin

    const server = await prisma.vpnServer.create({
      data: {
        name,
        flag: flag || '🌐',
        host,
        port,
        path,
        username,
        password,
        inboundId: effectiveInboundId,
        protocol: protocol || 'vless',
        tlsType: tlsType || 'Reality',
        flow: flow || 'xtls-rprx-vision',
        sni: sni || 'google.co.th',
        clientPort: clientPort || 443,
        supportsAis: supportsAis ?? true,
        supportsTrue: supportsTrue ?? false,
        supportsDtac: supportsDtac ?? false,
        category: category || 'general',
        speed: speed || 1000,
        isActive: true,
        ping: 0,
        load: 0,
        status: 'online',
        inboundConfigs: inboundConfigs || undefined,
        agentId: isAgentOnly ? session.userId : undefined,
        // Per-server pricing
        pricePerDay: pricePerDay ?? 2,
        priceWeekly: priceWeekly ?? undefined,
        priceMonthly: priceMonthly ?? undefined,
        price3Months: price3Months ?? undefined,
        price6Months: price6Months ?? undefined,
        price12Months: price12Months ?? undefined,
        // Decoration
        description: description || undefined,
        badge: badge || undefined,
        tags: tags || [],
        features: features || [],
        themeColor: themeColor || undefined,
        themeGradient: themeGradient || undefined,
        imageUrl: imageUrl || undefined,
        sortOrder: sortOrder ?? 0,
        // Limits
        maxClients: maxClients ?? 0,
        defaultIpLimit: defaultIpLimit ?? 0,
        // VLESS template
        vlessTemplate: vlessTemplate || undefined,
      }
    })

    return NextResponse.json({ success: true, server })
  } catch (error) {
    console.error('Failed to add server:', error)
    return NextResponse.json({ error: 'Failed to add server' }, { status: 500 })
  }
}
