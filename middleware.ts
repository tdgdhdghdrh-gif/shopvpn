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

// Cache license check result (check every 1 minute, not every request)
let licenseCache: { valid: boolean; checkedAt: number; siteName?: string } | null = null
const LICENSE_CHECK_INTERVAL = 1 * 60 * 1000 // 1 minute

async function checkLicenseWithServer(licenseKey: string, licenseApiUrl: string): Promise<{ valid: boolean; siteName?: string }> {
  const now = Date.now()
  if (licenseCache && (now - licenseCache.checkedAt) < LICENSE_CHECK_INTERVAL) {
    return { valid: licenseCache.valid, siteName: licenseCache.siteName }
  }

  try {
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
    
    if (licenseCache) return { valid: licenseCache.valid, siteName: licenseCache.siteName }
    return { valid: false }
  } catch {
    if (licenseCache) return { valid: licenseCache.valid, siteName: licenseCache.siteName }
    return { valid: false }
  }
}

// ถ้าไม่มี license cookie ให้เช็คกับ DB ว่ามี license key บันทึกไว้หรือไม่
async function hasLicenseInDb(origin: string): Promise<boolean> {
  try {
    const res = await fetch(`${origin}/api/license/activate`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      return data.activated === true || data.isLicenseServer === true
    }
  } catch {
    // ignore
  }
  return false
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
    pathname.startsWith('/api/admin/update-site') ||
    pathname === '/expired' ||
    pathname === '/setup' ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // === License Check ===
  // ถ้าเป็นเว็บต้นทาง (license server) -> ไม่ต้องเช็ค
  if (process.env.IS_LICENSE_SERVER !== 'true') {
    const licenseKey = request.cookies.get('license_key')?.value
    const licenseApiUrl = request.cookies.get('license_api_url')?.value || 'https://simonvpn.darkx.shop'

    if (!licenseKey) {
      // ไม่มี cookie -> เช็คกับ DB ก่อนว่ามี license หรือไม่
      const hasLicense = await hasLicenseInDb(request.nextUrl.origin)
      
      if (!hasLicense) {
        // ไม่มี license จริงๆ -> redirect ไป setup
        if (pathname !== '/setup') {
          licenseCache = null
          const setupUrl = request.nextUrl.clone()
          setupUrl.pathname = '/setup'
          return NextResponse.redirect(setupUrl)
        }
      }
      // ถ้ามี license ใน DB แต่ cookie หาย -> ให้ผ่านไป (หน้า setup จะ set cookie ใหม่เองถ้าเข้าไป)
    } else {
      // มี key แล้ว -> เช็คกับ license server ว่ายัง valid ไหม
      const result = await checkLicenseWithServer(licenseKey, licenseApiUrl)
      
      if (!result.valid) {
        if (pathname !== '/expired') {
          licenseCache = null
          const expiredUrl = request.nextUrl.clone()
          expiredUrl.pathname = '/expired'
          return NextResponse.redirect(expiredUrl)
        }
      }
    }
  }

  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''
  const method = request.method
  const sessionCookie = request.cookies.get('shop-session')?.value

  try {
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
    console.error('[IP Middleware] Error logging IP:', error)
  }

  const response = NextResponse.next()
  response.headers.set('x-client-ip', ip)
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
