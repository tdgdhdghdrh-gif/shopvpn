'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Trophy, Crown, Medal, Flame, Zap,
  Users, Hash, ChevronDown, ChevronUp,
  Sparkles, Star, Wifi
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────
interface LeaderboardEntry {
  rank: number
  name: string
  avatar: string | null
  dataUsage: number
  joinedAt: string | null
}

interface Stats {
  totalUsage: number
  totalUsers: number
  activeUsers: number
}

// ─── Format bytes to GB/MB ───────────────────────────────────────
function formatDataUsage(bytes: number): string {
  if (bytes === 0) return '0 MB'
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`
  }
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`
  }
  const kb = bytes / 1024
  return `${kb.toFixed(2)} KB`
}

// ─── Animated Counter ────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const start = Date.now()
    const from = 0
    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(from + (value - from) * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

// ─── Podium Card (Top 3) ─────────────────────────────────────────
function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: 1 | 2 | 3 }) {
  const config = {
    1: {
      gradient: 'from-yellow-400 via-amber-400 to-yellow-500',
      glow: 'shadow-yellow-500/40',
      border: 'border-yellow-500/25',
      bg: 'bg-yellow-500/[0.06]',
      textColor: 'text-yellow-400',
      avatarBorder: 'ring-yellow-500/40',
      shimmer: 'from-transparent via-yellow-400/10 to-transparent',
      size: 'w-20 h-20 sm:w-24 sm:h-24',
      avatarSize: 'w-16 h-16 sm:w-20 sm:h-20',
      rankSize: 'text-2xl sm:text-3xl',
      nameSize: 'text-sm sm:text-lg',
      amountSize: 'text-base sm:text-xl',
      delay: 'animation-delay: 0.3s',
      mt: '',
    },
    2: {
      gradient: 'from-zinc-300 via-zinc-200 to-zinc-400',
      glow: 'shadow-zinc-300/20',
      border: 'border-zinc-400/20',
      bg: 'bg-zinc-400/[0.04]',
      textColor: 'text-zinc-300',
      avatarBorder: 'ring-zinc-400/30',
      shimmer: 'from-transparent via-zinc-300/10 to-transparent',
      size: 'w-16 h-16 sm:w-20 sm:h-20',
      avatarSize: 'w-12 h-12 sm:w-16 sm:h-16',
      rankSize: 'text-xl sm:text-2xl',
      nameSize: 'text-xs sm:text-sm',
      amountSize: 'text-xs sm:text-base',
      delay: 'animation-delay: 0.5s',
      mt: 'mt-6 sm:mt-10',
    },
    3: {
      gradient: 'from-orange-500 via-orange-400 to-amber-600',
      glow: 'shadow-orange-500/20',
      border: 'border-orange-500/20',
      bg: 'bg-orange-500/[0.04]',
      textColor: 'text-orange-400',
      avatarBorder: 'ring-orange-500/30',
      shimmer: 'from-transparent via-orange-400/10 to-transparent',
      size: 'w-16 h-16 sm:w-20 sm:h-20',
      avatarSize: 'w-12 h-12 sm:w-16 sm:h-16',
      rankSize: 'text-xl sm:text-2xl',
      nameSize: 'text-xs sm:text-sm',
      amountSize: 'text-xs sm:text-base',
      delay: 'animation-delay: 0.7s',
      mt: 'mt-6 sm:mt-10',
    },
  }[place]

  const icons = { 1: Crown, 2: Medal, 3: Medal }
  const Icon = icons[place]

  return (
    <div
      className={`relative flex flex-col items-center text-center ${config.mt} lb-fade-up`}
      style={{ animationDelay: `${0.2 + place * 0.15}s` }}
    >
      {/* Glow ring behind avatar (place 1 only) */}
      {place === 1 && (
        <div className="absolute top-4 sm:top-2 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-yellow-500/[0.08] blur-2xl pointer-events-none lb-pulse-slow" />
      )}

      {/* Rank badge */}
      <div className={`relative ${config.size} bg-gradient-to-br ${config.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl ${config.glow} z-10`}>
        <Icon className={`${place === 1 ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-6 h-6 sm:w-8 sm:h-8'} text-white drop-shadow-md`} />
        {/* Shimmer overlay */}
        <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${config.shimmer} lb-shimmer`} />
        </div>
      </div>

      {/* Avatar */}
      <div className={`relative -mt-3 z-20`}>
        {entry.avatar ? (
          <img
            src={entry.avatar}
            alt=""
            className={`${config.avatarSize} rounded-xl sm:rounded-2xl object-cover ring-2 ${config.avatarBorder} shadow-xl`}
          />
        ) : (
          <div className={`${config.avatarSize} rounded-xl sm:rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center shadow-xl`}>
            <span className={`${config.rankSize} font-black ${config.textColor}`}>
              {entry.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Place number pill */}
        <div className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center shadow-lg ${config.glow} text-[10px] sm:text-xs font-black text-white`}>
          {place}
        </div>
      </div>

      {/* Name */}
      <p className={`${config.nameSize} font-black text-white mt-3 max-w-full truncate px-1`}>
        {entry.name}
      </p>

      {/* Data Usage */}
      <p className={`${config.amountSize} font-black ${config.textColor} mt-0.5`}>
        {formatDataUsage(entry.dataUsage)}
      </p>

      {/* Label */}
      <p className="text-[9px] sm:text-[10px] text-zinc-600 mt-0.5 font-bold">
        ใช้เน็ตสะสม
      </p>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/leaderboard')
      const data = await res.json()
      if (data.success) {
        setLeaderboard(data.leaderboard)
        setStats(data.stats)
      }
    } catch {
      console.error('Failed to fetch leaderboard')
    } finally {
      setLoading(false)
      setTimeout(() => setReady(true), 50)
    }
  }

  const displayedLeaderboard = showAll ? leaderboard : leaderboard.slice(0, 10)
  const restLeaderboard = displayedLeaderboard.filter(e => e.rank > 3)

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-dvh bg-black text-white">
        <LbStyles />
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14">
              <Link href="/" className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95">
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <div className="ml-3">
                <h1 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  อันดับการใช้เน็ต
                </h1>
                <p className="text-[10px] text-zinc-500">กำลังโหลด...</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-32 gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[3px] border-yellow-500/10 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-3 border-[3px] border-amber-400/10 rounded-full" />
            <div className="absolute inset-3 border-[3px] border-amber-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-500/40" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-zinc-400">กำลังโหลดอันดับ</p>
            <p className="text-[10px] text-zinc-600">โปรดรอสักครู่...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-dvh bg-transparent text-white ${ready ? 'lb-ready' : ''}`}>
      <LbStyles />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-25%] left-[-20%] w-[80%] h-[60%] bg-yellow-600/[0.04] rounded-full blur-[200px]" />
        <div className="absolute bottom-[-25%] right-[-20%] w-[70%] h-[50%] bg-amber-600/[0.03] rounded-full blur-[200px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40%] h-[30%] bg-orange-500/[0.02] rounded-full blur-[150px]" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-yellow-400/30 lb-float-particle"
            style={{
              left: `${12 + i * 11}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + (i % 3) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    อันดับการใช้เน็ต
                  </h1>
                </div>
                <p className="text-[10px] text-zinc-500">ผู้ใช้เน็ตสะสมมากที่สุด</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">

        {/* ─── Hero Section with Stats ─── */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl lb-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/[0.1] via-zinc-900/80 to-amber-500/[0.05]" />
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative border border-white/[0.06] rounded-2xl sm:rounded-3xl p-5 sm:p-8">
            {/* Trophy icon + title */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/30">
                  <Wifi className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
                </div>
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent lb-shimmer" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full lb-sparkle shadow-lg shadow-yellow-400/50" />
                <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 bg-amber-300 rounded-full lb-sparkle" style={{ animationDelay: '0.5s' }} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  อันดับการใช้เน็ต
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  ผู้ใช้เน็ตสะสมมากที่สุดในระบบ
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 sm:mt-6 pt-5 border-t border-white/5">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center lb-fade-up" style={{ animationDelay: '0.3s' }}>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  </div>
                  <p className="text-lg sm:text-2xl font-black text-white">
                    <AnimatedNumber value={stats.activeUsers} />
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">ผู้ใช้งาน</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center lb-fade-up" style={{ animationDelay: '0.4s' }}>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <p className="text-lg sm:text-2xl font-black text-emerald-400">
                    {formatDataUsage(stats.totalUsage)}
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">เน็ตรวม</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center lb-fade-up" style={{ animationDelay: '0.5s' }}>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  </div>
                  <p className="text-lg sm:text-2xl font-black text-cyan-400">
                    <AnimatedNumber value={stats.totalUsers} />
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">ผู้ใช้ทั้งหมด</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ─── LEADERBOARD ─── */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* ─── Top 3 Podium ─── */}
          {leaderboard.length >= 3 && (
            <div className="relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.04] rounded-2xl sm:rounded-3xl px-3 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-yellow-500/[0.06] rounded-full blur-3xl pointer-events-none" />

              {/* Title */}
              <div className="relative text-center mb-6 sm:mb-8 lb-fade-up" style={{ animationDelay: '0.15s' }}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/15 rounded-full">
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-[10px] sm:text-xs font-black text-yellow-400 uppercase tracking-widest">Top 3</span>
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                </div>
              </div>

              {/* Podium grid: [2nd] [1st] [3rd] */}
              <div className="grid grid-cols-3 gap-1 sm:gap-4 items-end">
                <PodiumCard entry={leaderboard[1]} place={2} />
                <PodiumCard entry={leaderboard[0]} place={1} />
                <PodiumCard entry={leaderboard[2]} place={3} />
              </div>

              {/* Podium base */}
              <div className="grid grid-cols-3 gap-1 sm:gap-4 mt-3 sm:mt-4">
                <div className="h-6 sm:h-8 bg-gradient-to-t from-zinc-400/10 to-zinc-400/5 border border-zinc-400/10 rounded-lg sm:rounded-xl" />
                <div className="h-9 sm:h-12 bg-gradient-to-t from-yellow-500/15 to-yellow-500/5 border border-yellow-500/15 rounded-lg sm:rounded-xl" />
                <div className="h-4 sm:h-6 bg-gradient-to-t from-orange-500/10 to-orange-500/5 border border-orange-500/10 rounded-lg sm:rounded-xl" />
              </div>
            </div>
          )}

          {/* ─── Full List ─── */}
          <div className="space-y-2">
            <h3 className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest px-1 lb-fade-up" style={{ animationDelay: '0.4s' }}>
              อันดับทั้งหมด ({leaderboard.length} คน)
            </h3>

            {restLeaderboard.map((entry, i) => {
              const isTop3 = entry.rank <= 3
              const colors = {
                1: { bg: 'bg-yellow-500/[0.05]', border: 'border-yellow-500/15 hover:border-yellow-500/30', text: 'text-yellow-400', accent: 'from-yellow-500/50 via-yellow-500/10 to-transparent', badge: 'from-yellow-400 to-amber-500', glow: 'shadow-yellow-500/20' },
                2: { bg: 'bg-zinc-400/[0.03]', border: 'border-zinc-400/10 hover:border-zinc-400/20', text: 'text-zinc-300', accent: 'from-zinc-400/40 via-zinc-400/10 to-transparent', badge: 'from-zinc-300 to-zinc-400', glow: 'shadow-zinc-400/15' },
                3: { bg: 'bg-orange-500/[0.03]', border: 'border-orange-500/10 hover:border-orange-500/20', text: 'text-orange-400', accent: 'from-orange-500/40 via-orange-500/10 to-transparent', badge: 'from-orange-500 to-amber-600', glow: 'shadow-orange-500/15' },
              } as Record<number, any>

              const c = colors[entry.rank] || {
                bg: 'bg-white/[0.015]',
                border: 'border-white/5 hover:border-white/10',
                text: 'text-white',
                accent: null,
                badge: null,
                glow: '',
              }

              return (
                <div
                  key={entry.rank}
                  className={`relative overflow-hidden flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all ${c.bg} ${c.border} lb-fade-up`}
                  style={{ animationDelay: `${0.4 + i * 0.05}s` }}
                >
                  {/* Top accent line */}
                  {c.accent && (
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.accent}`} />
                  )}

                  {/* Rank */}
                  {c.badge ? (
                    <div className={`relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${c.badge} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${c.glow} flex-shrink-0`}>
                      {entry.rank === 1 ? (
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      )}
                      {entry.rank === 1 && (
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent lb-shimmer" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-sm sm:text-base font-black text-zinc-500">#{entry.rank}</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm sm:text-base font-bold text-white truncate">{entry.name}</p>
                      {entry.rank === 1 && <Flame className="w-4 h-4 text-yellow-400 flex-shrink-0 lb-flicker" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] sm:text-[11px] text-zinc-600 font-bold">
                        ใช้เน็ตสะสม
                      </span>
                      {isTop3 && (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black ${
                          entry.rank === 1 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          entry.rank === 2 ? 'bg-zinc-400/10 text-zinc-400 border border-zinc-400/15' :
                          'bg-orange-500/10 text-orange-400 border border-orange-500/15'
                        }`}>
                          <Star className="w-2.5 h-2.5" />
                          TOP {entry.rank}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Data Usage */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm sm:text-base font-black ${c.text}`}>
                      {formatDataUsage(entry.dataUsage)}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <Wifi className="w-3 h-3 text-emerald-500/70" />
                      <span className="text-[9px] text-emerald-500/70 font-bold">ใช้เน็ต</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Show More / Less */}
            {leaderboard.length > 10 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] rounded-2xl text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-all active:scale-[0.98]"
              >
                {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showAll ? 'แสดงน้อยลง' : `ดูทั้งหมด (${leaderboard.length} คน)`}
              </button>
            )}

            {leaderboard.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto">
                  <Trophy className="w-10 h-10 text-zinc-700" />
                </div>
                <h3 className="text-lg font-bold text-white mt-5">ยังไม่มีข้อมูล</h3>
                <p className="text-xs text-zinc-500 mt-1.5">ยังไม่มีผู้ใช้งานเน็ตในระบบ</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl sm:rounded-2xl lb-fade-up" style={{ animationDelay: '0.6s' }}>
          <Sparkles className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] sm:text-xs font-bold text-zinc-500">หมายเหตุ</p>
            <p className="text-[10px] sm:text-[11px] text-zinc-600 leading-relaxed">
              อันดับคำนวณจากปริมาณการใช้เน็ตสะสมของแต่ละผู้ใช้ ชื่อผู้ใช้ถูกซ่อนบางส่วนเพื่อความเป็นส่วนตัว
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── CSS Animations ───
function LbStyles() {
  return (
    <style jsx global>{`
      .lb-fade-up {
        opacity: 0;
        transform: translateY(16px);
        animation: lbFadeUp 0.6s ease-out forwards;
      }
      .lb-ready .lb-fade-up {
      }
      @keyframes lbFadeUp {
        to { opacity: 1; transform: translateY(0); }
      }

      .lb-shimmer {
        animation: lbShimmer 3s ease-in-out infinite;
      }
      @keyframes lbShimmer {
        0% { transform: translateX(-100%); }
        30% { transform: translateX(100%); }
        100% { transform: translateX(100%); }
      }

      .lb-sparkle {
        animation: lbSparkle 2s ease-in-out infinite;
      }
      @keyframes lbSparkle {
        0%, 100% { opacity: 0.4; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      .lb-pulse-slow {
        animation: lbPulseSlow 4s ease-in-out infinite;
      }
      @keyframes lbPulseSlow {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
      }

      .lb-flicker {
        animation: lbFlicker 1.5s ease-in-out infinite;
      }
      @keyframes lbFlicker {
        0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
        25% { opacity: 0.8; transform: scale(0.95) rotate(-3deg); }
        75% { opacity: 0.9; transform: scale(1.05) rotate(2deg); }
      }

      .lb-float-particle {
        animation: lbFloat 5s ease-in-out infinite;
      }
      @keyframes lbFloat {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
        50% { transform: translateY(-30px) scale(1.5); opacity: 0.5; }
      }

      .lb-fade-in {
        animation: lbFadeIn 0.2s ease-out;
      }
      @keyframes lbFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .lb-scale-in {
        animation: lbScaleIn 0.3s ease-out;
      }
      @keyframes lbScaleIn {
        from { opacity: 0; transform: scale(0.95) translateY(8px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
    `}</style>
  )
}
