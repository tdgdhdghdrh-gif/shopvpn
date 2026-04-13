'use client'

import { useEffect, useState } from 'react'
import {
  Layout, Sparkles, Gamepad2, Briefcase, Crown, CheckCircle, Loader2,
  Monitor, Smartphone, Eye, Save, Shield, Zap, Globe,
  Star, Building2, Sword, Diamond, Lock, User,
  Droplets, Sun, LogIn, UserPlus, Palette,
} from 'lucide-react'

type AuthTemplateId = 'classic' | 'minimal' | 'gaming' | 'corporate' | 'premium' | 'songkran'

interface TemplateInfo {
  id: AuthTemplateId
  name: string
  subtitle: string
  desc: string
  icon: React.ElementType
  gradient: string
  border: string
  accent: string
  // Preview colors
  bgClass: string
  accentColor: string
  btnClass: string
  btnTextClass: string
  inputBorder: string
  orbColor: string
}

const templates: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic',
    subtitle: 'สีฟ้า-น้ำเงิน คลาสสิก',
    desc: 'ธีมมาตรฐาน - Gradient สีฟ้าครามผสมม่วง, Orb เรืองแสง, ฟีเจอร์ 4 อย่าง',
    icon: Layout,
    gradient: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500',
    accent: 'cyan',
    bgClass: 'from-black via-zinc-950 to-black',
    accentColor: 'text-cyan-400',
    btnClass: 'from-cyan-500 to-blue-600',
    btnTextClass: 'text-white',
    inputBorder: 'border-cyan-500/30',
    orbColor: 'bg-cyan-500/10',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    subtitle: 'ขาว-ดำ เรียบง่าย',
    desc: 'ธีมขาวดำ Minimalist - ปุ่มขาว ข้อความดำ สะอาดตา',
    icon: Sparkles,
    gradient: 'from-zinc-400 to-zinc-600',
    border: 'border-zinc-400',
    accent: 'zinc',
    bgClass: 'from-zinc-950 via-black to-zinc-950',
    accentColor: 'text-zinc-300',
    btnClass: 'from-white to-zinc-200',
    btnTextClass: 'text-black',
    inputBorder: 'border-zinc-500/30',
    orbColor: 'bg-zinc-500/5',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    subtitle: 'สีเขียว Neon เกมเมอร์',
    desc: 'ธีมเกมเมอร์ - Grid Pattern, Neon เขียว, เอฟเฟกต์เรืองแสง',
    icon: Gamepad2,
    gradient: 'from-green-500 to-emerald-500',
    border: 'border-green-500',
    accent: 'green',
    bgClass: 'from-black via-[#0a0f0a] to-black',
    accentColor: 'text-green-400',
    btnClass: 'from-green-500 to-emerald-600',
    btnTextClass: 'text-white',
    inputBorder: 'border-green-500/30',
    orbColor: 'bg-green-500/10',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    subtitle: 'สีน้ำเงินเข้ม ทางการ',
    desc: 'ธีมองค์กร - Professional, Security Focus, สีน้ำเงิน-ม่วง',
    icon: Briefcase,
    gradient: 'from-blue-600 to-indigo-600',
    border: 'border-blue-500',
    accent: 'blue',
    bgClass: 'from-slate-950 via-slate-900 to-slate-950',
    accentColor: 'text-blue-400',
    btnClass: 'from-blue-600 to-indigo-600',
    btnTextClass: 'text-white',
    inputBorder: 'border-blue-500/30',
    orbColor: 'bg-blue-500/6',
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'สีทอง-เหลือง หรูหรา',
    desc: 'ธีมพรีเมียม - Gold Accent, VIP Access, ดูหรูหราระดับสูง',
    icon: Crown,
    gradient: 'from-amber-500 to-yellow-500',
    border: 'border-amber-500',
    accent: 'amber',
    bgClass: 'from-black via-[#1a1000] to-black',
    accentColor: 'text-amber-400',
    btnClass: 'from-amber-500 to-yellow-500',
    btnTextClass: 'text-white',
    inputBorder: 'border-amber-500/30',
    orbColor: 'bg-amber-500/8',
  },
  {
    id: 'songkran',
    name: 'Songkran',
    subtitle: 'เทศกาลสงกรานต์',
    desc: 'ธีมสงกรานต์ - น้ำ/ทอง, Emoji Drops Animation, เทศกาลไทย',
    icon: Droplets,
    gradient: 'from-sky-400 to-cyan-500',
    border: 'border-sky-500',
    accent: 'sky',
    bgClass: 'from-[#060e1f] via-[#0c1f3d] to-[#060e1f]',
    accentColor: 'text-sky-400',
    btnClass: 'from-sky-500 to-cyan-500',
    btnTextClass: 'text-white',
    inputBorder: 'border-sky-500/30',
    orbColor: 'bg-sky-500/8',
  },
]

// ===== Mini Preview Components =====

function PhoneFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && <span className="text-[9px] text-zinc-500 font-medium flex items-center gap-1"><Smartphone className="w-3 h-3" /> {label}</span>}
      <div className="relative w-[120px] h-[210px] bg-black rounded-[16px] border-2 border-zinc-700 overflow-hidden shadow-xl shadow-black/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-black rounded-b-lg z-20" />
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

function DesktopFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && <span className="text-[9px] text-zinc-500 font-medium flex items-center gap-1"><Monitor className="w-3 h-3" /> {label}</span>}
      <div className="relative w-full max-w-[260px] bg-black rounded-lg border border-zinc-700 overflow-hidden shadow-xl shadow-black/50">
        <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border-b border-zinc-800">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
          <div className="flex-1 mx-3">
            <div className="bg-zinc-800 rounded px-2 py-0.5 text-[6px] text-zinc-500 text-center truncate">yoursite.com</div>
          </div>
        </div>
        <div className="aspect-[16/10] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

// Login page mini preview
function LoginPreview({ tmpl, isMobile = false }: { tmpl: TemplateInfo; isMobile?: boolean }) {
  const isGaming = tmpl.id === 'gaming'
  const isSongkran = tmpl.id === 'songkran'

  return (
    <div className={`w-full h-full bg-gradient-to-br ${tmpl.bgClass} text-white relative overflow-hidden`}>
      {/* Gaming grid */}
      {isGaming && (
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }} />
      )}
      {/* Orb glow */}
      <div className={`absolute top-2 right-2 w-12 h-12 ${tmpl.orbColor} blur-xl rounded-full`} />
      {/* Songkran emoji */}
      {isSongkran && (
        <div className="absolute top-1 right-2 text-[8px] opacity-40">💦🌸🐘</div>
      )}

      {isMobile ? (
        /* Mobile: full form */
        <div className="relative flex flex-col items-center justify-center h-full px-3 py-4">
          {/* Logo + Title */}
          <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${tmpl.gradient}/20 flex items-center justify-center mb-1.5`}>
            <Lock className={`w-2.5 h-2.5 ${tmpl.accentColor}`} />
          </div>
          <p className={`text-[7px] font-bold ${tmpl.accentColor} mb-0.5`}>เข้าสู่ระบบ</p>
          <p className="text-[4px] text-zinc-500 mb-2">ล็อกอินเพื่อใช้งาน VPN</p>
          {/* Form */}
          <div className="w-full max-w-[80px] space-y-1.5">
            <div className={`h-3 rounded-md bg-white/5 border ${tmpl.inputBorder} px-1 flex items-center gap-0.5`}>
              <User className="w-1.5 h-1.5 text-zinc-600" />
              <span className="text-[4px] text-zinc-600">ชื่อผู้ใช้</span>
            </div>
            <div className={`h-3 rounded-md bg-white/5 border ${tmpl.inputBorder} px-1 flex items-center gap-0.5`}>
              <Lock className="w-1.5 h-1.5 text-zinc-600" />
              <span className="text-[4px] text-zinc-600">รหัสผ่าน</span>
            </div>
            <div className={`h-3 rounded-md bg-gradient-to-r ${tmpl.btnClass} flex items-center justify-center`}>
              <span className={`text-[4px] font-bold ${tmpl.btnTextClass}`}>เข้าสู่ระบบ</span>
            </div>
          </div>
          <p className="text-[3.5px] text-zinc-600 mt-1.5">ยังไม่มีบัญชี? <span className={tmpl.accentColor}>สมัครสมาชิก</span></p>
        </div>
      ) : (
        /* Desktop: split layout */
        <div className="flex h-full">
          {/* Left panel - hero */}
          <div className={`w-[45%] flex flex-col items-center justify-center px-2 py-3 bg-gradient-to-br ${tmpl.bgClass}`}>
            <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${tmpl.gradient}/20 flex items-center justify-center mb-1`}>
              <Shield className={`w-2.5 h-2.5 ${tmpl.accentColor}`} />
            </div>
            <p className={`text-[5px] font-bold ${tmpl.accentColor} mb-0.5 text-center`}>ยินดีต้อนรับ</p>
            <p className="text-[3.5px] text-zinc-500 text-center mb-1.5">เข้าสู่ระบบ VPN</p>
            {/* Mini features */}
            <div className="space-y-0.5 w-full px-1">
              {[Shield, Zap, Globe].map((Icon, i) => (
                <div key={i} className="flex items-center gap-1 px-1 py-0.5 rounded bg-white/[0.03]">
                  <Icon className={`w-1.5 h-1.5 ${tmpl.accentColor}`} />
                  <div className="h-0.5 flex-1 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </div>
          {/* Right panel - form */}
          <div className="flex-1 flex flex-col items-center justify-center px-3">
            <p className="text-[5px] font-bold text-white mb-0.5">เข้าสู่ระบบ</p>
            <p className="text-[3px] text-zinc-500 mb-2">กรอกข้อมูลเพื่อเข้าใช้งาน</p>
            <div className="w-full max-w-[70px] space-y-1">
              <div className={`h-2.5 rounded bg-white/5 border ${tmpl.inputBorder} px-1 flex items-center gap-0.5`}>
                <User className="w-1.5 h-1.5 text-zinc-600" />
                <span className="text-[3px] text-zinc-600">ชื่อผู้ใช้</span>
              </div>
              <div className={`h-2.5 rounded bg-white/5 border ${tmpl.inputBorder} px-1 flex items-center gap-0.5`}>
                <Lock className="w-1.5 h-1.5 text-zinc-600" />
                <span className="text-[3px] text-zinc-600">รหัสผ่าน</span>
              </div>
              <div className={`h-2.5 rounded bg-gradient-to-r ${tmpl.btnClass} flex items-center justify-center`}>
                <span className={`text-[3.5px] font-bold ${tmpl.btnTextClass}`}>เข้าสู่ระบบ</span>
              </div>
            </div>
            <p className="text-[3px] text-zinc-600 mt-1">ยังไม่มีบัญชี? <span className={tmpl.accentColor}>สมัคร</span></p>
          </div>
        </div>
      )}
    </div>
  )
}

// Register page mini preview
function RegisterPreview({ tmpl, isMobile = false }: { tmpl: TemplateInfo; isMobile?: boolean }) {
  const isGaming = tmpl.id === 'gaming'
  const isSongkran = tmpl.id === 'songkran'

  return (
    <div className={`w-full h-full bg-gradient-to-br ${tmpl.bgClass} text-white relative overflow-hidden`}>
      {/* Gaming grid */}
      {isGaming && (
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }} />
      )}
      {/* Orb glow */}
      <div className={`absolute top-2 left-2 w-12 h-12 ${tmpl.orbColor} blur-xl rounded-full`} />
      {/* Songkran emoji */}
      {isSongkran && (
        <div className="absolute top-1 left-2 text-[8px] opacity-40">🌊🏖️🎉</div>
      )}

      {isMobile ? (
        /* Mobile: full form */
        <div className="relative flex flex-col items-center justify-center h-full px-3 py-3">
          <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${tmpl.gradient}/20 flex items-center justify-center mb-1`}>
            <UserPlus className={`w-2.5 h-2.5 ${tmpl.accentColor}`} />
          </div>
          <p className={`text-[7px] font-bold ${tmpl.accentColor} mb-0.5`}>สมัครสมาชิก</p>
          <p className="text-[4px] text-zinc-500 mb-1.5">สร้างบัญชีใหม่</p>
          {/* Form */}
          <div className="w-full max-w-[80px] space-y-1">
            <div className={`h-2.5 rounded-md bg-white/5 border ${tmpl.inputBorder} px-1 flex items-center gap-0.5`}>
              <User className="w-1.5 h-1.5 text-zinc-600" />
              <span className="text-[3.5px] text-zinc-600">ชื่อผู้ใช้</span>
            </div>
            <div className={`h-2.5 rounded-md bg-white/5 border ${tmpl.inputBorder} px-1 flex items-center gap-0.5`}>
              <Lock className="w-1.5 h-1.5 text-zinc-600" />
              <span className="text-[3.5px] text-zinc-600">รหัสผ่าน</span>
            </div>
            <div className={`h-2.5 rounded-md bg-white/5 border ${tmpl.inputBorder} px-1 flex items-center gap-0.5`}>
              <Lock className="w-1.5 h-1.5 text-zinc-600" />
              <span className="text-[3.5px] text-zinc-600">ยืนยันรหัสผ่าน</span>
            </div>
            <div className={`h-2.5 rounded-md bg-white/5 border ${tmpl.inputBorder} px-1 flex items-center gap-0.5`}>
              <span className="text-[3.5px] text-zinc-600">📱 เบอร์โทร</span>
            </div>
            <div className={`h-2.5 rounded-md bg-gradient-to-r ${tmpl.btnClass} flex items-center justify-center`}>
              <span className={`text-[3.5px] font-bold ${tmpl.btnTextClass}`}>สมัครสมาชิก</span>
            </div>
          </div>
          <p className="text-[3px] text-zinc-600 mt-1">มีบัญชีแล้ว? <span className={tmpl.accentColor}>เข้าสู่ระบบ</span></p>
        </div>
      ) : (
        /* Desktop: split layout */
        <div className="flex h-full">
          {/* Left panel - hero */}
          <div className={`w-[45%] flex flex-col items-center justify-center px-2 py-3 bg-gradient-to-br ${tmpl.bgClass}`}>
            <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${tmpl.gradient}/20 flex items-center justify-center mb-1`}>
              <Star className={`w-2.5 h-2.5 ${tmpl.accentColor}`} />
            </div>
            <p className={`text-[5px] font-bold ${tmpl.accentColor} mb-0.5 text-center`}>สมัครสมาชิก</p>
            <p className="text-[3.5px] text-zinc-500 text-center mb-1.5">เริ่มต้นใช้ VPN</p>
            {/* Stats */}
            <div className="flex gap-1 w-full px-1">
              {['1K+', '20+', '99%'].map((v, i) => (
                <div key={i} className="flex-1 text-center py-0.5 rounded bg-white/[0.03]">
                  <p className={`text-[4px] font-bold ${tmpl.accentColor}`}>{v}</p>
                  <p className="text-[2.5px] text-zinc-600">{['Users', 'Server', 'Up'][i]}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Right panel - form */}
          <div className="flex-1 flex flex-col items-center justify-center px-2">
            <p className="text-[5px] font-bold text-white mb-0.5">สร้างบัญชีใหม่</p>
            <p className="text-[3px] text-zinc-500 mb-1.5">กรอกข้อมูลเพื่อสมัคร</p>
            <div className="w-full max-w-[70px] space-y-0.5">
              {['ชื่อผู้ใช้', 'รหัสผ่าน', 'ยืนยันรหัส', 'เบอร์โทร'].map((label, i) => (
                <div key={i} className={`h-2 rounded bg-white/5 border ${tmpl.inputBorder} px-1 flex items-center`}>
                  <span className="text-[2.5px] text-zinc-600">{label}</span>
                </div>
              ))}
              <div className={`h-2 rounded bg-gradient-to-r ${tmpl.btnClass} flex items-center justify-center mt-0.5`}>
                <span className={`text-[3px] font-bold ${tmpl.btnTextClass}`}>สมัครสมาชิก</span>
              </div>
            </div>
            <p className="text-[2.5px] text-zinc-600 mt-1">มีบัญชีแล้ว? <span className={tmpl.accentColor}>เข้าสู่ระบบ</span></p>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Main Page =====

export default function AuthTemplatePage() {
  const [loginCurrent, setLoginCurrent] = useState<AuthTemplateId>('classic')
  const [registerCurrent, setRegisterCurrent] = useState<AuthTemplateId>('classic')
  const [loginSelected, setLoginSelected] = useState<AuthTemplateId>('classic')
  const [registerSelected, setRegisterSelected] = useState<AuthTemplateId>('classic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch current settings
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        const s = data.settings
        const lt = (s?.loginTemplate || 'classic') as AuthTemplateId
        const rt = (s?.registerTemplate || 'classic') as AuthTemplateId
        setLoginCurrent(lt)
        setRegisterCurrent(rt)
        setLoginSelected(lt)
        setRegisterSelected(rt)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Save
  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const getRes = await fetch('/api/admin/settings')
      const getData = await getRes.json()
      const currentSettings = getData.settings || {}

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentSettings,
          loginTemplate: loginSelected,
          registerTemplate: registerSelected,
        }),
      })
      if (res.ok) {
        setLoginCurrent(loginSelected)
        setRegisterCurrent(registerSelected)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = loginCurrent !== loginSelected || registerCurrent !== registerSelected

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20 rounded-xl flex items-center justify-center">
              <Palette className="w-4.5 h-4.5 text-violet-400" />
            </div>
            ธีมหน้าล็อกอิน / สมัคร
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 ml-[46px]">เลือกธีมสำหรับหน้าเข้าสู่ระบบ และหน้าสมัครสมาชิก แยกกันได้</p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
            saved
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : hasChanges
                ? 'bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 text-white shadow-lg shadow-violet-500/20'
                : 'bg-zinc-900 border border-white/5 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> บันทึกแล้ว!</>
          ) : (
            <><Save className="w-4 h-4" /> บันทึก</>
          )}
        </button>
      </div>

      {/* Currently Active Summary */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${templates.find(t => t.id === loginCurrent)?.gradient || 'from-cyan-500 to-blue-600'} flex items-center justify-center`}>
            <LogIn className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-500">หน้าล็อกอิน</p>
            <p className="text-sm font-bold text-white truncate">{templates.find(t => t.id === loginCurrent)?.name}</p>
          </div>
          {loginCurrent !== loginSelected && (
            <div className="ml-auto flex items-center gap-1 text-amber-400 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-medium">เปลี่ยน</span>
            </div>
          )}
        </div>

        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${templates.find(t => t.id === registerCurrent)?.gradient || 'from-cyan-500 to-blue-600'} flex items-center justify-center`}>
            <UserPlus className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-500">หน้าสมัครสมาชิก</p>
            <p className="text-sm font-bold text-white truncate">{templates.find(t => t.id === registerCurrent)?.name}</p>
          </div>
          {registerCurrent !== registerSelected && (
            <div className="ml-auto flex items-center gap-1 text-amber-400 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-medium">เปลี่ยน</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== Login Template Section ===== */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
            <LogIn className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">เลือกธีมหน้าล็อกอิน</h2>
            <p className="text-[11px] text-zinc-500">ธีมที่ผู้ใช้จะเห็นเมื่อเข้าสู่หน้าเข้าสู่ระบบ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tmpl) => {
            const isActive = loginSelected === tmpl.id
            const isCurrent = loginCurrent === tmpl.id

            return (
              <button
                key={tmpl.id}
                onClick={() => setLoginSelected(tmpl.id)}
                className={`relative text-left rounded-2xl border-2 transition-all overflow-hidden group ${
                  isActive
                    ? `${tmpl.border}/40 bg-white/[0.03] shadow-lg shadow-${tmpl.accent}-500/5`
                    : 'border-white/[0.06] hover:border-white/[0.15] bg-white/[0.01] hover:bg-white/[0.02]'
                }`}
              >
                {/* Active badge */}
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <div className={`w-6 h-6 bg-gradient-to-r ${tmpl.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}

                {/* Currently in use badge */}
                {isCurrent && (
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400">ACTIVE</span>
                  </div>
                )}

                {/* Preview area */}
                <div className="p-3 pb-0">
                  <div className="flex gap-2 justify-center">
                    <div className="flex-1 max-w-[180px]">
                      <DesktopFrame>
                        <LoginPreview tmpl={tmpl} isMobile={false} />
                      </DesktopFrame>
                    </div>
                    <div className="hidden sm:block">
                      <PhoneFrame>
                        <LoginPreview tmpl={tmpl} isMobile={true} />
                      </PhoneFrame>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 pt-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br ${tmpl.gradient}/10 border border-white/[0.08] flex items-center justify-center`}>
                      <tmpl.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-zinc-300'}`}>{tmpl.name}</h3>
                        <span className="text-[10px] text-zinc-600">{tmpl.subtitle}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{tmpl.desc}</p>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== Register Template Section ===== */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20 flex items-center justify-center">
            <UserPlus className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">เลือกธีมหน้าสมัครสมาชิก</h2>
            <p className="text-[11px] text-zinc-500">ธีมที่ผู้ใช้จะเห็นเมื่อเข้าสู่หน้าสมัครสมาชิก</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tmpl) => {
            const isActive = registerSelected === tmpl.id
            const isCurrent = registerCurrent === tmpl.id

            return (
              <button
                key={tmpl.id}
                onClick={() => setRegisterSelected(tmpl.id)}
                className={`relative text-left rounded-2xl border-2 transition-all overflow-hidden group ${
                  isActive
                    ? `${tmpl.border}/40 bg-white/[0.03] shadow-lg shadow-${tmpl.accent}-500/5`
                    : 'border-white/[0.06] hover:border-white/[0.15] bg-white/[0.01] hover:bg-white/[0.02]'
                }`}
              >
                {/* Active badge */}
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <div className={`w-6 h-6 bg-gradient-to-r ${tmpl.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}

                {/* Currently in use badge */}
                {isCurrent && (
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400">ACTIVE</span>
                  </div>
                )}

                {/* Preview area */}
                <div className="p-3 pb-0">
                  <div className="flex gap-2 justify-center">
                    <div className="flex-1 max-w-[180px]">
                      <DesktopFrame>
                        <RegisterPreview tmpl={tmpl} isMobile={false} />
                      </DesktopFrame>
                    </div>
                    <div className="hidden sm:block">
                      <PhoneFrame>
                        <RegisterPreview tmpl={tmpl} isMobile={true} />
                      </PhoneFrame>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 pt-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br ${tmpl.gradient}/10 border border-white/[0.08] flex items-center justify-center`}>
                      <tmpl.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-zinc-300'}`}>{tmpl.name}</h3>
                        <span className="text-[10px] text-zinc-600">{tmpl.subtitle}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{tmpl.desc}</p>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom save bar (sticky on mobile) */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50 p-4 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/20"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลง</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
