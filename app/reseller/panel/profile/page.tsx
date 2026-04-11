'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Store,
  User,
  Phone,
  Link,
  Upload,
  QrCode,
  Wallet,
  Save,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

interface ProfileData {
  id: string
  firstName: string
  lastName: string
  phone: string
  facebookUrl: string
  shopName: string
  shopLogo: string | null
  qrCodeImage: string | null
  walletPhone: string
  commissionRate: number
  resellerBalance: number
}

export default function ResellerProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingQr, setUploadingQr] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    facebookUrl: '',
    shopName: '',
    shopLogo: '',
    qrCodeImage: '',
    walletPhone: '',
  })

  const logoInputRef = useRef<HTMLInputElement>(null)
  const qrInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/reseller/profile')
        if (res.ok) {
          const json = await res.json()
          const p = json.profile as ProfileData
          setForm({
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            phone: p.phone || '',
            facebookUrl: p.facebookUrl || '',
            shopName: p.shopName || '',
            shopLogo: p.shopLogo || '',
            qrCodeImage: p.qrCodeImage || '',
            walletPhone: p.walletPhone || '',
          })
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess(false)
    setError('')
  }

  async function handleImageUpload(
    file: File,
    type: 'logo' | 'qr',
  ) {
    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingQr
    setUploading(true)
    setError('')

    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          ...(type === 'qr' ? { type: 'qr' } : {}),
        }),
      })

      const json = await res.json()
      if (json.success && json.url) {
        const field = type === 'logo' ? 'shopLogo' : 'qrCodeImage'
        setForm((prev) => ({ ...prev, [field]: json.url }))
      } else {
        setError(json.error || 'อัพโหลดรูปไม่สำเร็จ')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการอัพโหลด')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')

    try {
      const res = await fetch('/api/reseller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const json = await res.json()
      if (json.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(json.error || 'บันทึกไม่สำเร็จ')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSaving(false)
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
          <Store className="h-6 w-6 text-cyan-400" />
          โปรไฟล์ร้านค้า
        </h1>
        <p className="text-sm text-white/40 mt-1">
          แก้ไขข้อมูลส่วนตัวและร้านค้าของคุณ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-cyan-400" />
            ข้อมูลส่วนตัว
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                ชื่อจริง
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-500/50 focus:bg-white/[0.07]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                นามสกุล
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-500/50 focus:bg-white/[0.07]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                <Phone className="inline h-3 w-3 mr-1" />
                เบอร์โทร
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-500/50 focus:bg-white/[0.07]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                <Link className="inline h-3 w-3 mr-1" />
                Facebook URL
              </label>
              <input
                type="text"
                name="facebookUrl"
                value={form.facebookUrl}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-500/50 focus:bg-white/[0.07]"
              />
            </div>
          </div>
        </div>

        {/* Shop Info */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Store className="h-4.5 w-4.5 text-emerald-400" />
            ข้อมูลร้านค้า
          </h2>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              ชื่อร้านค้า
            </label>
            <input
              type="text"
              name="shopName"
              value={form.shopName}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-500/50 focus:bg-white/[0.07]"
            />
          </div>

          {/* Shop Logo */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">
              โลโก้ร้านค้า
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {form.shopLogo && (
                <div className="relative w-24 h-24 rounded-xl border border-white/10 overflow-hidden bg-white/5 flex-shrink-0">
                  <img
                    src={form.shopLogo}
                    alt="Shop logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 w-full">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'logo')
                  }}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingLogo ? 'กำลังอัพโหลด...' : 'อัพโหลดโลโก้'}
                </button>
                <p className="text-[11px] text-white/30 mt-1.5">
                  รองรับ JPG, PNG ขนาดไม่เกิน 2MB
                </p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">
              <QrCode className="inline h-3 w-3 mr-1" />
              QR Code รับเงิน
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {form.qrCodeImage && (
                <div className="relative w-24 h-24 rounded-xl border border-white/10 overflow-hidden bg-white/5 flex-shrink-0">
                  <img
                    src={form.qrCodeImage}
                    alt="QR Code"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 w-full">
                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'qr')
                  }}
                />
                <button
                  type="button"
                  onClick={() => qrInputRef.current?.click()}
                  disabled={uploadingQr}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                >
                  {uploadingQr ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingQr ? 'กำลังอัพโหลด...' : 'อัพโหลด QR Code'}
                </button>
                <p className="text-[11px] text-white/30 mt-1.5">
                  QR Code สำหรับรับเงินจากลูกค้า
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Wallet className="h-4.5 w-4.5 text-emerald-400" />
            ข้อมูลการเงิน
          </h2>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              เบอร์ TrueMoney Wallet
            </label>
            <input
              type="text"
              name="walletPhone"
              value={form.walletPhone}
              onChange={handleChange}
              placeholder="0xx-xxx-xxxx"
              className="w-full sm:w-80 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-500/50 focus:bg-white/[0.07]"
            />
          </div>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            บันทึกข้อมูลสำเร็จ
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </form>
    </div>
  )
}
