'use client'

import { useEffect, useState } from 'react'
import {
  Layout, Sparkles, Gamepad2, Briefcase, Crown, CheckCircle, Loader2,
  Monitor, Smartphone, Eye, Save, Shield, Zap, Globe,
  Star, Building2, Sword, Diamond, Lock, User,
  Droplets, Sun, LogIn, UserPlus, Palette, ShoppingCart,
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
  // VPN preview colors
  topBar: string
  specColor: string
  featureColor: string
}

const templates: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic',
    subtitle: '\u0e2a\u0e35\u0e1f\u0e49\u0e32-\u0e19\u0e49\u0e33\u0e40\u0e07\u0e34\u0e19 \u0e04\u0e25\u0e32\u0e2a\u0e2a\u0e34\u0e01',
    desc: '\u0e18\u0e35\u0e21\u0e21\u0e32\u0e15\u0e23\u0e10\u0e32\u0e19 - Gradient \u0e2a\u0e35\u0e1f\u0e49\u0e32\u0e04\u0e23\u0e32\u0e21\u0e1c\u0e2a\u0e21\u0e21\u0e48\u0e27\u0e07, Orb \u0e40\u0e23\u0e37\u0e2d\u0e07\u0e41\u0e2a\u0e07, \u0e1f\u0e35\u0e40\u0e08\u0e2d\u0e23\u0e4c 4 \u0e2d\u0e22\u0e48\u0e32\u0e07',
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
    topBar: 'from-cyan-500 via-violet-500 to-pink-500',
    specColor: 'text-cyan-400',
    featureColor: 'text-emerald-400',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    subtitle: '\u0e02\u0e32\u0e27-\u0e14\u0e33 \u0e40\u0e23\u0e35\u0e22\u0e1a\u0e07\u0e48\u0e32\u0e22',
    desc: '\u0e18\u0e35\u0e21\u0e02\u0e32\u0e27\u0e14\u0e33 Minimalist - \u0e1b\u0e38\u0e48\u0e21\u0e02\u0e32\u0e27 \u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e14\u0e33 \u0e2a\u0e30\u0e2d\u0e32\u0e14\u0e15\u0e32',
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
    topBar: 'from-zinc-500 via-zinc-400 to-zinc-500',
    specColor: 'text-zinc-300',
    featureColor: 'text-zinc-300',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    subtitle: '\u0e2a\u0e35\u0e40\u0e02\u0e35\u0e22\u0e27 Neon \u0e40\u0e01\u0e21\u0e40\u0e21\u0e2d\u0e23\u0e4c',
    desc: '\u0e18\u0e35\u0e21\u0e40\u0e01\u0e21\u0e40\u0e21\u0e2d\u0e23\u0e4c - Grid Pattern, Neon \u0e40\u0e02\u0e35\u0e22\u0e27, \u0e40\u0e2d\u0e1f\u0e40\u0e1f\u0e01\u0e15\u0e4c\u0e40\u0e23\u0e37\u0e2d\u0e07\u0e41\u0e2a\u0e07',
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
    topBar: 'from-green-500 via-emerald-400 to-green-500',
    specColor: 'text-green-400',
    featureColor: 'text-green-400',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    subtitle: '\u0e2a\u0e35\u0e19\u0e49\u0e33\u0e40\u0e07\u0e34\u0e19\u0e40\u0e02\u0e49\u0e21 \u0e17\u0e32\u0e07\u0e01\u0e32\u0e23',
    desc: '\u0e18\u0e35\u0e21\u0e2d\u0e07\u0e04\u0e4c\u0e01\u0e23 - Professional, Security Focus, \u0e2a\u0e35\u0e19\u0e49\u0e33\u0e40\u0e07\u0e34\u0e19-\u0e21\u0e48\u0e27\u0e07',
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
    topBar: 'from-blue-600 via-indigo-500 to-blue-600',
    specColor: 'text-blue-400',
    featureColor: 'text-blue-400',
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: '\u0e2a\u0e35\u0e17\u0e2d\u0e07-\u0e40\u0e2b\u0e25\u0e37\u0e2d\u0e07 \u0e2b\u0e23\u0e39\u0e2b\u0e23\u0e32',
    desc: '\u0e18\u0e35\u0e21\u0e1e\u0e23\u0e35\u0e40\u0e21\u0e35\u0e22\u0e21 - Gold Accent, VIP Access, \u0e14\u0e39\u0e2b\u0e23\u0e39\u0e2b\u0e23\u0e32\u0e23\u0e30\u0e14\u0e31\u0e1a\u0e2a\u0e39\u0e07',
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
    topBar: 'from-amber-500 via-yellow-400 to-amber-500',
    specColor: 'text-amber-400',
    featureColor: 'text-amber-400',
  },
  {
    id: 'songkran',
    name: 'Songkran',
    subtitle: '\u0e40\u0e17\u0e28\u0e01\u0e32\u0e25\u0e2a\u0e07\u0e01\u0e23\u0e32\u0e19\u0e15\u0e4c',
    desc: '\u0e18\u0e35\u0e21\u0e2a\u0e07\u0e01\u0e23\u0e32\u0e19\u0e15\u0e4c - \u0e19\u0e49\u0e33/\u0e17\u0e2d\u0e07, Emoji Drops Animation, \u0e40\u0e17\u0e28\u0e01\u0e32\u0e25\u0e44\u0e17\u0e22',
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
    topBar: 'from-sky-400 via-cyan-400 to-sky-400',
    specColor: 'text-sky-400',
    featureColor: 'text-sky-400',
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
      {isGaming && (
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }} />
      )}
      <div className={`absolute top-2 right-2 w-12 h-12 ${tmpl.orbColor} blur-xl rounded-full`} />
      {isSongkran && <div className="absolute top-1 right-2 text-[8px] opacity-40">💦🌸🐘</div>}

      {isMobile ? (
        <div className="relative flex flex-col items-center justify-center h-full px-3 py-4">
          <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${tmpl.gradient}/20 flex items-center justify-center mb-1.5`}>
            <Lock className={`w-2.5 h-2.5 ${tmpl.accentColor}`} />
          </div>
          <p className={`text-[7px] font-bold ${tmpl.accentColor} mb-0.5`}>เข้าสู่ระบบ</p>
          <p className="text-[4px] text-zinc-500 mb-2">ล็อกอินเพื่อใช้งาน VPN</p>
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
        <div className="flex h-full">
          <div className={`w-[45%] flex flex-col items-center justify-center px-2 py-3 bg-gradient-to-br ${tmpl.bgClass}`}>
            <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${tmpl.gradient}/20 flex items-center justify-center mb-1`}>
              <Shield className={`w-2.5 h-2.5 ${tmpl.accentColor}`} />
            </div>
            <p className={`text-[5px] font-bold ${tmpl.accentColor} mb-0.5 text-center`}>ยินดีต้อนรับ</p>
            <p className="text-[3.5px] text-zinc-500 text-center mb-1.5">เข้าสู่ระบบ VPN</p>
            <div className="space-y-0.5 w-full px-1">
              {[Shield, Zap, Globe].map((Icon, i) => (
                <div key={i} className="flex items-center gap-1 px-1 py-0.5 rounded bg-white/[0.03]">
                  <Icon className={`w-1.5 h-1.5 ${tmpl.accentColor}`} />
                  <div className="h-0.5 flex-1 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </div>
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
      {isGaming && (
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }} />
      )}
      <div className={`absolute top-2 left-2 w-12 h-12 ${tmpl.orbColor} blur-xl rounded-full`} />
      {isSongkran && <div className="absolute top-1 left-2 text-[8px] opacity-40">🌊🏖️🎉</div>}

      {isMobile ? (
        <div className="relative flex flex-col items-center justify-center h-full px-3 py-3">
          <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${tmpl.gradient}/20 flex items-center justify-center mb-1`}>
            <UserPlus className={`w-2.5 h-2.5 ${tmpl.accentColor}`} />
          </div>
          <p className={`text-[7px] font-bold ${tmpl.accentColor} mb-0.5`}>สมัครสมาชิก</p>
          <p className="text-[4px] text-zinc-500 mb-1.5">สร้างบัญชีใหม่</p>
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
        <div className="flex h-full">
          <div className={`w-[45%] flex flex-col items-center justify-center px-2 py-3 bg-gradient-to-br ${tmpl.bgClass}`}>
            <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${tmpl.gradient}/20 flex items-center justify-center mb-1`}>
              <Star className={`w-2.5 h-2.5 ${tmpl.accentColor}`} />
            </div>
            <p className={`text-[5px] font-bold ${tmpl.accentColor} mb-0.5 text-center`}>สมัครสมาชิก</p>
            <p className="text-[3.5px] text-zinc-500 text-center mb-1.5">เริ่มต้นใช้ VPN</p>
            <div className="flex gap-1 w-full px-1">
              {['1K+', '20+', '99%'].map((v, i) => (
                <div key={i} className="flex-1 text-center py-0.5 rounded bg-white/[0.03]">
                  <p className={`text-[4px] font-bold ${tmpl.accentColor}`}>{v}</p>
                  <p className="text-[2.5px] text-zinc-600">{['Users', 'Server', 'Up'][i]}</p>
                </div>
              ))}
            </div>
          </div>
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

// VPN Buy page mini preview — unique layout per theme
function VpnBuyPreview({ tmpl, isMobile = false }: { tmpl: TemplateInfo; isMobile?: boolean }) {
  // Shared mini purchase form (right side / bottom)
  const MiniForm = ({ compact = false }: { compact?: boolean }) => (
    <div className={`space-y-${compact ? '0.5' : '1'}`}>
      <div className="h-2 rounded bg-white/5 border border-white/[0.06] px-1 flex items-center">
        <span className="text-[3px] text-zinc-600">ชื่อ VPN</span>
      </div>
      <div className="flex gap-0.5">
        {['1', '7', '15', '30'].map(d => (
          <div key={d} className={`flex-1 h-2 rounded text-[3px] font-bold flex items-center justify-center ${d === '30' ? `bg-gradient-to-r ${tmpl.btnClass} ${tmpl.btnTextClass}` : 'bg-white/5 text-zinc-500'}`}>
            {compact ? d : `${d}วัน`}
          </div>
        ))}
      </div>
      {!compact && (
        <div className="h-2 rounded bg-white/5 border border-white/[0.06] px-1 flex items-center justify-between">
          <span className="text-[3px] text-zinc-500">ราคารวม</span>
          <span className={`text-[3.5px] font-bold ${tmpl.accentColor}`}>150 ฿</span>
        </div>
      )}
      <div className={`h-3 rounded bg-gradient-to-r ${tmpl.btnClass} flex items-center justify-center`}>
        <span className={`text-[4px] font-bold ${tmpl.btnTextClass}`}>ซื้อ VPN</span>
      </div>
    </div>
  )

  // ── CLASSIC: gradient top bar + orb glow + 2x2 specs ──
  if (tmpl.id === 'classic') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-black via-zinc-950 to-black text-white relative overflow-hidden">
        <div className="absolute top-2 right-2 w-10 h-10 bg-cyan-500/5 blur-xl rounded-full" />
        {isMobile ? (
          <div className="relative flex flex-col h-full px-2 py-2">
            <div className="rounded-md border border-zinc-800/60 bg-zinc-950 overflow-hidden mb-1.5">
              <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500" />
              <div className="p-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-[8px]">🇹🇭</div>
                  <div>
                    <p className="text-[5px] font-bold">Thailand #1</p>
                    <div className="flex items-center gap-0.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span className="text-[3px] text-emerald-400">Online</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-0.5">
                  {[Shield, Zap].map((Icon, i) => (
                    <div key={i} className="flex items-center gap-0.5 p-0.5 rounded bg-zinc-900/60 border border-zinc-800/40">
                      <Icon className={`w-1.5 h-1.5 ${['text-emerald-400', 'text-cyan-400'][i]}`} />
                      <div className="h-0.5 flex-1 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <MiniForm compact />
          </div>
        ) : (
          <div className="flex h-full">
            <div className="w-[40%] p-2">
              <div className="rounded-md border border-zinc-800/60 bg-zinc-950 overflow-hidden h-full">
                <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500" />
                <div className="p-1.5">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-[8px]">🇹🇭</div>
                    <div>
                      <p className="text-[5px] font-bold">Thailand</p>
                      <div className="flex items-center gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                        <span className="text-[3px] text-emerald-400">Online</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[6px] font-bold text-cyan-400 mb-1">5 ฿/วัน</p>
                  <div className="grid grid-cols-2 gap-0.5">
                    {[Shield, Zap, Globe, Star].map((Icon, i) => (
                      <div key={i} className="flex items-center gap-0.5 p-0.5 rounded bg-zinc-900/60 border border-zinc-800/40">
                        <Icon className={`w-1.5 h-1.5 ${['text-emerald-400', 'text-cyan-400', 'text-violet-400', 'text-amber-400'][i]}`} />
                        <div className="h-0.5 flex-1 rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {[Lock, Shield, Zap].map((Icon, i) => (
                      <div key={i} className="flex items-center gap-0.5">
                        <Icon className={`w-1.5 h-1.5 ${['text-emerald-400', 'text-cyan-400', 'text-violet-400'][i]}`} />
                        <div className="h-0.5 flex-1 rounded bg-white/5" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-center">
              <MiniForm />
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── MINIMAL: ultra clean, no glow, text rows ──
  if (tmpl.id === 'minimal') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-white relative overflow-hidden">
        {isMobile ? (
          <div className="relative flex flex-col h-full px-2 py-2">
            <div className="rounded border border-zinc-800/30 bg-zinc-950/80 overflow-hidden mb-1.5">
              <div className="h-px bg-zinc-700/50" />
              <div className="p-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[8px]">🇹🇭</span>
                  <p className="text-[5px] font-medium text-zinc-200">Thailand #1</p>
                  <div className="w-1 h-1 rounded-full bg-emerald-400 ml-auto" />
                </div>
                <p className="text-[7px] font-light text-white mb-1">5 <span className="text-[4px] text-zinc-600">฿/วัน</span></p>
                <div className="space-y-0.5">
                  {['Protocol', 'Speed'].map((l, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[3px] text-zinc-600">{l}</span>
                      <span className="text-[3px] text-zinc-400">VLESS</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <MiniForm compact />
          </div>
        ) : (
          <div className="flex h-full">
            <div className="w-[40%] p-2">
              <div className="rounded border border-zinc-800/30 bg-zinc-950/80 overflow-hidden h-full">
                <div className="h-px bg-zinc-700/50" />
                <div className="p-1.5">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[8px]">🇹🇭</span>
                    <p className="text-[5px] font-medium text-zinc-200">Thailand</p>
                    <div className="w-1 h-1 rounded-full bg-emerald-400 ml-auto" />
                  </div>
                  <p className="text-[8px] font-light text-white mb-1">5 <span className="text-[4px] text-zinc-600">฿/วัน</span></p>
                  <div className="mb-1.5 h-px bg-zinc-800/30" />
                  <div className="space-y-0.5">
                    {['Protocol', 'Speed', 'Ping', 'Uptime'].map((l, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[3px] text-zinc-600">{l}</span>
                        <span className="text-[3px] text-zinc-400">{['VLESS', '10G', '<10ms', '99.9%'][i]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {['Encryption', 'No-Log', 'Bandwidth'].map((l, i) => (
                      <div key={i} className="flex items-center gap-0.5">
                        <div className="w-0.5 h-0.5 rounded-full bg-zinc-600" />
                        <span className="text-[2.5px] text-zinc-600">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-center">
              <MiniForm />
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── GAMING: HUD style, neon borders, stat bars ──
  if (tmpl.id === 'gaming') {
    return (
      <div className="w-full h-full bg-[#0a0f0a] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }} />
        {isMobile ? (
          <div className="relative flex flex-col h-full px-2 py-2">
            <div className="rounded-md border border-green-500/20 bg-[#0a0f0a] overflow-hidden mb-1.5">
              <div className="h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-lime-500 relative">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.3)_1px,rgba(0,0,0,0.3)_2px)]" />
              </div>
              <div className="p-1.5">
                <div className="flex items-center gap-0.5 mb-1">
                  <div className="w-0.5 h-0.5 rounded-full bg-green-500" />
                  <span className="text-[3px] text-green-500/50 font-mono uppercase tracking-wider">Server Intel</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded bg-green-500/5 border border-green-500/20 flex items-center justify-center text-[8px]">🇹🇭</div>
                  <div>
                    <p className="text-[5px] font-black text-green-400 font-mono">Thailand #1</p>
                    <span className="text-[3px] text-green-400 font-mono">ONLINE</span>
                  </div>
                </div>
                {/* Stat bars */}
                {['Speed', 'Ping'].map((l, i) => (
                  <div key={i} className="mb-0.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[2.5px] text-green-500/50 font-mono">{l}</span>
                      <span className="text-[2.5px] text-green-300 font-mono">{['10G', '<10ms'][i]}</span>
                    </div>
                    <div className="h-0.5 rounded-full bg-green-950/50 overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${[95, 98][i]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <MiniForm compact />
          </div>
        ) : (
          <div className="flex h-full">
            <div className="w-[40%] p-2">
              <div className="rounded-md border border-green-500/20 bg-[#0a0f0a] overflow-hidden h-full">
                <div className="h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-lime-500 relative">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.3)_1px,rgba(0,0,0,0.3)_2px)]" />
                </div>
                <div className="p-1.5">
                  <div className="flex items-center gap-0.5 mb-1">
                    <div className="w-0.5 h-0.5 rounded-full bg-green-500" />
                    <span className="text-[3px] text-green-500/50 font-mono uppercase tracking-wider">Server Intel</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-5 h-5 rounded bg-green-500/5 border border-green-500/20 flex items-center justify-center text-[8px]">🇹🇭</div>
                    <div>
                      <p className="text-[5px] font-black text-green-400 font-mono">Thailand</p>
                      <span className="text-[3px] text-green-400 font-mono">ONLINE</span>
                    </div>
                  </div>
                  <div className="p-0.5 rounded bg-green-500/5 border border-green-500/10 mb-1 flex items-center justify-between">
                    <span className="text-[3px] text-green-500/50 font-mono">Cost</span>
                    <span className="text-[5px] font-black text-green-400 font-mono">5฿</span>
                  </div>
                  {/* Stat bars */}
                  {['Protocol', 'Speed', 'Ping', 'Uptime'].map((l, i) => (
                    <div key={i} className="mb-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[2.5px] text-green-500/50 font-mono">{l}</span>
                        <span className="text-[2.5px] text-green-300 font-mono">{['VLESS', '10G', '<10ms', '99.9%'][i]}</span>
                      </div>
                      <div className="h-0.5 rounded-full bg-green-950/50 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500" style={{ width: `${[90, 95, 98, 99][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-center">
              <MiniForm />
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── CORPORATE: blue header banner, table layout specs ──
  if (tmpl.id === 'corporate') {
    return (
      <div className="w-full h-full bg-slate-950 text-white relative overflow-hidden">
        {isMobile ? (
          <div className="relative flex flex-col h-full px-2 py-2">
            <div className="rounded-md border border-blue-500/15 overflow-hidden mb-1.5">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 px-1.5 py-1 flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center text-[7px]">🇹🇭</div>
                <div className="flex-1">
                  <p className="text-[4px] font-bold text-white">Thailand #1</p>
                  <span className="text-[3px] text-blue-100/70">Active</span>
                </div>
                <span className="text-[5px] font-bold text-white">5฿</span>
              </div>
              <div className="p-1">
                {['Protocol', 'Speed'].map((l, i) => (
                  <div key={i} className={`flex items-center justify-between px-1 py-0.5 ${i === 0 ? 'border-b border-blue-500/5' : ''}`}>
                    <span className="text-[3px] text-zinc-500">{l}</span>
                    <span className="text-[3px] text-zinc-300">{['VLESS', '10G'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <MiniForm compact />
          </div>
        ) : (
          <div className="flex h-full">
            <div className="w-[40%] p-2">
              <div className="rounded-md border border-blue-500/15 overflow-hidden h-full">
                <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 px-1.5 py-1 flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center text-[7px]">🇹🇭</div>
                  <div className="flex-1">
                    <p className="text-[4px] font-bold text-white">Thailand</p>
                    <span className="text-[3px] text-blue-100/70">Active</span>
                  </div>
                  <span className="text-[5px] font-bold text-white">5฿</span>
                </div>
                <div className="p-1">
                  <div className="bg-blue-500/5 px-1 py-0.5 border-b border-blue-500/10 mb-0.5">
                    <span className="text-[3px] text-blue-400 font-semibold uppercase">Specifications</span>
                  </div>
                  {['Protocol', 'Speed', 'Ping', 'Uptime'].map((l, i) => (
                    <div key={i} className={`flex items-center gap-0.5 px-1 py-0.5 ${i < 3 ? 'border-b border-blue-500/5' : ''}`}>
                      <Shield className="w-1.5 h-1.5 text-blue-400" />
                      <span className="text-[3px] text-zinc-500 flex-1">{l}</span>
                      <span className="text-[3px] text-zinc-300">{['VLESS', '10G', '<10ms', '99.9%'][i]}</span>
                    </div>
                  ))}
                  {/* Capacity bar */}
                  <div className="mt-1 px-1">
                    <div className="h-0.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 w-[40%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-center">
              <MiniForm />
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── PREMIUM: gold shimmer, crown, pill specs ──
  if (tmpl.id === 'premium') {
    return (
      <div className="w-full h-full bg-[#0f0d08] text-white relative overflow-hidden">
        <div className="absolute top-2 right-2 w-10 h-10 bg-amber-500/8 blur-xl rounded-full" />
        {isMobile ? (
          <div className="relative flex flex-col h-full px-2 py-2">
            <div className="rounded-md border border-amber-500/15 bg-[#0f0d08] overflow-hidden mb-1.5">
              <div className="h-0.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
              <div className="p-1.5">
                <div className="flex items-center gap-0.5 mb-1">
                  <Crown className="w-1.5 h-1.5 text-amber-400" />
                  <span className="text-[3px] text-amber-400/60 font-bold uppercase">Premium</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-[8px]">🇹🇭</div>
                  <div>
                    <p className="text-[5px] font-bold">Thailand #1</p>
                    <span className="text-[3px] text-amber-400">Online</span>
                  </div>
                </div>
                <div className="p-1 rounded bg-amber-500/8 border border-amber-500/10 flex items-center justify-between">
                  <span className="text-[3px] text-amber-400/40">Price</span>
                  <span className="text-[5px] font-black text-amber-400">5฿</span>
                </div>
              </div>
            </div>
            <MiniForm compact />
          </div>
        ) : (
          <div className="flex h-full">
            <div className="w-[40%] p-2">
              <div className="rounded-md border border-amber-500/15 bg-[#0f0d08] overflow-hidden h-full">
                <div className="h-0.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
                <div className="p-1.5">
                  <div className="flex items-center gap-0.5 mb-1">
                    <Crown className="w-1.5 h-1.5 text-amber-400" />
                    <span className="text-[3px] text-amber-400/60 font-bold uppercase tracking-wider">Premium Server</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-[8px]">🇹🇭</div>
                    <div>
                      <p className="text-[5px] font-bold">Thailand</p>
                      <span className="text-[3px] text-amber-400">Online</span>
                    </div>
                  </div>
                  <div className="p-1 rounded bg-amber-500/8 border border-amber-500/10 mb-1 flex items-center justify-between">
                    <span className="text-[3px] text-amber-400/40">Price</span>
                    <span className="text-[6px] font-black text-amber-400">5 ฿</span>
                  </div>
                  {/* Pill specs */}
                  <div className="flex flex-wrap gap-0.5">
                    {['VLESS', '10G', '<10ms', '99.9%'].map((v, i) => (
                      <div key={i} className="px-1 py-0.5 rounded-full bg-amber-500/8 border border-amber-500/10">
                        <span className="text-[2.5px] text-amber-200">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {[Crown, Shield, Zap].map((Icon, i) => (
                      <div key={i} className="flex items-center gap-0.5">
                        <Icon className="w-1.5 h-1.5 text-amber-400" />
                        <div className="h-0.5 flex-1 rounded bg-amber-500/5" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-center">
              <MiniForm />
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── SONGKRAN: water wave top, bubble specs, emoji ──
  return (
    <div className="w-full h-full bg-[#060e1f] text-white relative overflow-hidden">
      {isMobile ? (
        <div className="relative flex flex-col h-full px-2 py-2">
          <div className="rounded-md border border-sky-500/20 bg-[#060e1f] overflow-hidden mb-1.5">
            <div className="h-2 bg-gradient-to-b from-sky-500/20 to-transparent relative">
              <div className="absolute top-0 left-1 text-[4px] opacity-50">💧</div>
              <div className="absolute top-0 right-1.5 text-[3px] opacity-40">🌸</div>
            </div>
            <div className="p-1.5 -mt-0.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded bg-sky-500/10 border border-sky-500/15 flex items-center justify-center text-[8px]">🇹🇭</div>
                <div>
                  <p className="text-[5px] font-bold">Thailand #1</p>
                  <span className="text-[3px] text-sky-400">Online</span>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[Shield, Zap].map((Icon, i) => (
                  <div key={i} className="flex-1 flex items-center gap-0.5 p-0.5 rounded-full bg-sky-500/8 border border-sky-500/10">
                    <div className="w-2 h-2 rounded-full bg-sky-500/10 flex items-center justify-center">
                      <Icon className="w-1 h-1 text-sky-400" />
                    </div>
                    <div className="h-0.5 flex-1 rounded bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <MiniForm compact />
        </div>
      ) : (
        <div className="flex h-full">
          <div className="w-[40%] p-2">
            <div className="rounded-md border border-sky-500/20 bg-[#060e1f] overflow-hidden h-full">
              <div className="h-3 bg-gradient-to-b from-sky-500/20 to-transparent relative">
                <div className="absolute top-0.5 left-1 text-[4px] opacity-50">💧</div>
                <div className="absolute top-0 right-1.5 text-[3px] opacity-40">🌸</div>
                <div className="absolute top-0.5 left-1/2 text-[3px] opacity-30">☀️</div>
              </div>
              <div className="p-1.5 -mt-1">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-5 h-5 rounded bg-sky-500/10 border border-sky-500/15 flex items-center justify-center text-[8px] relative">
                    🇹🇭
                    <div className="absolute -bottom-0.5 -right-0.5 text-[4px]">💧</div>
                  </div>
                  <div>
                    <p className="text-[5px] font-bold">Thailand</p>
                    <span className="text-[3px] text-sky-400">Online</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 p-1 rounded bg-sky-500/8 border border-sky-500/10 mb-1">
                  <Droplets className="w-2 h-2 text-sky-400" />
                  <div>
                    <span className="text-[3px] text-sky-400/50 block">ราคา</span>
                    <span className="text-[5px] font-bold text-white">5 ฿</span>
                  </div>
                </div>
                {/* Bubble specs */}
                <div className="grid grid-cols-2 gap-0.5">
                  {[Shield, Zap, Globe, Star].map((Icon, i) => (
                    <div key={i} className="flex items-center gap-0.5 p-0.5 rounded-lg bg-sky-500/8 border border-sky-500/10">
                      <div className="w-2 h-2 rounded-full bg-sky-500/10 flex items-center justify-center">
                        <Icon className="w-1 h-1 text-sky-400" />
                      </div>
                      <div className="h-0.5 flex-1 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
                <div className="mt-1 space-y-0.5">
                  {['💦', '🛡️', '⚡'].map((e, i) => (
                    <div key={i} className="flex items-center gap-0.5">
                      <div className="w-2 h-2 rounded-full bg-sky-500/10 flex items-center justify-center">
                        <span className="text-[3px]">{e}</span>
                      </div>
                      <div className="h-0.5 flex-1 rounded bg-white/5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-2 flex flex-col justify-center">
            <MiniForm />
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable template grid section
function TemplateGridSection({
  sectionTitle,
  sectionDesc,
  sectionIcon: SectionIcon,
  iconGradient,
  iconBorder,
  iconColor,
  selected,
  current,
  onSelect,
  renderPreview,
}: {
  sectionTitle: string
  sectionDesc: string
  sectionIcon: React.ElementType
  iconGradient: string
  iconBorder: string
  iconColor: string
  selected: AuthTemplateId
  current: AuthTemplateId
  onSelect: (id: AuthTemplateId) => void
  renderPreview: (tmpl: TemplateInfo, isMobile: boolean) => React.ReactNode
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${iconGradient} border ${iconBorder} flex items-center justify-center`}>
          <SectionIcon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">{sectionTitle}</h2>
          <p className="text-[11px] text-zinc-500">{sectionDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tmpl) => {
          const isActive = selected === tmpl.id
          const isCurrent = current === tmpl.id

          return (
            <button
              key={tmpl.id}
              onClick={() => onSelect(tmpl.id)}
              className={`relative text-left rounded-2xl border-2 transition-all overflow-hidden group ${
                isActive
                  ? `${tmpl.border}/40 bg-white/[0.03] shadow-lg shadow-${tmpl.accent}-500/5`
                  : 'border-white/[0.06] hover:border-white/[0.15] bg-white/[0.01] hover:bg-white/[0.02]'
              }`}
            >
              {isActive && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <div className={`w-6 h-6 bg-gradient-to-r ${tmpl.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              )}

              {isCurrent && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400">ACTIVE</span>
                </div>
              )}

              <div className="p-3 pb-0">
                <div className="flex gap-2 justify-center">
                  <div className="flex-1 max-w-[180px]">
                    <DesktopFrame>
                      {renderPreview(tmpl, false)}
                    </DesktopFrame>
                  </div>
                  <div className="hidden sm:block">
                    <PhoneFrame>
                      {renderPreview(tmpl, true)}
                    </PhoneFrame>
                  </div>
                </div>
              </div>

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
  )
}

// ===== Main Page =====

export default function AuthTemplatePage() {
  const [loginCurrent, setLoginCurrent] = useState<AuthTemplateId>('classic')
  const [registerCurrent, setRegisterCurrent] = useState<AuthTemplateId>('classic')
  const [vpnCurrent, setVpnCurrent] = useState<AuthTemplateId>('classic')
  const [loginSelected, setLoginSelected] = useState<AuthTemplateId>('classic')
  const [registerSelected, setRegisterSelected] = useState<AuthTemplateId>('classic')
  const [vpnSelected, setVpnSelected] = useState<AuthTemplateId>('classic')
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
        const vt = (s?.vpnTemplate || 'classic') as AuthTemplateId
        setLoginCurrent(lt); setRegisterCurrent(rt); setVpnCurrent(vt)
        setLoginSelected(lt); setRegisterSelected(rt); setVpnSelected(vt)
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
          vpnTemplate: vpnSelected,
        }),
      })
      if (res.ok) {
        setLoginCurrent(loginSelected)
        setRegisterCurrent(registerSelected)
        setVpnCurrent(vpnSelected)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = loginCurrent !== loginSelected || registerCurrent !== registerSelected || vpnCurrent !== vpnSelected

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
            ธีมหน้าล็อกอิน / สมัคร / ซื้อ VPN
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 ml-[46px]">เลือกธีมสำหรับหน้าเข้าสู่ระบบ, หน้าสมัครสมาชิก, และหน้าซื้อ VPN แยกกันได้</p>
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
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
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

        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${templates.find(t => t.id === vpnCurrent)?.gradient || 'from-cyan-500 to-blue-600'} flex items-center justify-center`}>
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-500">หน้าซื้อ VPN</p>
            <p className="text-sm font-bold text-white truncate">{templates.find(t => t.id === vpnCurrent)?.name}</p>
          </div>
          {vpnCurrent !== vpnSelected && (
            <div className="ml-auto flex items-center gap-1 text-amber-400 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-medium">เปลี่ยน</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== Login Template Section ===== */}
      <TemplateGridSection
        sectionTitle="เลือกธีมหน้าล็อกอิน"
        sectionDesc="ธีมที่ผู้ใช้จะเห็นเมื่อเข้าสู่หน้าเข้าสู่ระบบ"
        sectionIcon={LogIn}
        iconGradient="from-cyan-500/20 to-blue-500/20"
        iconBorder="border-cyan-500/20"
        iconColor="text-cyan-400"
        selected={loginSelected}
        current={loginCurrent}
        onSelect={setLoginSelected}
        renderPreview={(tmpl, isMobile) => <LoginPreview tmpl={tmpl} isMobile={isMobile} />}
      />

      {/* ===== Register Template Section ===== */}
      <TemplateGridSection
        sectionTitle="เลือกธีมหน้าสมัครสมาชิก"
        sectionDesc="ธีมที่ผู้ใช้จะเห็นเมื่อเข้าสู่หน้าสมัครสมาชิก"
        sectionIcon={UserPlus}
        iconGradient="from-pink-500/20 to-rose-500/20"
        iconBorder="border-pink-500/20"
        iconColor="text-pink-400"
        selected={registerSelected}
        current={registerCurrent}
        onSelect={setRegisterSelected}
        renderPreview={(tmpl, isMobile) => <RegisterPreview tmpl={tmpl} isMobile={isMobile} />}
      />

      {/* ===== VPN Buy Template Section ===== */}
      <TemplateGridSection
        sectionTitle="เลือกธีมหน้าซื้อ VPN"
        sectionDesc="ธีมที่ผู้ใช้จะเห็นเมื่อเข้าสู่หน้าซื้อ VPN (เลือกเซิร์ฟเวอร์แล้วกดซื้อ)"
        sectionIcon={ShoppingCart}
        iconGradient="from-emerald-500/20 to-teal-500/20"
        iconBorder="border-emerald-500/20"
        iconColor="text-emerald-400"
        selected={vpnSelected}
        current={vpnCurrent}
        onSelect={setVpnSelected}
        renderPreview={(tmpl, isMobile) => <VpnBuyPreview tmpl={tmpl} isMobile={isMobile} />}
      />

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
