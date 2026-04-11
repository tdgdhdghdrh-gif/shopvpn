'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, Wallet, CheckCircle2, CreditCard, RefreshCw,
  TrendingUp, Calendar, Banknote, Clock, ArrowUpRight,
  XCircle, AlertCircle, Receipt, Sparkles
} from 'lucide-react'

interface Topup {
  id: string
  amount: number
  method: string
  status: string
  note: string | null
  createdAt: string
}

type FilterType = 'all' | 'success' | 'pending' | 'failed'

function SuccessMessage() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const amount = searchParams.get('amount')
  const newBalance = searchParams.get('balance')
  
  if (!success || !amount) return null
  
  return (
    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 animate-in slide-in-from-top-3">
      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-sm">เติมเงินสำเร็จ +{parseInt(amount).toLocaleString()} ฿</p>
        {newBalance && <p className="text-xs text-emerald-400/70">เครดิตคงเหลือ: {parseInt(newBalance).toLocaleString()} ฿</p>}
      </div>
    </div>
  )
}

function getMethodLabel(method: string) {
  switch (method) {
    case 'truemoney': return 'TrueMoney'
    case 'slip': return 'สลิปธนาคาร'
    case 'admin': return 'แอดมินเติมให้'
    case 'referral': return 'โบนัสเชิญเพื่อน'
    case 'refund': return 'คืนเงิน'
    default: return method
  }
}

function getMethodIcon(method: string) {
  switch (method) {
    case 'truemoney': return '🟠'
    case 'slip': return '🏦'
    case 'admin': return '👑'
    case 'referral': return '🎁'
    case 'refund': return '↩️'
    default: return '💳'
  }
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'SUCCESS':
      return { label: 'สำเร็จ', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 }
    case 'PENDING':
      return { label: 'รอตรวจสอบ', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock }
    case 'FAILED':
    case 'REJECTED':
      return { label: 'ไม่สำเร็จ', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle }
    default:
      return { label: status, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: AlertCircle }
  }
}

function formatRelativeTime(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMin < 1) return 'เมื่อสักครู่'
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function TopupsPage() {
  const router = useRouter()
  const [topups, setTopups] = useState<Topup[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [topupsRes, userRes] = await Promise.all([
        fetch('/api/profile/topups'),
        fetch('/api/user/me')
      ])

      if (topupsRes.status === 401) {
        router.push('/login')
        return
      }
      
      const topupsData = await topupsRes.json()
      const userData = await userRes.json()
      
      if (topupsData.topups) {
        setTopups(topupsData.topups)
      }
      if (userData.user) {
        setBalance(userData.user.balance)
      }
    } catch (error) {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const successTopups = topups.filter(t => t.status === 'SUCCESS')
  const totalDeposited = successTopups.reduce((sum, t) => sum + t.amount, 0)
  const thisMonthTopups = successTopups.filter(t => {
    const d = new Date(t.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonthTopups.reduce((sum, t) => sum + t.amount, 0)

  const filteredTopups = topups.filter(t => {
    if (filter === 'success') return t.status === 'SUCCESS'
    if (filter === 'pending') return t.status === 'PENDING'
    if (filter === 'failed') return t.status === 'FAILED' || t.status === 'REJECTED'
    return true
  })

  const pendingCount = topups.filter(t => t.status === 'PENDING').length
  const failedCount = topups.filter(t => t.status === 'FAILED' || t.status === 'REJECTED').length

  // Group by date
  function groupByDate(items: Topup[]) {
    const groups: { [key: string]: Topup[] } = {}
    items.forEach(item => {
      const date = new Date(item.createdAt)
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      let key: string
      if (date.toDateString() === today.toDateString()) {
        key = 'วันนี้'
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'เมื่อวาน'
      } else {
        key = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return groups
  }

  const grouped = groupByDate(filteredTopups)

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold tracking-tight">ประวัติการเติมเงิน</h1>
                <p className="text-[10px] text-gray-500 font-medium">รายการเติมเงินทั้งหมดของคุณ</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/topup"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold hidden sm:inline">เติมเงิน</span>
              </Link>
              <button
                onClick={() => { setLoading(true); fetchData() }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Success Message */}
        <Suspense fallback={null}>
          <SuccessMessage />
        </Suspense>

        {/* Balance & Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/10 rounded-2xl p-4 sm:p-5">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <p className="text-[10px] font-black text-emerald-400/70 uppercase tracking-widest">เครดิตคงเหลือ</p>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">{balance.toLocaleString()} <span className="text-lg">฿</span></p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full" />
            </div>

            {/* Total Deposited */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">เติมทั้งหมด</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{totalDeposited.toLocaleString()} <span className="text-sm text-gray-500">฿</span></p>
              <p className="text-[10px] text-gray-600 mt-1">{successTopups.length} รายการ</p>
            </div>

            {/* This Month */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">เดือนนี้</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{thisMonthTotal.toLocaleString()} <span className="text-sm text-gray-500">฿</span></p>
              <p className="text-[10px] text-gray-600 mt-1">{thisMonthTopups.length} รายการ</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && topups.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {([
              { key: 'all' as FilterType, label: `ทั้งหมด (${topups.length})` },
              { key: 'success' as FilterType, label: `สำเร็จ (${successTopups.length})` },
              ...(pendingCount > 0 ? [{ key: 'pending' as FilterType, label: `รอตรวจสอบ (${pendingCount})` }] : []),
              ...(failedCount > 0 ? [{ key: 'failed' as FilterType, label: `ไม่สำเร็จ (${failedCount})` }] : []),
            ]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === f.key
                    ? f.key === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : f.key === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : f.key === 'failed'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-white/10 text-white border border-white/10'
                    : 'bg-white/[0.03] text-gray-500 border border-transparent hover:bg-white/[0.06]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">กำลังโหลดประวัติ...</p>
          </div>
        ) : topups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
              <Receipt className="w-10 h-10 text-gray-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-400 font-medium">ยังไม่มีประวัติการเติมเงิน</p>
              <p className="text-gray-600 text-sm">เติมเงินเข้าระบบเพื่อซื้อ VPN</p>
            </div>
            <Link
              href="/topup"
              className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
            >
              เติมเงินเลย
            </Link>
          </div>
        ) : filteredTopups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
              <Receipt className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">ไม่มีรายการในหมวดนี้</p>
          </div>
        ) : (
          /* Grouped by Date */
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel} className="space-y-2">
                {/* Date Header */}
                <div className="flex items-center gap-3 px-1">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{dateLabel}</h3>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] text-gray-600">
                    +{items.filter(i => i.status === 'SUCCESS').reduce((s, i) => s + i.amount, 0).toLocaleString()} ฿
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {items.map((topup) => {
                    const statusInfo = getStatusInfo(topup.status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <div 
                        key={topup.id}
                        className="group bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all overflow-hidden"
                      >
                        <div className="p-4 flex items-center gap-4">
                          {/* Icon */}
                          <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                            {getMethodIcon(topup.method)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-white truncate">{getMethodLabel(topup.method)}</p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${statusInfo.color}`}>
                                <StatusIcon className="w-2.5 h-2.5" />
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[11px] text-gray-500">
                                {new Date(topup.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-[11px] text-gray-600">
                                {formatRelativeTime(topup.createdAt)}
                              </span>
                              {topup.note && (
                                <span className="text-[11px] text-gray-600 truncate">
                                  {topup.note}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="flex-shrink-0 text-right">
                            <p className={`font-black text-lg ${
                              topup.status === 'SUCCESS' 
                                ? 'text-emerald-400' 
                                : topup.status === 'PENDING' 
                                  ? 'text-amber-400' 
                                  : 'text-red-400'
                            }`}>
                              +{topup.amount.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-600">THB</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom spacing for mobile */}
        <div className="h-8" />
      </main>
    </div>
  )
}
