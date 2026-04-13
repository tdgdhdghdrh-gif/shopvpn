'use client'

import { useEffect, useState } from 'react'
import {
  Layout, Sparkles, Gamepad2, Briefcase, Crown, CheckCircle, Loader2,
  Monitor, Smartphone, Eye, Save, ArrowRight, Shield, Zap, Globe,
  Star, Trophy, Building2, Sword, ChevronRight, Diamond, Gem, Code,
  Droplets, Sun, Waves,
} from 'lucide-react'

type TemplateId = 'classic' | 'minimal' | 'gaming' | 'corporate' | 'premium' | 'songkran' | 'customHtml'

interface TemplateInfo {
  id: TemplateId
  name: string
  subtitle: string
  desc: string
  features: string[]
  icon: React.ElementType
  gradient: string
  border: string
  bg: string
  accent: string
  heroTitle: string
  heroSub: string
}

const templates: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic',
    subtitle: 'ครบทุก section',
    desc: 'แบบเต็ม - Hero, Features, Stats, Pricing, Server Locations, How It Works, FAQ, Testimonials, CTA',
    features: ['Hero Section', 'Features', 'Stats Counter', 'Pricing Plans', 'Server Locations', 'How It Works', 'Testimonials', 'FAQ', 'CTA'],
    icon: Layout,
    gradient: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500',
    bg: 'bg-blue-500',
    accent: 'blue',
    heroTitle: 'VPN ที่เร็วที่สุด',
    heroSub: 'เชื่อมต่อปลอดภัยทุกที่',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    subtitle: 'เรียบง่าย สะอาดตา',
    desc: 'ดีไซน์เรียบง่าย - Hero ขนาดใหญ่, Features 3 อย่าง, Pricing, CTA',
    features: ['Hero Clean', 'Features x3', 'Pricing Plans', 'CTA Button'],
    icon: Sparkles,
    gradient: 'from-zinc-400 to-zinc-600',
    border: 'border-zinc-400',
    bg: 'bg-zinc-500',
    accent: 'zinc',
    heroTitle: 'Simple. Fast. Secure.',
    heroSub: 'VPN ที่ใช้ง่ายที่สุด',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    subtitle: 'สายเกม Neon',
    desc: 'สไตล์เกมเมอร์ - Neon สีเขียว, Ping ต่ำ, เกมที่รองรับ, Stats, FAQ',
    features: ['Neon Hero', 'Ping Stats', 'Game Support', 'Speed Test', 'Pricing', 'FAQ'],
    icon: Gamepad2,
    gradient: 'from-emerald-400 to-cyan-400',
    border: 'border-emerald-500',
    bg: 'bg-emerald-500',
    accent: 'emerald',
    heroTitle: 'GAME WITHOUT LAG',
    heroSub: 'Ping < 5ms ลื่นทุกเกม',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    subtitle: 'ทางการ องค์กร',
    desc: 'สไตล์ Professional - Security Focus, Trust Badges, How It Works, Testimonials',
    features: ['Professional Hero', 'Security Features', 'Trust Badges', 'How It Works', 'Testimonials', 'FAQ'],
    icon: Briefcase,
    gradient: 'from-indigo-400 to-violet-500',
    border: 'border-indigo-500',
    bg: 'bg-indigo-500',
    accent: 'indigo',
    heroTitle: 'Enterprise Security',
    heroSub: 'ปกป้องข้อมูลองค์กรของคุณ',
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'หรูหรา Gold/Amber',
    desc: 'ธีมพรีเมียม - Gold Accent, Rotating Headlines, Comparison Table, Animated Effects',
    features: ['Gold Hero', 'Rotating Headlines', '6 Features', 'Comparison Table', 'How It Works', 'Carriers', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    icon: Crown,
    gradient: 'from-amber-400 to-yellow-500',
    border: 'border-amber-500',
    bg: 'bg-amber-500',
    accent: 'amber',
    heroTitle: 'VPN ระดับพรีเมียม',
    heroSub: 'ความเร็วสูงสุด ปลอดภัยระดับทหาร',
  },
  {
    id: 'songkran',
    name: 'Songkran',
    subtitle: 'เทศกาลสงกรานต์',
    desc: 'ธีมสงกรานต์ไทย - Water Splash, ลายน้ำ/ทอง/ชมพู, Floating Drops & Petals, Animated Effects',
    features: ['Water Hero', 'Floating Drops', 'Flower Petals', '6 Features', 'Comparison Table', 'How It Works', 'Carriers', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    icon: Droplets,
    gradient: 'from-sky-400 to-cyan-500',
    border: 'border-sky-500',
    bg: 'bg-sky-500',
    accent: 'sky',
    heroTitle: 'สาดความเร็ว VPN',
    heroSub: 'เร็วแรงดั่งสายน้ำสงกรานต์',
  },
  {
    id: 'customHtml',
    name: 'Custom HTML',
    subtitle: 'เขียนเอง 100%',
    desc: 'เขียน HTML/CSS/JS เอง ออกแบบหน้า Landing Page ได้อิสระ 100% ไม่จำกัดรูปแบบ',
    features: ['Full HTML', 'Custom CSS', 'JavaScript', 'ออกแบบเอง', 'ไม่จำกัด'],
    icon: Code,
    gradient: 'from-rose-500 to-orange-500',
    border: 'border-rose-500',
    bg: 'bg-rose-500',
    accent: 'rose',
    heroTitle: 'Your Custom Design',
    heroSub: 'เขียน HTML/CSS/JS ได้อิสระ',
  },
]

// ===== Mini Preview Components =====

function PhoneFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1"><Smartphone className="w-3 h-3" /> {label}</span>}
      <div className="relative w-[160px] h-[290px] bg-black rounded-[20px] border-2 border-zinc-700 overflow-hidden shadow-2xl shadow-black/50">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-b-xl z-20" />
        {/* Screen */}
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

function DesktopFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1"><Monitor className="w-3 h-3" /> {label}</span>}
      <div className="relative w-full max-w-[340px] bg-black rounded-lg border border-zinc-700 overflow-hidden shadow-2xl shadow-black/50">
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
          <div className="flex-1 mx-4">
            <div className="bg-zinc-800 rounded px-2 py-0.5 text-[7px] text-zinc-500 text-center truncate">yoursite.com</div>
          </div>
        </div>
        {/* Screen */}
        <div className="aspect-[16/10] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

// Mini mockup screens for each template
function ClassicPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-white">
      {/* Navbar */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/5">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500/30" />
          <span className="text-[6px] font-bold">VPN</span>
        </div>
        {!isMobile && (
          <div className="flex gap-2">
            <div className="w-8 h-2 rounded bg-white/10" />
            <div className="w-8 h-2 rounded bg-white/10" />
            <div className="w-10 h-3 rounded bg-blue-500 text-[5px] text-center leading-[12px]">Login</div>
          </div>
        )}
      </div>
      {/* Hero */}
      <div className={`flex flex-col items-center justify-center ${isMobile ? 'px-3 py-6' : 'px-6 py-8'} text-center`}>
        <div className={`${isMobile ? 'w-6 h-6 mb-2' : 'w-8 h-8 mb-3'} rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center`}>
          <Shield className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-blue-400`} />
        </div>
        <p className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} font-bold mb-1`}>VPN ที่เร็วที่สุด</p>
        <p className={`${isMobile ? 'text-[5px]' : 'text-[6px]'} text-zinc-400 mb-2`}>เชื่อมต่อปลอดภัย ทุกที่ ทุกเวลา</p>
        <div className={`${isMobile ? 'w-14 h-3' : 'w-16 h-3.5'} rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-[5px] text-center leading-[12px] font-bold`}>เริ่มต้นใช้งาน</div>
      </div>
      {/* Features */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-1 px-2' : 'grid-cols-3 gap-1.5 px-3'} mb-3`}>
        {[
          { icon: Zap, label: 'เร็ว', color: 'text-yellow-400 bg-yellow-500/10' },
          { icon: Shield, label: 'ปลอดภัย', color: 'text-blue-400 bg-blue-500/10' },
          { icon: Globe, label: 'ทั่วโลก', color: 'text-emerald-400 bg-emerald-500/10' },
        ].map((f, i) => (
          <div key={i} className={`flex ${isMobile ? 'flex-row gap-1.5 py-1' : 'flex-col items-center py-2'} px-2 rounded-lg bg-white/[0.03] border border-white/5`}>
            <div className={`w-4 h-4 ${f.color} rounded flex items-center justify-center shrink-0`}>
              <f.icon className="w-2 h-2" />
            </div>
            <span className="text-[5px] text-zinc-300">{f.label}</span>
          </div>
        ))}
      </div>
      {/* Stats */}
      <div className={`grid grid-cols-3 gap-1 px-3 ${isMobile ? 'mb-2' : 'mb-3'}`}>
        {['99.9%', '50K+', '<5ms'].map((s, i) => (
          <div key={i} className="text-center py-1.5 rounded bg-white/[0.02] border border-white/5">
            <p className="text-[7px] font-bold text-white">{s}</p>
            <p className="text-[4px] text-zinc-500">{['Uptime', 'Users', 'Ping'][i]}</p>
          </div>
        ))}
      </div>
      {/* Pricing hint */}
      <div className="px-3">
        <div className="h-1.5 w-12 rounded bg-white/10 mx-auto mb-1.5" />
        <div className="grid grid-cols-3 gap-1">
          {[50, 100, 200].map((p, i) => (
            <div key={i} className="text-center py-1.5 rounded bg-white/[0.03] border border-white/5">
              <p className="text-[6px] font-bold">{p}฿</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MinimalPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-black text-white">
      {/* Navbar */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/5">
        <span className="text-[6px] font-bold text-zinc-300">VPN</span>
        {!isMobile && <div className="w-10 h-3 rounded bg-white text-black text-[5px] text-center leading-[12px] font-bold">Start</div>}
      </div>
      {/* Hero - large clean */}
      <div className={`flex flex-col items-center justify-center text-center ${isMobile ? 'px-3 py-10' : 'px-6 py-12'}`}>
        <p className={`${isMobile ? 'text-[10px]' : 'text-[13px]'} font-black mb-1 tracking-tight`}>Simple. Fast.</p>
        <p className={`${isMobile ? 'text-[10px]' : 'text-[13px]'} font-black mb-2 tracking-tight`}>Secure.</p>
        <p className={`${isMobile ? 'text-[5px]' : 'text-[6px]'} text-zinc-500 mb-3 max-w-[80%]`}>VPN ที่ใช้ง่ายที่สุด ไม่ต้องตั้งค่าอะไร</p>
        <div className="flex gap-1.5">
          <div className={`${isMobile ? 'w-14 h-3' : 'w-16 h-4'} rounded-full bg-white text-black text-[5px] text-center leading-[12px] font-bold flex items-center justify-center`}>เริ่มเลย</div>
          <div className={`${isMobile ? 'w-14 h-3' : 'w-16 h-4'} rounded-full border border-zinc-700 text-[5px] text-center leading-[12px] text-zinc-400 flex items-center justify-center`}>ดูราคา</div>
        </div>
      </div>
      {/* 3 Features */}
      <div className={`grid grid-cols-3 gap-1.5 ${isMobile ? 'px-2' : 'px-4'}`}>
        {[
          { icon: Zap, label: 'Fast' },
          { icon: Shield, label: 'Safe' },
          { icon: Globe, label: 'Global' },
        ].map((f, i) => (
          <div key={i} className="flex flex-col items-center py-2 px-1 rounded-lg border border-white/5 bg-white/[0.02]">
            <f.icon className="w-3 h-3 text-zinc-400 mb-1" />
            <span className="text-[5px] text-zinc-500">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function GamingPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-black text-white relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)',
        backgroundSize: '12px 12px',
      }} />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-emerald-500/10 blur-2xl rounded-full" />
      {/* Navbar */}
      <div className="relative flex items-center justify-between px-2 py-1.5 border-b border-emerald-500/10">
        <div className="flex items-center gap-1">
          <Gamepad2 className="w-3 h-3 text-emerald-400" />
          <span className="text-[6px] font-bold text-emerald-400">VPN</span>
        </div>
        {!isMobile && <div className="w-12 h-3 rounded bg-emerald-500 text-[5px] text-center leading-[12px] font-bold">PLAY NOW</div>}
      </div>
      {/* Hero */}
      <div className={`relative flex flex-col items-center justify-center text-center ${isMobile ? 'px-3 py-6' : 'px-4 py-8'}`}>
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
          <Sword className="w-4 h-4 text-emerald-400" />
        </div>
        <p className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-black text-emerald-400 mb-0.5 tracking-widest`}>GAME WITHOUT LAG</p>
        <p className={`${isMobile ? 'text-[5px]' : 'text-[6px]'} text-zinc-500 mb-2`}>Ping &lt; 5ms ลื่นทุกเกม</p>
        <div className={`${isMobile ? 'w-16 h-3' : 'w-20 h-4'} rounded bg-gradient-to-r from-emerald-500 to-cyan-500 text-[5px] text-center leading-[12px] font-bold flex items-center justify-center`}>START GAMING</div>
      </div>
      {/* Ping stats */}
      <div className={`grid grid-cols-3 gap-1 ${isMobile ? 'px-2' : 'px-3'}`}>
        {[
          { val: '<5ms', label: 'PING' },
          { val: '1Gbps', label: 'SPEED' },
          { val: '99.9%', label: 'UPTIME' },
        ].map((s, i) => (
          <div key={i} className="text-center py-1.5 rounded border border-emerald-500/10 bg-emerald-500/[0.03]">
            <p className="text-[7px] font-bold text-emerald-400">{s.val}</p>
            <p className="text-[4px] text-zinc-600">{s.label}</p>
          </div>
        ))}
      </div>
      {/* Game icons */}
      <div className={`flex justify-center gap-2 ${isMobile ? 'mt-3' : 'mt-4'}`}>
        {['ROV', 'PUBG', 'ML'].map((g, i) => (
          <div key={i} className="w-7 h-7 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
            <span className="text-[5px] font-bold text-emerald-400/60">{g}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CorporatePreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Navbar */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/5">
        <div className="flex items-center gap-1">
          <Building2 className="w-3 h-3 text-indigo-400" />
          <span className="text-[6px] font-bold">VPN</span>
        </div>
        {!isMobile && (
          <div className="flex gap-1.5">
            <div className="w-8 h-2 rounded bg-white/10" />
            <div className="w-12 h-3 rounded bg-indigo-500 text-[5px] text-center leading-[12px] font-bold">Contact</div>
          </div>
        )}
      </div>
      {/* Hero */}
      <div className={`flex flex-col items-center justify-center text-center ${isMobile ? 'px-3 py-6' : 'px-6 py-8'}`}>
        <div className="flex gap-1 mb-2">
          <div className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[4px] text-indigo-400">Enterprise</div>
        </div>
        <p className={`${isMobile ? 'text-[8px]' : 'text-[11px]'} font-bold mb-1`}>Enterprise-Grade</p>
        <p className={`${isMobile ? 'text-[8px]' : 'text-[11px]'} font-bold mb-1 text-indigo-400`}>Security Solution</p>
        <p className={`${isMobile ? 'text-[5px]' : 'text-[6px]'} text-zinc-500 mb-2`}>ปกป้องข้อมูลองค์กรของคุณ</p>
        <div className="flex gap-1.5">
          <div className={`${isMobile ? 'w-14 h-3' : 'w-16 h-3.5'} rounded bg-indigo-500 text-[5px] text-center leading-[12px] font-bold flex items-center justify-center`}>Get Started</div>
          <div className={`${isMobile ? 'w-14 h-3' : 'w-16 h-3.5'} rounded border border-indigo-500/30 text-[5px] text-center text-indigo-400 flex items-center justify-center`}>Learn More</div>
        </div>
      </div>
      {/* Trust badges */}
      <div className={`grid grid-cols-3 gap-1 ${isMobile ? 'px-2' : 'px-3'} mb-3`}>
        {[
          { icon: Shield, label: 'AES-256' },
          { icon: Globe, label: 'Zero-Log' },
          { icon: Star, label: '24/7' },
        ].map((b, i) => (
          <div key={i} className="flex flex-col items-center py-1.5 rounded border border-indigo-500/10 bg-indigo-500/[0.03]">
            <b.icon className="w-3 h-3 text-indigo-400 mb-0.5" />
            <span className="text-[4px] text-zinc-500">{b.label}</span>
          </div>
        ))}
      </div>
      {/* Steps */}
      <div className={`flex justify-center gap-2 ${isMobile ? 'px-2' : 'px-3'}`}>
        {['1', '2', '3'].map((s) => (
          <div key={s} className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[5px] font-bold text-indigo-400">{s}</div>
            <div className="w-0.5 h-2 bg-indigo-500/10 mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PremiumPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-black text-white relative overflow-hidden">
      {/* Gold gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-amber-500/5" />
      {/* Navbar */}
      <div className="relative flex items-center justify-between px-2 py-1.5 border-b border-amber-500/10">
        <div className="flex items-center gap-1">
          <Crown className="w-3 h-3 text-amber-400" />
          <span className="text-[6px] font-bold text-amber-400">VPN</span>
        </div>
        {!isMobile && <div className="w-12 h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-[5px] text-center leading-[12px] font-bold text-black">Premium</div>}
      </div>
      {/* Hero */}
      <div className={`relative flex flex-col items-center justify-center text-center ${isMobile ? 'px-3 py-6' : 'px-4 py-8'}`}>
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
          <Diamond className="w-4 h-4 text-amber-400" />
        </div>
        <p className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-black mb-0.5`}>
          <span className="text-amber-400">ความเร็วสูงสุด</span> <span className="text-white">10Gbps</span>
        </p>
        <p className={`${isMobile ? 'text-[5px]' : 'text-[6px]'} text-zinc-500 mb-2`}>VPN ระดับพรีเมียม ปลอดภัยระดับทหาร</p>
        <div className={`${isMobile ? 'w-16 h-3' : 'w-20 h-4'} rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-[5px] text-center leading-[12px] font-bold text-black flex items-center justify-center`}>เริ่มต้นใช้งาน</div>
      </div>
      {/* Features */}
      <div className={`grid grid-cols-3 gap-1 ${isMobile ? 'px-2' : 'px-3'} mb-2`}>
        {[
          { icon: Zap, label: '10Gbps' },
          { icon: Shield, label: 'AES-256' },
          { icon: Globe, label: '50+ Countries' },
        ].map((f, i) => (
          <div key={i} className="flex flex-col items-center py-1.5 rounded border border-amber-500/10 bg-amber-500/[0.03]">
            <f.icon className="w-3 h-3 text-amber-400 mb-0.5" />
            <span className="text-[4px] text-zinc-500">{f.label}</span>
          </div>
        ))}
      </div>
      {/* Comparison hint */}
      <div className={`${isMobile ? 'px-2' : 'px-3'} mb-2`}>
        <div className="rounded border border-amber-500/10 bg-amber-500/[0.02] p-1.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[4px] text-zinc-500">Feature</span>
            <div className="flex gap-2">
              <span className="text-[4px] text-zinc-600">Others</span>
              <span className="text-[4px] text-amber-400 font-bold">Simon</span>
            </div>
          </div>
          {['Speed', 'Security', 'Support'].map((r, i) => (
            <div key={i} className="flex justify-between items-center py-0.5 border-t border-white/5">
              <span className="text-[4px] text-zinc-500">{r}</span>
              <div className="flex gap-3">
                <span className="text-[5px] text-zinc-600">-</span>
                <Gem className="w-2 h-2 text-amber-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Pricing hint */}
      <div className={`grid grid-cols-3 gap-1 ${isMobile ? 'px-2' : 'px-3'}`}>
        {[50, 100, 200].map((p, i) => (
          <div key={i} className="text-center py-1 rounded border border-amber-500/10 bg-amber-500/[0.03]">
            <p className="text-[6px] font-bold text-amber-400">{p}฿</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SongkranPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628] text-white relative overflow-hidden">
      {/* Water glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-sky-500/10 blur-2xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-amber-500/5 blur-2xl rounded-full" />
      {/* Navbar */}
      <div className="relative flex items-center justify-between px-2 py-1.5 border-b border-sky-500/10">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3 text-sky-400" />
          <span className="text-[6px] font-bold text-sky-400">VPN</span>
        </div>
        {!isMobile && <div className="w-14 h-3 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 text-[5px] text-center leading-[12px] font-bold text-white">Songkran</div>}
      </div>
      {/* Hero */}
      <div className={`relative flex flex-col items-center justify-center text-center ${isMobile ? 'px-3 py-5' : 'px-4 py-7'}`}>
        <div className="flex gap-0.5 mb-1.5">
          <span className="text-[5px] px-1.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300">Songkran</span>
          <Sun className="w-2.5 h-2.5 text-amber-400" />
        </div>
        <p className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-black mb-0.5`}>
          <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">สาดความเร็ว</span> <span className="text-white">10Gbps</span>
        </p>
        <p className={`${isMobile ? 'text-[5px]' : 'text-[6px]'} text-zinc-500 mb-2`}>เร็วแรงดั่งสายน้ำ เข้ารหัสระดับทหาร</p>
        <div className={`${isMobile ? 'w-16 h-3' : 'w-20 h-4'} rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 text-[5px] text-center leading-[12px] font-bold text-white flex items-center justify-center`}>สาดน้ำเริ่มใช้งาน</div>
      </div>
      {/* Features */}
      <div className={`grid grid-cols-3 gap-1 ${isMobile ? 'px-2' : 'px-3'} mb-2`}>
        {[
          { icon: Zap, label: '10Gbps', color: 'text-sky-400' },
          { icon: Shield, label: 'AES-256', color: 'text-amber-400' },
          { icon: Globe, label: 'Global', color: 'text-cyan-400' },
        ].map((f, i) => (
          <div key={i} className="flex flex-col items-center py-1.5 rounded border border-sky-500/10 bg-sky-500/[0.03]">
            <f.icon className={`w-3 h-3 ${f.color} mb-0.5`} />
            <span className="text-[4px] text-zinc-500">{f.label}</span>
          </div>
        ))}
      </div>
      {/* Water drops decoration */}
      <div className={`flex justify-center gap-1.5 ${isMobile ? 'px-2' : 'px-3'} mb-2`}>
        {[1, 2, 3, 4, 5].map((d) => (
          <div key={d} className="w-2 h-2.5 rounded-full bg-gradient-to-b from-sky-400/30 to-sky-400/10" style={{ borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' }} />
        ))}
      </div>
      {/* Pricing hint */}
      <div className={`grid grid-cols-3 gap-1 ${isMobile ? 'px-2' : 'px-3'}`}>
        {[50, 100, 200].map((p, i) => (
          <div key={i} className="text-center py-1 rounded border border-sky-500/10 bg-sky-500/[0.03]">
            <p className="text-[6px] font-bold text-sky-400">{p}฿</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomHtmlPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-zinc-950 text-white relative overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'linear-gradient(rgba(244,63,94,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.4) 1px, transparent 1px)',
        backgroundSize: '10px 10px',
      }} />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-rose-500/8 blur-3xl rounded-full" />
      {/* Content */}
      <div className={`relative flex flex-col items-center justify-center text-center h-full ${isMobile ? 'px-3' : 'px-6'}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/20 flex items-center justify-center mb-3">
          <Code className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-rose-400`} />
        </div>
        <p className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} font-bold text-rose-400 mb-1`}>&lt;/&gt; Custom HTML</p>
        <p className={`${isMobile ? 'text-[5px]' : 'text-[6px]'} text-zinc-500 mb-3 max-w-[80%]`}>เขียน HTML/CSS/JS ได้อิสระ ออกแบบหน้า Landing Page ตามใจคุณ</p>
        {/* Code lines mockup */}
        <div className={`w-full ${isMobile ? 'max-w-[120px]' : 'max-w-[180px]'} text-left space-y-1 px-2 py-2 rounded-lg bg-black/50 border border-rose-500/10`}>
          <div className="flex gap-1 items-center">
            <span className="text-[5px] text-rose-400/60 font-mono">&lt;div</span>
            <span className="text-[5px] text-orange-400/60 font-mono">class=</span>
            <span className="text-[5px] text-emerald-400/60 font-mono">&quot;hero&quot;</span>
            <span className="text-[5px] text-rose-400/60 font-mono">&gt;</span>
          </div>
          <div className="flex gap-1 items-center pl-2">
            <span className="text-[5px] text-blue-400/60 font-mono">&lt;h1&gt;</span>
            <span className="text-[5px] text-zinc-400 font-mono">Your Title</span>
            <span className="text-[5px] text-blue-400/60 font-mono">&lt;/h1&gt;</span>
          </div>
          <div className="flex gap-1 items-center pl-2">
            <span className="text-[5px] text-purple-400/60 font-mono">&lt;style&gt;</span>
            <span className="text-[5px] text-zinc-500 font-mono">...</span>
            <span className="text-[5px] text-purple-400/60 font-mono">&lt;/style&gt;</span>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-[5px] text-rose-400/60 font-mono">&lt;/div&gt;</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const previewComponents: Record<TemplateId, React.FC<{ isMobile?: boolean }>> = {
  classic: ClassicPreview,
  minimal: MinimalPreview,
  gaming: GamingPreview,
  corporate: CorporatePreview,
  premium: PremiumPreview,
  songkran: SongkranPreview,
  customHtml: CustomHtmlPreview,
}

// ===== Main Page =====

export default function LandingTemplatePage() {
  const [current, setCurrent] = useState<TemplateId>('classic')
  const [selected, setSelected] = useState<TemplateId>('classic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId | null>(null)
  const [customHtml, setCustomHtml] = useState('')
  const [savedCustomHtml, setSavedCustomHtml] = useState('')

  // Fetch current template
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        const s = data.settings
        const tmpl = (s?.landingTemplate || 'classic') as TemplateId
        setCurrent(tmpl)
        setSelected(tmpl)
        setCustomHtml(s?.landingCustomHtml || '')
        setSavedCustomHtml(s?.landingCustomHtml || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Save template
  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      // First fetch current settings, then update with new template
      const getRes = await fetch('/api/admin/settings')
      const getData = await getRes.json()
      const currentSettings = getData.settings || {}

      const payload: Record<string, unknown> = { ...currentSettings, landingTemplate: selected }
      // Always send customHtml if selected or if it has changed
      if (selected === 'customHtml' || customHtml !== savedCustomHtml) {
        payload.landingCustomHtml = customHtml
      }

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setCurrent(selected)
        setSavedCustomHtml(customHtml)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = current !== selected || (selected === 'customHtml' && customHtml !== savedCustomHtml)
  const activePreview = previewTemplate || selected

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
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-xl flex items-center justify-center">
              <Layout className="w-4.5 h-4.5 text-purple-400" />
            </div>
            รูปแบบหน้าแรก
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 ml-[46px]">เลือกดีไซน์ Landing Page สำหรับผู้เยี่ยมชมที่ยังไม่ได้ล็อกอิน</p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            saved
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : hasChanges
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg shadow-purple-500/20'
                : 'bg-zinc-900 border border-white/5 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> บันทึกแล้ว</>
          ) : (
            <><Save className="w-4 h-4" /> บันทึก</>
          )}
        </button>
      </div>

      {/* Currently Active */}
      <div className="mb-6 px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${templates.find(t => t.id === current)?.gradient || 'from-blue-500 to-cyan-500'} flex items-center justify-center`}>
          {(() => {
            const Icon = templates.find(t => t.id === current)?.icon || Layout
            return <Icon className="w-4 h-4 text-white" />
          })()}
        </div>
        <div>
          <p className="text-[11px] text-zinc-500">กำลังใช้งานอยู่</p>
          <p className="text-sm font-bold text-white">{templates.find(t => t.id === current)?.name} Template</p>
        </div>
        {hasChanges && (
          <div className="ml-auto flex items-center gap-1.5 text-amber-400">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-medium">มีการเปลี่ยนแปลง</span>
          </div>
        )}
      </div>

      {/* Template Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-8">
        {templates.map((tmpl) => {
          const isActive = selected === tmpl.id
          const isCurrent = current === tmpl.id
          const PreviewComponent = previewComponents[tmpl.id]

          return (
            <button
              key={tmpl.id}
              onClick={() => setSelected(tmpl.id)}
              onMouseEnter={() => setPreviewTemplate(tmpl.id)}
              onMouseLeave={() => setPreviewTemplate(null)}
              className={`relative text-left rounded-2xl border-2 transition-all overflow-hidden group ${
                isActive
                  ? `${tmpl.border}/40 bg-white/[0.03] shadow-lg shadow-${tmpl.accent}-500/5`
                  : 'border-white/[0.06] hover:border-white/[0.15] bg-white/[0.01] hover:bg-white/[0.02]'
              }`}
            >
              {/* Active badge */}
              {isActive && (
                <div className="absolute top-3 right-3 z-10">
                  <div className={`w-7 h-7 bg-gradient-to-r ${tmpl.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Currently in use badge */}
              {isCurrent && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">ACTIVE</span>
                </div>
              )}

              {/* Preview area */}
              <div className="p-4 pb-0">
                <div className="flex gap-3 justify-center">
                  {/* Desktop preview */}
                  <div className="flex-1 max-w-[220px]">
                    <DesktopFrame>
                      <PreviewComponent isMobile={false} />
                    </DesktopFrame>
                  </div>
                  {/* Mobile preview */}
                  <div className="hidden sm:block">
                    <PhoneFrame>
                      <PreviewComponent isMobile={true} />
                    </PhoneFrame>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 pt-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${tmpl.gradient}/10 border border-white/[0.08] flex items-center justify-center`}>
                    <tmpl.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-zinc-300'}`}>{tmpl.name}</h3>
                      <span className="text-[10px] text-zinc-600">{tmpl.subtitle}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mb-2">{tmpl.desc}</p>
                    {/* Feature tags */}
                    <div className="flex flex-wrap gap-1">
                      {tmpl.features.slice(0, 5).map((f, i) => (
                        <span key={i} className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${
                          isActive ? 'bg-white/[0.06] text-zinc-300' : 'bg-white/[0.03] text-zinc-600'
                        }`}>{f}</span>
                      ))}
                      {tmpl.features.length > 5 && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-medium text-zinc-600">+{tmpl.features.length - 5}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Custom HTML Code Editor */}
      {selected === 'customHtml' && (
        <div className="mb-8 rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-rose-500/10 bg-rose-500/[0.03]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center">
              <Code className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Custom HTML Editor</h3>
              <p className="text-[11px] text-zinc-500">เขียน HTML/CSS/JS สำหรับหน้า Landing Page - จะแสดงแทนที่ template ทั้งหมด</p>
            </div>
          </div>
          <div className="p-4">
            {/* Tips */}
            <div className="mb-3 px-3 py-2 rounded-lg bg-zinc-900/50 border border-white/5">
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <span className="text-rose-400 font-bold">Tips:</span> ใส่ HTML เต็มรูปแบบได้เลย รวม <code className="text-rose-300">&lt;style&gt;</code> และ <code className="text-rose-300">&lt;script&gt;</code> tags.
                HTML นี้จะแสดงเป็นหน้า Landing Page แทน template ปกติ สำหรับผู้เยี่ยมชมที่ยังไม่ได้ล็อกอิน.
                Navbar จะยังแสดงอยู่ด้านบน.
              </p>
            </div>
            {/* Editor */}
            <textarea
              value={customHtml}
              onChange={(e) => setCustomHtml(e.target.value)}
              placeholder={`<!-- ตัวอย่าง Custom Landing Page -->\n<div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; text-align: center;">\n  <div>\n    <h1 style="font-size: 3rem; font-weight: 900; color: white; margin-bottom: 1rem;">Welcome to VPN</h1>\n    <p style="font-size: 1.2rem; color: #a1a1aa; margin-bottom: 2rem;">เชื่อมต่อ VPN ที่เร็วที่สุด</p>\n    <a href="/login" style="padding: 12px 32px; background: linear-gradient(135deg, #f43f5e, #f97316); color: white; border-radius: 12px; text-decoration: none; font-weight: 700;">เข้าสู่ระบบ</a>\n  </div>\n</div>`}
              className="w-full h-[400px] bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/30 placeholder:text-zinc-700"
              spellCheck={false}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-zinc-600">
                {customHtml.length.toLocaleString()} characters
              </p>
              {customHtml !== savedCustomHtml && (
                <span className="text-[10px] text-amber-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  มีการเปลี่ยนแปลง
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-bold text-white">ตัวอย่างขนาดใหญ่</h2>
          <span className="text-[11px] text-zinc-600">- {templates.find(t => t.id === activePreview)?.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Desktop Large Preview */}
          <div>
            <DesktopFrame label="Desktop Preview">
              {(() => {
                const Comp = previewComponents[activePreview]
                return <Comp isMobile={false} />
              })()}
            </DesktopFrame>
          </div>

          {/* Mobile Large Preview */}
          <div className="flex justify-center">
            <PhoneFrame label="Mobile Preview">
              {(() => {
                const Comp = previewComponents[activePreview]
                return <Comp isMobile={true} />
              })()}
            </PhoneFrame>
          </div>
        </div>
      </div>

      {/* Bottom save bar (sticky on mobile) */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50 p-4 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลง - {templates.find(t => t.id === selected)?.name}</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
