'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import DashboardCard from '@/components/admin/DashboardCard'
import {
  Store,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Phone,
  Link as LinkIcon,
  Wallet,
  QrCode,
  Percent,
  Loader2,
} from 'lucide-react'

interface Reseller {
  id: string
  userName: string
  userEmail: string
  firstName: string
  lastName: string
  phone: string
  facebookUrl: string
  shopName: string
  shopLogo: string | null
  walletPhone: string
  qrCodeImage: string | null
  status: 'pending' | 'approved' | 'rejected'
  commissionRate: number
  orderCount: number
  serverCount: number
  createdAt: string
  updatedAt: string
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

const STATUS_CONFIG = {
  pending: {
    label: 'รอตรวจสอบ',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    icon: Clock,
  },
  approved: {
    label: 'อนุมัติแล้ว',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'ปฏิเสธ',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: XCircle,
  },
} as const

export default function AdminResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [commissionInputs, setCommissionInputs] = useState<Record<string, number>>({})
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const fetchResellers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/resellers')
      if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลตัวแทนได้')
      const data = await res.json()
      setResellers(data.resellers ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResellers()
  }, [fetchResellers])

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setActionLoading(id)
      const commissionRate = commissionInputs[id] ?? 10
      const res = await fetch('/api/admin/resellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, commissionRate }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'ดำเนินการไม่สำเร็จ')
      }
      await fetchResellers()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = resellers.filter((r) => r.status === 'pending').length
  const approvedCount = resellers.filter((r) => r.status === 'approved').length
  const filtered =
    filter === 'all' ? resellers : resellers.filter((r) => r.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          <p className="text-zinc-400 text-sm">กำลังโหลดข้อมูลตัวแทน...</p>
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
            onClick={fetchResellers}
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
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <Store className="w-6 h-6 text-purple-400" />
            </div>
            จัดการตัวแทนจำหน่าย
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            ตรวจสอบและอนุมัติคำขอเป็นตัวแทนจำหน่าย
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardCard
            label="ตัวแทนทั้งหมด"
            value={resellers.length}
            description="จำนวนตัวแทนจำหน่ายในระบบ"
            icon={Users}
            color="text-blue-400"
          />
          <DashboardCard
            label="รอตรวจสอบ"
            value={pendingCount}
            description="คำขอที่ยังไม่ได้ดำเนินการ"
            icon={Clock}
            color="text-yellow-400"
          />
          <DashboardCard
            label="อนุมัติแล้ว"
            value={approvedCount}
            description="ตัวแทนที่ใช้งานอยู่"
            icon={CheckCircle2}
            color="text-emerald-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((f) => (
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
                ? `ทั้งหมด (${resellers.length})`
                : f === 'pending'
                  ? `รอตรวจสอบ (${pendingCount})`
                  : f === 'approved'
                    ? `อนุมัติแล้ว (${approvedCount})`
                    : `ปฏิเสธ (${resellers.filter((r) => r.status === 'rejected').length})`}
            </button>
          ))}
        </div>

        {/* Reseller List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Store className="w-12 h-12 text-zinc-700" />
            <p className="text-zinc-500">ไม่พบข้อมูลตัวแทน</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((reseller) => {
              const statusConf = STATUS_CONFIG[reseller.status]
              const StatusIcon = statusConf.icon
              const isProcessing = actionLoading === reseller.id

              return (
                <div
                  key={reseller.id}
                  className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10"
                >
                  <div className="p-5 sm:p-6">
                    {/* Top Row: Shop Info & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Shop Logo & Name */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {reseller.shopLogo ? (
                          <button
                            onClick={() => setPreviewImage(reseller.shopLogo)}
                            className="shrink-0"
                          >
                            <Image
                              src={reseller.shopLogo}
                              alt={reseller.shopName}
                              width={56}
                              height={56}
                              className="w-14 h-14 rounded-2xl object-cover border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
                            />
                          </button>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                            <Store className="w-7 h-7 text-zinc-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-lg truncate">{reseller.shopName}</h3>
                          <p className="text-sm text-zinc-400 truncate">{reseller.userName}</p>
                          <p className="text-xs text-zinc-600 truncate">{reseller.userEmail}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusConf.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConf.label}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                      <div className="bg-zinc-800/50 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Phone className="w-3 h-3" />
                          เบอร์โทร
                        </div>
                        <p className="text-sm font-medium truncate">
                          {reseller.phone || '-'}
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <LinkIcon className="w-3 h-3" />
                          Facebook URL
                        </div>
                        <p className="text-sm font-medium truncate">
                          {reseller.facebookUrl || '-'}
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Wallet className="w-3 h-3" />
                          เบอร์วอเล็ท
                        </div>
                        <p className="text-sm font-medium truncate">
                          {reseller.walletPhone || '-'}
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Percent className="w-3 h-3" />
                          คอมมิชชั่น
                        </div>
                        <p className="text-sm font-medium">{reseller.commissionRate}%</p>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        เซิร์ฟเวอร์: {reseller.serverCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        ออเดอร์: {reseller.orderCount}
                      </span>
                      <span>
                        สมัคร: {new Date(reseller.createdAt).toLocaleDateString('th-TH')}
                      </span>
                      <span>
                        อัปเดต: {new Date(reseller.updatedAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>

                    {/* QR Code Preview */}
                    {reseller.qrCodeImage && (
                      <div className="mt-4">
                        <button
                          onClick={() => setPreviewImage(reseller.qrCodeImage)}
                          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <Image
                            src={reseller.qrCodeImage}
                            alt="QR Code"
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg border border-white/10 object-cover"
                          />
                          <span>ดู QR Code</span>
                        </button>
                      </div>
                    )}

                    {/* Actions for Pending */}
                    {reseller.status === 'pending' && (
                      <div className="mt-5 pt-5 border-t border-white/5 space-y-4">
                        {/* Commission Rate Input */}
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-sm text-zinc-400 whitespace-nowrap">
                            <Percent className="w-4 h-4 text-purple-400" />
                            คอมมิชชั่น
                          </label>
                          <div className="relative w-28">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={commissionInputs[reseller.id] ?? 10}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10)
                                if (!isNaN(v) && v >= 0 && v <= 100) {
                                  setCommissionInputs((prev) => ({
                                    ...prev,
                                    [reseller.id]: v,
                                  }))
                                }
                              }}
                              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-center focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                              %
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(reseller.id, 'approved')}
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
                            onClick={() => handleAction(reseller.id, 'rejected')}
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full">
            <Image
              src={previewImage}
              alt="Preview"
              width={512}
              height={512}
              className="w-full h-auto rounded-2xl border border-white/10"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 p-2 bg-zinc-900 border border-white/10 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <XCircle className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
