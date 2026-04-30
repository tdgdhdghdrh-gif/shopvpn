import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './lib/prisma'

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
    pathname === '/site-expired' ||
    pathname === '/setup' ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // === Maintenance Mode Check ===
  try {
    const maintenance = await prisma.maintenanceMode.findFirst()
    if (maintenance?.enabled) {
      // Allow admin routes
      if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
        // Check if user has admin session
        const sessionCookie = request.cookies.get('shop-session')?.value
        if (sessionCookie) {
          // Try to verify admin session via API or decode
          // For now, allow all /admin and /login paths
          return NextResponse.next()
        }
      }

      // Check if IP is in allowed list
      const clientIP = getClientIP(request)
      if (maintenance.allowedIps?.includes(clientIP)) {
        return NextResponse.next()
      }

      // Block and show maintenance page
      if (pathname !== '/maintenance') {
        const url = request.nextUrl.clone()
        url.pathname = '/maintenance'
        url.searchParams.set('msg', encodeURIComponent(maintenance.message))
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    // If DB error, don't block (fail open)
    console.error('Maintenance check error:', error)
  }

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
