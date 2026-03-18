'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, ScanLine, Upload, AlertCircle, CheckCircle2, Loader2, Building2, User, ImageIcon, X } from 'lucide-react'

interface Settings {
  bankReceiverName: string
  bankAccountNumber: string
  qrCodeImage: string
}

export default function SlipTopupPage() {
  const [slipUrl, setSlipUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [settings, setSettings] = useState<Settings>({
    bankReceiverName: 'พันวิลา',
    bankAccountNumber: '',
    qrCodeImage: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings/public')
      const data = await res.json()
      console.log('Public settings response:', data)
      if (data.settings) {
        setSettings({
          bankReceiverName: data.settings.bankReceiverName || 'พันวิลา',
          bankAccountNumber: data.settings.bankAccountNumber || '',
          qrCodeImage: data.settings.qrCodeImage || ''
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

    setLoading(true)
    setMessage({ type: '', text: '' })

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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 sm:h-16">
            <Link 
              href="/topup" 
              className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="ml-3 text-base sm:text-lg font-semibold">เติมด้วยสลิป</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 py-6">
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent border border-blue-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
          <div className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-blue-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 sm:w-32 sm:h-32 bg-cyan-500/20 rounded-full blur-3xl" />
          
          <div className="relative text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl shadow-blue-500/30">
              <ScanLine className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">สลิปธนาคาร</h2>
            <p className="text-gray-400 text-sm sm:text-base">ตรวจสอบสลิปอัตโนมัติผ่าน AI</p>
          </div>
        </div>

        {/* Bank Info Card with QR */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-white mb-6 flex items-center gap-3 text-lg">
            <Building2 className="w-6 h-6 text-blue-400" />
            ข้อมูลบัญชีรับเงิน
          </h3>
          
          {settingsLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-14 bg-blue-500/10 rounded-xl" />
              <div className="h-14 bg-blue-500/10 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* QR Code - ใหญ่ๆ */}
              {settings.qrCodeImage && settings.qrCodeImage.length > 0 ? (
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-2xl p-5 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={settings.qrCodeImage} 
                      alt="QR Code" 
                      className="w-44 h-44 object-contain"
                    />
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">ชื่อบัญชี</span>
                </div>
                <span className="font-semibold text-white text-base">{settings.bankReceiverName}</span>
              </div>
              
              {settings.bankAccountNumber && (
                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">เลขบัญชี</span>
                  </div>
                  <span className="font-semibold text-white font-mono text-base">{settings.bankAccountNumber}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            )}
            <span className="text-xs sm:text-sm">{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3 sm:mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              อัพโหลดสลิป
            </label>
            
            {previewUrl ? (
              <div className="relative">
                <div className="bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={previewUrl} 
                    alt="Slip Preview" 
                    className="w-full max-h-48 sm:max-h-64 object-contain mx-auto"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-7 h-7 sm:w-9 sm:h-9 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-blue-500/50 rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-all hover:bg-white/5"
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 animate-spin mb-3 sm:mb-4" />
                    <p className="text-sm text-gray-400">กำลังอัพโหลด...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm text-gray-400 mb-1 sm:mb-2">คลิกเพื่ออัพโหลดสลิป</p>
                    <p className="text-xs text-gray-600">หรือถ่ายรูปจากกล้อง</p>
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
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] text-sm sm:text-base"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <ScanLine className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสลิป'}
          </button>
        </form>

        {/* Steps */}
        <div className="mt-8 sm:mt-12">
          <h3 className="font-semibold text-white mb-4 sm:mb-5 flex items-center gap-2 text-base sm:text-lg">
            วิธีใช้งาน
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {[
              { step: '1', text: 'โอนเงินไปที่บัญชีด้านบน' },
              { step: '2', text: 'แคปหน้าจอหรือถ่ายรูปสลิป' },
              { step: '3', text: 'อัพโหลดรูปสลิปในช่องด้านบน' },
              { step: '4', text: 'กดตรวจสอบสลิป' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-base font-bold text-blue-400 flex-shrink-0">
                  {item.step}
                </div>
                <span className="text-sm sm:text-base text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-xs sm:text-sm text-blue-400/80 text-center">
            ระบบ AI จะตรวจสอบสลิปอัตโนมัติ ยอดเงินจะเข้าทันทีหลังตรวจสอบสำเร็จ
          </p>
        </div>
      </main>
    </div>
  )
}
