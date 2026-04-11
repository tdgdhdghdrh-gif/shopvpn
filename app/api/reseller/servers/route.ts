import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET - list reseller's servers
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const profile = await prisma.resellerProfile.findUnique({
      where: { userId: session.userId }
    })

    if (!profile || profile.status !== 'approved') {
      return Response.json({ success: false, error: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const servers = await prisma.resellerServer.findMany({
      where: { resellerId: profile.id },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ success: true, servers })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - add new server
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const profile = await prisma.resellerProfile.findUnique({
      where: { userId: session.userId }
    })

    if (!profile || profile.status !== 'approved') {
      return Response.json({ success: false, error: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const data = await req.json()
    const { name, flag, host, port, path, username, password, inboundId, protocol, tlsType, flow, sni, clientPort, supportsAis, supportsTrue, supportsDtac, category, speed, pricePerDay, skipConnectionTest } = data

    if (!name || !host || !port || !path || !inboundId) {
      return Response.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
    }

    // Test connection if not skipped
    if (!skipConnectionTest && username && password) {
      try {
        const testUrl = `http://${host}:${port}${path}/login`
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        
        const testRes = await fetch(testUrl, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
          signal: controller.signal 
        }).catch(() => null)
        clearTimeout(timeout)
        
        // Also try HTTPS
        if (!testRes || !testRes.ok) {
          const httpsUrl = `https://${host}:${port}${path}/login`
          const controller2 = new AbortController()
          const timeout2 = setTimeout(() => controller2.abort(), 10000)
          const testRes2 = await fetch(httpsUrl, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
            signal: controller2.signal
          }).catch(() => null)
          clearTimeout(timeout2)
          
          if (!testRes2) {
            return Response.json({ success: false, error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ตรวจสอบข้อมูลหรือเลือก "ข้ามการตรวจสอบ"' }, { status: 400 })
          }
        }
      } catch {
        return Response.json({ success: false, error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' }, { status: 400 })
      }
    }

    const server = await prisma.resellerServer.create({
      data: {
        resellerId: profile.id,
        name,
        flag: flag || '🌐',
        host,
        port: parseInt(String(port)),
        path,
        username: username || '',
        password: password || '',
        inboundId: parseInt(String(inboundId)),
        protocol: protocol || 'vless',
        tlsType: tlsType || 'Reality',
        flow: flow || 'xtls-rprx-vision',
        sni: sni || 'google.co.th',
        clientPort: parseInt(String(clientPort)) || 443,
        supportsAis: supportsAis ?? true,
        supportsTrue: supportsTrue ?? false,
        supportsDtac: supportsDtac ?? false,
        category: category || 'general',
        speed: parseInt(String(speed)) || 1000,
        pricePerDay: parseFloat(String(pricePerDay)) || 2,
      }
    })

    return Response.json({ success: true, server })
  } catch (error) {
    console.error('Add reseller server error:', error)
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - update server
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const profile = await prisma.resellerProfile.findUnique({
      where: { userId: session.userId }
    })

    if (!profile || profile.status !== 'approved') {
      return Response.json({ success: false, error: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const data = await req.json()
    const { id, ...updateData } = data

    if (!id) {
      return Response.json({ success: false, error: 'ไม่พบ ID เซิร์ฟเวอร์' }, { status: 400 })
    }

    // Verify ownership
    const server = await prisma.resellerServer.findFirst({
      where: { id, resellerId: profile.id }
    })

    if (!server) {
      return Response.json({ success: false, error: 'ไม่พบเซิร์ฟเวอร์' }, { status: 404 })
    }

    const updated = await prisma.resellerServer.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.flag && { flag: updateData.flag }),
        ...(updateData.host && { host: updateData.host }),
        ...(updateData.port && { port: parseInt(String(updateData.port)) }),
        ...(updateData.path && { path: updateData.path }),
        ...(updateData.username && { username: updateData.username }),
        ...(updateData.password && { password: updateData.password }),
        ...(updateData.inboundId && { inboundId: parseInt(String(updateData.inboundId)) }),
        ...(updateData.protocol && { protocol: updateData.protocol }),
        ...(updateData.tlsType && { tlsType: updateData.tlsType }),
        ...(updateData.flow && { flow: updateData.flow }),
        ...(updateData.sni && { sni: updateData.sni }),
        ...(updateData.clientPort && { clientPort: parseInt(String(updateData.clientPort)) }),
        ...(updateData.supportsAis !== undefined && { supportsAis: updateData.supportsAis }),
        ...(updateData.supportsTrue !== undefined && { supportsTrue: updateData.supportsTrue }),
        ...(updateData.supportsDtac !== undefined && { supportsDtac: updateData.supportsDtac }),
        ...(updateData.category && { category: updateData.category }),
        ...(updateData.speed && { speed: parseInt(String(updateData.speed)) }),
        ...(updateData.pricePerDay !== undefined && { pricePerDay: parseFloat(String(updateData.pricePerDay)) }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
      }
    })

    return Response.json({ success: true, server: updated })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - delete server
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const profile = await prisma.resellerProfile.findUnique({
      where: { userId: session.userId }
    })

    if (!profile || profile.status !== 'approved') {
      return Response.json({ success: false, error: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const { id } = await req.json()

    // Verify ownership
    const server = await prisma.resellerServer.findFirst({
      where: { id, resellerId: profile.id }
    })

    if (!server) {
      return Response.json({ success: false, error: 'ไม่พบเซิร์ฟเวอร์' }, { status: 404 })
    }

    await prisma.resellerServer.delete({ where: { id } })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
