'use client'

import { useState, useEffect } from 'react'
import {
  Calendar, Lock, AlertCircle, CheckCircle2, Loader2,
  Shield, Clock, Save, X, Eye, EyeOff, Edit3
} from 'lucide-react'

export default function SiteExpiryPage() {
  const [loading, setLoading] = useState(true)
  const [currentExpiry, setCurrentExpiry] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Edit mode (requires secret)
  const [editMode, setEditMode] = useState(false)
  const [secretVerified, setSecretVerified] = useState(false)
  const [secretInput, setSecretInput] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [expiryDate, setExpiryDate] = useState('')

  // Load expiry data on mount (super admin only, no secret needed)
  useEffect(() => {
    fetch('/api/admin/site-expiry')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setCurrentExpiry(data.siteExpiryDate)
          setIsExpired(data.isExpired)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(t)
    }
  }, [message])

  async function verifySecret(e: React.FormEvent) {
    e.preventDefault()
    if (!secretInput.trim()) return
    setAuthLoading(true)
    setAuthError('')

    try {
      const res = await fetch('/api/admin/site-expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretInput.trim() }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSecretVerified(true)
        setCurrentExpiry(data.siteExpiryDate)
        setIsExpired(data.siteExpiryDate ? new Date(data.siteExpiryDate) < new Date() : false)
        if (data.siteExpiryDate) {
          const d = new Date(data.siteExpiryDate)
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
          setExpiryDate(d.toISOString().slice(0, 16))
        }
        setMessage({ type: 'success', text: 'ยืนยันตัวตนสำเร็จ สามารถแก้ไขได้' })
      } else {
        setAuthError(data.error || 'รหัสผ่านไม่ถูกต้อง')
      }
    } catch {
      setAuthError('เกิดข้อผิดพลาด')
    } finally {
      setAuthLoading(false)
    }
  }

  async function saveExpiry(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/admin/site-expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretInput.trim(),
          siteExpiryDate: expiryDate || null,
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setCurrentExpiry(data.siteExpiryDate)
        setIsExpired(data.siteExpiryDate ? new Date(data.siteExpiryDate) < new Date() : false)
        setEditMode(false)
        setSecretVerified(false)
        setSecretInput('')
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.error || 'บันทึกไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setSaving(false)
    }
  }

  function clearExpiry() {
    setExpiryDate('')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto sm:w-96 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20">
            <Calendar className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">วันหมดอายุเว็บ</h2>
            <p className="text-zinc-500 text-xs sm:text-sm font-medium">ดูและจัดการวันหมดอายุของเว็บไซต์</p>
          </div>
        </div>
        {!editMode && (
          <button
            onClick={() => { setEditMode(true); setAuthError('') }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 border border-red-500/30 rounded-xl text-sm font-bold text-white hover:bg-red-500 transition-all"
          >
            <Edit3 className="w-4 h-4" /> แก้ไข
          </button>
        )}
      </div>

      {/* Current Status */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${
        isExpired ? 'bg-red-500/5 border-red-500/20' : currentExpiry ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isExpired ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            currentExpiry ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">สถานะปัจจุบัน</h3>
            <p className="text-[11px] text-zinc-500">
              {isExpired ? 'เว็บไซต์หมดอายุแล้ว' :
               currentExpiry ? 'เว็บไซต์มีวันหมดอายุ' :
               'เว็บไซต์ไม่มีวันหมดอายุ'}
            </p>
          </div>
        </div>

        {currentExpiry && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">วันหมดอายุ</span>
              <span className={`text-sm font-bold ${isExpired ? 'text-red-400' : 'text-amber-400'}`}>
                {new Date(currentExpiry).toLocaleString('th-TH', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            {isExpired && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                เว็บไซต์ถูกล็อกแล้ว ผู้ใช้ทั่วไปไม่สามารถเข้าใช้งานได้
              </div>
            )}
            {!isExpired && (
              <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                เหลืออีก {Math.max(0, Math.ceil((new Date(currentExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} วัน
              </div>
            )}
          </div>
        )}

        {!currentExpiry && (
          <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
            เว็บไซต์ไม่มีวันหมดอายุ ใช้งานได้ตลอด
          </div>
        )}
      </div>

      {/* Edit Form (requires secret) */}
      {editMode && (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" /> แก้ไขวันหมดอายุ
            </h3>
            <button onClick={() => { setEditMode(false); setSecretVerified(false); setAuthError(''); setSecretInput('') }}
              className="text-xs text-zinc-500 hover:text-white transition-colors">
              ยกเลิก
            </button>
          </div>

          {/* Secret verification */}
          <form onSubmit={verifySecret} className="space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">รหัสผู้สร้างเว็บ</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secretInput}
                  onChange={(e) => { setSecretInput(e.target.value); setAuthError('') }}
                  placeholder="ใส่รหัสผ่าน..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-zinc-700 focus:border-red-500/50 transition-all tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || !secretInput.trim()}
              className="w-full py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-zinc-700 transition-all disabled:opacity-50"
            >
              {authLoading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> กำลังตรวจสอบ...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Shield className="w-4 h-4" /> ยืนยันรหัส</span>
              )}
            </button>
          </form>

          {/* Expiry form (shown after secret verified) */}
          {secretVerified && (
            <form onSubmit={saveExpiry} className="space-y-4 pt-4 border-t border-zinc-800">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">วันที่และเวลาหมดอายุ</label>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white"
                />
                <p className="text-[11px] text-zinc-600 mt-1.5">
                  ถ้าไม่เลือก = ไม่มีวันหมดอายุ (ใช้งานได้ตลอด)
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 border border-red-500/30 rounded-xl text-sm font-bold text-white hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button
                  type="button"
                  onClick={clearExpiry}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" /> ล้าง (ไม่มีวันหมด)
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Warning */}
      <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-xl text-xs text-zinc-600 flex items-start gap-2">
        <Shield className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-zinc-500 mb-1">คำเตือน</p>
          <p>เมื่อถึงวันหมดอายุ ผู้ใช้ทั่วไปจะไม่สามารถเข้าใช้งานเว็บไซต์ได้ทั้งหมด (ยกเว้นหน้านี้และ API)</p>
          <p className="mt-1">การอัปเดทเว็บไซต์ (update-site) จะไม่เปลี่ยนแปลงวันหมดอายุที่ตั้งไว้</p>
        </div>
      </div>
    </div>
  )
}
