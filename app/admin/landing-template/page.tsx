'use client'

import { useEffect, useState } from 'react'
import {
  Layout, Sparkles, Gamepad2, Briefcase, Crown, CheckCircle, Loader2,
  Monitor, Smartphone, Eye, Save, ArrowRight, Shield, Zap, Globe,
  Star, Trophy, Building2, Sword, ChevronRight, Diamond, Gem, Code,
  Droplets, Sun, Waves,
  Rocket, Orbit, TreePine, Mountain,
  Sunrise, Moon, Flower2,
  Feather, CloudRain, Disc, Sprout,
} from 'lucide-react'

type TemplateId = 'classic' | 'minimal' | 'gaming' | 'corporate' | 'premium' | 'songkran' | 'aurora' | 'neonNight' | 'space' | 'fantasy' | 'ocean' | 'sunset' | 'midnight' | 'sakura' | 'zenGarden' | 'cyberTokyo' | 'retroWave' | 'forestSpirit' | 'customHtml'

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
    id: 'aurora',
    name: 'Aurora',
    subtitle: 'แสงเหนือ ละมุนตา',
    desc: 'ธีมแสงเหนือ - Gradient ม่วง-ชมพู-ฟ้า ละมุนตา ดูฝันๆ พร้อม Glass Cards และ Glow Effects',
    features: ['Aurora Hero', 'Gradient Glow', 'Glass Cards', '6 Features', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    icon: Star,
    gradient: 'from-violet-500 via-fuchsia-500 to-cyan-500',
    border: 'border-violet-500',
    bg: 'bg-violet-500',
    accent: 'violet',
    heroTitle: 'VPN แสงเหนือ',
    heroSub: 'เชื่อมต่อลื่นไหลดั่งแสงออโรรา',
  },
  {
    id: 'neonNight',
    name: 'Neon Night',
    subtitle: 'Cyberpunk Neon',
    desc: 'ธีมไซเบอร์พังค์ - Grid Background, Neon Glow สีชมพู-น้ำเงิน ดูทันสมัย ดูเท่',
    features: ['Neon Hero', 'Grid Background', 'Glow Effects', 'Speed Stats', 'Pricing', 'FAQ', 'CTA'],
    icon: Zap,
    gradient: 'from-fuchsia-500 via-purple-500 to-cyan-500',
    border: 'border-fuchsia-500',
    bg: 'bg-fuchsia-500',
    accent: 'fuchsia',
    heroTitle: 'NEON VPN',
    heroSub: 'เชื่อมต่อด้วยแสง Neon ทะลุทุกขีดจำกัด',
  },
  {
    id: 'space',
    name: 'Space',
    subtitle: 'อวกาศ ล้ำยุค',
    desc: 'ธีมอวกาศ - โทนสีน้ำเงินลึก ดวงดาว ดาวเคราะห์ แสงดาวระยิบ พร้อม Glow Effects',
    features: ['Cosmic Hero', 'Starfield', 'Planet Glow', '6 Features', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    icon: Rocket,
    gradient: 'from-indigo-600 via-blue-600 to-cyan-500',
    border: 'border-indigo-500',
    bg: 'bg-indigo-600',
    accent: 'indigo',
    heroTitle: 'VPN ระดับจักรวาล',
    heroSub: 'เชื่อมต่อเร็วทะลุทุกดวงดาว',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    subtitle: 'ต่างโลก เวทมนตร์',
    desc: 'ธีมต่างโลกแฟนตาซี - ภูเขา ต้นไม้ เวทมนตร์ โทนสีม่วง-เขียว-ทอง ลึกลับ ตื่นตาตื่นใจ',
    features: ['Fantasy Hero', 'Magic Glow', 'Nature Vibes', '6 Features', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    icon: TreePine,
    gradient: 'from-emerald-500 via-teal-500 to-violet-500',
    border: 'border-emerald-500',
    bg: 'bg-emerald-500',
    accent: 'emerald',
    heroTitle: 'VPN ต่างโลก',
    heroSub: 'เชื่อมต่อด้วยพลังเวทมนตร์',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    subtitle: 'มหาสมุทร ลึกลับ',
    desc: 'ธีมทะเล - คลื่น ฟองน้ำ โทนสีฟ้า-น้ำเงิน-เขียวมรกต สดชื่น ลึกลับ ดั่งใต้ท้องทะเล',
    features: ['Ocean Hero', 'Wave Effects', 'Bubble Animation', '6 Features', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    icon: Waves,
    gradient: 'from-cyan-400 via-teal-500 to-emerald-500',
    border: 'border-cyan-500',
    bg: 'bg-cyan-500',
    accent: 'cyan',
    heroTitle: 'VPN ดั่งมหาสมุทร',
    heroSub: 'เชื่อมต่อลึกลับ ไร้ขีดจำกัด',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    subtitle: 'พระอาทิตย์ตก อบอุ่น',
    desc: 'ธีมพระอาทิตย์ตก - โทนสีส้ม-ชมพู-ม่วง-แดง อบอุ่น โรแมนติก สวยงามดั่งแสงอาทิตย์อัสดง',
    features: ['Sunset Hero', 'Gradient Glow', 'Warm Colors', '6 Features', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    icon: Sunrise,
    gradient: 'from-orange-400 via-pink-500 to-purple-500',
    border: 'border-orange-500',
    bg: 'bg-orange-500',
    accent: 'orange',
    heroTitle: 'VPN ยามพระอาทิตย์ตก',
    heroSub: 'อบอุ่น สวยงาม ไร้ขีดจำกัด',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    subtitle: 'กลางคืน หรูหรา',
    desc: 'ธีมกลางคืน - ดวงดาว แสงจันทร์ โทนสีน้ำเงินเข้ม-ทอง-ม่วง หรูหรา ลึกลับ ดั่งดาวเคราะห์',
    features: ['Midnight Hero', 'Starfield', 'Gold Accents', '6 Features', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    icon: Moon,
    gradient: 'from-indigo-600 via-purple-600 to-amber-500',
    border: 'border-indigo-500',
    bg: 'bg-indigo-600',
    accent: 'indigo',
    heroTitle: 'VPN ยามเที่ยงคืน',
    heroSub: 'หรูหรา ลึกลับ ดั่งดวงดาว',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    subtitle: 'ซากุระ ละมุนละไม',
    desc: 'ธีมซากุระญี่ปุ่น - กลีบดอกไม้ โทนสีชมพูอ่อน-ขาว-ม่วง อ่อนโยน สวยงาม ละมุนตา',
    features: ['Sakura Hero', 'Falling Petals', 'Pink Glow', '6 Features', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    icon: Flower2,
    gradient: 'from-pink-300 via-rose-400 to-fuchsia-400',
    border: 'border-pink-400',
    bg: 'bg-pink-400',
    accent: 'pink',
    heroTitle: 'VPN ดั่งกลีบซากุระ',
    heroSub: 'อ่อนโยน สวยงาม แข็งแกร่ง',
  },
  {
    id: 'zenGarden',
    name: 'Zen Garden',
    subtitle: 'สวนญี่ปุ่น สงบ',
    desc: 'ธีมสวนญี่ปุ่น - มินิมอล สงบ น้ำตก ซากุระร่วง หิน โทนสีขาว-เทา-น้ำตาล ผ่อนคลาย',
    features: ['Zen Hero', 'Water Ripples', 'Falling Petals', 'Minimal Cards', 'Pricing', 'FAQ', 'CTA'],
    icon: Feather,
    gradient: 'from-stone-300 via-amber-200 to-stone-400',
    border: 'border-stone-400',
    bg: 'bg-stone-400',
    accent: 'stone',
    heroTitle: '静けさのVPN',
    heroSub: 'สงบ เร็ว เสถียร',
  },
  {
    id: 'cyberTokyo',
    name: 'Cyber Tokyo',
    subtitle: 'โตเกียวยามฝนตก',
    desc: 'ธีมถนนโตเกียวยามค่ำคืน - ฝนตก เนออน ป้ายญี่ปุ่น โทนสีน้ำเงิน-ชมพู ทันสมัย มีสไตล์',
    features: ['Tokyo Hero', 'Rain Effect', 'Neon Glow', 'City Lights', 'Pricing', 'FAQ', 'CTA'],
    icon: CloudRain,
    gradient: 'from-blue-500 via-pink-500 to-cyan-500',
    border: 'border-pink-500',
    bg: 'bg-pink-500',
    accent: 'pink',
    heroTitle: '東京VPN',
    heroSub: 'เร็วเหมือนสายฝนในโตเกียว',
  },
  {
    id: 'retroWave',
    name: 'Retro Wave',
    subtitle: 'ย้อนยุค 80s',
    desc: 'ธีมย้อนยุค 80s Vaporwave - พระอาทิตย์ตกสีชมพู-ม่วง ตึกสีม่วง ต้นปาล์ม Grid floor คลาสสิก',
    features: ['Retro Hero', 'Sunset Grid', 'Vaporwave Colors', '80s Style', 'Pricing', 'FAQ', 'CTA'],
    icon: Disc,
    gradient: 'from-orange-400 via-pink-500 to-purple-500',
    border: 'border-pink-500',
    bg: 'bg-pink-500',
    accent: 'pink',
    heroTitle: 'VAPOR VPN',
    heroSub: 'ย้อนเวลากลับไปสู่ยุค 80s',
  },
  {
    id: 'forestSpirit',
    name: 'Forest Spirit',
    subtitle: 'ป่าฝน หมอก แมลงเรืองแสง',
    desc: 'ธีมธรรมชาติป่าฝน - หมอก แมลงเรืองแสง น้ำค้าง โทนสีเขียวเข้ม-เหลือง ลึกลับ สงบ',
    features: ['Forest Hero', 'Fireflies', 'Mist Layers', 'Nature Glow', 'Pricing', 'FAQ', 'CTA'],
    icon: Sprout,
    gradient: 'from-lime-400 via-emerald-500 to-teal-500',
    border: 'border-emerald-500',
    bg: 'bg-emerald-500',
    accent: 'emerald',
    heroTitle: 'VPN แห่งป่า',
    heroSub: 'เชื่อมต่อตามธรรมชาติ',
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
    <div className="w-full h-full bg-zinc-950 text-white flex">
      {/* Sidebar */}
      {!isMobile && (
        <div className="w-10 h-full bg-zinc-900 border-r border-white/5 flex flex-col items-center py-2 gap-2">
          <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center"><Shield className="w-2.5 h-2.5 text-blue-400" /></div>
          <div className="w-5 h-5 rounded bg-white/5" />
          <div className="w-5 h-5 rounded bg-white/5" />
          <div className="w-5 h-5 rounded bg-white/5" />
          <div className="mt-auto w-5 h-5 rounded-full bg-blue-500/20" />
        </div>
      )}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-2 py-1 border-b border-white/5">
          <span className="text-[5px] font-bold text-zinc-400">Dashboard</span>
          <div className="flex gap-1">
            <div className="w-8 h-2 rounded bg-white/5" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          </div>
        </div>
        {/* Metrics 2x2 */}
        <div className={`grid grid-cols-2 gap-1 p-1.5 ${isMobile ? 'grid-cols-2' : ''}`}>
          {[
            { label: 'Users', val: '12.5K', bar: 'bg-blue-500', w: '70%' },
            { label: 'Speed', val: '10Gbps', bar: 'bg-cyan-500', w: '90%' },
            { label: 'Ping', val: '<5ms', bar: 'bg-emerald-500', w: '95%' },
            { label: 'Uptime', val: '99.9%', bar: 'bg-amber-500', w: '99%' },
          ].map((m, i) => (
            <div key={i} className="rounded bg-white/[0.02] border border-white/5 p-1.5">
              <p className="text-[4px] text-zinc-500 mb-0.5">{m.label}</p>
              <p className="text-[7px] font-bold text-white">{m.val}</p>
              <div className="h-0.5 w-full bg-white/5 rounded-full mt-1"><div className={`h-full rounded-full ${m.bar}`} style={{ width: m.w }} /></div>
            </div>
          ))}
        </div>
        {/* Mini chart */}
        <div className="px-1.5 pb-1.5 flex-1">
          <div className="h-full rounded bg-white/[0.02] border border-white/5 p-1.5 flex flex-col">
            <p className="text-[4px] text-zinc-500 mb-1">Traffic</p>
            <div className="flex-1 flex items-end gap-0.5">
              {[30, 45, 35, 60, 50, 75, 65, 80, 70, 90, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-blue-500/40 to-cyan-500/20 rounded-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MinimalPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-white text-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-100 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-zinc-100 rounded-tr-full" />
      <div className="relative z-10 text-center px-4">
        <p className={`${isMobile ? 'text-[14px]' : 'text-[18px]'} font-black tracking-tighter leading-none mb-1`}>Simple.</p>
        <p className={`${isMobile ? 'text-[14px]' : 'text-[18px]'} font-black tracking-tighter leading-none mb-1`}>Fast.</p>
        <p className={`${isMobile ? 'text-[14px]' : 'text-[18px]'} font-black tracking-tighter leading-none mb-3 text-zinc-300`}>Secure.</p>
        <p className={`${isMobile ? 'text-[5px]' : 'text-[6px]'} text-zinc-400 mb-4 max-w-[70%] mx-auto`}>VPN ที่ใช้ง่ายที่สุดในโลก</p>
        <div className={`${isMobile ? 'w-16 h-6' : 'w-20 h-7'} rounded-full bg-black text-white text-[5px] font-bold flex items-center justify-center mx-auto`}>เริ่มต้นใช้งาน</div>
      </div>
      {/* Single dot decoration */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-zinc-200" />
      <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-zinc-100" />
    </div>
  )
}

function GamingPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-black text-white relative overflow-hidden">
      {/* Diagonal neon stripe */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 60%)' }} />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(emerald 1px, transparent 1px), linear-gradient(90deg, emerald 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      {/* Crosshair center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-12 border border-emerald-500/20 rounded-full flex items-center justify-center">
        <div className="w-8 h-8 border border-emerald-500/30 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-emerald-400 rounded-full" />
        </div>
      </div>
      {/* Navbar */}
      <div className="relative flex items-center justify-between px-2 py-1">
        <Gamepad2 className="w-3 h-3 text-emerald-400" />
        <span className="text-[5px] font-bold text-emerald-400 tracking-widest">GAME WITHOUT LAG</span>
      </div>
      {/* Health/Shields bars */}
      <div className={`relative px-3 ${isMobile ? 'mt-6' : 'mt-8'}`}>
        {[
          { label: 'PING', val: '<5ms', color: 'from-emerald-500 to-cyan-500', w: '95%' },
          { label: 'SPEED', val: '1Gbps', color: 'from-cyan-500 to-blue-500', w: '85%' },
          { label: 'UPTIME', val: '99.9%', color: 'from-blue-500 to-indigo-500', w: '99%' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 mb-1">
            <span className="text-[4px] text-zinc-500 w-6 text-right">{s.label}</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${s.color}`} style={{ width: s.w }} />
            </div>
            <span className="text-[5px] font-bold text-emerald-400">{s.val}</span>
          </div>
        ))}
      </div>
      {/* Game icons row */}
      <div className="relative flex justify-center gap-2 mt-2">
        {['ROV', 'PUBG', 'ML', 'VALO'].map((g, i) => (
          <div key={i} className="w-7 h-7 rounded bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
            <span className="text-[4px] font-bold text-emerald-400/60">{g}</span>
          </div>
        ))}
      </div>
      {/* CTA */}
      <div className="relative mt-2 flex justify-center">
        <div className={`${isMobile ? 'w-20 h-4' : 'w-24 h-5'} rounded bg-gradient-to-r from-emerald-500 to-cyan-500 text-[5px] font-bold flex items-center justify-center`}>START GAMING</div>
      </div>
    </div>
  )
}

function CorporatePreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-white text-zinc-800 flex">
      {/* Left: Text */}
      <div className={`${isMobile ? 'w-full px-3' : 'w-1/2 px-4'} flex flex-col justify-center`}>
        <div className="flex items-center gap-1 mb-2">
          <div className="w-1 h-1 rounded-full bg-indigo-500" />
          <span className="text-[4px] text-indigo-500 font-bold tracking-wider">ENTERPRISE</span>
        </div>
        <p className={`${isMobile ? 'text-[9px]' : 'text-[10px]'} font-bold leading-tight mb-1`}>Secure Your</p>
        <p className={`${isMobile ? 'text-[9px]' : 'text-[10px]'} font-bold leading-tight text-indigo-600 mb-2`}>Business Data</p>
        <p className="text-[5px] text-zinc-400 mb-3">ปกป้องข้อมูลองค์กรด้วยมาตรฐานระดับสากล</p>
        <div className="flex gap-1.5">
          <div className="px-2 py-1 rounded bg-indigo-600 text-white text-[4px] font-bold">Get Started</div>
          <div className="px-2 py-1 rounded border border-zinc-200 text-[4px] font-bold text-zinc-500">Learn More</div>
        </div>
      </div>
      {/* Right: Image placeholder + trust */}
      {!isMobile && (
        <div className="w-1/2 bg-zinc-50 flex flex-col items-center justify-center p-3">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex gap-2">
            {['ISO', 'SOC2', 'GDPR'].map((t, i) => (
              <div key={i} className="px-1.5 py-0.5 rounded bg-white border border-zinc-100 text-[3px] text-zinc-400 font-bold">{t}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PremiumPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-black text-white relative overflow-hidden flex flex-col items-center justify-center">
      {/* Gold radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
      {/* Center diamond */}
      <div className="relative z-10 w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rotate-45 flex items-center justify-center mb-2 shadow-lg shadow-amber-500/20">
        <Diamond className="w-4 h-4 text-black -rotate-45" />
      </div>
      {/* Orbiting dots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-amber-500/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-amber-500/5 rounded-full" />
      {[0, 90, 180, 270].map((deg, i) => (
        <div key={i} className="absolute top-1/2 left-1/2 w-10" style={{ transform: `rotate(${deg}deg) translateX(40px)` }}>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
        </div>
      ))}
      <p className="relative z-10 text-[8px] font-black text-amber-400 mb-0.5">PREMIUM VPN</p>
      <p className="relative z-10 text-[5px] text-zinc-500 mb-3">ความเร็วสูงสุด ปลอดภัยระดับทหาร</p>
      {/* Gem pricing */}
      <div className="relative z-10 flex gap-2">
        {['50฿', '100฿', '200฿'].map((p, i) => (
          <div key={i} className="w-8 h-10 bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            <span className="text-[5px] font-bold text-amber-400">{p}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SongkranPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#0a1f3d] via-[#0d2b4d] to-[#0a3a5c] text-white relative overflow-hidden">
      {/* Water bubbles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-sky-400/20" style={{
          width: 3 + Math.random() * 4,
          height: 3 + Math.random() * 4,
          left: `${10 + Math.random() * 80}%`,
          top: `${20 + Math.random() * 60}%`,
        }} />
      ))}
      {/* Wave at bottom */}
      <svg className="absolute bottom-0 left-0 right-0 h-8" viewBox="0 0 120 20" preserveAspectRatio="none">
        <path d="M0,10 Q30,0 60,10 T120,10 L120,20 L0,20Z" fill="rgba(56,189,248,0.15)" />
        <path d="M0,15 Q30,5 60,15 T120,15 L120,20 L0,20Z" fill="rgba(56,189,248,0.25)" />
      </svg>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-4">
        <div className="flex items-center gap-1 mb-1">
          <Droplets className="w-3 h-3 text-sky-400" />
          <Sun className="w-3 h-3 text-amber-400" />
        </div>
        <p className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-black text-sky-300 mb-0.5`}>สาดความเร็ว</p>
        <p className="text-[5px] text-sky-200/60 mb-2">เร็วแรงดั่งสายน้ำสงกรานต์</p>
        <div className={`${isMobile ? 'w-16 h-4' : 'w-20 h-5'} rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 text-[5px] font-bold flex items-center justify-center`}>เริ่มสาดน้ำ</div>
      </div>
      {/* Water drop decorations */}
      <div className="relative z-10 flex justify-center gap-2 mt-3">
        {[1, 2, 3].map((d) => (
          <div key={d} className="w-4 h-5 bg-gradient-to-b from-sky-400/30 to-sky-400/10 rounded-full" style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }} />
        ))}
      </div>
    </div>
  )
}

function AuroraPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#0a0514] text-white relative overflow-hidden">
      {/* Flowing aurora bands */}
      <div className="absolute top-0 left-0 right-0 h-full">
        <div className="absolute top-[10%] left-[-20%] right-[-20%] h-8 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/15 to-cyan-500/20 rounded-full blur-xl" />
        <div className="absolute top-[25%] left-[-10%] right-[-30%] h-6 bg-gradient-to-r from-cyan-500/15 via-violet-500/10 to-fuchsia-500/15 rounded-full blur-xl" />
        <div className="absolute top-[40%] left-[-30%] right-[-10%] h-5 bg-gradient-to-r from-fuchsia-500/10 via-cyan-500/15 to-violet-500/10 rounded-full blur-xl" />
      </div>
      {/* Glass cards floating */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-3">
        <p className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-1`}>VPN แสงเหนือ</p>
        <p className="text-[5px] text-zinc-500 mb-3">เชื่อมต่อลื่นไหลดั่งแสงออโรรา</p>
        <div className={`${isMobile ? 'w-full space-y-1.5' : 'w-full space-y-2'}`}>
          {[
            { label: 'ความเร็ว', val: '10Gbps', color: 'border-violet-500/20 bg-violet-500/5' },
            { label: 'ความปลอดภัย', val: 'AES-256', color: 'border-fuchsia-500/20 bg-fuchsia-500/5' },
            { label: 'เซิร์ฟเวอร์', val: '50+', color: 'border-cyan-500/20 bg-cyan-500/5' },
          ].map((f, i) => (
            <div key={i} className={`flex items-center justify-between px-2 py-1 rounded-lg border backdrop-blur-sm ${f.color}`}>
              <span className="text-[4px] text-zinc-400">{f.label}</span>
              <span className="text-[5px] font-bold text-white">{f.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NeonNightPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-black text-green-400 relative overflow-hidden font-mono">
      {/* Terminal window frame */}
      <div className="absolute inset-1 border border-green-500/20 rounded">
        <div className="flex items-center gap-1 px-1 py-0.5 border-b border-green-500/20">
          <div className="w-1 h-1 rounded-full bg-red-500/50" />
          <div className="w-1 h-1 rounded-full bg-yellow-500/50" />
          <div className="w-1 h-1 rounded-full bg-green-500/50" />
          <span className="text-[3px] text-green-500/40 ml-1">vpn.exe</span>
        </div>
        <div className={`p-1.5 ${isMobile ? 'text-[4px]' : 'text-[5px]'} space-y-1`}>
          <p><span className="text-green-500/50">$</span> connect --server thailand</p>
          <p className="text-green-300/70">{'>'} Establishing secure tunnel...</p>
          <p className="text-green-300/70">{'>'} Handshake complete</p>
          <p className="text-green-300/70">{'>'} Latency: <span className="text-green-400">4ms</span></p>
          <p className="text-green-300/70">{'>'} Encryption: <span className="text-green-400">AES-256-GCM</span></p>
          <p><span className="text-green-500/50">$</span> status<span className="animate-pulse">_</span></p>
        </div>
      </div>
      {/* Neon grid floor */}
      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-[0.08]" style={{
        backgroundImage: 'linear-gradient(rgba(74,222,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.5) 1px, transparent 1px)',
        backgroundSize: '8px 8px',
        transform: 'perspective(50px) rotateX(30deg)',
        transformOrigin: 'bottom',
      }} />
    </div>
  )
}

function SpacePreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#02040a] text-white relative overflow-hidden flex items-center justify-center">
      {/* Star field */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0.5px, transparent 0.5px)',
        backgroundSize: '12px 12px',
      }} />
      {/* Concentric orbits */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-indigo-500/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-blue-500/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-cyan-500/10 rounded-full" />
      {/* Planets */}
      <div className="absolute top-[30%] left-[25%] w-2.5 h-2.5 rounded-full bg-indigo-400/40 shadow-[0_0_6px_rgba(99,102,241,0.3)]" />
      <div className="absolute top-[60%] right-[25%] w-2 h-2 rounded-full bg-cyan-400/30 shadow-[0_0_6px_rgba(34,211,238,0.3)]" />
      <div className="absolute top-[45%] left-[70%] w-1.5 h-1.5 rounded-full bg-blue-400/40" />
      {/* Center content */}
      <div className="relative z-10 text-center">
        <Rocket className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-indigo-400 mx-auto mb-1`} />
        <p className="text-[8px] font-black text-indigo-300">COSMIC VPN</p>
        <p className="text-[4px] text-indigo-200/50">เชื่อมต่อเร็วทะลุทุกดวงดาว</p>
      </div>
      {/* Rocket trail */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-t from-orange-500/40 to-transparent" />
    </div>
  )
}

function FantasyPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#0d1210] text-[#e8f5e9] relative overflow-hidden">
      {/* Parchment edges */}
      <div className="absolute inset-2 border border-emerald-500/10 rounded" style={{ borderRadius: '2px' }} />
      {/* Corner runes */}
      <div className="absolute top-3 left-3 text-[6px] text-emerald-500/30">ᚠ</div>
      <div className="absolute top-3 right-3 text-[6px] text-emerald-500/30">ᚢ</div>
      <div className="absolute bottom-3 left-3 text-[6px] text-emerald-500/30">ᚦ</div>
      <div className="absolute bottom-3 right-3 text-[6px] text-emerald-500/30">ᚨ</div>
      {/* Magic circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-emerald-500/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-teal-500/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400/30 rounded-full" />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <TreePine className="w-4 h-4 text-emerald-400 mb-1" />
        <p className="text-[8px] font-black text-emerald-300">VPN ต่างโลก</p>
        <p className="text-[4px] text-emerald-200/40 mb-2">เชื่อมต่อด้วยพลังเวทมนตร์</p>
        {/* Rune stones */}
        <div className="flex gap-1.5">
          {['⚡', '🛡', '🌍'].map((r, i) => (
            <div key={i} className="w-5 h-6 bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center text-[6px]">{r}</div>
          ))}
        </div>
      </div>
      {/* Sparkle dots */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="absolute w-0.5 h-0.5 bg-emerald-400/50 rounded-full" style={{
          left: `${15 + Math.random() * 70}%`,
          top: `${15 + Math.random() * 70}%`,
        }} />
      ))}
    </div>
  )
}

function OceanPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#001020] text-white relative overflow-hidden flex flex-col">
      {/* Deep sea layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#001a33] via-[#002a4d] to-[#003d66]" />
      {/* Light rays from top */}
      <div className="absolute top-0 left-1/4 w-4 h-full bg-gradient-to-b from-cyan-400/5 to-transparent" />
      <div className="absolute top-0 left-1/2 w-3 h-full bg-gradient-to-b from-cyan-400/5 to-transparent" />
      <div className="absolute top-0 left-3/4 w-4 h-full bg-gradient-to-b from-cyan-400/5 to-transparent" />
      {/* Rising bubbles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-cyan-300/20" style={{
          width: 2 + Math.random() * 3,
          height: 2 + Math.random() * 3,
          left: `${10 + i * 15}%`,
          bottom: `${10 + Math.random() * 30}%`,
        }} />
      ))}
      {/* Submarine window frame */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full border-4 border-cyan-900/50 bg-[#001a2e]/80 flex items-center justify-center mb-2">
          <div className="text-center">
            <Waves className="w-5 h-5 text-cyan-400 mx-auto mb-0.5" />
            <p className="text-[6px] font-bold text-cyan-300">DEEP VPN</p>
          </div>
        </div>
        <p className="text-[4px] text-cyan-200/50">ดำดิ่งสู่ความเร็วที่ไร้ขีดจำกัด</p>
      </div>
      {/* Sea floor */}
      <div className="relative z-10 h-3 bg-gradient-to-t from-[#001020] to-transparent" />
    </div>
  )
}

function SunsetPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#2d1b4e] via-[#1a0a2e] to-[#0f0518] text-white relative overflow-hidden">
      {/* Sky gradient bands */}
      <div className="absolute top-[15%] left-0 right-0 h-4 bg-gradient-to-r from-orange-500/20 via-pink-500/15 to-purple-500/10 rounded-full blur-lg" />
      <div className="absolute top-[25%] left-0 right-0 h-3 bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-indigo-500/5 rounded-full blur-lg" />
      {/* Sun half-circle */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-16 h-8 bg-gradient-to-b from-orange-400 to-pink-500 rounded-b-full opacity-80" />
      {/* Mountain silhouettes */}
      <svg className="absolute bottom-8 left-0 right-0 h-8" viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M0,20 L20,5 L40,15 L60,3 L80,12 L100,8 L100,20Z" fill="#0a0514" opacity="0.6" />
        <path d="M0,20 L15,10 L30,18 L50,8 L70,16 L85,9 L100,14 L100,20Z" fill="#0a0514" opacity="0.8" />
      </svg>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-3">
        <Sunrise className="w-4 h-4 text-orange-400 mb-1" />
        <p className="text-[8px] font-black text-orange-300">SUNSET VPN</p>
        <p className="text-[4px] text-orange-200/50 mb-2">อบอุ่น สวยงาม ไร้ขีดจำกัด</p>
        <div className="flex gap-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400/20 to-pink-500/20 border border-orange-500/20 flex items-center justify-center text-[5px] text-orange-300">50</div>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400/20 to-pink-500/20 border border-orange-500/20 flex items-center justify-center text-[5px] text-orange-300">100</div>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400/20 to-pink-500/20 border border-orange-500/20 flex items-center justify-center text-[5px] text-orange-300">200</div>
        </div>
      </div>
    </div>
  )
}

function MidnightPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#050510] text-white relative overflow-hidden flex items-center justify-center">
      {/* Star field */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 60}%`,
          opacity: 0.3 + Math.random() * 0.7,
        }} />
      ))}
      {/* Moon crescent */}
      <div className="absolute top-[15%] right-[20%] w-8 h-8 rounded-full bg-amber-100/10" />
      <div className="absolute top-[15%] right-[18%] w-8 h-8 rounded-full bg-[#050510]" />
      {/* Clock face ring */}
      <div className="absolute w-24 h-24 border border-indigo-500/10 rounded-full" />
      <div className="absolute w-24 h-24 border border-indigo-500/5 rounded-full" style={{ transform: 'rotate(45deg)' }} />
      {/* Hour markers */}
      {[0, 90, 180, 270].map((deg, i) => (
        <div key={i} className="absolute w-20" style={{ transform: `rotate(${deg}deg)` }}>
          <div className="w-0.5 h-0.5 bg-indigo-400/30 mx-auto" />
        </div>
      ))}
      {/* Content */}
      <div className="relative z-10 text-center">
        <Moon className="w-5 h-5 text-indigo-300 mx-auto mb-1" />
        <p className="text-[8px] font-black text-indigo-200">MIDNIGHT VPN</p>
        <p className="text-[4px] text-indigo-200/40 mb-2">หรูหรา ลึกลับ ดั่งดวงดาว</p>
        {/* Constellation lines */}
        <svg className="w-16 h-6 mx-auto" viewBox="0 0 60 20">
          <circle cx="10" cy="10" r="1" fill="#6366f1" opacity="0.5" />
          <circle cx="30" cy="5" r="1" fill="#6366f1" opacity="0.5" />
          <circle cx="50" cy="12" r="1" fill="#6366f1" opacity="0.5" />
          <line x1="10" y1="10" x2="30" y2="5" stroke="#6366f1" strokeWidth="0.5" opacity="0.2" />
          <line x1="30" y1="5" x2="50" y2="12" stroke="#6366f1" strokeWidth="0.5" opacity="0.2" />
        </svg>
      </div>
    </div>
  )
}

function SakuraPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#1a0a12] text-white relative overflow-hidden">
      {/* Branch SVG */}
      <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="none">
        <path d="M0,20 Q30,25 50,15 T100,10" stroke="#4a1a2e" strokeWidth="0.5" fill="none" opacity="0.5" />
        <path d="M50,15 Q60,30 55,50" stroke="#4a1a2e" strokeWidth="0.3" fill="none" opacity="0.4" />
        <path d="M30,22 Q35,35 25,45" stroke="#4a1a2e" strokeWidth="0.3" fill="none" opacity="0.4" />
      </svg>
      {/* Flower dots on branch */}
      <div className="absolute top-[22%] left-[30%] w-1.5 h-1.5 rounded-full bg-pink-400/40" />
      <div className="absolute top-[18%] left-[50%] w-2 h-2 rounded-full bg-pink-300/40" />
      <div className="absolute top-[15%] left-[75%] w-1.5 h-1.5 rounded-full bg-rose-300/40" />
      <div className="absolute top-[35%] left-[55%] w-1.5 h-1.5 rounded-full bg-pink-400/30" />
      {/* Falling petals */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="absolute w-1 h-1 bg-pink-300/30 rounded-full" style={{
          left: `${10 + i * 15}%`,
          top: `${30 + (i % 3) * 20}%`,
          transform: `rotate(${i * 45}deg)`,
        }} />
      ))}
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <Flower2 className="w-5 h-5 text-pink-300 mb-1" />
        <p className="text-[8px] font-black text-pink-200">SAKURA VPN</p>
        <p className="text-[4px] text-pink-200/40 mb-2">อ่อนโยน สวยงาม แข็งแกร่ง</p>
        <div className="flex gap-1">
          {['50฿', '100฿', '200฿'].map((p, i) => (
            <div key={i} className="px-1.5 py-0.5 rounded-full border border-pink-500/20 bg-pink-500/5 text-[4px] text-pink-300">{p}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ZenGardenPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#f5f0e8] text-[#5c5c5c] relative overflow-hidden">
      {/* Raked sand lines - diagonal */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #c4b8a0 8px, #c4b8a0 8.5px)',
      }} />
      {/* 3 rocks */}
      <div className="absolute top-[25%] left-[25%] w-5 h-4 bg-[#8a8a8a] rounded-full opacity-40" />
      <div className="absolute top-[35%] left-[55%] w-4 h-3 bg-[#7a7a7a] rounded-full opacity-35" />
      <div className="absolute top-[55%] left-[40%] w-6 h-5 bg-[#9a9a9a] rounded-full opacity-30" />
      {/* Moss circles around rocks */}
      <div className="absolute top-[24%] left-[23%] w-8 h-7 border border-[#a8b8a0]/30 rounded-full" />
      <div className="absolute top-[34%] left-[53%] w-7 h-6 border border-[#a8b8a0]/25 rounded-full" />
      <div className="absolute top-[54%] left-[38%] w-9 h-8 border border-[#a8b8a0]/20 rounded-full" />
      {/* Content - extremely minimal */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-6">
        <p className="text-[7px] font-light tracking-[0.3em] text-stone-500 mb-1">静けさ</p>
        <p className="text-[5px] text-stone-400 tracking-wider">VPN</p>
      </div>
    </div>
  )
}

function CyberTokyoPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#020205] text-white relative overflow-hidden">
      {/* Vertical neon sign bars (Japanese street style) */}
      <div className="absolute top-0 bottom-0 left-2 flex flex-col gap-1 py-2">
        <div className="w-2 h-8 bg-gradient-to-b from-pink-500/40 to-pink-500/10 rounded-sm" />
        <div className="w-2 h-6 bg-gradient-to-b from-cyan-500/40 to-cyan-500/10 rounded-sm" />
        <div className="w-2 h-10 bg-gradient-to-b from-blue-500/40 to-blue-500/10 rounded-sm" />
      </div>
      <div className="absolute top-0 bottom-0 right-3 flex flex-col gap-1 py-3">
        <div className="w-2 h-7 bg-gradient-to-b from-fuchsia-500/40 to-fuchsia-500/10 rounded-sm" />
        <div className="w-2 h-9 bg-gradient-to-b from-pink-500/40 to-pink-500/10 rounded-sm" />
      </div>
      {/* Rain streaks */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute w-px bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent" style={{
            height: 10 + Math.random() * 15,
            left: `${5 + i * 8}%`,
            top: `${Math.random() * 40}%`,
          }} />
        ))}
      </div>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <CloudRain className="w-5 h-5 text-pink-400 mb-1" />
        <p className="text-[8px] font-black text-pink-300 tracking-widest">東京VPN</p>
        <p className="text-[4px] text-cyan-300/50 mb-2">เร็วเหมือนสายฝนในโตเกียว</p>
        <div className="flex gap-1">
          {['新宿', '渋谷', '池袋'].map((a, i) => (
            <div key={i} className="px-1 py-0.5 bg-pink-500/10 border border-pink-500/20 text-[3px] text-pink-300">{a}</div>
          ))}
        </div>
      </div>
      {/* Wet ground reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-cyan-900/10 to-transparent" />
    </div>
  )
}

function RetroWavePreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#1a0b2e] text-white relative overflow-hidden">
      {/* Purple sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d1b4e] via-[#1a0b2e] to-[#0f0518]" />
      {/* Perspective grid floor */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%]" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,0,255,0.15) 25%, rgba(255,0,255,0.15) 26%, transparent 27%), linear-gradient(90deg, transparent 24%, rgba(255,0,255,0.15) 25%, rgba(255,0,255,0.15) 26%, transparent 27%)',
        backgroundSize: '16px 16px',
        transform: 'perspective(40px) rotateX(35deg)',
        transformOrigin: 'bottom',
      }} />
      {/* Sun with stripes */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-b from-orange-400 via-pink-500 to-purple-500 opacity-80" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1a0b2e]" />
      <div className="absolute top-[23%] left-1/2 -translate-x-1/2 w-14 h-0.5 bg-[#1a0b2e]" />
      <div className="absolute top-[26%] left-1/2 -translate-x-1/2 w-14 h-0.5 bg-[#1a0b2e]" />
      {/* Palm tree silhouettes */}
      <div className="absolute bottom-[30%] left-[10%] w-0.5 h-6 bg-pink-500/30" />
      <div className="absolute bottom-[34%] left-[8%] w-3 h-0.5 bg-pink-500/20 rotate-[-20deg]" />
      <div className="absolute bottom-[34%] left-[10%] w-3 h-0.5 bg-pink-500/20 rotate-[20deg]" />
      <div className="absolute bottom-[28%] right-[12%] w-0.5 h-5 bg-pink-500/25" />
      <div className="absolute bottom-[31%] right-[11%] w-2 h-0.5 bg-pink-500/15 rotate-[-20deg]" />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-2">
        <p className="text-[7px] font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">VAPOR VPN</p>
        <p className="text-[4px] text-pink-300/50">ย้อนเวลากลับไปสู่ยุค 80s</p>
      </div>
    </div>
  )
}

function ForestSpiritPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#0a1a0a] text-[#e8f5e9] relative overflow-hidden">
      {/* Fog layers */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-emerald-900/20 to-transparent" />
      <div className="absolute bottom-2 left-0 right-0 h-8 bg-gradient-to-t from-emerald-800/10 to-transparent" />
      {/* Firefly dots */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: 1.5 + Math.random() * 2,
          height: 1.5 + Math.random() * 2,
          left: `${5 + Math.random() * 90}%`,
          top: `${10 + Math.random() * 70}%`,
          background: i % 2 === 0 ? '#a3e635' : '#34d399',
          opacity: 0.4 + Math.random() * 0.4,
          boxShadow: `0 0 ${3 + Math.random() * 4}px currentColor`,
        }} />
      ))}
      {/* Vine branches */}
      <svg className="absolute top-0 left-0 w-16 h-20 opacity-20" viewBox="0 0 40 50">
        <path d="M0,0 Q10,20 5,40" stroke="#34d399" strokeWidth="0.5" fill="none" />
        <path d="M5,15 Q15,18 12,28" stroke="#34d399" strokeWidth="0.3" fill="none" />
      </svg>
      <svg className="absolute top-0 right-0 w-16 h-20 opacity-20" viewBox="0 0 40 50">
        <path d="M40,0 Q30,20 35,40" stroke="#34d399" strokeWidth="0.5" fill="none" />
      </svg>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <Sprout className="w-5 h-5 text-emerald-400 mb-1" />
        <p className="text-[8px] font-black text-emerald-300">FOREST VPN</p>
        <p className="text-[4px] text-emerald-200/40 mb-2">เชื่อมต่อตามธรรมชาติ</p>
        <div className="flex gap-1.5">
          {['🌿', '💧', '🍃'].map((e, i) => (
            <div key={i} className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[6px]">{e}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CustomHtmlPreview({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="w-full h-full bg-[#1e1e1e] text-white relative overflow-hidden font-mono">
      {/* VS Code style tabs */}
      <div className="flex items-center bg-[#252526] border-b border-[#333]">
        <div className="px-2 py-1 bg-[#1e1e1e] border-t-2 border-blue-500 text-[4px] text-white">index.html</div>
        <div className="px-2 py-1 text-[4px] text-zinc-500">style.css</div>
        <div className="px-2 py-1 text-[4px] text-zinc-500">script.js</div>
      </div>
      {/* Sidebar */}
      {!isMobile && (
        <div className="absolute left-0 top-6 bottom-0 w-6 bg-[#252526] border-r border-[#333] pt-1">
          <div className="text-[4px] text-zinc-500 px-1 mb-1">EXPLORER</div>
          <div className="text-[3px] text-zinc-400 px-1">📁 src</div>
          <div className="text-[3px] text-zinc-300 px-2">📄 index.html</div>
          <div className="text-[3px] text-zinc-400 px-2">📄 app.css</div>
        </div>
      )}
      {/* Code area */}
      <div className={`${isMobile ? 'pl-1' : 'pl-7'} pt-1 space-y-0.5`}>
        <div className="flex gap-1"><span className="text-[4px] text-zinc-600 w-3 text-right">1</span><span className="text-[4px] text-rose-400">{'<!DOCTYPE html>'}</span></div>
        <div className="flex gap-1"><span className="text-[4px] text-zinc-600 w-3 text-right">2</span><span className="text-[4px] text-zinc-300">{'<html>'}</span></div>
        <div className="flex gap-1"><span className="text-[4px] text-zinc-600 w-3 text-right">3</span><span className="text-[4px] text-zinc-300">{'  <body>'}</span></div>
        <div className="flex gap-1"><span className="text-[4px] text-zinc-600 w-3 text-right">4</span><span className="text-[4px] text-zinc-300">{'    <div '}</span><span className="text-[4px] text-orange-300">class</span><span className="text-[4px] text-zinc-300">=</span><span className="text-[4px] text-emerald-300">"hero"</span><span className="text-[4px] text-zinc-300">{'>'}</span></div>
        <div className="flex gap-1"><span className="text-[4px] text-zinc-600 w-3 text-right">5</span><span className="text-[4px] text-zinc-300">{'      <h1>'}</span><span className="text-[4px] text-white">Your Design</span><span className="text-[4px] text-zinc-300">{'</h1>'}</span></div>
        <div className="flex gap-1"><span className="text-[4px] text-zinc-600 w-3 text-right">6</span><span className="text-[4px] text-zinc-300">{'    </div>'}</span></div>
        <div className="flex gap-1"><span className="text-[4px] text-zinc-600 w-3 text-right">7</span><span className="text-[4px] text-zinc-300">{'  </body>'}</span></div>
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
  aurora: AuroraPreview,
  neonNight: NeonNightPreview,
  space: SpacePreview,
  fantasy: FantasyPreview,
  ocean: OceanPreview,
  sunset: SunsetPreview,
  midnight: MidnightPreview,
  sakura: SakuraPreview,
  zenGarden: ZenGardenPreview,
  cyberTokyo: CyberTokyoPreview,
  retroWave: RetroWavePreview,
  forestSpirit: ForestSpiritPreview,
  customHtml: CustomHtmlPreview,
}

// ===== Main Page =====

export default function LandingTemplatePage() {
  const [current, setCurrent] = useState<string>('classic')
  const [selected, setSelected] = useState<string>('classic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [customHtml, setCustomHtml] = useState('')
  const [savedCustomHtml, setSavedCustomHtml] = useState('')

  // Fetch current template
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((settingsData) => {
        const s = settingsData.settings
        const tmpl = s?.landingTemplate || 'classic'
        setCurrent(tmpl)
        setSelected(tmpl)
        setCustomHtml(s?.landingCustomHtml || '')
        setSavedCustomHtml(s?.landingCustomHtml || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const getRes = await fetch('/api/admin/settings')
      const getData = await getRes.json()
      const currentSettings = getData.settings || {}

      const payload: Record<string, unknown> = { ...currentSettings, landingTemplate: selected }
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

  // Get current template name
  function getCurrentTemplateName() {
    return templates.find(t => t.id === current)?.name || 'Classic'
  }

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
          <p className="text-sm font-bold text-white">{getCurrentTemplateName()} Template</p>
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
                  ? `${tmpl.border}/40 bg-white/[0.03]`
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
          <span className="text-[11px] text-zinc-600">
            - {templates.find(t => t.id === activePreview)?.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Desktop Large Preview */}
          <div>
            <DesktopFrame label="Desktop Preview">
              {(() => {
                const Comp = previewComponents[activePreview as TemplateId]
                return Comp ? <Comp isMobile={false} /> : <ClassicPreview isMobile={false} />
              })()}
            </DesktopFrame>
          </div>

          {/* Mobile Large Preview */}
          <div className="flex justify-center">
            <PhoneFrame label="Mobile Preview">
              {(() => {
                const Comp = previewComponents[activePreview as TemplateId]
                return Comp ? <Comp isMobile={true} /> : <ClassicPreview isMobile={true} />
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
