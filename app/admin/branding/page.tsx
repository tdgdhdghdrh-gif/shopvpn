'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Palette, Save, Loader2, CheckCircle2, AlertCircle, Upload,
  Image as ImageIcon, Type, Globe, Monitor, Smartphone, Eye,
  Trash2, ExternalLink, RefreshCw, Sun, Moon, Sparkles
} from 'lucide-react'

interface ThemeOption {
  id: string
  name: string
  description: string
  badge?: string
  badgeColor?: string
  preview: {
    bg: string
    card: string
    accent: string
    accent2?: string
    text: string
    border: string
    glow?: string
  }
}

const themes: ThemeOption[] = [
  // ====== Classic ======
  {
    id: 'cyber',
    name: 'Cyber Dark',
    description: 'ธีมมืดสไตล์ไซเบอร์ ดีฟอลต์',
    badge: 'DEFAULT',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    preview: { bg: '#000000', card: '#18181b', accent: '#3b82f6', text: '#ffffff', border: '#27272a' }
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'ธีมมืดโทนน้ำเงินเข้ม สง่างาม',
    preview: { bg: '#0f172a', card: '#1e293b', accent: '#6366f1', text: '#e2e8f0', border: '#334155' }
  },
  {
    id: 'emerald',
    name: 'Emerald Night',
    description: 'ธีมมืดโทนเขียวมรกต หรูหรา',
    preview: { bg: '#022c22', card: '#064e3b', accent: '#10b981', text: '#d1fae5', border: '#065f46' }
  },
  {
    id: 'rose',
    name: 'Rose Dark',
    description: 'ธีมมืดโทนชมพูแดง โรแมนติก',
    preview: { bg: '#1c1017', card: '#2d1a24', accent: '#f43f5e', text: '#ffe4e6', border: '#3d1f2e' }
  },
  {
    id: 'amber',
    name: 'Golden Dark',
    description: 'ธีมมืดโทนทองหรู Premium',
    preview: { bg: '#1a1505', card: '#292211', accent: '#f59e0b', text: '#fef3c7', border: '#3d3419' }
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'ธีมมืดโทนม่วงจักรพรรดิ์',
    preview: { bg: '#1a0f2e', card: '#2e1065', accent: '#a855f7', text: '#f3e8ff', border: '#3b1d70' }
  },
  // ====== Spectacular ======
  {
    id: 'neonTokyo',
    name: 'Neon Tokyo',
    description: 'ไซเบอร์พังก์นีออน เมืองที่ไม่เคยหลับ',
    badge: 'HOT',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30 animate-pulse',
    preview: { bg: '#0a0a0f', card: '#12111a', accent: '#ff2d95', accent2: '#00f0ff', text: '#f0e6ff', border: '#2a1f3d', glow: '#ff2d95' }
  },
  {
    id: 'oceanAbyss',
    name: 'Ocean Abyss',
    description: 'ใต้มหาสมุทรลึก แสงเรืองรอง',
    badge: 'NEW',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 animate-pulse',
    preview: { bg: '#020b18', card: '#071a2e', accent: '#00d4ff', accent2: '#0066ff', text: '#e0f4ff', border: '#0d3355', glow: '#00d4ff' }
  },
  {
    id: 'inferno',
    name: 'Inferno',
    description: 'เปลวไฟภูเขาไฟ ร้อนแรงทรงพลัง',
    badge: 'NEW',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse',
    preview: { bg: '#0f0503', card: '#1f0c06', accent: '#ff5722', accent2: '#ff9800', text: '#fff3e0', border: '#3d1a0a', glow: '#ff5722' }
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'แสงเหนือเวทมนตร์ ลึกลับงดงาม',
    badge: 'NEW',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse',
    preview: { bg: '#040d15', card: '#091a25', accent: '#00e5a0', accent2: '#a855f7', text: '#e0fff5', border: '#0f3a2e', glow: '#00e5a0' }
  },
  // ====== Light ======
  {
    id: 'cleanWhite',
    name: 'Clean White',
    description: 'ธีมขาวสะอาดตา สว่าง อ่านง่าย',
    badge: 'NEW',
    badgeColor: 'bg-gray-500/20 text-gray-500 border-gray-400/30 animate-pulse',
    preview: { bg: '#f8fafc', card: '#ffffff', accent: '#3b82f6', text: '#0f172a', border: '#e2e8f0' }
  },
  {
    id: 'softGray',
    name: 'Soft Gray',
    description: 'ธีมเทาอ่อน นุ่มนวล ถนอมสายตา',
    badge: 'NEW',
    badgeColor: 'bg-slate-500/20 text-slate-400 border-slate-500/30 animate-pulse',
    preview: { bg: '#f1f5f9', card: '#e2e8f0', accent: '#6366f1', text: '#1e293b', border: '#cbd5e1' }
  },
]

export default function BrandingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Settings state
  const [siteName, setSiteName] = useState('')
  const [siteLogo, setSiteLogo] = useState('')
  const [appLogo, setAppLogo] = useState('')
  const [backgroundImage, setBackgroundImage] = useState('')
  const [backgroundOpacity, setBackgroundOpacity] = useState(30)
  const [theme, setTheme] = useState('cyber')

  // Image upload states
  const [uploadingSiteLogo, setUploadingSiteLogo] = useState(false)
  const [uploadingAppLogo, setUploadingAppLogo] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)

  const siteLogoRef = useRef<HTMLInputElement>(null)
  const appLogoRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) {
        setSiteName(data.settings.siteName || '')
        setSiteLogo(data.settings.siteLogo || '')
        setAppLogo(data.settings.appLogo || '')
        setBackgroundImage(data.settings.backgroundImage || '')
        setBackgroundOpacity(data.settings.backgroundOpacity ?? 30)
        setTheme(data.settings.theme || 'cyber')
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถโหลดการตั้งค่าได้' })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(file: File, type: 'siteLogo' | 'appLogo' | 'bg') {
    const setUploading = type === 'siteLogo' ? setUploadingSiteLogo : type === 'appLogo' ? setUploadingAppLogo : setUploadingBg
    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64, type: 'branding' })
          })
          const data = await res.json()
          if (data.success && data.url) {
            if (type === 'siteLogo') setSiteLogo(data.url)
            else if (type === 'appLogo') setAppLogo(data.url)
            else setBackgroundImage(data.url)
            setMessage({ type: 'success', text: 'อัพโหลดรูปสำเร็จ' })
          } else {
            setMessage({ type: 'error', text: data.error || 'อัพโหลดล้มเหลว' })
          }
        } catch {
          setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัพโหลด' })
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch {
      setUploading(false)
      setMessage({ type: 'error', text: 'ไม่สามารถอ่านไฟล์ได้' })
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName, siteLogo, appLogo, backgroundImage, backgroundOpacity, theme })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'บันทึกการตั้งค่า Branding เรียบร้อยแล้ว' })
      } else {
        setMessage({ type: 'error', text: data.error || 'การบันทึกล้มเหลว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลดการตั้งค่า Branding...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-right-10 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
              <Palette className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Branding & Theme</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">จัดการโลโก้ ชื่อเว็บ พื้นหลัง และธีมสีของเว็บไซต์</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-purple-600 border border-purple-500/30 rounded-xl text-sm font-bold text-white hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </div>

      {/* Site Name */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">ชื่อเว็บไซต์</h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">ชื่อที่จะแสดงบน Navbar, Title Bar และ SEO</p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="เช่น MyVPNShop"
            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none transition-all font-medium"
          />
          <p className="mt-2 text-[11px] text-zinc-600 font-medium">ค่าปัจจุบัน: <span className="text-zinc-400">{siteName || '(ไม่ได้ตั้ง)'}</span></p>
        </div>
      </div>

      {/* Site Logo */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">โลโก้เว็บไซต์</h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">โลโก้ที่แสดงบน Navbar (แนะนำ 40x40 หรือ 512x512 px)</p>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Preview */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-zinc-800 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 mx-auto sm:mx-0">
              {siteLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={siteLogo} alt="Site Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center">
                  <Globe className="w-8 h-8 text-zinc-600 mx-auto mb-1" />
                  <span className="text-[9px] text-zinc-600 font-medium">ไม่มีโลโก้</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={siteLogo}
                  onChange={(e) => setSiteLogo(e.target.value)}
                  placeholder="วาง URL รูปภาพ หรืออัพโหลด..."
                  className="flex-1 bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none transition-all font-medium"
                />
                <input ref={siteLogoRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'siteLogo')} />
                <button
                  onClick={() => siteLogoRef.current?.click()}
                  disabled={uploadingSiteLogo}
                  className="px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm font-bold shrink-0 disabled:opacity-40"
                >
                  {uploadingSiteLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </button>
              </div>
              {siteLogo && (
                <button
                  onClick={() => setSiteLogo('')}
                  className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  ลบโลโก้
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* App Logo */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">โลโก้แอพ (Favicon / PWA Icon)</h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">ไอคอนบน tab เบราว์เซอร์ และไอคอนแอพมือถือ (แนะนำ 512x512 px)</p>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Preview */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-zinc-800 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 mx-auto sm:mx-0">
              {appLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={appLogo} alt="App Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center">
                  <Smartphone className="w-8 h-8 text-zinc-600 mx-auto mb-1" />
                  <span className="text-[9px] text-zinc-600 font-medium">ไม่มีไอคอน</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={appLogo}
                  onChange={(e) => setAppLogo(e.target.value)}
                  placeholder="วาง URL รูปภาพ หรืออัพโหลด..."
                  className="flex-1 bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-pink-500/50 focus:outline-none transition-all font-medium"
                />
                <input ref={appLogoRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'appLogo')} />
                <button
                  onClick={() => appLogoRef.current?.click()}
                  disabled={uploadingAppLogo}
                  className="px-4 py-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400 hover:bg-pink-500/20 transition-all text-sm font-bold shrink-0 disabled:opacity-40"
                >
                  {uploadingAppLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </button>
              </div>
              {appLogo && (
                <button
                  onClick={() => setAppLogo('')}
                  className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  ลบไอคอน
                </button>
              )}
              <p className="text-[10px] text-zinc-600 font-medium">หมายเหตุ: Favicon/PWA icon จะอัพเดทหลังจาก build ใหม่</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Image */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">พื้นหลังเว็บไซต์</h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">รูปพื้นหลังหน้าเว็บ (แนะนำ 1920x1080 px)</p>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          {/* Preview */}
          <div className="w-full h-32 sm:h-48 bg-zinc-800 border border-white/10 rounded-2xl overflow-hidden relative">
            {backgroundImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Eye className="w-6 h-6 text-white/80" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <ImageIcon className="w-8 h-8 text-zinc-600 mb-2" />
                <span className="text-xs text-zinc-600 font-medium">ไม่มีพื้นหลัง (จะใช้สีดำ)</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              placeholder="วาง URL รูปภาพ หรืออัพโหลด..."
              className="flex-1 bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none transition-all font-medium"
            />
            <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'bg')} />
            <button
              onClick={() => bgRef.current?.click()}
              disabled={uploadingBg}
              className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-bold shrink-0 disabled:opacity-40"
            >
              {uploadingBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            </button>
          </div>
          {backgroundImage && (
            <button
              onClick={() => setBackgroundImage('')}
              className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              ลบพื้นหลัง
            </button>
          )}
        </div>
      </div>

      {/* Background Opacity */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">ความสว่างพื้นหลัง</h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">ปรับความทึบแสงของภาพพื้นหลัง (0% = มืดสนิท, 100% = เห็นรูปชัด)</p>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-5">
          {/* Preview with live opacity */}
          <div className="w-full h-28 sm:h-36 rounded-2xl overflow-hidden relative border border-white/10">
            <div className="absolute inset-0" style={{ backgroundColor: themes.find(t => t.id === theme)?.preview.bg || '#000000' }} />
            {backgroundImage && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={backgroundImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: backgroundOpacity / 100 }}
                />
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: `rgba(0,0,0,${Math.max(0, 0.5 - (backgroundOpacity / 100 * 0.3))})` }}
                />
              </>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl">
                <span className="text-white font-bold text-lg">{backgroundOpacity}%</span>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-zinc-600" />
                <span className="text-[11px] text-zinc-600 font-medium">มืด</span>
              </div>
              <span className="text-sm font-bold text-white tabular-nums">{backgroundOpacity}%</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-600 font-medium">สว่าง</span>
                <Sun className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={backgroundOpacity}
              onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-yellow-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-yellow-500/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-yellow-400"
            />
            {/* Quick presets */}
            <div className="flex gap-2">
              {[
                { label: 'มืด', value: 10 },
                { label: 'ค่อนข้างมืด', value: 25 },
                { label: 'ปานกลาง', value: 40 },
                { label: 'สว่าง', value: 60 },
                { label: 'ชัดมาก', value: 80 },
              ].map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setBackgroundOpacity(preset.value)}
                  className={`flex-1 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all ${
                    backgroundOpacity === preset.value
                      ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400'
                      : 'bg-zinc-800/50 border border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">ธีมสี</h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">เลือกธีมสีสำหรับเว็บไซต์ จะมีผลกับหน้าผู้ใช้ทั้งหมด</p>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-6">
          {/* Classic Themes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">Classic</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {themes.filter(t => !t.preview.glow).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left group ${
                    theme === t.id
                      ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10'
                      : 'border-white/5 hover:border-white/20 bg-zinc-900/30'
                  }`}
                >
                  {/* Badge */}
                  {t.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${t.badgeColor}`}>
                        {t.badge}
                      </span>
                    </div>
                  )}

                  {/* Theme active indicator */}
                  {theme === t.id && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Color Preview */}
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: t.preview.bg }} />
                    <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: t.preview.card }} />
                    <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: t.preview.accent }} />
                    <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: t.preview.text }} />
                  </div>

                  {/* Mini Preview Card */}
                  <div className="w-full h-16 rounded-xl overflow-hidden mb-3 border border-white/5" style={{ backgroundColor: t.preview.bg }}>
                    <div className="h-3 flex items-center px-2 gap-1" style={{ backgroundColor: t.preview.card, borderBottom: `1px solid ${t.preview.border}` }}>
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: t.preview.accent }} />
                      <div className="w-8 h-0.5 rounded" style={{ backgroundColor: t.preview.text, opacity: 0.3 }} />
                    </div>
                    <div className="p-2 flex gap-1.5">
                      <div className="w-5 h-5 rounded" style={{ backgroundColor: t.preview.card }} />
                      <div className="flex-1 space-y-1">
                        <div className="w-3/4 h-1 rounded" style={{ backgroundColor: t.preview.text, opacity: 0.3 }} />
                        <div className="w-1/2 h-1 rounded" style={{ backgroundColor: t.preview.accent, opacity: 0.5 }} />
                      </div>
                    </div>
                  </div>

                  <h4 className={`text-sm font-bold tracking-tight ${theme === t.id ? 'text-purple-300' : 'text-white'}`}>{t.name}</h4>
                  <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Spectacular Themes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 uppercase tracking-widest px-2">Spectacular</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {themes.filter(t => !!t.preview.glow).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left group overflow-hidden ${
                    theme === t.id
                      ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10'
                      : 'border-white/5 hover:border-white/20 bg-zinc-900/30'
                  }`}
                  style={{
                    boxShadow: theme === t.id
                      ? `0 0 30px ${t.preview.glow}20, 0 0 60px ${t.preview.glow}10`
                      : undefined,
                  }}
                >
                  {/* Glow background effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${t.preview.glow}15 0%, transparent 70%)`,
                    }}
                  />
                  {/* Active glow */}
                  {theme === t.id && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 50% 0%, ${t.preview.glow}20 0%, transparent 70%)`,
                      }}
                    />
                  )}

                  {/* Badge */}
                  {t.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${t.badgeColor}`}>
                        {t.badge}
                      </span>
                    </div>
                  )}

                  {/* Theme active indicator */}
                  {theme === t.id && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="relative z-[1]">
                    {/* Color Preview with dual accent */}
                    <div className="flex gap-1.5 mb-3">
                      <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: t.preview.bg }} />
                      <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: t.preview.card }} />
                      <div className="w-8 h-8 rounded-lg border border-white/10 relative" style={{ backgroundColor: t.preview.accent }}>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900" style={{ backgroundColor: t.preview.accent }} />
                      </div>
                      {t.preview.accent2 && (
                        <div className="w-8 h-8 rounded-lg border border-white/10 relative" style={{ backgroundColor: t.preview.accent2 }}>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900" style={{ backgroundColor: t.preview.accent2 }} />
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: t.preview.text }} />
                    </div>

                    {/* Enhanced Mini Preview Card with gradient glow */}
                    <div className="w-full h-20 rounded-xl overflow-hidden mb-3 border border-white/5 relative" style={{ backgroundColor: t.preview.bg }}>
                      {/* Top glow bar */}
                      <div className="absolute top-0 left-0 right-0 h-px" style={{
                        background: `linear-gradient(90deg, transparent, ${t.preview.accent}, ${t.preview.accent2 || t.preview.accent}, transparent)`,
                      }} />
                      {/* Navbar area */}
                      <div className="h-4 flex items-center px-2 gap-1" style={{ backgroundColor: t.preview.card, borderBottom: `1px solid ${t.preview.border}` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.preview.accent, boxShadow: `0 0 4px ${t.preview.accent}` }} />
                        <div className="w-6 h-0.5 rounded" style={{ backgroundColor: t.preview.text, opacity: 0.3 }} />
                        <div className="ml-auto flex gap-0.5">
                          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: t.preview.accent, opacity: 0.6 }} />
                          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: t.preview.accent2 || t.preview.accent, opacity: 0.4 }} />
                        </div>
                      </div>
                      {/* Content area */}
                      <div className="p-2 flex gap-1.5">
                        <div className="w-6 h-6 rounded-md relative" style={{ backgroundColor: t.preview.card, border: `1px solid ${t.preview.border}` }}>
                          <div className="absolute inset-0 rounded-md" style={{
                            background: `linear-gradient(135deg, ${t.preview.accent}30, ${t.preview.accent2 || t.preview.accent}20)`,
                          }} />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="w-4/5 h-1 rounded" style={{ backgroundColor: t.preview.text, opacity: 0.3 }} />
                          <div className="flex gap-1">
                            <div className="w-1/3 h-1 rounded" style={{ backgroundColor: t.preview.accent, opacity: 0.6 }} />
                            <div className="w-1/4 h-1 rounded" style={{ backgroundColor: t.preview.accent2 || t.preview.accent, opacity: 0.4 }} />
                          </div>
                        </div>
                      </div>
                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                        background: `linear-gradient(90deg, ${t.preview.accent}60, ${t.preview.accent2 || t.preview.accent}40, transparent)`,
                      }} />
                    </div>

                    <h4 className={`text-sm font-bold tracking-tight ${theme === t.id ? 'text-purple-300' : 'text-white'}`}>{t.name}</h4>
                    <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{t.description}</p>

                    {/* Dual accent indicator */}
                    {t.preview.accent2 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: `${t.preview.accent}20` }}>
                          <div className="h-full rounded-full" style={{
                            width: '100%',
                            background: `linear-gradient(90deg, ${t.preview.accent}, ${t.preview.accent2})`,
                          }} />
                        </div>
                        <span className="text-[9px] font-bold text-zinc-600">DUAL</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">ตัวอย่าง Navbar</h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">ตัวอย่างการแสดงผล Navbar ด้วยการตั้งค่าปัจจุบัน</p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          {/* Simulated Navbar */}
          <div className={`rounded-2xl border border-white/10 overflow-hidden`} style={{
            backgroundColor: themes.find(t => t.id === theme)?.preview.bg || '#000000'
          }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{
              backgroundColor: themes.find(t => t.id === theme)?.preview.card || '#18181b',
              borderBottom: `1px solid ${themes.find(t => t.id === theme)?.preview.border || '#27272a'}`
            }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
                  {siteLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={siteLogo} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Globe className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
                <span className="text-sm font-black tracking-tight" style={{
                  color: themes.find(t => t.id === theme)?.preview.text || '#ffffff'
                }}>
                  {siteName || 'SiteName'}
                </span>
              </div>
              <div className="flex gap-2">
                {['HOME', 'BLOG', 'TOPUP'].map(label => (
                  <span key={label} className="text-[9px] font-bold px-2 py-1 rounded" style={{
                    color: themes.find(t => t.id === theme)?.preview.accent || '#3b82f6',
                    backgroundColor: `${themes.find(t => t.id === theme)?.preview.accent || '#3b82f6'}15`
                  }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-20 flex items-center justify-center">
              {backgroundImage ? (
                <div className="w-full h-full relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={backgroundImage} alt="" className="w-full h-full object-cover opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-zinc-400">Content Area</span>
                  </div>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-zinc-600">Content Area</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-gradient-to-br from-purple-600/[0.06] to-transparent border border-purple-500/10 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">คำแนะนำ</h3>
        </div>
        <ul className="text-xs text-zinc-400 font-medium leading-relaxed space-y-1.5 ml-12">
          <li>&bull; <span className="text-cyan-400 font-bold">โลโก้เว็บ</span> จะแสดงบน Navbar ทุกหน้า (แนะนำขนาด 512x512 px, PNG พื้นใส)</li>
          <li>&bull; <span className="text-pink-400 font-bold">โลโก้แอพ</span> จะเป็น Favicon และ PWA icon สำหรับ Add to Home Screen</li>
          <li>&bull; <span className="text-emerald-400 font-bold">พื้นหลัง</span> จะแสดงเป็นภาพพื้นหลังหน้าผู้ใช้ (ถ้าไม่ตั้ง จะใช้พื้นดำ)</li>
          <li>&bull; <span className="text-yellow-400 font-bold">ความสว่าง</span> ปรับให้ภาพพื้นหลังมืด/สว่างตามต้องการ (ค่าแนะนำ 25-50%)</li>
          <li>&bull; <span className="text-purple-400 font-bold">ธีมสี</span> จะเปลี่ยนสีหลักของ Navbar, ปุ่ม, และ accent ทั้งหมดในหน้าผู้ใช้</li>
          <li>&bull; การเปลี่ยนแปลงจะมีผลทันทีหลังกดบันทึก (ผู้ใช้จะเห็นเมื่อรีเฟรช)</li>
        </ul>
      </div>

      {/* Mobile Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-3 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 border border-purple-500/30 rounded-xl text-sm font-bold text-white active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </div>
    </div>
  )
}
