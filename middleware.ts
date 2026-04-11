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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ข้ามไฟล์ static, _next, favicon, images, และ internal API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/api/ip-log') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
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
