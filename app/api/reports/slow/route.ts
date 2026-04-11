import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - ดึงรายงานเซิร์ฟเวอร์ช้า (ผู้ใช้ทุกคนดูได้)
export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' })
    }

    // ดึงเซิร์ฟเวอร์ทั้งหมดพร้อมจำนวนรายงาน
    const servers = await prisma.vpnServer.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        flag: true,
        status: true,
        category: true,
      },
      orderBy: { name: 'asc' }
    })

    // นับจำนวนรายงานต่อเซิร์ฟเวอร์ (เฉพาะ 7 วันล่าสุด)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const reports = await prisma.slowReport.groupBy({
      by: ['serverId', 'reason'],
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      _count: { id: true }
    })

    // ดึง vote ของ user ปัจจุบัน
    const myVotes = await prisma.slowReport.findMany({
      where: {
        userId: session.userId,
        createdAt: { gte: sevenDaysAgo }
      },
      select: { serverId: true, reason: true }
    })

    // จำนวน report ทั้งหมดต่อเซิร์ฟเวอร์
    const totalReportsPerServer = await prisma.slowReport.groupBy({
      by: ['serverId'],
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      _count: { id: true }
    })

    // รวมข้อมูล
    const serversWithReports = servers.map(server => {
      const serverReports = reports.filter(r => r.serverId === server.id)
      const totalReport = totalReportsPerServer.find(r => r.serverId === server.id)
      const reasons: Record<string, number> = {}
      serverReports.forEach(r => {
        reasons[r.reason] = r._count.id
      })
      const myServerVotes = myVotes.filter(v => v.serverId === server.id).map(v => v.reason)

      return {
        ...server,
        totalReports: totalReport?._count.id || 0,
        reasons,
        myVotes: myServerVotes,
      }
    })

    // เรียงตามจำนวนรายงานมากสุด
    serversWithReports.sort((a, b) => b.totalReports - a.totalReports)

    return NextResponse.json({ success: true, servers: serversWithReports })
  } catch (error) {
    console.error('Get slow reports error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' })
  }
}

// POST - โหวตแจ้งเซิร์ฟเวอร์ช้า
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' })
    }

    const body = await request.json()
    const { serverId, reason } = body

    if (!serverId) {
      return NextResponse.json({ success: false, error: 'ไม่พบเซิร์ฟเวอร์' })
    }

    const validReasons = ['slow', 'unstable', 'disconnect', 'high_load']
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json({ success: false, error: 'เหตุผลไม่ถูกต้อง' })
    }

    // เช็คว่าเซิร์ฟเวอร์มีอยู่
    const server = await prisma.vpnServer.findUnique({ where: { id: serverId } })
    if (!server) {
      return NextResponse.json({ success: false, error: 'ไม่พบเซิร์ฟเวอร์' })
    }

    // เช็คว่าเคย vote เรื่องนี้ไปแล้วหรือยัง (ใน 7 วันนี้)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const existingVote = await prisma.slowReport.findFirst({
      where: {
        userId: session.userId,
        serverId,
        reason,
        createdAt: { gte: sevenDaysAgo }
      }
    })

    if (existingVote) {
      // ถอนโหวต (toggle)
      await prisma.slowReport.delete({ where: { id: existingVote.id } })
      return NextResponse.json({ success: true, action: 'removed', message: 'ถอนโหวตแล้ว' })
    }

    // สร้าง vote ใหม่
    await prisma.slowReport.create({
      data: {
        userId: session.userId,
        serverId,
        reason,
      }
    })

    return NextResponse.json({ success: true, action: 'added', message: 'โหวตแล้ว' })
  } catch (error) {
    console.error('Post slow report error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' })
  }
}
