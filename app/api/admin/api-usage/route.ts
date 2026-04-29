import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function checkAdmin() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true },
  })
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

export async function GET(request: Request) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const checkLive = searchParams.get('check') === 'true'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const apiType = searchParams.get('apiType') || undefined
    const successFilter = searchParams.get('success')

    // Get settings
    const settings = await prisma.settings.findFirst({
      select: {
        truemoneyPhone: true,
        truemoneyApiKey: true,
        slipApiKey: true,
      },
    })

    // Query usage stats from TopUp table
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      walletTotal,
      slipTotal,
      walletToday,
      slipToday,
      walletThisMonth,
      slipThisMonth,
    ] = await Promise.all([
      prisma.topUp.count({ where: { method: 'WALLET' } }),
      prisma.topUp.count({ where: { method: 'SLIP' } }),
      prisma.topUp.count({ where: { method: 'WALLET', createdAt: { gte: today } } }),
      prisma.topUp.count({ where: { method: 'SLIP', createdAt: { gte: today } } }),
      prisma.topUp.count({ where: { method: 'WALLET', createdAt: { gte: thisMonth } } }),
      prisma.topUp.count({ where: { method: 'SLIP', createdAt: { gte: thisMonth } } }),
    ])

    const walletAmountAgg = await prisma.topUp.aggregate({
      where: { method: 'WALLET' },
      _sum: { amount: true },
    })
    const slipAmountAgg = await prisma.topUp.aggregate({
      where: { method: 'SLIP' },
      _sum: { amount: true },
    })

    // Query API call logs
    const where: any = {}
    if (apiType) where.apiType = apiType
    if (successFilter === 'true') where.success = true
    if (successFilter === 'false') where.success = false

    const [logs, totalLogs] = await Promise.all([
      prisma.apiCallLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.apiCallLog.count({ where }),
    ])

    // Get avg response time
    const avgDuration = await prisma.apiCallLog.aggregate({
      where: apiType ? { apiType } : {},
      _avg: { durationMs: true },
    })

    // Live check remaining tokens
    let truemoneyStatus: any = null
    let slipStatus: any = null

    if (checkLive && settings?.truemoneyApiKey && settings?.truemoneyPhone) {
      try {
        const apiUrl = `https://api.darkx.shop/tools/truemoney?code=__STATUS_CHECK__&phone=${settings.truemoneyPhone}`
        const apiRes = await fetch(apiUrl, {
          headers: { 'x-api-key': settings.truemoneyApiKey },
          cache: 'no-store',
        })
        const apiData = await apiRes.json()
        truemoneyStatus = {
          ok: apiRes.ok,
          remainingTokens: apiData.remaining_tokens ?? null,
          operator: apiData.operator ?? null,
          responseTime: apiData.responseTime ?? null,
          timestamp: apiData.timestamp ?? null,
          msg: apiData.msg || apiData.error || null,
        }
      } catch (err: any) {
        truemoneyStatus = { ok: false, error: err.message || 'ไม่สามารถเชื่อมต่อ API ได้' }
      }
    }

    if (checkLive && settings?.slipApiKey) {
      slipStatus = {
        ok: true,
        configured: true,
        msg: 'API Key ตั้งค่าแล้ว',
      }
    }

    return NextResponse.json({
      settings: {
        truemoneyPhone: settings?.truemoneyPhone || null,
        truemoneyConfigured: !!(settings?.truemoneyPhone && settings?.truemoneyApiKey),
        slipConfigured: !!(settings?.slipApiKey),
      },
      stats: {
        wallet: {
          totalCalls: walletTotal,
          todayCalls: walletToday,
          monthCalls: walletThisMonth,
          totalAmount: walletAmountAgg._sum.amount || 0,
        },
        slip: {
          totalCalls: slipTotal,
          todayCalls: slipToday,
          monthCalls: slipThisMonth,
          totalAmount: slipAmountAgg._sum.amount || 0,
        },
      },
      logs: {
        data: logs,
        total: totalLogs,
        page,
        limit,
        totalPages: Math.ceil(totalLogs / limit),
      },
      avgDurationMs: Math.round(avgDuration._avg.durationMs || 0),
      liveStatus: {
        truemoney: truemoneyStatus,
        slip: slipStatus,
      },
    })
  } catch (error) {
    console.error('API Usage error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
