'use client'

import { useEffect, useState } from 'react'
import {
  Wallet,
  ArrowDownCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Banknote,
  Send,
} from 'lucide-react'

interface WithdrawalData {
  id: string
  amount: number
  method: string
  accountInfo: string
  status: string
  note: string | null
  processedAt: string | null
  createdAt: string
}

export default function ResellerWithdrawPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('wallet')
  const [accountInfo, setAccountInfo] = useState('')

  async function fetchData() {
    try {
      const res = await fetch('/api/reseller/withdraw')
      if (res.ok) {
        const json = await res.json()
        setWithdrawals(json.withdrawals ?? [])
        setBalance(json.balance ?? 0)
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Pre-fill accountInfo from profile
    async function loadProfile() {
      try {
        const res = await fetch('/api/reseller/profile')
        if (res.ok) {
          const json = await res.json()
          if (json.profile?.walletPhone) {
            setAccountInfo(json.profile.walletPhone)
          }
        }
      } catch {}
    }

    fetchData()
    loadProfile()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSuccess('')
    setError('')

    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินที่ถูกต้อง')
      setSubmitting(false)
      return
    }

    if (numAmount > balance) {
      setError(`ยอดเงินไม่เพียงพอ (คงเหลือ: ฿${balance.toLocaleString()})`)
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/reseller/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          method,
          accountInfo,
        }),
      })

      const json = await res.json()
      if (json.success) {
        setSuccess('ส่งคำขอถอนเงินสำเร็จ! กรุณารอแอดมินอนุมัติ')
        setAmount('')
        // Refresh data
        setLoading(true)
        await fetchData()
      } else {
        setError(json.error || 'เกิดข้อผิดพลาด')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการส่งคำขอ')
    } finally {
      setSubmitting(false)
    }
  }

  const hasPending = withdrawals.some((w) => w.status === 'pending')

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400">
            <Clock className="h-3 w-3" />
            รอดำเนินการ
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            อนุมัติแล้ว
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
            <XCircle className="h-3 w-3" />
            ปฏิเสธ
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/50">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wallet className="h-6 w-6 text-cyan-400" />
          ถอนเงิน
        </h1>
        <p className="text-sm text-white/40 mt-1">
          ถอนรายได้จากการขายของคุณ
        </p>
      </div>

      {/* Balance Card */}
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20">
            <Wallet className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-sm text-white/50">ยอดเงินคงเหลือ</p>
        </div>
        <p className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          ฿{balance.toLocaleString()}
        </p>
        <p className="text-xs text-white/30 mt-2">พร้อมถอนได้ทันที</p>
      </div>

      {/* Withdrawal Form */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-5">
          <ArrowDownCircle className="h-4.5 w-4.5 text-cyan-400" />
          แบบฟอร์มถอนเงิน
        </h2>

        {hasPending && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400 flex items-center gap-2 mb-5">
            <Clock className="h-4 w-4 flex-shrink-0" />
            คุณมีรายการถอนเงินที่รอดำเนินการอยู่ กรุณารอแอดมินอนุมัติก่อน
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                <Banknote className="inline h-3 w-3 mr-1" />
                จำนวนเงิน (บาท)
              </label>
              <input
                type="number"
                min="10"
                step="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError('')
                  setSuccess('')
                }}
                placeholder="ขั้นต่ำ 10 บาท"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-500/50 focus:bg-white/[0.07]"
              />
            </div>

            {/* Method */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                วิธีการรับเงิน
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('wallet')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    method === 'wallet'
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                      : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    method === 'bank'
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                      : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <Banknote className="h-4 w-4" />
                  ธนาคาร
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              {method === 'wallet' ? 'เบอร์วอเล็ท' : 'เลขบัญชีธนาคาร'}
            </label>
            <input
              type="text"
              value={accountInfo}
              onChange={(e) => {
                setAccountInfo(e.target.value)
                setError('')
                setSuccess('')
              }}
              placeholder={
                method === 'wallet' ? '0xx-xxx-xxxx' : 'ชื่อธนาคาร + เลขบัญชี'
              }
              required
              className="w-full sm:w-96 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-500/50 focus:bg-white/[0.07]"
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || hasPending}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? 'กำลังดำเนินการ...' : 'ส่งคำขอถอนเงิน'}
          </button>
        </form>
      </div>

      {/* Withdrawal History */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-white/50" />
            ประวัติการถอนเงิน
          </h2>
        </div>

        {withdrawals.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ArrowDownCircle className="mx-auto h-12 w-12 text-white/10 mb-3" />
            <p className="text-white/40">ยังไม่มีประวัติการถอนเงิน</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-white/50">
                    <th className="px-5 py-3.5 font-medium">วันที่</th>
                    <th className="px-5 py-3.5 font-medium text-right">จำนวน</th>
                    <th className="px-5 py-3.5 font-medium">วิธี</th>
                    <th className="px-5 py-3.5 font-medium">บัญชี</th>
                    <th className="px-5 py-3.5 font-medium text-center">สถานะ</th>
                    <th className="px-5 py-3.5 font-medium">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr
                      key={w.id}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-white/60 text-xs">
                        {new Date(w.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right text-white font-medium">
                        ฿{w.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-white/60 text-xs">
                          {w.method === 'wallet' ? (
                            <Wallet className="h-3 w-3" />
                          ) : (
                            <Banknote className="h-3 w-3" />
                          )}
                          {w.method === 'wallet' ? 'Wallet' : 'ธนาคาร'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white/50 text-xs">
                        {w.accountInfo}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {getStatusBadge(w.status)}
                      </td>
                      <td className="px-5 py-3.5 text-white/40 text-xs max-w-[200px] truncate">
                        {w.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-white/5">
              {withdrawals.map((w) => (
                <div key={w.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-white">
                      ฿{w.amount.toLocaleString()}
                    </p>
                    {getStatusBadge(w.status)}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="inline-flex items-center gap-1">
                      {w.method === 'wallet' ? (
                        <Wallet className="h-3 w-3" />
                      ) : (
                        <Banknote className="h-3 w-3" />
                      )}
                      {w.method === 'wallet' ? 'Wallet' : 'ธนาคาร'}
                    </span>
                    <span>{w.accountInfo}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/30">
                    <span>
                      {new Date(w.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {w.note && (
                      <span className="text-white/40 truncate max-w-[150px]">
                        {w.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
