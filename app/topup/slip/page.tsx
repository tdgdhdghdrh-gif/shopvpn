'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, ScanLine, Upload, AlertCircle, CheckCircle2, Loader2, 
  Building2, User, ImageIcon, X, AlertTriangle, Zap, Shield, Clock,
  Info, QrCode, Camera
} from 'lucide-react'

interface Settings {
  bankReceiverName: string
  bankAccountNumber: string
  qrCodeImage: string
  minTopupAmount: number
}

export default function SlipTopupPage() {
  const [slipUrl, setSlipUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [settings, setSettings] = useState<Settings>({
    bankReceiverName: 'พันวิลา',
    bankAccountNumber: '',
    qrCodeImage: '',
    minTopupAmount: 60
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings/public')
      const data = await res.json()
      if (data.settings) {
        setSettings({
          bankReceiverName: data.settings.bankReceiverName || 'พันวิลา',
          bankAccountNumber: data.settings.bankAccountNumber || '',
          qrCodeImage: data.settings.qrCodeImage || '',
          minTopupAmount: data.settings.minTopupAmount ?? 60
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!slipUrl.trim()) {
      setMessage({ type: 'error', text: 'กรุณาอัพโหลดรูปสลิป' })
      return
    }

    setShowConfirm(true)
  }

  async function confirmTopup() {
    setLoading(true)
    setMessage({ type: '', text: '' })
    setShowConfirm(false)

    try {
      const res = await fetch('/api/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: slipUrl.trim(), type: 'slip' })
      })

      const data = await res.json()

      if (data.success) {
        window.location.href = `/profile/topups?success=true&amount=${data.amount}&balance=${data.newBalance}`
      } else {
        setMessage({ type: 'error', text: data.error || 'ตรวจสอบสลิปไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'รูปภาพต้องมีขนาดไม่เกิน 5MB' })
      return
    }

    setUploading(true)
    setMessage({ type: '', text: '' })

    try {
      const reader2 = new FileReader()
      reader2.onload = async (event) => {
        const base64 = event.target?.result as string
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, type: 'slip' })
        })

        const data = await res.json()
        if (data.success) {
          setSlipUrl(data.url)
          setMessage({ type: 'success', text: 'อัพโหลดรูปภาพสำเร็จ!' })
        } else {
          if (data.fallback) {
            setSlipUrl(base64)
            setMessage({ type: '', text: '' })
          } else {
            setMessage({ type: 'error', text: data.error || 'อัพโหลดไม่สำเร็จ' })
          }
        }
        setUploading(false)
      }
      reader2.readAsDataURL(file)
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัพโหลด' })
      setUploading(false)
    }
  }

  function removeImage() {
    setSlipUrl('')
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14">
            <Link 
              href="/topup" 
              className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div className="ml-3">
              <h1 className="text-sm font-semibold text-white">เติมด้วยสลิป</h1>
              <p className="text-[10px] text-zinc-500">PromptPay / โอนเงิน</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-12">

        {/* Hero */}
        <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-7 mb-5">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <ScanLine className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">สลิปธนาคาร</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">ตรวจสอบสลิปอัตโนมัติผ่าน AI</p>
            </div>
          </div>

          {/* Quick info pills */}
          <div className="relative flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">AI ตรวจสอบ</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-medium text-blue-400">เข้าทันที</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Shield className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] font-medium text-purple-400">ปลอดภัย 100%</span>
            </div>
          </div>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Left: Bank Info + Upload Form */}
          <div className="lg:col-span-3 space-y-4">

            {/* Bank Info Card */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5">
              <h3 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                ข้อมูลบัญชีรับเงิน
              </h3>
              
              {settingsLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-12 bg-zinc-800/50 rounded-xl" />
                  <div className="h-12 bg-zinc-800/50 rounded-xl" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* QR Code */}
                  {settings.qrCodeImage && settings.qrCodeImage.length > 0 && (
                    <div className="flex justify-center mb-4">
                      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg shadow-blue-500/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={settings.qrCodeImage} 
                          alt="QR Code" 
                          className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-[11px] text-zinc-500">ชื่อบัญชี</span>
                    </div>
                    <span className="text-xs font-bold text-white">{settings.bankReceiverName}</span>
                  </div>
                  
                  {settings.bankAccountNumber && (
                    <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span className="text-[11px] text-zinc-500">เลขบัญชี</span>
                      </div>
                      <span className="text-xs font-bold text-white font-mono">{settings.bankAccountNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message */}
            {message.text && (
              <div className={`p-3 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Upload Form */}
            <form onSubmit={handleSubmit}>
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-3">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  อัพโหลดสลิป
                </label>
                
                {previewUrl ? (
                  <div className="relative">
                    <div className="bg-black/50 border border-white/5 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={previewUrl} 
                        alt="Slip Preview" 
                        className="w-full max-h-52 sm:max-h-64 object-contain mx-auto"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg border-2 border-zinc-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                          <span className="text-[10px] text-zinc-400">กำลังอัพโหลด...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-white/10 hover:border-blue-500/30 rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all hover:bg-blue-500/5 group"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
                        <p className="text-xs text-zinc-400">กำลังอัพโหลด...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/15 transition-colors">
                          <Upload className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-xs font-medium text-zinc-300 mb-1">คลิกเพื่ออัพโหลดสลิป</p>
                        <p className="text-[10px] text-zinc-600 flex items-center justify-center gap-1">
                          <Camera className="w-3 h-3" />
                          หรือถ่ายรูปจากกล้อง (สูงสุด 5MB)
                        </p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !slipUrl}
                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] text-sm group/btn relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                ) : (
                  <ScanLine className="w-4 h-4 relative z-10" />
                )}
                <span className="relative z-10">{loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสลิป'}</span>
              </button>
            </form>

            {/* Warning note */}
            <div className="p-3 bg-amber-500/8 border border-amber-500/15 rounded-xl flex items-start gap-2.5">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-400/80 leading-relaxed">
                ระบบ AI จะตรวจสอบสลิปอัตโนมัติ ยอดเงินจะเข้าทันทีหลังตรวจสอบสำเร็จ เติมขั้นต่ำ <span className="font-bold text-amber-400">{settings.minTopupAmount} บาท</span>
              </p>
            </div>
          </div>

          {/* Right: Steps */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 lg:sticky lg:top-20">
              <h3 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                วิธีใช้งาน
              </h3>
              <div className="space-y-2.5">
                {[
                  { step: '1', text: 'โอนเงิน', sub: 'สแกน QR หรือโอนไปบัญชีด้านบน' },
                  { step: '2', text: 'แคปหน้าจอ', sub: 'ถ่ายรูปหรือแคปสลิปการโอน' },
                  { step: '3', text: 'อัพโหลดสลิป', sub: 'กดอัพโหลดในช่องด้านบน' },
                  { step: '4', text: 'กดตรวจสอบ', sub: 'รอ AI ตรวจสอบ เงินเข้าทันที' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 bg-black/30 border border-white/5 rounded-xl">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 rounded-lg flex items-center justify-center text-[11px] font-bold text-blue-400 shrink-0">
                      {item.step}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white">{item.text}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security badge */}
              <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-emerald-400">ปลอดภัย 100%</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">ข้อมูลถูกเข้ารหัสและไม่ถูกเก็บ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-sm animate-slide-up">
            {/* Handle bar for mobile */}
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />
            
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">ยืนยันการเติมเงิน</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">กรุณาตรวจสอบก่อนกดยืนยัน</p>
              </div>
            </div>
            
            <div className="space-y-2.5 mb-5">
              <div className="p-3 bg-zinc-800/50 border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-xs text-zinc-400">เติมเงินขั้นต่ำ</span>
                <span className="text-sm font-bold text-white">{settings.minTopupAmount} บาท</span>
              </div>
              <div className="p-3 bg-red-500/8 border border-red-500/15 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-400 leading-relaxed">
                    <strong>ไม่คืนเงิน</strong> หากโอนผิดบัญชี หรือกดยืนยันผิด
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl transition-colors border border-white/5"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmTopup}
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                ยืนยันเติมเงิน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
