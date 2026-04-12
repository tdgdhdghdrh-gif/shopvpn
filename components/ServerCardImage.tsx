'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Wifi, Server, Zap } from 'lucide-react'

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

// Badge mapping
const BADGE_MAP: Record<string, { emoji: string; bg: string; text: string }> = {
  'hot': { emoji: '🔥', bg: 'bg-red-500', text: 'HOT' },
  'new': { emoji: '✨', bg: 'bg-emerald-500', text: 'NEW' },
  'sale': { emoji: '💰', bg: 'bg-yellow-500', text: 'SALE' },
  'best': { emoji: '⭐', bg: 'bg-purple-500', text: 'BEST' },
  'popular': { emoji: '💎', bg: 'bg-violet-500', text: 'ยอดนิยม' },
  'recommended': { emoji: '👍', bg: 'bg-blue-500', text: 'แนะนำ' },
}

function ServerImageCard({ server, user, defaultPrices }: { 
  server: Server; 
  user: any;
  defaultPrices?: { daily: number; weekly: number; monthly: number }
}) {
  const [imgError, setImgError] = useState(false)

  // Calculate price range
  const daily = server.pricePerDay ?? defaultPrices?.daily ?? 4
  const monthly = server.priceMonthly ?? defaultPrices?.monthly ?? 100
  const priceRange = daily === monthly ? `${daily}` : `${daily} - ${monthly}`

  // Badge
  const badgeKey = server.badge?.toLowerCase() || ''
  const badgeInfo = BADGE_MAP[badgeKey]

  // Category text
  const categoryLabels: Record<string, string> = {
    movie: 'สายดูหนัง',
    game: 'สายเกม',
    streaming: 'สายสตรีม',
    tiktok: 'สาย TikTok',
    general: 'ทั่วไป',
  }
  const categoryText = categoryLabels[server.category || 'general'] || 'ทั่วไป'

  // Tag count
  const tagCount = server.tags?.length ?? 0

  // Status
  const isOnline = server.status?.toLowerCase() === 'online'

  return (
    <Link
      href={`/vpn?server=${server.id}`}
      className="group block rounded-2xl border border-white/[0.06] bg-zinc-900/60 overflow-hidden transition-all hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
    >
      {/* Image Area */}
      <div className="relative w-full bg-zinc-800/80 overflow-hidden">
        {server.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={server.imageUrl}
            alt={server.name}
            className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          /* Fallback: gradient + flag + name */
          <div className={cn(
            "w-full aspect-[16/9] flex flex-col items-center justify-center gap-3",
            server.themeGradient
              ? `bg-gradient-to-br ${server.themeGradient}`
              : "bg-gradient-to-br from-zinc-800 via-zinc-900 to-black"
          )}>
            <span className="text-5xl">{server.flag}</span>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-bold text-zinc-400">{server.name}</span>
            </div>
          </div>
        )}

        {/* Badge overlay (top-right) */}
        {badgeInfo && (
          <div className={cn(
            "absolute top-3 right-3 px-2.5 py-1 rounded-lg text-white text-[11px] font-bold shadow-lg",
            badgeInfo.bg
          )}>
            {badgeInfo.emoji} {badgeInfo.text}
          </div>
        )}

        {/* Status dot (top-left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
          <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
          <span className="text-[10px] font-bold text-white/80">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4">
        {/* Server Name */}
        <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
          {server.flag} {server.name}
        </h3>

        {/* Bottom row: category + count + price */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-medium">
            <span>{categoryText}</span>
            {tagCount > 0 && (
              <span>{tagCount} แท็ก</span>
            )}
          </div>
          <div className="text-sm font-bold text-cyan-400">
            {priceRange} <span className="text-[10px] text-zinc-500 font-medium">บาท</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ServerCardImageList({ servers, user, defaultPrices }: {
  servers: Server[]
  user: any
  defaultPrices?: { daily: number; weekly: number; monthly: number }
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {servers.length === 0 ? (
        <div className="col-span-full py-20 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4">
            <Wifi className="w-6 h-6 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-400 font-medium">ยังไม่มีเซิร์ฟเวอร์</p>
          <p className="text-xs text-zinc-600 mt-1">กรุณาติดต่อแอดมินเพื่อเพิ่มเซิร์ฟเวอร์</p>
        </div>
      ) : (
        servers.map((server) => (
          <ServerImageCard
            key={server.id}
            server={server}
            user={user}
            defaultPrices={defaultPrices}
          />
        ))
      )}
    </div>
  )
}
