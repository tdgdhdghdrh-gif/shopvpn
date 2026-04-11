'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardCard from '@/components/admin/DashboardCard'
import {
  Wallet,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  Loader2,
  Store,
  User,
} from 'lucide-react'

interface Withdrawal {
  id: string
  resellerId: string
  shopName: string
  userName: string
  userEmail: string
  walletPhone: string
  amount: number
  method: string
  accountInfo: string
  qrCodeImage: string | null
  adminQrCode: string | null
  bankReceiverName: string | null
  bankAccountNumber: string | null
  status: 'pending' | 'approved' | 'rejected'
  note: string | null
  createdAt: string
  updatedAt: string
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

const STATUS_CONFIG = {
  pending: {
    label: 'รอดำเนินการ',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    icon: Clock,
  },
  approved: {
    label: 'โอนแล้ว',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'ปฏิเสธ',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: XCircle,
  },
} as const

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})
  const [noteOpen, setNoteOpen] = useState<string | null>(null)

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/withdrawals')
      if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลการถอนเงินได้')
      const data = await res.json()
      setWithdrawals(data.withdrawals ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWithdrawals()
  }, [fetchWithdrawals])

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setActionLoading(id)
      const note = noteInputs[id]?.trim() || undefined
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, note }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'ดำเนินการไม่สำเร็จ')
      }
      setNoteOpen(null)
      setNoteInputs((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      await fetchWithdrawals()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length
  const totalApprovedAmount = withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0)
  const totalPendingAmount = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0)
  const filtered =
    filter === 'all' ? withdrawals : withdrawals.filter((w) => w.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-orange-400" />
          <p className="text-zinc-400 text-sm">กำลังโหลดข้อมูลการถอนเงิน...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <XCircle className="w-12 h-12 text-red-400" />
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchWithdrawals}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <Wallet className="w-6 h-6 text-orange-400" />
            </div>
            จัดการการถอนเงิน
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            ตรวจสอบและอนุมัติคำขอถอนเงินจากตัวแทน
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardCard
            label="รอดำเนินการ"
            value={pendingCount}
            description={`รวม ฿${totalPendingAmount.toLocaleString()}`}
            icon={Clock}
            color="text-yellow-400"
          />
          <DashboardCard
            label="โอนแล้วทั้งหมด"
            value={`฿${totalApprovedAmount.toLocaleString()}`}
            description={`${withdrawals.filter((w) => w.status === 'approved').length} รายการ`}
            icon={Banknote}
            color="text-emerald-400"
          />
          <DashboardCard
            label="คำขอทั้งหมด"
            value={withdrawals.length}
            description="จำนวนคำขอถอนเงินทั้งหมด"
            icon={ArrowDownCircle}
            color="text-blue-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((f) => {
            const count =
              f === 'all'
                ? withdrawals.length
                : withdrawals.filter((w) => w.status === f).length
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  filter === f
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-white/5'
                }`}
              >
                {f === 'all'
                  ? `ทั้งหมด (${count})`
                  : f === 'pending'
                    ? `รอดำเนินการ (${count})`
                    : f === 'approved'
                      ? `โอนแล้ว (${count})`
                      : `ปฏิเสธ (${count})`}
              </button>
            )
          })}
        </div>

        {/* Withdrawal List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Wallet className="w-12 h-12 text-zinc-700" />
            <p className="text-zinc-500">ไม่พบรายการถอนเงิน</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((withdrawal) => {
              const statusConf = STATUS_CONFIG[withdrawal.status]
              const StatusIcon = statusConf.icon
              const isProcessing = actionLoading === withdrawal.id
              const isNoteExpanded = noteOpen === withdrawal.id

              return (
                <div
                  key={withdrawal.id}
                  className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10"
                >
                  <div className="p-5 sm:p-6">
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Reseller Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                          <Store className="w-6 h-6 text-orange-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base truncate">
                            {withdrawal.shopName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{withdrawal.userName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-orange-400">
                          ฿{withdrawal.amount.toLocaleString()}
                        </p>
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-1 ${statusConf.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConf.label}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                      <div className="bg-zinc-800/50 rounded-xl p-3 space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                          อีเมล
                        </p>
                        <p className="text-sm font-medium truncate">{withdrawal.userEmail}</p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3 space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                          วิธีการถอน
                        </p>
                        <p className="text-sm font-medium">
                          {withdrawal.method === 'wallet' ? 'วอเล็ท' : 'โอนเข้าบัญชี'}
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3 space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                          {withdrawal.method === 'wallet' ? 'เบอร์วอเล็ท' : 'เลขบัญชี'}
                        </p>
                        <p className="text-sm font-medium truncate">
                          {withdrawal.accountInfo || '-'}
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3 space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                          วันที่ขอ
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(withdrawal.createdAt).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* QR Code Section - Wallet */}
                    {withdrawal.method === 'wallet' && (
                      <div className="mt-4 p-4 bg-zinc-800/30 border border-white/5 rounded-xl">
                        <p className="text-xs text-zinc-500 mb-2">QR Code วอเล็ท - โอนเงินไปที่</p>
                        <div className="flex items-center gap-4">
                          {withdrawal.qrCodeImage ? (
                            <img
                              src={withdrawal.qrCodeImage}
                              alt="QR Code"
                              className="w-24 h-24 object-contain bg-white rounded-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 text-xs text-center px-2">
                              ไม่มี QR Code
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-zinc-300 mb-1">เบอร์วอเล็ท:</p>
                            <p className="text-lg font-mono font-bold text-orange-400">
                              {withdrawal.accountInfo || withdrawal.walletPhone}
                            </p>
                            <p className="text-sm text-zinc-400 mt-2">
                              จำนวนเงิน: <span className="text-orange-400 font-bold">฿{withdrawal.amount.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QR Code Section - Bank */}
                    {withdrawal.method === 'bank' && (
                      <div className="mt-4 p-4 bg-zinc-800/30 border border-white/5 rounded-xl">
                        <p className="text-xs text-zinc-500 mb-2">QR Code ธนาคาร - โอนเงินไปที่</p>
                        <div className="flex items-center gap-4">
                          {withdrawal.adminQrCode ? (
                            <img
                              src={withdrawal.adminQrCode}
                              alt="QR Code"
                              className="w-24 h-24 object-contain bg-white rounded-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 text-xs text-center px-2">
                              ไม่มี QR Code
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-zinc-300 mb-1">ชื่อบัญชี:</p>
                            <p className="text-lg font-bold text-orange-400">
                              {withdrawal.bankReceiverName || '-'}
                            </p>
                            <p className="text-sm text-zinc-300 mt-2">เลขบัญชี:</p>
                            <p className="text-lg font-mono font-bold text-orange-400">
                              {withdrawal.accountInfo || withdrawal.bankAccountNumber}
                            </p>
                            <p className="text-sm text-zinc-400 mt-2">
                              จำนวนเงิน: <span className="text-orange-400 font-bold">฿{withdrawal.amount.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Existing Note */}
                    {withdrawal.note && (
                      <div className="mt-4 p-3 bg-zinc-800/30 border border-white/5 rounded-xl">
                        <p className="text-xs text-zinc-500 mb-1">หมายเหตุ</p>
                        <p className="text-sm text-zinc-300">{withdrawal.note}</p>
                      </div>
                    )}

                    {/* Actions for Pending */}
                    {withdrawal.status === 'pending' && (
                      <div className="mt-5 pt-5 border-t border-white/5 space-y-4">
                        {/* Toggle Note Input */}
                        <button
                          onClick={() =>
                            setNoteOpen(isNoteExpanded ? null : withdrawal.id)
                          }
                          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {isNoteExpanded ? 'ซ่อนหมายเหตุ' : '+ เพิ่มหมายเหตุ (ไม่บังคับ)'}
                        </button>

                        {/* Note Input */}
                        {isNoteExpanded && (
                          <textarea
                            value={noteInputs[withdrawal.id] ?? ''}
                            onChange={(e) =>
                              setNoteInputs((prev) => ({
                                ...prev,
                                [withdrawal.id]: e.target.value,
                              }))
                            }
                            placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)..."
                            rows={2}
                            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all placeholder:text-zinc-600"
                          />
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(withdrawal.id, 'approved')}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all duration-200 active:scale-[0.98]"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleAction(withdrawal.id, 'rejected')}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            ปฏิเสธ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
