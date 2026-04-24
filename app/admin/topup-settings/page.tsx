'use client'

import { useEffect, useState } from 'react'
import {
  Wallet,
  CreditCard,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Power,
} from 'lucide-react'

interface TopupStatus {
  walletEnabled: boolean
  slipEnabled: boolean
  autoDisableTopup: boolean
}

export default function AdminTopupSettingsPage() {
  const [status, setStatus] = useState<TopupStatus>({
    walletEnabled: true,
    slipEnabled: true,
    autoDisableTopup: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/topup-status')
      .then((r) => r.json())
      .then((d) => {
        if (d.walletEnabled !== undefined) {
          setStatus({
            walletEnabled: d.walletEnabled,
            slipEnabled: d.slipEnabled,
            autoDisableTopup: d.autoDisableTopup,
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/topup-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('บันทึกสำเร็จ')
      } else {
        setMessage(data.error || 'บันทึกไม่สำเร็จ')
      }
    } catch {
      setMessage('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                ตั้งค่าระบบเติมเงิน
              </h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                เปิด/ปิดช่องทางเติมเงินและตั้งค่าอัตโนมัติ
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-cyan-600/25 disabled:opacity-50 active:scale-95 flex items-center gap-2 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          บันทึก
        </button>
      </div>

      {message && (
        <div className={`p-3.5 rounded-2xl text-sm font-medium flex items-center gap-3 ${message.includes('สำเร็จ') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${message.includes('สำเร็จ') ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            {message.includes('สำเร็จ') ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <span>{message}</span>
        </div>
      )}

      {/* Wallet Toggle */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/10 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block leading-tight">เติมเงินวอลเล็ต</span>
              <span className="text-[11px] text-zinc-500">เติมผ่านระบบ TrueMoney Wallet API</span>
            </div>
          </div>
          <button
            onClick={() => setStatus((s) => ({ ...s, walletEnabled: !s.walletEnabled }))}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${status.walletEnabled ? 'bg-emerald-500 shadow-inner shadow-emerald-600/50' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <div className={`absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-300 ${status.walletEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Slip Toggle */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block leading-tight">เติมเงินสลิป</span>
              <span className="text-[11px] text-zinc-500">เติมผ่านการอัปโหลดสลิปธนาคาร</span>
            </div>
          </div>
          <button
            onClick={() => setStatus((s) => ({ ...s, slipEnabled: !s.slipEnabled }))}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${status.slipEnabled ? 'bg-emerald-500 shadow-inner shadow-emerald-600/50' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <div className={`absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-300 ${status.slipEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Auto Disable Toggle */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/10 flex items-center justify-center">
              <Power className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block leading-tight">ซ่อนอัตโนมัติเมื่อขัดข้อง</span>
              <span className="text-[11px] text-zinc-500">ถ้าระบบเติมเงินมีปัญหาบ่อย จะซ่อนตัวเองอัตโนมัติ</span>
            </div>
          </div>
          <button
            onClick={() => setStatus((s) => ({ ...s, autoDisableTopup: !s.autoDisableTopup }))}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${status.autoDisableTopup ? 'bg-emerald-500 shadow-inner shadow-emerald-600/50' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <div className={`absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-300 ${status.autoDisableTopup ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}
