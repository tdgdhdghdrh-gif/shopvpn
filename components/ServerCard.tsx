'use client'

import Link from 'next/link'
import { 
  ArrowRight, Users, Activity, Wifi, 
  Film, Gamepad2, Youtube, Sparkles, Server, Gauge,
  Signal, Clock, Shield, Zap, ChevronRight, CheckCircle2,
  Lock, Network, Radio, Cpu, Smartphone
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
}

// โลโก้แอพพร้อม fallback
function getCategoryInfo(category: string) {
  const categories: Record<string, { 
    text: string; 
    icon: any; 
    color: string; 
    bg: string; 
    border: string;
    apps: { name: string; logo: string; fallback: string }[]
  }> = {
    movie: { 
      text: 'สายดูหนังซีรี่ย์', 
      icon: Film, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10', 
      border: 'border-purple-500/20',
      apps: [
        { name: 'Netflix', logo: 'https://img.icons8.com/color/48/netflix.png', fallback: 'N' },
        { name: 'Disney+', logo: 'https://img.icons8.com/color/48/disney-plus.png', fallback: 'D+' },
        { name: 'iQIYI', logo: 'https://img.icons8.com/color/48/iqiyi.png', fallback: 'iQ' },
        { name: 'WeTV', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/WeTV_logo.svg/48px-WeTV_logo.svg.png', fallback: 'W' },
      ]
    },
    game: { 
      text: 'สายเล่นเกม', 
      icon: Gamepad2, 
      color: 'text-green-400', 
      bg: 'bg-green-500/10', 
      border: 'border-green-500/20',
      apps: [
        { name: 'ROV', logo: 'https://i.pinimg.com/736x/ee/9c/78/ee9c78f4f16e24a71db36d08618fbe03.jpg', fallback: 'R' },
        { name: 'PUBG', logo: 'https://img.icons8.com/color/48/pubg.png', fallback: 'P' },
        { name: 'Valorant', logo: 'https://img.icons8.com/color/48/valorant.png', fallback: 'V' },
        { name: 'Free Fire', logo: 'https://i.pinimg.com/736x/d3/47/71/d34771b9bc5cb75b70bd06f643cdbfff.jpg', fallback: 'FF' },
      ]
    },
    streaming: { 
      text: 'สายสตรีมมิ่ง', 
      icon: Youtube, 
      color: 'text-red-400', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20',
      apps: [
        { name: 'YouTube', logo: 'https://img.icons8.com/color/48/youtube-play.png', fallback: 'YT' },
        { name: 'Twitch', logo: 'https://img.icons8.com/color/48/twitch.png', fallback: 'TW' },
        { name: 'TikTok', logo: 'https://img.icons8.com/color/48/tiktok.png', fallback: 'TT' },
        { name: 'Facebook', logo: 'https://img.icons8.com/color/48/facebook.png', fallback: 'FB' },
      ]
    },
    tiktok: { 
      text: 'สายดู TikTok', 
      icon: Sparkles, 
      color: 'text-pink-400', 
      bg: 'bg-pink-500/10', 
      border: 'border-pink-500/20',
      apps: [
        { name: 'TikTok', logo: 'https://img.icons8.com/color/48/tiktok.png', fallback: 'TT' },
        { name: 'Instagram', logo: 'https://img.icons8.com/color/48/instagram-new.png', fallback: 'IG' },
        { name: 'X', logo: 'https://img.icons8.com/color/48/twitterx.png', fallback: 'X' },
        { name: 'Threads', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Threads_%28app%29_logo.svg/48px-Threads_%28app%29_logo.svg.png', fallback: '@' },
      ]
    },
    general: { 
      text: 'สายทั่วไป', 
      icon: Wifi, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/10', 
      border: 'border-cyan-500/20',
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

// แอพ VPN Clients ที่ใช้เชื่อมต่อ
const vpnClients = [
  { name: 'V2Box', logo: 'https://i.pinimg.com/736x/64/ed/7e/64ed7ede0d5e1b89a5ffc910c333fc2d.jpg', fallback: 'V2' },
  { name: 'v2rayNG', logo: 'https://raw.githubusercontent.com/2dust/v2rayNG/master/V2rayNG/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', fallback: 'NG' },
]

// สุ่มค่าต่างๆ
function getRandomPing() { return Math.floor(Math.random() * 14) + 1 }
function getRandomLoad() { return Math.floor(Math.random() * 50) + 5 }
function getRandomUsers() { return Math.floor(Math.random() * 89) + 10 }
function getRandomSlots() { return Math.floor(Math.random() * 45) + 5 }
function getRandomSpeed() {
  const speeds = [100, 200, 500, 1000, 2000, 5000, 10000]
  return speeds[Math.floor(Math.random() * speeds.length)]
}

// Component สำหรับแสดงโลโก้พร้อม fallback
function AppIcon({ app, size = 'sm' }: { app: { name: string; logo: string; fallback: string }; size?: 'sm' | 'md' }) {
  const [failed, setFailed] = useState(false)
  const sizeClass = size === 'md' ? 'w-10 h-10' : 'w-8 h-8'
  const textSize = size === 'md' ? 'text-xs' : 'text-[10px]'

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
  const [users, setUsers] = useState(getRandomUsers())
  const [slots, setSlots] = useState(getRandomSlots())
  const [speed, setSpeed] = useState(server.speed || getRandomSpeed())
  const [hasStarted, setHasStarted] = useState(false)

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
      if (Math.random() > 0.6) setUsers(getRandomUsers())
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

  return (
    <div className="group relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 rounded-2xl p-4 overflow-hidden transition-all hover:border-zinc-600 hover:shadow-xl hover:shadow-cyan-500/10">
      {/* Background Effects */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all" />
      <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="text-2xl">{server.flag}</div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${getStatusColor(server.status)} border-2 border-zinc-900`} />
          </div>
          <div>
            <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors leading-tight">
              {server.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(server.status)} animate-pulse`} />
              <span className="text-[9px] text-zinc-400 uppercase font-medium">{server.status}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-[9px] text-zinc-500 uppercase">{server.protocol}</span>
            </div>
          </div>
        </div>
        <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[9px] font-bold text-cyan-400 uppercase">
          VLESS
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-2.5 relative z-10">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-medium",
          categoryInfo.bg,
          categoryInfo.border,
          categoryInfo.color
        )}>
          <CategoryIcon className="w-3 h-3" />
          {categoryInfo.text}
        </div>
      </div>

      {/* Network Tags */}
      <div className="flex flex-wrap gap-1 mb-2.5 relative z-10">
        {server.supportsAis && (
          <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-medium text-emerald-400">
            AIS 5G/4G
          </div>
        )}
        {server.supportsTrue && (
          <div className="px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-[8px] font-medium text-pink-400">
            TRUE 5G
          </div>
        )}
        {server.supportsDtac && (
          <div className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-medium text-cyan-400">
            DTAC
          </div>
        )}
      </div>

      {/* VPN Clients - แอพที่ใช้เชื่อมต่อ */}
      <div className="mb-3 p-2.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl relative z-10">
        <p className="text-[8px] text-blue-400 uppercase mb-2 flex items-center gap-1.5">
          <Smartphone className="w-3 h-3" />
          แอพที่ใช้เชื่อมต่อ
        </p>
        <div className="flex gap-3">
          {vpnClients.map((app, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <AppIcon app={app} size="md" />
              <span className="text-[8px] text-zinc-400">{app.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Apps */}
      <div className="mb-3 p-2.5 bg-black/40 border border-white/5 rounded-xl relative z-10">
        <p className="text-[8px] text-zinc-500 uppercase mb-2 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
          รองรับแอพเหล่านี้
        </p>
        <div className="flex flex-wrap gap-3">
          {categoryInfo.apps.map((app, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <AppIcon app={app} />
              <span className="text-[8px] text-zinc-400">{app.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Speed Badge */}
      <div className="mb-3 relative z-10">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border border-violet-500/20 rounded-xl">
          <Gauge className="w-4 h-4 text-violet-400" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-zinc-500">ความเร็วเน็ต</div>
              <div className="flex items-center gap-1 text-[9px] text-emerald-400">
                <Signal className="w-2.5 h-2.5" />
                <span>เสถียร</span>
              </div>
            </div>
            <div className="text-sm font-bold text-violet-400 transition-all duration-300">
              {speedDisplay.value} <span className="text-[9px]">{speedDisplay.unit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - 4 items */}
      <div className="grid grid-cols-4 gap-1.5 mb-3 relative z-10">
        <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-center">
          <Clock className="w-3 h-3 text-amber-400 mx-auto mb-0.5" />
          <div className={cn("text-xs font-bold transition-colors duration-300", getPingColor(ping))}>
            {ping < 10 ? `<${ping}` : ping}
          </div>
          <div className="text-[7px] text-zinc-500">ms</div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-center">
          <Activity className="w-3 h-3 text-pink-400 mx-auto mb-0.5" />
          <div className={cn("text-xs font-bold transition-colors duration-300", getLoadColor(load))}>
            {load}%
          </div>
          <div className="text-[7px] text-zinc-500">โหลด</div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-center">
          <Users className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
          <div className="text-xs font-bold text-blue-400 transition-colors duration-300">
            {users}
          </div>
          <div className="text-[7px] text-zinc-500">ผู้ใช้</div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-center">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 mx-auto mb-0.5" />
          <div className="text-xs font-bold text-emerald-400 transition-colors duration-300">
            {slots}
          </div>
          <div className="text-[7px] text-zinc-500">ที่ว่าง</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 relative z-10">
        <div className="flex items-center justify-between text-[9px] mb-1">
          <span className="text-zinc-500">ความหนาเซิร์ฟเวอร์</span>
          <span className={getLoadColor(load)}>{load}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-500", getLoadBgColor(load))}
            style={{ width: `${load}%` }}
          />
        </div>
      </div>

      {/* Tech Specs */}
      <div className="mb-3 p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg relative z-10">
        <div className="grid grid-cols-2 gap-1.5 text-[9px]">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-400">AES-256</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Network className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-400">WebSocket</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-400">Reality</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-400">XTLS</span>
          </div>
        </div>
      </div>

      {/* Server ID & Status */}
      <div className="flex items-center justify-between text-[9px] text-zinc-500 mb-3 relative z-10">
        <div className="flex items-center gap-1">
          <Server className="w-3 h-3" />
          <span>#{server.id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400">พร้อมใช้งาน</span>
        </div>
      </div>

      {/* Connect Button */}
      <Link
        href={user ? `/vpn?server=${server.id}` : '/login'}
        className="group/btn relative w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-cyan-500/25 active:scale-95 text-sm overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
        <Zap className="relative z-10 w-4 h-4" />
        <span className="relative z-10">{user ? 'เชื่อมต่อทันที' : 'เข้าสู่ระบบ'}</span>
        <ChevronRight className="relative z-10 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </Link>
    </div>
  )
}
