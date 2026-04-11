import { NextRequest, NextResponse } from 'next/server'

// ดึง IP จาก request headers
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  
  if (cfIP) return cfIP
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  
  return 'unknown'
}

// Cache license check result (check every 5 minutes, not every request)
let licenseCache: { valid: boolean; checkedAt: number; siteName?: string; needSetup?: boolean } | null = null
const LICENSE_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

// Cache license key จาก DB
let licenseKeyCache: { key: string | null; apiUrl: string | null; checkedAt: number } | null = null
const KEY_CACHE_INTERVAL = 60 * 1000 // 1 minute

async function getLicenseKeyFromDB(baseUrl: string): Promise<{ key: string | null; apiUrl: string | null }> {
  const now = Date.now()
  if (licenseKeyCache && (now - licenseKeyCache.checkedAt) < KEY_CACHE_INTERVAL) {
    return { key: licenseKeyCache.key, apiUrl: licenseKeyCache.apiUrl }
  }
  
  try {
    const res = await fetch(`${baseUrl}/api/license/activate`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      licenseKeyCache = { key: data.licenseKey || null, apiUrl: data.licenseApiUrl || null, checkedAt: now }
      return { key: data.licenseKey || null, apiUrl: data.licenseApiUrl || null }
    }
  } catch {}
  
  // fallback
  if (licenseKeyCache) return { key: licenseKeyCache.key, apiUrl: licenseKeyCache.apiUrl }
  return { key: null, apiUrl: null }
}

async function checkLicense(request: NextRequest): Promise<{ valid: boolean; siteName?: string; needSetup?: boolean }> {
  const baseUrl = request.nextUrl.origin
  
  // ดึง license key จาก DB ของเว็บลูกค้า
  const { key: licenseKey, apiUrl: licenseApiUrl } = await getLicenseKeyFromDB(baseUrl)
  
  // ถ้าไม่มีทั้ง key และ apiUrl = เว็บต้นทาง (ไม่ใช่ลูกค้า) -> ปล่อยผ่าน
  if (!licenseKey && !licenseApiUrl) {
    return { valid: true }
  }
  
  // ถ้ามี apiUrl แต่ยังไม่มี key = ลูกค้ายังไม่ได้ setup
  if (!licenseKey) {
    return { valid: false, needSetup: true }
  }

  // ใช้ cache ถ้ายังไม่หมดเวลา
  const now = Date.now()
  if (licenseCache && (now - licenseCache.checkedAt) < LICENSE_CHECK_INTERVAL) {
    return { valid: licenseCache.valid, siteName: licenseCache.siteName, needSetup: licenseCache.needSetup }
  }

  try {
    // ส่งไปเช็คที่เว็บต้นทาง
    const checkUrl = licenseApiUrl || 'https://simonvpn.darkx.shop'
    const res = await fetch(`${checkUrl}/api/license/check?key=${licenseKey}`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    })
    
    if (res.ok) {
      const data = await res.json()
      licenseCache = { valid: data.valid === true, checkedAt: now, siteName: data.siteName }
      return { valid: data.valid === true, siteName: data.siteName }
    }
    
    // API error แต่มี cache เก่า -> ใช้ cache เก่า (graceful)
    if (licenseCache) return { valid: licenseCache.valid, siteName: licenseCache.siteName }
    
    // ไม่มี cache เลย + API error -> ปล่อยผ่าน (ไม่บล็อกถ้า API ล่ม)
    return { valid: true }
  } catch {
    // Network error -> ใช้ cache เก่า หรือปล่อยผ่าน
    if (licenseCache) return { valid: licenseCache.valid, siteName: licenseCache.siteName }
    return { valid: true }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ข้ามไฟล์ static, _next, favicon, images, และ internal API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/api/ip-log') ||
    pathname.startsWith('/api/license') ||
    pathname === '/expired' ||
    pathname === '/setup' ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // === License Check ===
  const license = await checkLicense(request)
  
  // ถ้ายังไม่ได้ setup -> redirect ไปหน้า setup
  if (license.needSetup) {
    if (pathname !== '/setup') {
      const setupUrl = request.nextUrl.clone()
      setupUrl.pathname = '/setup'
      return NextResponse.redirect(setupUrl)
    }
  }
  
  // ถ้า license หมดอายุ -> redirect ไปหน้า /expired
  if (!license.valid && !license.needSetup) {
    if (pathname !== '/expired') {
      const expiredUrl = request.nextUrl.clone()
      expiredUrl.pathname = '/expired'
      return NextResponse.redirect(expiredUrl)
    }
  }

  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''
  const method = request.method

  // ดึง session cookie เพื่อระบุ user (ถ้ามี)
  const sessionCookie = request.cookies.get('shop-session')?.value

  try {
    // เรียก internal API เพื่อบันทึก IP log และเช็ค blocked
    const baseUrl = request.nextUrl.origin
    const logResponse = await fetch(`${baseUrl}/api/ip-log`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.IP_LOG_SECRET || 'ip-log-internal-secret-key'
      },
      body: JSON.stringify({
        ipAddress: ip,
        path: pathname,
        method,
        userAgent,
        sessionCookie,
      }),
    })

    if (logResponse.ok) {
      const data = await logResponse.json()
      
      // ถ้า IP ถูกบล็อก -> ส่ง 403
      if (data.blocked) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Access Denied', 
            message: 'IP ของคุณถูกบล็อก กรุณาติดต่อแอดมิน' 
          }),
          { 
            status: 403, 
            headers: { 'Content-Type': 'application/json' } 
          }
        )
      }
    }
  } catch (error) {
    // ถ้า log API ล้มเหลว ให้ผ่านไปก่อน ไม่บล็อก user
    console.error('[IP Middleware] Error logging IP:', error)
  }

  // เพิ่ม IP header เพื่อให้ API routes อื่นๆ ใช้ได้
  const response = NextResponse.next()
  response.headers.set('x-client-ip', ip)
  return response
}

export const config = {
  matcher: [
    // จับทุก route ยกเว้น static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
