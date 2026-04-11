'use client'

import Link from 'next/link'
import { 
  Zap, Users, Activity, Wifi, 
  Film, Gamepad2, Youtube, Sparkles, Gauge,
  Signal, Clock, Shield, ChevronRight, CheckCircle2,
  Lock, Network, Radio, Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useMemo } from 'react'

interface Server {
  id: string
  name: string
  flag: string
  status: string
  protocol: string
  ping: number
  load: number
  speed?: number
  category?: string
  supportsAis?: boolean
  supportsTrue?: boolean
  supportsDtac?: boolean
  userCount?: number
  // Per-server pricing & decoration
  pricePerDay?: number
  priceWeekly?: number | null
  priceMonthly?: number | null
  description?: string | null
  badge?: string | null
  tags?: string[]
  themeColor?: string | null
  themeGradient?: string | null
  imageUrl?: string | null
  sortOrder?: number
  maxClients?: number
  defaultIpLimit?: number
}

// Category info with app logos & fallbacks
function getCategoryInfo(category: string) {
  const categories: Record<string, { 
    text: string; 
    icon: any; 
    color: string; 
    bg: string; 
    border: string;
    gradient: string;
    apps: { name: string; logo: string; fallback: string }[]
  }> = {
    movie: { 
      text: 'สายดูหนัง', 
      icon: Film, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10', 
      border: 'border-purple-500/20',
      gradient: 'from-purple-500/20 to-purple-500/5',
      apps: [
        { name: 'Netflix', logo: 'https://img.icons8.com/color/48/netflix.png', fallback: 'N' },
        { name: 'Disney+', logo: 'https://img.icons8.com/color/48/disney-plus.png', fallback: 'D+' },
        { name: 'iQIYI', logo: 'https://img.icons8.com/color/48/iqiyi.png', fallback: 'iQ' },
        { name: 'WeTV', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/WeTV_logo.svg/48px-WeTV_logo.svg.png', fallback: 'W' },
      ]
    },
    game: { 
      text: 'สายเกม', 
      icon: Gamepad2, 
      color: 'text-green-400', 
      bg: 'bg-green-500/10', 
      border: 'border-green-500/20',
      gradient: 'from-green-500/20 to-green-500/5',
      apps: [
        { name: 'ROV', logo: 'https://i.pinimg.com/736x/ee/9c/78/ee9c78f4f16e24a71db36d08618fbe03.jpg', fallback: 'R' },
        { name: 'PUBG', logo: 'https://img.icons8.com/color/48/pubg.png', fallback: 'P' },
        { name: 'Valorant', logo: 'https://img.icons8.com/color/48/valorant.png', fallback: 'V' },
        { name: 'Free Fire', logo: 'https://i.pinimg.com/736x/d3/47/71/d34771b9bc5cb75b70bd06f643cdbfff.jpg', fallback: 'FF' },
      ]
    },
    streaming: { 
      text: 'สายสตรีม', 
      icon: Youtube, 
      color: 'text-red-400', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20',
      gradient: 'from-red-500/20 to-red-500/5',
      apps: [
        { name: 'YouTube', logo: 'https://img.icons8.com/color/48/youtube-play.png', fallback: 'YT' },
        { name: 'Twitch', logo: 'https://img.icons8.com/color/48/twitch.png', fallback: 'TW' },
        { name: 'TikTok', logo: 'https://img.icons8.com/color/48/tiktok.png', fallback: 'TT' },
        { name: 'Facebook', logo: 'https://img.icons8.com/color/48/facebook.png', fallback: 'FB' },
      ]
    },
    tiktok: { 
      text: 'สาย TikTok', 
      icon: Sparkles, 
      color: 'text-pink-400', 
      bg: 'bg-pink-500/10', 
      border: 'border-pink-500/20',
      gradient: 'from-pink-500/20 to-pink-500/5',
      apps: [
        { name: 'TikTok', logo: 'https://img.icons8.com/color/48/tiktok.png', fallback: 'TT' },
        { name: 'Instagram', logo: 'https://img.icons8.com/color/48/instagram-new.png', fallback: 'IG' },
        { name: 'X', logo: 'https://img.icons8.com/color/48/twitterx.png', fallback: 'X' },
        { name: 'Threads', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Threads_%28app%29_logo.svg/48px-Threads_%28app%29_logo.svg.png', fallback: '@' },
      ]
    },
    general: { 
      text: 'ทั่วไป', 
      icon: Wifi, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/10', 
      border: 'border-cyan-500/20',
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      apps: [
        { name: 'Chrome', logo: 'https://img.icons8.com/color/48/chrome.png', fallback: 'C' },
        { name: 'Line', logo: 'https://img.icons8.com/color/48/line-me.png', fallback: 'L' },
        { name: 'Discord', logo: 'https://img.icons8.com/color/48/discord-logo.png', fallback: 'D' },
        { name: 'Telegram', logo: 'https://img.icons8.com/color/48/telegram-app.png', fallback: 'TG' },
      ]
    },
  }
  return categories[category] || categories.general
}

// VPN client apps
const vpnClients = [
  { name: 'V2Box', logo: 'https://i.pinimg.com/736x/64/ed/7e/64ed7ede0d5e1b89a5ffc910c333fc2d.jpg', fallback: 'V2' },
  { name: 'v2rayNG', logo: 'https://raw.githubusercontent.com/2dust/v2rayNG/master/V2rayNG/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', fallback: 'NG' },
]

// Seeded badge system
const serverBadges = [
  { text: 'ลดราคา!', emoji: '🔥', bg: 'bg-red-500/15', border: 'border-red-500/30', textColor: 'text-red-400', animation: 'animate-badge-bounce' },
  { text: 'คุ้มสุดๆ', emoji: '💰', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', textColor: 'text-yellow-400', animation: 'animate-badge-wiggle' },
  { text: 'แรงมาก!', emoji: '⚡', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', textColor: 'text-cyan-400', animation: 'animate-badge-pulse' },
  { text: 'ขายดี!', emoji: '🏆', bg: 'bg-amber-500/15', border: 'border-amber-500/30', textColor: 'text-amber-400', animation: 'animate-badge-bounce' },
  { text: 'แนะนำ!', emoji: '⭐', bg: 'bg-purple-500/15', border: 'border-purple-500/30', textColor: 'text-purple-400', animation: 'animate-badge-wiggle' },
  { text: 'ใหม่ล่าสุด', emoji: '✨', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', textColor: 'text-emerald-400', animation: 'animate-badge-shimmer' },
  { text: 'ถูกมาก!', emoji: '🎉', bg: 'bg-pink-500/15', border: 'border-pink-500/30', textColor: 'text-pink-400', animation: 'animate-badge-bounce' },
  { text: 'เสถียรสุด', emoji: '🛡️', bg: 'bg-blue-500/15', border: 'border-blue-500/30', textColor: 'text-blue-400', animation: 'animate-badge-pulse' },
  { text: 'ยอดนิยม', emoji: '💎', bg: 'bg-violet-500/15', border: 'border-violet-500/30', textColor: 'text-violet-400', animation: 'animate-badge-wiggle' },
  { text: 'โปรพิเศษ', emoji: '🎁', bg: 'bg-rose-500/15', border: 'border-rose-500/30', textColor: 'text-rose-400', animation: 'animate-badge-shimmer' },
]

function getBadgeForServer(serverId: string) {
  let hash = 0
  for (let i = 0; i < serverId.length; i++) {
    hash = ((hash << 5) - hash) + serverId.charCodeAt(i)
    hash |= 0
  }
  return serverBadges[Math.abs(hash) % serverBadges.length]
}

// Random stat generators
function getRandomPing() { return Math.floor(Math.random() * 14) + 1 }
function getRandomLoad() { return Math.floor(Math.random() * 50) + 5 }
function getRandomUsers() { return Math.floor(Math.random() * 89) + 10 }
function getRandomSlots() { return Math.floor(Math.random() * 45) + 5 }
function getRandomSpeed() {
  const speeds = [100, 200, 500, 1000, 2000, 5000, 10000]
  return speeds[Math.floor(Math.random() * speeds.length)]
}

// Logo component with fallback
function AppIcon({ app, size = 'sm' }: { app: { name: string; logo: string; fallback: string }; size?: 'sm' | 'md' }) {
  const [failed, setFailed] = useState(false)
  const sizeClass = size === 'md' ? 'w-8 h-8' : 'w-6 h-6'
  const textSize = size === 'md' ? 'text-[9px]' : 'text-[8px]'

  if (failed) {
    return (
      <div className={cn(
        sizeClass,
        "rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center font-bold text-white border border-zinc-600",
        textSize
      )}>
        {app.fallback}
      </div>
    )
  }

  return (
    <div className={cn(sizeClass, "rounded-lg bg-zinc-800/50 p-0.5 flex items-center justify-center overflow-hidden")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={app.logo} 
        alt={app.name}
        className="w-full h-full object-contain"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  )
}

export default function ServerCard({ server, user, totalServers = 1 }: { server: Server, user: any, totalServers?: number }) {
  const initialDelay = useMemo(() => Math.random() * 3000, [])
  
  const [ping, setPing] = useState(getRandomPing())
  const [load, setLoad] = useState(getRandomLoad())
  const [slots, setSlots] = useState(getRandomSlots())
  const [speed, setSpeed] = useState(server.speed || getRandomSpeed())
  const [hasStarted, setHasStarted] = useState(false)

  // ใช้จำนวนผู้ใช้จริงจาก server
  const realUsers = server.userCount ?? 0

  useEffect(() => {
    const startTimeout = setTimeout(() => setHasStarted(true), initialDelay)
    return () => clearTimeout(startTimeout)
  }, [initialDelay])

  useEffect(() => {
    if (!hasStarted) return
    const intervalTime = 1500 + Math.random() * 2500
    
    const interval = setInterval(() => {
      setPing(getRandomPing())
      setLoad(getRandomLoad())
      if (Math.random() > 0.8) setSpeed(getRandomSpeed())
      if (Math.random() > 0.7) setSlots(getRandomSlots())
    }, intervalTime)

    return () => clearInterval(interval)
  }, [hasStarted])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'bg-emerald-400'
      case 'busy': return 'bg-amber-400'
      case 'offline': return 'bg-rose-500'
      default: return 'bg-zinc-500'
    }
  }

  const getLoadColor = (loadValue: number) => {
    if (loadValue < 40) return 'text-emerald-400'
    if (loadValue < 70) return 'text-amber-400'
    return 'text-rose-400'
  }

  const getLoadBgColor = (loadValue: number) => {
    if (loadValue < 40) return 'bg-emerald-400'
    if (loadValue < 70) return 'bg-amber-400'
    return 'bg-rose-400'
  }

  const getPingColor = (pingValue: number) => {
    if (pingValue < 15) return 'text-emerald-400'
    if (pingValue < 30) return 'text-amber-400'
    return 'text-rose-400'
  }

  const getSpeedDisplay = (speedValue: number) => {
    if (speedValue >= 1000) {
      return { value: (speedValue / 1000).toFixed(speedValue >= 10000 ? 0 : 1), unit: 'Gbps' }
    }
    return { value: speedValue.toString(), unit: 'Mbps' }
  }

  const speedDisplay = getSpeedDisplay(speed)
  const categoryInfo = getCategoryInfo(server.category || 'general')
  const CategoryIcon = categoryInfo.icon
  
  // Use custom badge from admin if set, otherwise use deterministic badge
  const badge = useMemo(() => {
    if (server.badge) {
      // Find matching predefined badge or create custom one
      const predefined = serverBadges.find(b => b.text === server.badge)
      if (predefined) return predefined
      return { 
        text: server.badge, 
        emoji: '✨', 
        bg: 'bg-amber-500/15', 
        border: 'border-amber-500/30', 
        textColor: 'text-amber-400', 
        animation: 'animate-badge-wiggle' 
      }
    }
    return getBadgeForServer(server.id)
  }, [server.id, server.badge])
  const networks = [
    server.supportsAis && { name: 'AIS', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    server.supportsTrue && { name: 'TRUE', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    server.supportsDtac && { name: 'DTAC', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  ].filter(Boolean) as { name: string; color: string }[]

  return (
    <div 
      className="group relative bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-xl card-hover-glow"
      style={server.themeColor ? { borderColor: `${server.themeColor}20` } : undefined}
    >
      
      {/* Top gradient accent bar */}
      {server.themeGradient ? (
        <div className="h-0.5" style={{ background: server.themeGradient }} />
      ) : (
        <div className={cn("h-0.5 bg-gradient-to-r", categoryInfo.gradient)} />
      )}

      {/* Card body */}
      <div className="p-4">
        
        {/* Row 1: Header - Flag, Name, Status + Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="text-2xl leading-none">{server.flag}</div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900",
                getStatusColor(server.status)
              )} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-white group-hover:text-zinc-300 transition-colors truncate">
                {server.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-zinc-500 uppercase font-medium">{server.protocol}</span>
                <span className="text-zinc-700">|</span>
                <span className="text-[9px] text-zinc-500 uppercase">VLESS</span>
              </div>
            </div>
          </div>
          {/* Promo badge */}
          <div className={cn(
            "shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold",
            badge.bg, badge.border, badge.textColor, badge.animation
          )}>
            <span className="text-[10px]">{badge.emoji}</span>
            {badge.text}
          </div>
        </div>

        {/* Row 2: Category + Network tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <div className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-medium",
            categoryInfo.bg, categoryInfo.border, categoryInfo.color
          )}>
            <CategoryIcon className="w-3 h-3" />
            {categoryInfo.text}
          </div>
          {networks.map((net) => (
            <div key={net.name} className={cn(
              "px-1.5 py-0.5 rounded-md border text-[8px] font-semibold",
              net.color
            )}>
              {net.name}
            </div>
          ))}
          {server.tags && server.tags.length > 0 && server.tags.map((tag) => (
            <div key={tag} className="px-1.5 py-0.5 rounded-md border text-[8px] font-medium bg-zinc-800/50 border-zinc-700/50 text-zinc-400">
              {tag}
            </div>
          ))}
        </div>

        {/* Description (if set by admin) */}
        {server.description && (
          <p className="text-[10px] text-zinc-500 mb-3 leading-relaxed line-clamp-2">{server.description}</p>
        )}

        {/* Price display */}
        <div className="mb-3 flex items-center justify-between px-3 py-2 bg-gradient-to-r from-emerald-500/8 to-cyan-500/8 border border-emerald-500/15 rounded-xl">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{server.pricePerDay ?? 2}</span>
            <span className="text-[10px] text-zinc-500">฿/วัน</span>
          </div>
          <div className="flex items-center gap-2">
            {server.priceWeekly != null && (
              <span className="text-[9px] text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded">7วัน {server.priceWeekly}฿</span>
            )}
            {server.priceMonthly != null && (
              <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">30วัน {server.priceMonthly}฿</span>
            )}
          </div>
        </div>

        {/* Row 3: Speed display */}
        <div className="mb-3 flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r from-violet-500/8 to-fuchsia-500/8 border border-violet-500/15 rounded-xl">
          <Gauge className="w-4 h-4 text-violet-400 shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <div>
              <div className="text-[9px] text-zinc-500">ความเร็ว</div>
              <div className="text-sm font-bold text-violet-400 leading-tight transition-all duration-300">
                {speedDisplay.value} <span className="text-[9px] font-medium">{speedDisplay.unit}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-emerald-400">
              <Signal className="w-3 h-3" />
              <span>เสถียร</span>
            </div>
          </div>
        </div>

        {/* Row 4: Stats grid - Ping, Load, Users, Slots */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          <div className="bg-black/30 border border-white/5 rounded-lg py-1.5 px-1 text-center">
            <Clock className="w-3 h-3 text-amber-400 mx-auto mb-0.5" />
            <div className={cn("text-[11px] font-bold transition-colors duration-300 leading-tight", getPingColor(ping))}>
              {ping < 10 ? `<${ping}` : ping}
            </div>
            <div className="text-[7px] text-zinc-600">ms</div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-lg py-1.5 px-1 text-center">
            <Activity className="w-3 h-3 text-pink-400 mx-auto mb-0.5" />
            <div className={cn("text-[11px] font-bold transition-colors duration-300 leading-tight", getLoadColor(load))}>
              {load}%
            </div>
            <div className="text-[7px] text-zinc-600">โหลด</div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-lg py-1.5 px-1 text-center">
            <Users className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
            <div className="text-[11px] font-bold text-blue-400 transition-colors duration-300 leading-tight">
              {realUsers}
            </div>
            <div className="text-[7px] text-zinc-600">ผู้ใช้</div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-lg py-1.5 px-1 text-center">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 mx-auto mb-0.5" />
            <div className={cn("text-[11px] font-bold transition-colors duration-300 leading-tight", 
              server.maxClients && server.maxClients > 0 
                ? (server.maxClients - realUsers <= 5 ? 'text-amber-400' : 'text-emerald-400')
                : 'text-emerald-400'
            )}>
              {server.maxClients && server.maxClients > 0 
                ? Math.max(0, server.maxClients - realUsers)
                : slots}
            </div>
            <div className="text-[7px] text-zinc-600">ที่ว่าง</div>
          </div>
        </div>

        {/* Row 5: Load progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[9px] mb-1">
            <span className="text-zinc-600">โหลดเซิร์ฟเวอร์</span>
            <span className={getLoadColor(load)}>{load}%</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", getLoadBgColor(load))}
              style={{ width: `${load}%` }}
            />
          </div>
        </div>

        {/* Row 6: Apps supported - compact */}
        <div className="mb-3 p-2.5 bg-black/30 border border-white/5 rounded-xl">
          <p className="text-[8px] text-zinc-500 uppercase mb-2 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            รองรับแอพ
          </p>
          <div className="flex items-center gap-2">
            {categoryInfo.apps.map((app, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <AppIcon app={app} />
                <span className="text-[7px] text-zinc-500">{app.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 7: VPN Clients + Tech Specs - combined row */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {/* VPN Clients */}
          <div className="p-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <p className="text-[7px] text-zinc-400 uppercase mb-1.5 flex items-center gap-1">
              <Smartphone className="w-2.5 h-2.5" />
              แอพเชื่อมต่อ
            </p>
            <div className="flex gap-2">
              {vpnClients.map((app, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <AppIcon app={app} size="md" />
                  <span className="text-[7px] text-zinc-500">{app.name}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Tech Specs */}
          <div className="p-2 bg-zinc-900/50 border border-white/5 rounded-lg">
            <p className="text-[7px] text-zinc-500 uppercase mb-1.5 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              เทคโนโลยี
            </p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px]">
              <div className="flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-zinc-600" />
                <span className="text-zinc-400">AES-256</span>
              </div>
              <div className="flex items-center gap-1">
                <Network className="w-2.5 h-2.5 text-zinc-600" />
                <span className="text-zinc-400">WS</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-zinc-600" />
                <span className="text-zinc-400">Reality</span>
              </div>
              <div className="flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-zinc-600" />
                <span className="text-zinc-400">XTLS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connect Button */}
        <Link
          href={user ? `/vpn?server=${server.id}` : '/login'}
          className="group/btn relative w-full py-2.5 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 transition-all hover:bg-zinc-200 active:scale-[0.98] text-xs overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          <Zap className="relative z-10 w-3.5 h-3.5" />
          <span className="relative z-10">{user ? 'เชื่อมต่อทันที' : 'เข้าสู่ระบบ'}</span>
          <ChevronRight className="relative z-10 w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
