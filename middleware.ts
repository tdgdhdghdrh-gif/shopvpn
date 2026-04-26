import { NextRequest, NextResponse } from 'next/server'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) return cfIP
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  return 'unknown'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and internal API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/api/') ||
    pathname === '/expired' ||
    pathname === '/setup' ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // === License Check (DISABLED) ===
  // License check bypassed - all sites are now fully activated

  // === IP Logging ===
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
    // Ignore IP log errors, don't block users
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
