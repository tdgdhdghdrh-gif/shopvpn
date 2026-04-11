'use client'

import { useState, useEffect } from 'react'
import { Key, Loader2, CheckCircle2, XCircle, Shield, ArrowRight, Globe } from 'lucide-react'

export default function SetupPage() {
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{
    siteName: string
    expiryDate: string
    remaining: { text: string }
  } | null>(null)

  // เช็คว่าเว็บนี้ต้อง setup จริงไหม ถ้าไม่ -> redirect ไปหน้าหลัก
  useEffect(() => {
    fetch('/api/license/activate')
      .then(res => res.json())
      .then(data => {
        // ถ้ามี key แล้ว (activate แล้ว) หรือ ไม่มี apiUrl (เว็บต้นทาง) -> ไม่ต้อง setup
        if (data.activated || !data.licenseApiUrl) {
          window.location.href = '/'
          return
        }
        setChecking(false)
      })
      .catch(() => {
        // ถ้า error ก็ redirect ไปหน้าหลัก
        window.location.href = '/'
      })
  }, [])

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('กรุณาใส่ License Key')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          licenseKey: licenseKey.trim(),
          licenseApiUrl: 'https://simonvpn.darkx.shop'
        })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess({
          siteName: data.siteName,
          expiryDate: data.expiryDate,
          remaining: data.remaining,
        })
        // Redirect หลัง 2 วินาที
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        setError(data.error || 'ไม่สามารถลงทะเบียนได้')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
    
    setLoading(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Success */}
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">ลงทะเบียนสำเร็จ!</h1>
            <p className="text-sm text-zinc-400 mb-6">เว็บของคุณพร้อมใช้งานแล้ว</p>
            
            <div className="bg-zinc-800/50 rounded-2xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">ชื่อเว็บ</span>
                <span className="text-sm font-bold text-white">{success.siteName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">อายุคงเหลือ</span>
                <span className="text-sm font-bold text-emerald-400">{success.remaining?.text}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">หมดอายุ</span>
                <span className="text-xs font-mono text-zinc-400">
                  {new Date(success.expiryDate).toLocaleDateString('th-TH', { 
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังเข้าสู่เว็บ...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">ลงทะเบียนเว็บ</h1>
          <p className="text-sm text-zinc-500">ใส่ License Key เพื่อเปิดใช้งานเว็บของคุณ</p>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* License Key Input */}
            <div className="mb-6">
              <label className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-wider flex items-center gap-2">
                <Key className="w-3.5 h-3.5" />
                License Key
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={e => { setLicenseKey(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleActivate()}
                placeholder="LIC-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full bg-zinc-800/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-700 font-mono focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                autoFocus
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Activate Button */}
            <button
              onClick={handleActivate}
              disabled={loading || !licenseKey.trim()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-2xl font-bold text-sm hover:from-violet-500 hover:to-fuchsia-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-violet-500/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  เปิดใช้งานเว็บ
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Info Footer */}
          <div className="px-6 sm:px-8 py-5 border-t border-white/[0.04] bg-zinc-950/30">
            <p className="text-[11px] text-zinc-600 text-center leading-relaxed">
              License Key ได้จากผู้ดูแลระบบ หากยังไม่มี กรุณาติดต่อเพื่อขอรับ Key
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
