'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dices, Loader2, Users, Crown, Star, Zap, Filter,
  CheckCircle, X, Eye, EyeOff, Sparkles, RefreshCw,
  TicketCheck, AlertTriangle, ChevronDown, ChevronUp,
  Gem, Target, Coins, Volume2, PartyPopper, Trophy,
  Flame, Fingerprint, Server, Check, Circle, Radio,
  Timer, Settings2, Gauge
} from 'lucide-react'

interface EligibleUser {
  user: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
  totalVpnSpend: number
  vpnOrderCount: number
  servers: Array<{ id: string; name: string; flag: string }>
  totalTopup?: number
  topupCount?: number
  lastActive: string
}

interface Winner {
  id: string
  name: string | null
  email: string
  avatar: string | null
}

interface VpnServer {
  id: string
  name: string
  flag: string
  isEventServer: boolean
}

const periods = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'today', label: 'วันนี้' },
  { value: 'week', label: '7 วันล่าสุด' },
  { value: 'month', label: 'เดือนนี้' },
]

const rankConfig: Record<number, {
  bg: string; border: string; text: string; icon: any;
  badgeBg: string; label: string; glow: string; crownColor: string;
  particleColor: string; size: string;
}> = {
  1: {
    bg: 'from-yellow-400/25 via-amber-500/20 to-orange-500/15',
    border: 'border-yellow-400/60',
    text: 'text-yellow-300',
    icon: Crown,
    badgeBg: 'from-yellow-500/40 to-amber-600/30',
    label: 'ที่ 1',
    glow: 'shadow-yellow-500/50 shadow-2xl',
    crownColor: 'text-yellow-400',
    particleColor: '#fbbf24',
    size: 'scale-110',
  },
  2: {
    bg: 'from-slate-300/25 via-zinc-400/20 to-gray-500/15',
    border: 'border-slate-300/60',
    text: 'text-slate-300',
    icon: Gem,
    badgeBg: 'from-slate-400/40 to-zinc-500/30',
    label: 'ที่ 2',
    glow: 'shadow-slate-400/40 shadow-2xl',
    crownColor: 'text-slate-300',
    particleColor: '#cbd5e1',
    size: 'scale-105',
  },
  3: {
    bg: 'from-orange-500/25 via-amber-600/20 to-yellow-700/15',
    border: 'border-orange-400/60',
    text: 'text-orange-300',
    icon: Trophy,
    badgeBg: 'from-orange-500/40 to-amber-600/30',
    label: 'ที่ 3',
    glow: 'shadow-orange-500/40 shadow-xl',
    crownColor: 'text-orange-400',
    particleColor: '#fb923c',
    size: 'scale-100',
  },
}

function getRankConfig(rank: number) {
  if (rank <= 3) return rankConfig[rank]
  return {
    bg: 'from-purple-500/20 via-blue-500/10 to-transparent',
    border: 'border-purple-400/30',
    text: 'text-purple-300',
    icon: Star,
    badgeBg: 'from-purple-500/25 to-blue-500/20',
    label: `ที่ ${rank}`,
    glow: 'shadow-purple-500/20 shadow-lg',
    crownColor: 'text-purple-400',
    particleColor: '#a78bfa',
    size: 'scale-100',
  }
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotSpeed: number
  life: number
}

function wait(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export default function AdminLuckyDrawPage() {
  const [users, setUsers] = useState<EligibleUser[]>([])
  const [servers, setServers] = useState<VpnServer[]>([])
  const [loading, setLoading] = useState(true)
  const [drawPhase, setDrawPhase] = useState<'idle' | 'countdown' | 'shuffling' | 'drumroll' | 'revealing' | 'done'>('idle')
  const [winners, setWinners] = useState<Winner[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [drawHistory, setDrawHistory] = useState<{ winners: Winner[], time: string }[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Particles
  const [confetti, setConfetti] = useState<Particle[]>([])
  const [screenFlash, setScreenFlash] = useState(false)
  const [spotlightActive, setSpotlightActive] = useState(false)

  // Filters
  const [period, setPeriod] = useState('all')
  const [minTopup, setMinTopup] = useState('0')
  const [winnerCount, setWinnerCount] = useState('10')
  const [selectedServerIds, setSelectedServerIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())
  const [showUserList, setShowUserList] = useState(true)

  // Animation
  const [countdownNum, setCountdownNum] = useState(5)
  const [shuffleEmail, setShuffleEmail] = useState('')
  const [shuffleProgress, setShuffleProgress] = useState(0)
  const [flashRank, setFlashRank] = useState(0)
  const [shakeRank1, setShakeRank1] = useState(false)

  const abortRef = useRef(false)

  useEffect(() => { fetchData() }, [period, minTopup])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function fetchData() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('period', period)
      if (minTopup) params.set('minTopup', minTopup)
      if (selectedServerIds.size > 0) params.set('serverIds', Array.from(selectedServerIds).join(','))

      const res = await fetch(`/api/admin/lucky-draw?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
        setServers(data.servers)
        // Auto-select event servers if nothing selected
        if (selectedServerIds.size === 0 && data.servers) {
          const eventIds = data.servers.filter((s: VpnServer) => s.isEventServer).map((s: VpnServer) => s.id)
          if (eventIds.length > 0) setSelectedServerIds(new Set(eventIds))
        }
      }
    } catch { } finally { setLoading(false) }
  }

  function toggleServer(id: string) {
    setSelectedServerIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllServers() {
    setSelectedServerIds(new Set(servers.map(s => s.id)))
  }

  function clearAllServers() {
    setSelectedServerIds(new Set())
  }

  // ====== CONFETTI ======
  function spawnConfetti(count: number, originY: number = 50, colors?: string[]) {
    const cols = colors || ['#fbbf24', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899', '#f97316', '#eab308', '#06b6d4']
    const now = Date.now()
    const p: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: now + i,
      x: 20 + Math.random() * 60,
      y: originY,
      vx: (Math.random() - 0.5) * 30,
      vy: -12 - Math.random() * 18,
      color: cols[Math.floor(Math.random() * cols.length)],
      size: 3 + Math.random() * 10,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 20,
      life: 1,
    }))
    setConfetti(prev => [...prev, ...p])
    // Cleanup
    setTimeout(() => {
      setConfetti(prev => prev.filter(x => x.id < now))
    }, 8000)
  }

  function flashScreen() {
    setScreenFlash(true)
    setTimeout(() => setScreenFlash(false), 400)
  }

  // ====== DRAW SEQUENCE ======
  const startDrawSequence = useCallback(async () => {
    if (selectedServerIds.size === 0) {
      setToast({ type: 'error', message: 'กรุณาเลือกเซิร์ฟเวอร์อย่างน้อย 1 เครื่อง' })
      return
    }
    if (users.length === 0) {
      setToast({ type: 'error', message: 'ไม่มีผู้ใช้ที่มีสิทธิ์สุ่ม' })
      return
    }
    const count = parseInt(winnerCount) || 10
    const eligible = users.filter(u => !excludedIds.has(u.user.id))
    if (count > eligible.length) {
      setToast({ type: 'error', message: `จำนวนผู้โชคดีมากกว่าจำนวนผู้มีสิทธิ์ (${eligible.length} คน)` })
      return
    }

    abortRef.current = false

    // Phase 1: Countdown 5-4-3-2-1
    setDrawPhase('countdown')
    for (let i = 5; i >= 0; i--) {
      if (abortRef.current) return
      setCountdownNum(i)
      if (i === 0) flashScreen()
      await wait(i === 0 ? 800 : 900)
    }

    // Phase 2: Shuffling (rapid, 6 seconds)
    setDrawPhase('shuffling')
    setShuffleProgress(0)
    const shuffleEmails = eligible.map(u => u.user.email)
    const shuffleStart = Date.now()
    const shuffleDuration = 6000

    while (Date.now() - shuffleStart < shuffleDuration && !abortRef.current) {
      const email = shuffleEmails[Math.floor(Math.random() * shuffleEmails.length)]
      setShuffleEmail(email)
      const prog = ((Date.now() - shuffleStart) / shuffleDuration) * 100
      setShuffleProgress(prog)
      await wait(50)
    }

    // Phase 3: Drumroll (slow down, 4 seconds)
    setDrawPhase('drumroll')
    const drumStart = Date.now()
    const drumDuration = 4000
    while (Date.now() - drumStart < drumDuration && !abortRef.current) {
      const email = shuffleEmails[Math.floor(Math.random() * shuffleEmails.length)]
      setShuffleEmail(email)
      const elapsed = Date.now() - drumStart
      const slowdown = 60 + (elapsed / drumDuration) * 500
      await wait(slowdown)
    }

    if (abortRef.current) return

    // Call API
    try {
      const res = await fetch('/api/admin/lucky-draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerCount: count,
          period,
          minTopup: parseFloat(minTopup) || 0,
          serverIds: Array.from(selectedServerIds),
          excludedUserIds: Array.from(excludedIds),
        }),
      })
      const data = await res.json()
      if (!data.success || abortRef.current) {
        setToast({ type: 'error', message: data.error || 'เกิดข้อผิดพลาด' })
        setDrawPhase('idle')
        return
      }

      // Phase 4: Revealing (from last to first)
      setDrawPhase('revealing')
      const reversed = [...data.winners].reverse()
      setWinners(reversed)
      setRevealedCount(0)

      for (let i = 0; i < reversed.length && !abortRef.current; i++) {
        const displayRank = reversed.length - i
        setFlashRank(displayRank)
        setTimeout(() => setFlashRank(0), 800)

        // Spawn mini confetti for top 3
        if (displayRank <= 3) {
          const cfg = getRankConfig(displayRank)
          spawnConfetti(displayRank === 1 ? 60 : 25, 40, [cfg.particleColor])
        }

        // Screen flash for rank 1
        if (displayRank === 1) {
          flashScreen()
          setShakeRank1(true)
          setTimeout(() => setShakeRank1(false), 1000)
        }

        let delayMs = 1000
        if (displayRank === 5) delayMs = 1200
        if (displayRank === 4) delayMs = 1400
        if (displayRank === 3) delayMs = 2500
        if (displayRank === 2) delayMs = 3000
        if (displayRank === 1) delayMs = 4500

        setRevealedCount(i + 1)
        await wait(delayMs)
      }

      if (abortRef.current) return

      // Phase 5: Celebration
      setDrawPhase('done')
      setSpotlightActive(true)
      spawnConfetti(150, 30)
      setTimeout(() => spawnConfetti(100, 60), 800)
      setTimeout(() => spawnConfetti(80, 45), 1600)
      setTimeout(() => setSpotlightActive(false), 8000)

      setDrawHistory(prev => [{ winners: data.winners, time: new Date().toLocaleTimeString('th-TH') }, ...prev].slice(0, 20))
    } catch {
      setToast({ type: 'error', message: 'เกิดข้อผิดพลาด' })
      setDrawPhase('idle')
    }
  }, [users, excludedIds, winnerCount, period, minTopup, selectedServerIds])

  function resetDraw() {
    abortRef.current = true
    setWinners([])
    setDrawPhase('idle')
    setRevealedCount(0)
    setShuffleEmail('')
    setShuffleProgress(0)
    setFlashRank(0)
    setShakeRank1(false)
    setConfetti([])
    setSpotlightActive(false)
    setScreenFlash(false)
  }

  function toggleExclude(userId: string) {
    setExcludedIds(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const filteredUsers = users.filter(u => !excludedIds.has(u.user.id))
  const displayWinners = [...winners].reverse()

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Screen Flash */}
      {screenFlash && (
        <div className="fixed inset-0 bg-white/20 z-[9995] pointer-events-none animate-flashOverlay" />
      )}

      {/* Spotlight */}
      {spotlightActive && (
        <div className="fixed inset-0 pointer-events-none z-[9996] animate-fadeSlow">
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/15 via-amber-500/5 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-yellow-400/8 blur-[120px] animate-pulse" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[600px] bg-gradient-to-b from-amber-400/10 to-transparent blur-[80px]" />
        </div>
      )}

      {/* Confetti Canvas */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[9997] overflow-hidden">
          {confetti.map(p => (
            <Confetti key={p.id} p={p} />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl ${
          toast.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <Dices className="w-4.5 h-4.5 text-amber-400" />
            </div>
            สุ่มผู้โชคดี
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 ml-[46px]">สุ่มจากผู้ใช้ที่ซื้อเซิร์ฟเวอร์ที่คุณเลือกเท่านั้น</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 transition-all">
            <Settings2 className="w-4 h-4" /> ตั้งค่า
          </button>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 transition-all">
            <RefreshCw className="w-4 h-4" /> รีเฟรช
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">ช่วงเวลา</label>
              <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-amber-500/30 transition-colors">
                {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">เติมขั้นต่ำ (บาท)</label>
              <input type="number" min={0} value={minTopup} onChange={e => setMinTopup(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/30 transition-colors" />
              <p className="text-[10px] text-zinc-600 mt-1">0 = ไม่กรองยอดเติม</p>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">จำนวนรางวัล</label>
              <input type="number" min={1} max={100} value={winnerCount} onChange={e => setWinnerCount(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-amber-500/30 transition-colors" />
            </div>
          </div>

          {/* Server Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" /> เลือกเซิร์ฟเวอร์ที่จะสุ่ม (ซื้อจากเครื่องไหนถึงมีสิทธิ์)
              </label>
              <div className="flex items-center gap-2">
                <button onClick={selectAllServers} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-all">เลือกทั้งหมด</button>
                <button onClick={clearAllServers} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-all">ล้าง</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-2 rounded-xl bg-zinc-900/50 border border-white/5">
              {servers.map(s => {
                const selected = selectedServerIds.has(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleServer(s.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selected
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                        : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {selected ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{s.flag} {s.name}</span>
                    {s.isEventServer && <span className="text-[9px] px-1 py-0.5 rounded bg-pink-500/20 text-pink-400 shrink-0">กิจกรรม</span>}
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-zinc-600 mt-1">เลือก {selectedServerIds.size} / {servers.length} เครื่อง</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Users className="w-4 h-4 text-blue-400" />} label="ผู้มีสิทธิ์" value={users.length} />
        <StatCard icon={<TicketCheck className="w-4 h-4 text-emerald-400" />} label="เข้าร่วมสุ่ม" value={filteredUsers.length} />
        <StatCard icon={<EyeOff className="w-4 h-4 text-rose-400" />} label="ถูกตัดสิทธิ" value={excludedIds.size} />
        <StatCard icon={<Target className="w-4 h-4 text-amber-400" />} label="จำนวนรางวัล" value={winnerCount} />
      </div>

      {/* ========== MAIN DRAW STAGE ========== */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden mb-6 relative min-h-[480px]">
        {(drawPhase === 'shuffling' || drawPhase === 'drumroll' || drawPhase === 'revealing') && (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/8 via-purple-500/5 to-blue-500/8 pointer-events-none" />
        )}

        <div className="p-8 text-center relative flex flex-col items-center justify-center min-h-[480px]">

          {/* ---- IDLE ---- */}
          {drawPhase === 'idle' && (
            <div className="py-4 animate-fadeIn">
              <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full bg-amber-500/5 animate-ping" style={{ animationDuration: '2s' }} />
                <Dices className="w-12 h-12 text-amber-400/70 relative z-10" />
              </div>
              <p className="text-sm text-zinc-500 mb-1">พร้อมสุ่มผู้โชคดี</p>
              <p className="text-xl font-black text-white mb-2">{filteredUsers.length} คน ลุ้น {winnerCount} รางวัล</p>
              {selectedServerIds.size > 0 && (
                <p className="text-xs text-zinc-600 mb-6">จาก {selectedServerIds.size} เซิร์ฟเวอร์ที่เลือก</p>
              )}
              <button onClick={startDrawSequence} disabled={filteredUsers.length === 0 || selectedServerIds.size === 0}
                className="inline-flex items-center gap-3 px-12 py-4 rounded-2xl text-lg font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-2xl shadow-amber-500/25 transition-all disabled:opacity-40 hover:scale-105 active:scale-95">
                <Dices className="w-7 h-7" /> เริ่มสุ่มผู้โชคดี
              </button>
            </div>
          )}

          {/* ---- COUNTDOWN ---- */}
          {drawPhase === 'countdown' && (
            <div className="py-4">
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
                <div className="absolute inset-3 rounded-full border-2 border-orange-500/30 animate-pulse" />
                <div className="absolute inset-6 rounded-full border border-yellow-400/20 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-500/40 via-orange-500/30 to-red-500/20 border-4 border-amber-400/60 flex items-center justify-center shadow-2xl shadow-amber-500/40">
                  <span className={`text-8xl font-black text-white ${countdownNum === 0 ? 'animate-bounce' : 'animate-pulse'}`}>
                    {countdownNum === 0 ? 'GO!' : countdownNum}
                  </span>
                </div>
              </div>
              <p className="mt-8 text-lg font-black text-amber-400 animate-pulse">
                {countdownNum === 0 ? '🔥 เริ่มสุ่มเลย! 🔥' : 'เตรียมตัวให้พร้อม...'}
              </p>
            </div>
          )}

          {/* ---- SHUFFLING ---- */}
          {drawPhase === 'shuffling' && (
            <div className="py-4 w-full max-w-xl">
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/50 to-orange-500/50 animate-ping" style={{ animationDuration: '0.8s' }} />
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-600/30 animate-spin" style={{ animationDuration: '0.6s' }} />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-500/40 to-orange-500/40 border-4 border-amber-400/70 flex items-center justify-center shadow-2xl shadow-amber-500/50">
                  <div className="relative">
                    <Fingerprint className="w-16 h-16 text-amber-200" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-yellow-400 animate-ping" />
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
                  <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> ระบบกำลังสุ่มแบบสุ่มเต็มรูปแบบ...</span>
                  <span className="font-mono text-amber-400">{Math.floor(shuffleProgress)}%</span>
                </div>
                <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all duration-75 relative"
                    style={{ width: `${Math.min(100, shuffleProgress)}%` }}>
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 rounded-2xl bg-zinc-950/90 border-2 border-amber-500/30 shadow-xl">
                <p className="text-3xl sm:text-5xl font-black text-amber-300 font-mono tracking-widest truncate">
                  {shuffleEmail || '...'}
                </p>
              </div>

              <div className="mt-5 flex justify-center gap-1">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className={`w-1.5 rounded-full transition-all duration-75 ${i < (shuffleProgress / 6.25) ? 'h-8 bg-gradient-to-t from-amber-600 to-amber-300' : 'h-2 bg-zinc-800'}`} />
                ))}
              </div>
            </div>
          )}

          {/* ---- DRUMROLL ---- */}
          {drawPhase === 'drumroll' && (
            <div className="py-4 w-full max-w-xl">
              <div className="relative w-36 h-36 mx-auto mb-10">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/40 to-amber-500/40 animate-pulse" style={{ animationDuration: '0.5s' }} />
                <div className="relative w-full h-full rounded-full bg-zinc-900 border-4 border-amber-500/60 flex items-center justify-center">
                  <Volume2 className="w-12 h-12 text-amber-400 animate-bounce" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-ping" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>

              <p className="text-xl font-black text-amber-400 mb-2 animate-pulse">🥁 กลองกระหึ่ม... 🥁</p>
              <p className="text-sm text-zinc-500 mb-6">ใกล้ประกาศผลแล้ว!</p>

              <div className="px-8 py-5 rounded-2xl bg-zinc-950/90 border-2 border-purple-500/30 shadow-xl">
                <p className="text-2xl sm:text-4xl font-black text-purple-300 font-mono tracking-widest truncate">
                  {shuffleEmail || '...'}
                </p>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-purple-500/60 animate-ping" style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }} />
                ))}
              </div>
            </div>
          )}

          {/* ---- REVEALING / DONE ---- */}
          {(drawPhase === 'revealing' || drawPhase === 'done') && (
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-center gap-3 mb-8">
                <Sparkles className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                <h3 className="text-2xl sm:text-3xl font-black text-white">✨ ประกาศผลผู้โชคดี ✨</h3>
                <Sparkles className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              </div>

              <div className="space-y-3">
                {displayWinners.map((w, displayIdx) => {
                  const rank = displayIdx + 1
                  const cfg = getRankConfig(rank)
                  const RankIcon = cfg.icon
                  const isRevealed = winners.length - revealedCount <= displayIdx
                  const isFlashing = flashRank === rank
                  const isShaking = shakeRank1 && rank === 1

                  if (!isRevealed) {
                    return (
                      <div key={rank} className="flex items-center gap-3 p-5 rounded-2xl bg-zinc-950/60 border border-white/5 opacity-40">
                        <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                          <span className="text-2xl font-black text-zinc-600">?</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse" />
                          <div className="h-3 w-28 bg-zinc-800 rounded animate-pulse" />
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={rank}
                      className={`relative flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r ${cfg.bg} border-2 ${cfg.border} ${cfg.glow} overflow-hidden transition-all duration-700 ${cfg.size} ${isShaking ? 'animate-shake' : ''}`}
                      style={{ animation: 'winnerPop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>

                      {isFlashing && <div className="absolute inset-0 bg-white/15 animate-flash pointer-events-none" />}

                      {/* Rank Badge */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${cfg.badgeBg} border-2 ${cfg.border} flex flex-col items-center justify-center shrink-0 shadow-xl`}>
                        <RankIcon className={`w-6 h-6 ${cfg.text} drop-shadow-md`} />
                        <span className={`text-xs font-black ${cfg.text}`}>{cfg.label}</span>
                      </div>

                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-black shrink-0 border-2 ${cfg.border} ${rank === 1 ? 'bg-yellow-500/25 text-yellow-300' : rank === 2 ? 'bg-slate-400/25 text-slate-300' : rank === 3 ? 'bg-orange-500/25 text-orange-300' : 'bg-purple-500/25 text-purple-300'}`}>
                        {w.name?.charAt(0).toUpperCase() || w.email.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-lg font-black text-white truncate">{w.name || 'ไม่ระบุชื่อ'}</p>
                        <p className="text-sm text-zinc-400 font-mono truncate">{w.email}</p>
                      </div>

                      {/* Crown / Star */}
                      {rank <= 3 ? (
                        <Crown className={`w-8 h-8 shrink-0 ${cfg.crownColor} drop-shadow-xl ${rank === 1 ? 'animate-bounce' : ''}`} style={{ animationDuration: '1.5s' }} />
                      ) : (
                        <Star className={`w-6 h-6 shrink-0 ${cfg.text}`} />
                      )}
                    </div>
                  )
                })}
              </div>

              {drawPhase === 'done' && (
                <div className="mt-8 space-y-5">
                  <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: 9 }, (_, i) => (
                      <Star key={i} className={`text-amber-400 fill-amber-400 animate-pulse drop-shadow-lg`} style={{ width: 16 + (4 - Math.abs(4 - i)) * 4, height: 16 + (4 - Math.abs(4 - i)) * 4, animationDelay: `${i * 0.12}s` }} />
                    ))}
                  </div>
                  <p className="text-center text-lg font-bold text-amber-400 animate-pulse">🎉 ยินดีด้วยกับผู้โชคดีทุกท่าน! 🎉</p>
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={resetDraw}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95">
                      <Dices className="w-5 h-5" /> สุ่มใหม่
                    </button>
                    <button onClick={() => { setShowFilters(true); resetDraw(); }}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 hover:text-white transition-all">
                      <Settings2 className="w-4 h-4" /> ตั้งค่าใหม่
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {drawHistory.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-white/5 bg-zinc-900/30">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> ประวัติการสุ่ม
            </h3>
          </div>
          <div className="p-3 space-y-2">
            {drawHistory.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-zinc-600 font-mono shrink-0">{h.time}</span>
                <div className="flex-1 flex items-center gap-1 flex-wrap">
                  {h.winners.slice(0, 5).map((w, wi) => (
                    <span key={w.id} className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                      #{wi + 1} {w.email}
                    </span>
                  ))}
                  {h.winners.length > 5 && <span className="text-zinc-600">+{h.winners.length - 5}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User List */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-zinc-900/30 cursor-pointer" onClick={() => setShowUserList(!showUserList)}>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            รายชื่อผู้มีสิทธิ์ ({filteredUsers.length} คน)
            {excludedIds.size > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400">ตัด {excludedIds.size} คน</span>
            )}
          </h3>
          {showUserList ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </div>

        {showUserList && (
          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="py-12 flex items-center justify-center"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center">
                <AlertTriangle className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">ไม่พบผู้ใช้ที่มีสิทธิ์ในเงื่อนไขนี้</p>
                <p className="text-xs text-zinc-600 mt-1">ลองเลือกเซิร์ฟเวอร์หรือปรับช่วงเวลาดู</p>
              </div>
            ) : (
              users.map((u, idx) => {
                const isExcluded = excludedIds.has(u.user.id)
                return (
                  <div key={u.user.id} className={`flex items-center gap-3 px-4 py-3 transition-all ${isExcluded ? 'opacity-40 bg-rose-500/5' : 'hover:bg-white/[0.02]'}`}>
                    <span className="text-xs font-mono text-zinc-600 w-6 text-right shrink-0">{idx + 1}</span>
                    <button onClick={() => toggleExclude(u.user.id)}
                      className={`p-1.5 rounded-lg transition-all ${isExcluded ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-zinc-800 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                      title={isExcluded ? 'คืนสิทธิ์' : 'ตัดสิทธิ์'}>
                      {isExcluded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-blue-400">
                      {u.user.name?.charAt(0).toUpperCase() || u.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{u.user.name || 'ไม่ระบุชื่อ'}</p>
                      <p className="text-xs text-zinc-500 font-mono truncate">{u.user.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        ซื้อ {u.totalVpnSpend?.toLocaleString() || 0}฿
                      </span>
                      {u.servers?.slice(0, 2).map(s => (
                        <span key={s.id} className="text-[10px] text-zinc-600">{s.flag}</span>
                      ))}
                      {u.servers && u.servers.length > 2 && <span className="text-[10px] text-zinc-600">+{u.servers.length - 2}</span>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes winnerPop {
          0% { transform: scale(0.25) translateY(60px); opacity: 0; }
          50% { transform: scale(1.06) translateY(-6px); opacity: 1; }
          75% { transform: scale(0.98) translateY(2px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes flash {
          0% { opacity: 0.7; }
          100% { opacity: 0; }
        }
        @keyframes fadeSlow {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes flashOverlay {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-8px) rotate(-1deg); }
          20% { transform: translateX(8px) rotate(1deg); }
          30% { transform: translateX(-6px) rotate(-0.5deg); }
          40% { transform: translateX(6px) rotate(0.5deg); }
          50% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          70% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        .animate-flash { animation: flash 0.7s ease-out forwards; }
        .animate-flashOverlay { animation: flashOverlay 0.4s ease-out forwards; }
        .animate-fadeSlow { animation: fadeSlow 8s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-shake { animation: shake 0.8s ease-in-out; }
      `}} />
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4">
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs font-bold text-zinc-500">{label}</span></div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function Confetti({ p }: { p: Particle }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    let x = p.x
    let y = p.y
    let vy = p.vy
    let r = p.rotation
    let life = p.life

    const anim = () => {
      vy += 0.35
      x += p.vx * 0.015
      y += vy * 0.015
      r += p.rotSpeed
      life -= 0.003
      el.style.left = `${x}%`
      el.style.top = `${y}%`
      el.style.transform = `rotate(${r}deg) scale(${Math.max(0, life)})`
      el.style.opacity = String(Math.max(0, life))
      if (life > 0 && y < 120) requestAnimationFrame(anim)
    }
    requestAnimationFrame(anim)
  }, [p])

  return (
    <div ref={ref}
      className="absolute rounded-sm pointer-events-none"
      style={{
        left: `${p.x}%`, top: `${p.y}%`,
        width: p.size, height: p.size * 0.6,
        backgroundColor: p.color,
        transform: `rotate(${p.rotation}deg)`,
      }}
    />
  )
}
