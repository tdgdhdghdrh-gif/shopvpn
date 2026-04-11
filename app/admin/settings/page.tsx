'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import {
  Save, Key, Phone, Building2, User,
  AlertCircle, CheckCircle2, Loader2, Shield, Wallet, ScanLine,
  Upload, X, QrCode, Settings as SettingsIcon, Info, ExternalLink,
  Globe, Image as ImageIcon, Type, DollarSign, Layout, Eye, EyeOff,
  CheckCircle, XCircle, ChevronDown,
  Gift, Clock,
} from 'lucide-react'

interface Settings {
  truemoneyPhone: string
  truemoneyApiKey: string
  slipApiKey: string
  bankReceiverName: string
  bankAccountNumber: string
  qrCodeImage: string
  siteName: string
  siteLogo: string
  backgroundImage: string
  googleApiKey: string
  vpnDailyPrice: number
  vpnWeeklyPrice: number
  vpnMonthlyPrice: number
  minTopupAmount: number
  landingTemplate: string
  trialEnabled: boolean
  trialDurationMinutes: number
}

const INITIAL_SETTINGS: Settings = {
  truemoneyPhone: '',
  truemoneyApiKey: '',
  slipApiKey: '',
  bankReceiverName: '',
  bankAccountNumber: '',
  qrCodeImage: '',
  siteName: '',
  siteLogo: '',
  backgroundImage: '',
  googleApiKey: '',
  vpnDailyPrice: 4,
  vpnWeeklyPrice: 25,
  vpnMonthlyPrice: 100,
  minTopupAmount: 60,
  landingTemplate: 'classic',
  trialEnabled: true,
  trialDurationMinutes: 60,
}

function StatusDot({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
  ) : (
    <XCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
  )
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }
  const c = colorMap[color] || colorMap.purple
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-11 sm:h-11 ${c} border rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 font-medium truncate">{label}</p>
        <p className="text-sm sm:text-base font-bold text-white truncate">{value}</p>
      </div>
    </div>
  )
}

/* ── Input field component (ต้องอยู่นอก component หลักเพื่อป้องกัน re-mount ทุก keystroke) ── */
function InputField({ label, value, onChange, placeholder, icon: Icon, type = 'text', color = 'blue', hint, revealed, onToggleReveal }: {
  label: string; value: string | number; onChange: (value: string | number) => void; placeholder: string;
  icon: React.ElementType; type?: string; color?: string; hint?: string;
  revealed?: boolean; onToggleReveal?: () => void;
}) {
  const isSecret = type === 'password'
  const focusColor: Record<string, string> = {
    blue: 'focus:border-blue-500/50', red: 'focus:border-red-500/50',
    emerald: 'focus:border-emerald-500/50', indigo: 'focus:border-indigo-500/50',
    purple: 'focus:border-purple-500/50',
  }
  const iconFocus: Record<string, string> = {
    blue: 'group-focus-within:text-blue-400', red: 'group-focus-within:text-red-400',
    emerald: 'group-focus-within:text-emerald-400', indigo: 'group-focus-within:text-indigo-400',
    purple: 'group-focus-within:text-purple-400',
  }
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-0.5">{label}</label>
      <div className="relative group">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 ${iconFocus[color]} transition-colors`} />
        <input
          type={isSecret && !revealed ? 'password' : type === 'number' ? 'number' : 'text'}
          min={type === 'number' ? 0 : undefined}
          step={type === 'number' ? '0.5' : undefined}
          value={value}
          onChange={(e) => onChange(type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-${isSecret ? '11' : '4'} py-3 text-sm text-white ${focusColor[color]} transition-all font-medium placeholder:text-zinc-700`}
        />
        {isSecret && onToggleReveal && (
          <button
            type="button"
            onClick={onToggleReveal}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-zinc-600 ml-0.5">{hint}</p>}
    </div>
  )
}

/* ── Image upload area component ── */
function ImageUploadArea({ type, label, imgSrc, inputRef, onUpload, onRemove, uploading, maxW = 'max-w-[200px]', maxH = 'max-h-[100px]', areaW = 'w-full', areaH = 'h-[120px]' }: {
  type: 'qr' | 'logo' | 'background'; label: string; imgSrc: string;
  inputRef: React.RefObject<HTMLInputElement | null>; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void; uploading: boolean;
  maxW?: string; maxH?: string; areaW?: string; areaH?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-0.5">{label}</label>
      {imgSrc ? (
        <div className="relative group inline-block">
          <div className={`${type === 'qr' ? 'bg-white' : 'bg-zinc-900'} rounded-xl ${type === 'qr' ? 'p-4' : 'p-2'} flex items-center justify-center overflow-hidden border border-white/[0.06] group-hover:border-purple-500/20 transition-all`}>
            <img src={imgSrc} alt={label} className={`${maxW} ${maxH} object-contain`} />
          </div>
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={`group border-2 border-dashed border-white/[0.06] hover:border-purple-500/30 rounded-xl text-center cursor-pointer transition-all hover:bg-purple-500/[0.03] flex flex-col items-center justify-center gap-2 ${areaW} ${areaH}`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 transition-colors" />
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">อัปโหลด</p>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
    </div>
  )
}

/* ── Section card wrapper ── */
function SectionCard({ id, title, desc, icon: Icon, color, mobileSection, onToggle, children }: {
  id: string; title: string; desc: string; icon: React.ElementType; color: string;
  mobileSection: string | null; onToggle: (id: string) => void; children: React.ReactNode
}) {
  const colorMap: Record<string, { icon: string; gradient: string }> = {
    indigo: { icon: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', gradient: 'from-indigo-500/5' },
    blue: { icon: 'text-blue-400 bg-blue-500/10 border-blue-500/20', gradient: 'from-blue-500/5' },
    emerald: { icon: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', gradient: 'from-emerald-500/5' },
    red: { icon: 'text-red-400 bg-red-500/10 border-red-500/20', gradient: 'from-red-500/5' },
    purple: { icon: 'text-purple-400 bg-purple-500/10 border-purple-500/20', gradient: 'from-purple-500/5' },
  }
  const c = colorMap[color] || colorMap.purple
  const isOpen = mobileSection === id

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full p-5 sm:p-6 border-b border-white/5 bg-gradient-to-r to-transparent flex items-center gap-3 sm:gap-4 text-left sm:cursor-default"
        style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-from), transparent)` }}
      >
        <div className={`w-10 h-10 sm:w-11 sm:h-11 ${c.icon} border rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h3>
          <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">{desc}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-600 sm:hidden transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`sm:block ${isOpen ? 'block' : 'hidden'}`}>
        <div className="p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS)
  const [savedSettings, setSavedSettings] = useState<Settings>(INITIAL_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [revealFields, setRevealFields] = useState<Record<string, boolean>>({})
  const [mobileSection, setMobileSection] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSettings)
  }, [settings, savedSettings])

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const configStatus = useMemo(() => {
    const checks = [
      { label: 'ชื่อเว็บ', ok: !!settings.siteName },
      { label: 'โลโก้', ok: !!settings.siteLogo },
      { label: 'พื้นหลัง', ok: !!settings.backgroundImage },
      { label: 'QR Code', ok: !!settings.qrCodeImage },
      { label: 'TrueMoney', ok: !!settings.truemoneyPhone && !!settings.truemoneyApiKey },
      { label: 'Slip API', ok: !!settings.slipApiKey },
      { label: 'Google API', ok: !!settings.googleApiKey },
      { label: 'ราคา VPN', ok: settings.vpnDailyPrice > 0 && settings.vpnWeeklyPrice > 0 && settings.vpnMonthlyPrice > 0 },
    ]
    const done = checks.filter(c => c.ok).length
    return { checks, done, total: checks.length }
  }, [settings])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) {
        const s: Settings = {
          truemoneyPhone: data.settings.truemoneyPhone || '',
          truemoneyApiKey: data.settings.truemoneyApiKey || '',
          slipApiKey: data.settings.slipApiKey || '',
          bankReceiverName: data.settings.bankReceiverName || '',
          bankAccountNumber: data.settings.bankAccountNumber || '',
          qrCodeImage: data.settings.qrCodeImage || '',
          siteName: data.settings.siteName || '',
          siteLogo: data.settings.siteLogo || '',
          backgroundImage: data.settings.backgroundImage || '',
          googleApiKey: data.settings.googleApiKey || '',
          vpnDailyPrice: data.settings.vpnDailyPrice || 4,
          vpnWeeklyPrice: data.settings.vpnWeeklyPrice || 25,
          vpnMonthlyPrice: data.settings.vpnMonthlyPrice || 100,
          minTopupAmount: data.settings.minTopupAmount ?? 60,
          landingTemplate: data.settings.landingTemplate || 'classic',
          trialEnabled: data.settings.trialEnabled ?? true,
          trialDurationMinutes: data.settings.trialDurationMinutes ?? 60,
        }
        setSettings(s)
        setSavedSettings(s)
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถดึงข้อมูลการตั้งค่าได้' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault()
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
        setSavedSettings({ ...settings })
        setMessage({ type: 'success', text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' })
      } else {
        const detail = data.detail ? ` (${data.detail})` : ''
        setMessage({ type: 'error', text: (data.error || 'การบันทึกล้มเหลว') + detail })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof Settings, value: string | number | boolean) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  function toggleReveal(field: string) {
    setRevealFields(prev => ({ ...prev, [field]: !prev[field] }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'qr' | 'logo' | 'background') {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'ขนาดเกินกำหนด: ต้องไม่เกิน 2MB' })
      return
    }
    setUploading(type)
    setMessage({ type: '', text: '' })
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, type }),
        })
        const data = await res.json()
        if (data.success) {
          if (type === 'qr') updateField('qrCodeImage', data.url)
          else if (type === 'logo') updateField('siteLogo', data.url)
          else if (type === 'background') updateField('backgroundImage', data.url)
          setMessage({ type: 'success', text: `อัปโหลด${type === 'qr' ? 'QR Code' : type === 'logo' ? 'โลโก้' : 'พื้นหลัง'}สำเร็จ` })
        } else {
          setMessage({ type: 'error', text: data.error || 'อัปโหลดล้มเหลว' })
        }
        setUploading(null)
      }
      reader.readAsDataURL(file)
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัปโหลด' })
      setUploading(null)
    }
  }

  function removeImage(type: 'qr' | 'logo' | 'background') {
    if (type === 'qr') {
      updateField('qrCodeImage', '')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else if (type === 'logo') {
      updateField('siteLogo', '')
      if (logoInputRef.current) logoInputRef.current.value = ''
    } else if (type === 'background') {
      updateField('backgroundImage', '')
      if (bgInputRef.current) bgInputRef.current.value = ''
    }
  }

  function toggleMobileSection(id: string) {
    setMobileSection(prev => prev === id ? null : id)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลดการตั้งค่า...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* ── Toast ── */}
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

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
              <SettingsIcon className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">ตั้งค่าระบบ</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">จัดการ API ชำระเงิน ราคา และการตั้งค่าเว็บไซต์</p>
        </div>
        {/* Desktop save button */}
        <button
          onClick={() => handleSave()}
          disabled={saving || !hasChanges}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-purple-600 border border-purple-500/30 rounded-xl text-sm font-bold text-white hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="สถานะการตั้งค่า" value={`${configStatus.done}/${configStatus.total} รายการ`} icon={CheckCircle} color="emerald" />
        <StatCard label="ระบบชำระเงิน" value={settings.truemoneyApiKey && settings.slipApiKey ? 'พร้อมใช้งาน' : 'ยังไม่ครบ'} icon={Wallet} color={settings.truemoneyApiKey && settings.slipApiKey ? 'emerald' : 'red'} />
        <StatCard label="ราคา VPN รายวัน" value={`${settings.vpnDailyPrice} บาท`} icon={DollarSign} color="blue" />
        <StatCard label="ราคา VPN รายเดือน" value={`${settings.vpnMonthlyPrice} บาท`} icon={DollarSign} color="purple" />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        {/* ── Left Column (2/3) ── */}
        <div className="xl:col-span-2 space-y-5 sm:space-y-6">

          {/* Site Configuration */}
          <SectionCard id="site" title="ตั้งค่าเว็บไซต์" desc="ชื่อเว็บ โลโก้ และพื้นหลัง" icon={Layout} color="indigo" mobileSection={mobileSection} onToggle={toggleMobileSection}>
            <div className="space-y-5">
              <InputField label="ชื่อเว็บไซต์" value={settings.siteName} onChange={(v) => updateField('siteName', v)} placeholder="ชื่อเว็บไซต์ของคุณ" icon={Type} color="indigo" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ImageUploadArea type="logo" label="โลโก้เว็บไซต์" imgSrc={settings.siteLogo} inputRef={logoInputRef} onUpload={(e) => handleImageUpload(e, 'logo')} onRemove={() => removeImage('logo')} uploading={uploading === 'logo'} />
                <ImageUploadArea type="background" label="พื้นหลังเว็บไซต์" imgSrc={settings.backgroundImage} inputRef={bgInputRef} onUpload={(e) => handleImageUpload(e, 'background')} onRemove={() => removeImage('background')} uploading={uploading === 'background'} maxW="max-w-[300px]" maxH="max-h-[120px]" />
              </div>
            </div>
          </SectionCard>

          {/* VPN Pricing */}
          <SectionCard id="pricing" title="ตั้งค่าราคา VPN" desc="กำหนดราคาแพ็คเกจ VPN และเติมเงินขั้นต่ำ" icon={DollarSign} color="emerald" mobileSection={mobileSection} onToggle={toggleMobileSection}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <InputField label="รายวัน (บาท)" value={settings.vpnDailyPrice} onChange={(v) => updateField('vpnDailyPrice', v)} placeholder="4" icon={DollarSign} type="number" color="emerald" />
                <InputField label="รายสัปดาห์ (บาท)" value={settings.vpnWeeklyPrice} onChange={(v) => updateField('vpnWeeklyPrice', v)} placeholder="25" icon={DollarSign} type="number" color="emerald" />
                <InputField label="รายเดือน (บาท)" value={settings.vpnMonthlyPrice} onChange={(v) => updateField('vpnMonthlyPrice', v)} placeholder="100" icon={DollarSign} type="number" color="emerald" />
              </div>
              <div className="border-t border-white/5 pt-5">
                <InputField label="เติมเงินขั้นต่ำ (บาท)" value={settings.minTopupAmount} onChange={(v) => updateField('minTopupAmount', v)} placeholder="60" icon={Wallet} type="number" color="emerald" hint="จำนวนเงินขั้นต่ำที่ลูกค้าต้องเติมต่อครั้ง (ซองเล็ท / สลิป)" />
              </div>
            </div>
          </SectionCard>

          {/* Trial VPN */}
          <SectionCard id="trial" title="ทดลองใช้ VPN ฟรี" desc="เปิด/ปิดระบบทดลองฟรี และตั้งระยะเวลา" icon={Gift} color="emerald" mobileSection={mobileSection} onToggle={toggleMobileSection}>
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold text-white">เปิดใช้ระบบทดลองฟรี</p>
                    <p className="text-[10px] text-zinc-500">ลูกค้าสามารถทดลองใช้ VPN ฟรี 1 ครั้ง/เซิร์ฟเวอร์/วัน</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('trialEnabled', !settings.trialEnabled)}
                  className={`relative w-12 h-7 rounded-full transition-all ${settings.trialEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.trialEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {settings.trialEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <InputField 
                    label="ระยะเวลาทดลอง (นาที)" 
                    value={settings.trialDurationMinutes} 
                    onChange={(v) => updateField('trialDurationMinutes', v)} 
                    placeholder="60" 
                    icon={Clock} 
                    type="number" 
                    color="emerald" 
                    hint="เช่น 60 = 1 ชม., 30 = 30 นาที, 120 = 2 ชม." 
                  />
                </div>
              )}
            </div>
          </SectionCard>

          {/* TrueMoney Wallet */}
          <SectionCard id="truemoney" title="TrueMoney Wallet" desc="การประมวลผลวอชเชอร์และยอดเงินอัตโนมัติ" icon={Wallet} color="red" mobileSection={mobileSection} onToggle={toggleMobileSection}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <InputField label="เบอร์รับเงิน" value={settings.truemoneyPhone} onChange={(v) => updateField('truemoneyPhone', v)} placeholder="08X-XXX-XXXX" icon={Phone} color="red" />
              <InputField label="วอชเชอร์ API Token" value={settings.truemoneyApiKey} onChange={(v) => updateField('truemoneyApiKey', v)} placeholder="dx_xxxxxxxx" icon={Key} type="password" color="red" revealed={revealFields.truemoneyApiKey} onToggleReveal={() => toggleReveal('truemoneyApiKey')} />
            </div>
          </SectionCard>

          {/* Bank Slip Verification */}
          <SectionCard id="slip" title="ระบบตรวจสอบสลิปธนาคาร" desc="การตรวจสอบ OCR และธุรกรรมแบบเรียลไทม์" icon={ScanLine} color="blue" mobileSection={mobileSection} onToggle={toggleMobileSection}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <InputField label="Slip API Key" value={settings.slipApiKey} onChange={(v) => updateField('slipApiKey', v)} placeholder="dx_xxxxxxxx" icon={Key} type="password" color="blue" revealed={revealFields.slipApiKey} onToggleReveal={() => toggleReveal('slipApiKey')} />
              <InputField label="ชื่อโปรไฟล์ผู้รับเงิน" value={settings.bankReceiverName} onChange={(v) => updateField('bankReceiverName', v)} placeholder="ระบุให้ตรงตามสลิป" icon={User} color="blue" />
              <div className="sm:col-span-2">
                <InputField label="หมายเลขบัญชีปลายทาง" value={settings.bankAccountNumber} onChange={(v) => updateField('bankAccountNumber', v)} placeholder="XXX-X-XXXXX-X" icon={Building2} color="blue" />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Right Sidebar (1/3) ── */}
        <div className="space-y-5 sm:space-y-6">

          {/* QR Code Upload */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" /> QR Code รับชำระเงิน
              </h3>
              <Shield className="w-3.5 h-3.5 text-emerald-500/30" />
            </div>
            <div className="p-5">
              {settings.qrCodeImage ? (
                <div className="relative group">
                  <div className="bg-white rounded-xl p-4 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-purple-500/20 transition-all">
                    <img src={settings.qrCodeImage} alt="Payment QR" className="max-w-full h-auto object-contain max-h-[220px]" />
                  </div>
                  <button
                    onClick={() => removeImage('qr')}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group border-2 border-dashed border-white/[0.06] hover:border-emerald-500/30 rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all hover:bg-emerald-500/[0.03] space-y-3"
                >
                  {uploading === 'qr' ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">กำลังอัปโหลด...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-400">อัปโหลด QR Code</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">PNG, JPG (MAX 2MB)</p>
                      </div>
                    </>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'qr')} className="hidden" />
            </div>
          </div>

          {/* Config Status Checklist */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/5">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400" /> สถานะการตั้งค่า
              </h3>
            </div>
            <div className="p-4 sm:p-5 space-y-1">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ความสมบูรณ์</span>
                  <span className="text-xs font-bold text-white">{Math.round((configStatus.done / configStatus.total) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(configStatus.done / configStatus.total) * 100}%` }}
                  />
                </div>
              </div>
              {configStatus.checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2.5 py-1.5">
                  <StatusDot ok={c.ok} />
                  <span className={`text-xs font-medium ${c.ok ? 'text-zinc-400' : 'text-zinc-600'}`}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API Provider Info */}
          <div className="bg-gradient-to-br from-blue-600/[0.06] to-transparent border border-blue-500/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Info className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">ผู้ให้บริการ API</h3>
            </div>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              ระบบชำระเงินเชื่อมต่อกับ <span className="text-blue-400 font-bold">DarkX Payment Gateway</span> สำหรับรับยอดเงินอัตโนมัติ
            </p>
            <a
              href="https://api.darkx.shop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest"
            >
              <ExternalLink className="w-3.5 h-3.5" /> เว็บไซต์ผู้ให้บริการ
            </a>
          </div>
        </div>
      </div>

      {/* ── Mobile Floating Save Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-3 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <button
          onClick={() => handleSave()}
          disabled={saving || !hasChanges}
          className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 border border-purple-500/30 rounded-xl text-sm font-bold text-white active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
        </button>
      </div>
    </div>
  )
}
