import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET - ดึงข้อมูลรายงานเน็ตช้าทั้งหมด (Admin)
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true },
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000)

    // ดึงเซิร์ฟเวอร์ทั้งหมด
    const servers = await prisma.vpnServer.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        flag: true,
        status: true,
        category: true,
      },
      orderBy: { name: 'asc' },
    })

    // รายงานแยกตาม reason
    const reportsByReason = await prisma.slowReport.groupBy({
      by: ['serverId', 'reason'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { id: true },
    })

    // จำนวน report ทั้งหมดต่อ server
    const totalPerServer = await prisma.slowReport.groupBy({
      by: ['serverId'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { id: true },
    })

    // ดึง userId ทั้งหมดที่โหวตใน 7 วัน (แยกตาม server)
    const allVotes = await prisma.slowReport.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { serverId: true, userId: true },
    })

    // ดึง userId ที่ออนไลน์ (active ใน 15 นาทีล่าสุดจาก IPLog)
    const onlineUserRows = await prisma.iPLog.groupBy({
      by: ['userId'],
      where: {
        userId: { not: null },
        createdAt: { gte: fifteenMinAgo },
      },
    })
    const onlineUserIds = new Set(onlineUserRows.map((r) => r.userId).filter(Boolean))

    // นับ online voters ต่อ server
    const onlineVotersPerServer = new Map<string, number>()
    const votersByServer = new Map<string, Set<string>>()
    for (const vote of allVotes) {
      if (!votersByServer.has(vote.serverId)) {
        votersByServer.set(vote.serverId, new Set())
      }
      votersByServer.get(vote.serverId)!.add(vote.userId)
    }
    for (const [serverId, voters] of votersByServer) {
      let onlineCount = 0
      for (const uid of voters) {
        if (onlineUserIds.has(uid)) onlineCount++
      }
      onlineVotersPerServer.set(serverId, onlineCount)
    }

    // ดึงรายละเอียด report ล่าสุด (รวม user)
    const recentReports = await prisma.slowReport.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        serverId: true,
        reason: true,
        createdAt: true,
        userId: true,
      },
    })

    // ดึง user info สำหรับ recent reports
    const userIds = [...new Set(recentReports.map((r) => r.userId))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    // สถิติรวม
    const totalReportsCount = await prisma.slowReport.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    })

    const totalUniqueVoters = await prisma.slowReport.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: sevenDaysAgo } },
    })

    // รวมข้อมูลเซิร์ฟเวอร์
    const serversWithReports = servers.map((server) => {
      const serverReasons = reportsByReason.filter((r) => r.serverId === server.id)
      const total = totalPerServer.find((r) => r.serverId === server.id)
      const totalVoters = votersByServer.get(server.id)?.size || 0

      const reasons: Record<string, number> = {}
      serverReasons.forEach((r) => {
        reasons[r.reason] = r._count.id
      })

      return {
        ...server,
        totalReports: total?._count.id || 0,
        uniqueVoters: totalVoters,
        onlineVoters: onlineVotersPerServer.get(server.id) || 0,
        reasons,
      }
    })

    // เรียงตามจำนวนรายงานมากสุด
    serversWithReports.sort((a, b) => b.totalReports - a.totalReports)

    // Top 5 เซิร์ฟเวอร์ที่มีรายงานเยอะสุด
    const top5Servers = serversWithReports.filter((s) => s.totalReports > 0).slice(0, 5)
    const normalServers = serversWithReports.filter((s) => s.totalReports === 0)

    // รายงานล่าสุดพร้อม user + online status
    const recentWithUser = recentReports.map((r) => {
      const u = userMap.get(r.userId)
      return {
        id: r.id,
        serverId: r.serverId,
        reason: r.reason,
        createdAt: r.createdAt.toISOString(),
        userName: u?.name || 'ไม่ทราบ',
        userEmail: u?.email || '',
        isOnline: onlineUserIds.has(r.userId),
      }
    })

    // นับ online voters ทั้งระบบ (unique)
    const allVoterIds = new Set(allVotes.map((v) => v.userId))
    let totalOnlineVoters = 0
    for (const uid of allVoterIds) {
      if (onlineUserIds.has(uid)) totalOnlineVoters++
    }

    return NextResponse.json({
      success: true,
      top5Servers,
      normalServers,
      recentReports: recentWithUser,
      stats: {
        totalReports: totalReportsCount,
        totalVoters: totalUniqueVoters.length,
        onlineVoters: totalOnlineVoters,
        serversWithIssues: serversWithReports.filter((s) => s.totalReports > 0).length,
        criticalServers: serversWithReports.filter((s) => s.totalReports >= 10).length,
        totalServers: servers.length,
      },
    })
  } catch (error) {
    console.error('Admin slow reports error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - เคลียร์โหวตของเซิร์ฟเวอร์ (Admin แก้ไขปัญหาแล้ว)
export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isSuperAdmin: true, isAdmin: true },
    })

    if (!user?.isSuperAdmin && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { serverId } = body

    if (!serverId) {
      return NextResponse.json({ success: false, error: 'ไม่ระบุเซิร์ฟเวอร์' })
    }

    const deleted = await prisma.slowReport.deleteMany({
      where: { serverId },
    })

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      message: `เคลียร์โหวตเซิร์ฟเวอร์แล้ว ${deleted.count} รายการ`,
    })
  } catch (error) {
    console.error('Admin delete slow reports error:', error)
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
