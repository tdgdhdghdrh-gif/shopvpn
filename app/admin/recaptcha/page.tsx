'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Save, Key, AlertCircle, CheckCircle2, Loader2, ShieldCheck,
  Eye, EyeOff, ExternalLink, Info, Shield, Lock, Unlock,
  CheckCircle, XCircle, Globe, MonitorSmartphone, Fingerprint,
} from 'lucide-react'

interface RecaptchaSettings {
  recaptchaEnabled: boolean
  googleApiKey: string
  recaptchaSecretKey: string
}

const INITIAL: RecaptchaSettings = {
  recaptchaEnabled: false,
  googleApiKey: '',
  recaptchaSecretKey: '',
}

export default function AdminRecaptchaPage() {
  const [settings, setSettings] = useState<RecaptchaSettings>(INITIAL)
  const [saved, setSaved] = useState<RecaptchaSettings>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [revealFields, setRevealFields] = useState<Record<string, boolean>>({})
  const [focusField, setFocusField] = useState<string | null>(null)

  const hasChanges = useMemo(() => JSON.stringify(settings) !== JSON.stringify(saved), [settings, saved])

  const isReady = settings.recaptchaEnabled && !!settings.googleApiKey && !!settings.recaptchaSecretKey

  useEffect(() => { fetchSettings() }, [])

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(t)
    }
  }, [message])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) {
        const s: RecaptchaSettings = {
          recaptchaEnabled: data.settings.recaptchaEnabled ?? false,
          googleApiKey: data.settings.googleApiKey || '',
          recaptchaSecretKey: data.settings.recaptchaSecretKey || '',
        }
        setSettings(s)
        setSaved(s)
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถดึงข้อมูลการตั้งค่าได้' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (data.success) {
        setSaved({ ...settings })
        setMessage({ type: 'success', text: 'บันทึกการตั้งค่า reCAPTCHA เรียบร้อยแล้ว' })
      } else {
        setMessage({ type: 'error', text: data.error || 'การบันทึกล้มเหลว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSaving(false)
    }
  }

  function toggleReveal(field: string) {
    setRevealFields(prev => ({ ...prev, [field]: !prev[field] }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <ShieldCheck className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลด reCAPTCHA...</p>
      </div>
    )
  }

  return (
    <div className="pb-28 sm:pb-8">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 sm:animate-in sm:slide-in-from-right-10 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-transparent border border-blue-500/10 mb-6 sm:mb-8">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-[0.03]">
          <ShieldCheck className="w-32 h-32 sm:w-48 sm:h-48" />
        </div>

        <div className="relative p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">reCAPTCHA</h1>
                <p className="text-zinc-400 text-xs sm:text-sm font-medium max-w-md">ป้องกันบอทและสแปมในหน้าล็อกอินและสมัครสมาชิกด้วย Google reCAPTCHA v2</p>
              </div>
            </div>
            {/* Desktop Save */}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="hidden sm:flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-cyan-600 shadow-lg shadow-blue-500/20 disabled:shadow-none"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">

        {/* ── Left Column (2 cols on xl) ── */}
        <div className="xl:col-span-2 space-y-5 sm:space-y-6">

          {/* ─ Power Toggle ─ */}
          <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
            settings.recaptchaEnabled 
              ? 'bg-gradient-to-br from-blue-500/[0.08] via-cyan-500/[0.04] to-transparent border-blue-500/20' 
              : 'bg-zinc-900/50 border-white/5'
          }`}>
            {/* Animated glow when enabled */}
            {settings.recaptchaEnabled && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.03] via-transparent to-cyan-500/[0.03] animate-pulse" />
            )}
            
            <div className="relative p-5 sm:p-7">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, recaptchaEnabled: !prev.recaptchaEnabled }))}
                  className={`relative w-16 h-9 sm:w-[72px] sm:h-10 rounded-full transition-all duration-300 shrink-0 ${
                    settings.recaptchaEnabled 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30' 
                      : 'bg-zinc-800 border border-white/10'
                  }`}
                >
                  <div className={`absolute top-1 sm:top-1.5 w-7 h-7 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
                    settings.recaptchaEnabled ? 'left-[calc(100%-32px)] sm:left-[calc(100%-34px)]' : 'left-1'
                  }`}>
                    {settings.recaptchaEnabled 
                      ? <Unlock className="w-3.5 h-3.5 text-blue-600" /> 
                      : <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    }
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {settings.recaptchaEnabled ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานอยู่'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                      settings.recaptchaEnabled
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-500 border border-white/5'
                    }`}>
                      {settings.recaptchaEnabled ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                    {settings.recaptchaEnabled 
                      ? 'ผู้ใช้จะต้องยืนยัน reCAPTCHA ก่อนล็อกอินหรือสมัครสมาชิก' 
                      : 'ผู้ใช้สามารถล็อกอินและสมัครสมาชิกได้โดยไม่ต้องยืนยัน reCAPTCHA'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─ Keys Section ─ */}
          <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
            settings.recaptchaEnabled 
              ? 'bg-zinc-900/50 border-white/5 opacity-100' 
              : 'bg-zinc-900/30 border-white/[0.03] opacity-40 pointer-events-none'
          }`}>
            {/* Header */}
            <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/15 to-cyan-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <Key className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">คีย์ reCAPTCHA</h3>
                  <p className="text-[10px] sm:text-[11px] text-zinc-500 font-medium">กรอก Site Key และ Secret Key จาก Google reCAPTCHA Console</p>
                </div>
              </div>
            </div>

            {/* Keys Inputs */}
            <div className="p-5 sm:p-7 space-y-6">
              {/* Site Key */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <label className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Site Key</label>
                  <span className="text-[9px] font-bold text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">FRONTEND</span>
                </div>
                <div className="relative group">
                  <div className={`absolute left-0 top-0 bottom-0 w-12 rounded-l-xl flex items-center justify-center transition-colors ${
                    focusField === 'siteKey' ? 'bg-blue-500/10' : 'bg-white/[0.02]'
                  }`}>
                    <Key className={`w-4 h-4 transition-colors ${focusField === 'siteKey' ? 'text-blue-400' : 'text-zinc-600'}`} />
                  </div>
                  <input
                    type={revealFields['siteKey'] ? 'text' : 'password'}
                    value={settings.googleApiKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                    onFocus={() => setFocusField('siteKey')}
                    onBlur={() => setFocusField(null)}
                    placeholder="6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className={`w-full bg-white/[0.02] border rounded-xl pl-14 pr-12 py-3.5 text-sm text-white font-mono transition-all placeholder:text-zinc-700 focus:outline-none ${
                      focusField === 'siteKey' ? 'border-blue-500/40 bg-blue-500/[0.02]' : 'border-white/[0.06] hover:border-white/[0.1]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleReveal('siteKey')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors p-1"
                  >
                    {revealFields['siteKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-600 font-medium pl-1">ใช้แสดง reCAPTCHA widget ในหน้าเว็บฝั่งผู้ใช้</p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.04]" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-zinc-900 px-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">and</span>
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <label className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Secret Key</label>
                  <span className="text-[9px] font-bold text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">SERVER</span>
                </div>
                <div className="relative group">
                  <div className={`absolute left-0 top-0 bottom-0 w-12 rounded-l-xl flex items-center justify-center transition-colors ${
                    focusField === 'secretKey' ? 'bg-amber-500/10' : 'bg-white/[0.02]'
                  }`}>
                    <Lock className={`w-4 h-4 transition-colors ${focusField === 'secretKey' ? 'text-amber-400' : 'text-zinc-600'}`} />
                  </div>
                  <input
                    type={revealFields['secretKey'] ? 'text' : 'password'}
                    value={settings.recaptchaSecretKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, recaptchaSecretKey: e.target.value }))}
                    onFocus={() => setFocusField('secretKey')}
                    onBlur={() => setFocusField(null)}
                    placeholder="6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className={`w-full bg-white/[0.02] border rounded-xl pl-14 pr-12 py-3.5 text-sm text-white font-mono transition-all placeholder:text-zinc-700 focus:outline-none ${
                      focusField === 'secretKey' ? 'border-amber-500/40 bg-amber-500/[0.02]' : 'border-white/[0.06] hover:border-white/[0.1]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleReveal('secretKey')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors p-1"
                  >
                    {revealFields['secretKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-600 font-medium pl-1">ใช้ตรวจสอบ reCAPTCHA ฝั่งเซิร์ฟเวอร์ (ห้ามเปิดเผยต่อสาธารณะ)</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column (sidebar) ── */}
        <div className="space-y-5 sm:space-y-6">

          {/* Status Overview */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-blue-400" />
                สถานะระบบ
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {/* Overall Status */}
              <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                isReady 
                  ? 'bg-emerald-500/[0.06] border-emerald-500/15' 
                  : settings.recaptchaEnabled 
                    ? 'bg-amber-500/[0.06] border-amber-500/15' 
                    : 'bg-zinc-800/50 border-white/[0.04]'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isReady 
                    ? 'bg-emerald-500/15 text-emerald-400' 
                    : settings.recaptchaEnabled 
                      ? 'bg-amber-500/15 text-amber-400' 
                      : 'bg-zinc-800 text-zinc-600'
                }`}>
                  {isReady 
                    ? <CheckCircle className="w-4 h-4" /> 
                    : settings.recaptchaEnabled 
                      ? <AlertCircle className="w-4 h-4" /> 
                      : <XCircle className="w-4 h-4" />
                  }
                </div>
                <div>
                  <p className={`text-xs font-bold ${
                    isReady ? 'text-emerald-400' : settings.recaptchaEnabled ? 'text-amber-400' : 'text-zinc-500'
                  }`}>
                    {isReady ? 'พร้อมใช้งาน' : settings.recaptchaEnabled ? 'ยังตั้งค่าไม่ครบ' : 'ปิดใช้งาน'}
                  </p>
                  <p className="text-[10px] text-zinc-600 font-medium">
                    {isReady ? 'reCAPTCHA ทำงานอยู่' : settings.recaptchaEnabled ? 'กรุณาใส่คีย์ให้ครบ' : 'ไม่มีการป้องกันบอท'}
                  </p>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-0.5 pt-1">
                {[
                  { label: 'เปิดใช้งาน reCAPTCHA', ok: settings.recaptchaEnabled },
                  { label: 'Site Key (Frontend)', ok: !!settings.googleApiKey },
                  { label: 'Secret Key (Server)', ok: !!settings.recaptchaSecretKey },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 px-1">
                    {item.ok 
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    }
                    <span className={`text-xs font-medium ${item.ok ? 'text-zinc-300' : 'text-zinc-600'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Protected Pages */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <MonitorSmartphone className="w-4 h-4 text-cyan-400" />
                หน้าที่ได้รับการป้องกัน
              </h3>
            </div>
            <div className="p-5 space-y-2">
              {[
                { name: 'หน้าเข้าสู่ระบบ', path: '/login', icon: Lock },
                { name: 'หน้าสมัครสมาชิก', path: '/register', icon: Shield },
              ].map((page, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    settings.recaptchaEnabled 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : 'bg-zinc-800 text-zinc-600'
                  }`}>
                    <page.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{page.name}</p>
                    <p className="text-[10px] text-zinc-600 font-mono">{page.path}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shrink-0 ${
                    settings.recaptchaEnabled 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-zinc-800 text-zinc-600 border border-white/5'
                  }`}>
                    {settings.recaptchaEnabled ? 'PROTECTED' : 'OPEN'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Guide */}
          <div className="bg-gradient-to-br from-blue-600/[0.06] via-cyan-500/[0.03] to-transparent border border-blue-500/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-blue-500/10">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                วิธีตั้งค่า
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                {[
                  { step: '1', text: 'สร้างคีย์ใหม่ที่ Google reCAPTCHA Console', sub: 'เลือก reCAPTCHA v2 "I\'m not a robot"' },
                  { step: '2', text: 'คัดลอก Site Key มาใส่ในช่องแรก', sub: 'ใช้แสดง widget ฝั่งผู้ใช้' },
                  { step: '3', text: 'คัดลอก Secret Key มาใส่ในช่องที่สอง', sub: 'ใช้ตรวจสอบฝั่งเซิร์ฟเวอร์' },
                  { step: '4', text: 'เปิด Toggle แล้วกดบันทึก', sub: 'ระบบจะเริ่มทำงานทันที' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-black text-blue-400">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-300">{item.text}</p>
                      <p className="text-[10px] text-zinc-600">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://www.google.com/recaptcha/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full p-3 bg-blue-500/[0.08] hover:bg-blue-500/[0.15] border border-blue-500/15 hover:border-blue-500/25 rounded-xl text-xs font-bold text-blue-400 transition-all active:scale-[0.98]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Google reCAPTCHA Console
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Floating Save Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-3 bg-black/90 backdrop-blur-xl border-t border-white/5">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 disabled:from-zinc-800 disabled:to-zinc-800 rounded-xl text-sm font-bold text-white disabled:text-zinc-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
        </button>
      </div>
    </div>
  )
}
