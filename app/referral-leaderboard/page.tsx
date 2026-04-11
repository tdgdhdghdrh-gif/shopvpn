'use client'

import { useState, useEffect } from 'react'
import { Users, Trophy, Star, Crown, Gift, Medal, Loader2, Copy, Check, TrendingUp, Award, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface LeaderboardEntry {
  rank: number; name: string; avatar: string | null
  referralCount: number; totalEarned: number
  badge: string; badgeColor: string; joinedAt: string
}

interface MyStats {
  referralCode: string | null; referralCount: number; totalEarned: number
  rank: number | null; badge: string
  recentReferrals: { referredName: string | null; amount: number; type: string; createdAt: string }[]
}

interface GlobalStats {
  totalReferrals: number; totalEarnings: number; totalReferrers: number
}

const badgeIcons: Record<string, any> = {
  Bronze: Medal, Silver: Star, Gold: Crown, Diamond: Trophy,
}

export default function ReferralLeaderboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [myStats, setMyStats] = useState<MyStats | null>(null)
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => {
      if (d.user) { setUser(d.user); setIsAdmin(d.user.isAdmin || d.user.isSuperAdmin) }
    }).catch(() => {})
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/referral-leaderboard')
      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
      setMyStats(data.myStats || null)
      setGlobalStats(data.globalStats || null)
    } catch {} finally { setLoading(false) }
  }

  function copyCode() {
    if (!myStats?.referralCode) return
    const link = `${window.location.origin}/register?ref=${myStats.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getRankColor(rank: number) {
    if (rank === 1) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400'
    if (rank === 2) return 'from-zinc-300/10 to-zinc-400/10 border-zinc-400/20 text-zinc-300'
    if (rank === 3) return 'from-orange-600/15 to-amber-700/15 border-orange-600/20 text-orange-400'
    return 'from-zinc-900/50 to-zinc-900/50 border-white/5 text-zinc-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar user={user} isAdmin={isAdmin} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
          <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Navbar user={user} isAdmin={isAdmin} />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-pink-500/30 rounded-2xl flex items-center justify-center">
            <Trophy className="w-8 h-8 text-pink-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">อันดับนักแนะนำ</h1>
          <p className="text-zinc-500 text-sm">ชวนเพื่อนมาใช้งาน รับ 20 บาทต่อคน!</p>
        </div>

        {/* Global Stats */}
        {globalStats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center">
              <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg sm:text-xl font-black text-white">{globalStats.totalReferrers}</p>
              <p className="text-[10px] text-zinc-600 font-medium">นักแนะนำ</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center">
              <Gift className="w-5 h-5 text-pink-400 mx-auto mb-1" />
              <p className="text-lg sm:text-xl font-black text-white">{globalStats.totalReferrals}</p>
              <p className="text-[10px] text-zinc-600 font-medium">คนถูกเชิญ</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg sm:text-xl font-black text-white">{globalStats.totalEarnings.toLocaleString()}฿</p>
              <p className="text-[10px] text-zinc-600 font-medium">รายได้รวม</p>
            </div>
          </div>
        )}

        {/* My Stats */}
        {myStats && (
          <div className="bg-gradient-to-br from-violet-600/[0.08] to-pink-600/[0.05] border border-violet-500/15 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-400" /> สถิติของคุณ
              </h3>
              {myStats.rank && (
                <span className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs font-black text-violet-400">
                  อันดับ #{myStats.rank}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-black text-white">{myStats.referralCount}</p>
                <p className="text-[10px] text-zinc-500 font-medium">คนที่ชวน</p>
              </div>
              <div>
                <p className="text-xl font-black text-emerald-400">{myStats.totalEarned}฿</p>
                <p className="text-[10px] text-zinc-500 font-medium">รายได้ทั้งหมด</p>
              </div>
              <div>
                <p className="text-xl font-black text-amber-400">{myStats.badge}</p>
                <p className="text-[10px] text-zinc-500 font-medium">ระดับ Badge</p>
              </div>
            </div>

            {/* Referral Link */}
            {myStats.referralCode && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${myStats.referralCode}`}
                  readOnly
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-zinc-400 font-mono truncate"
                />
                <button onClick={copyCode}
                  className="px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs font-bold text-violet-400 hover:bg-violet-500/20 transition-all shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Recent Referrals */}
            {myStats.recentReferrals.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">ล่าสุด</p>
                {myStats.recentReferrals.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">{r.referredName || 'ไม่ระบุชื่อ'}</span>
                    <span className="text-emerald-400 font-bold">+{r.amount}฿</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Badge Tiers */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">ระดับ Badge</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: 'Bronze', min: 1, color: '#CD7F32', bg: 'bg-orange-900/20 border-orange-700/20' },
              { name: 'Silver', min: 5, color: '#C0C0C0', bg: 'bg-zinc-700/20 border-zinc-500/20' },
              { name: 'Gold', min: 15, color: '#FFD700', bg: 'bg-yellow-900/20 border-yellow-600/20' },
              { name: 'Diamond', min: 30, color: '#B9F2FF', bg: 'bg-cyan-900/20 border-cyan-500/20' },
            ].map(b => {
              const Icon = badgeIcons[b.name] || Medal
              return (
                <div key={b.name} className={`p-3 rounded-xl border ${b.bg} text-center space-y-1`}>
                  <Icon className="w-5 h-5 mx-auto" style={{ color: b.color }} />
                  <p className="text-xs font-bold text-white">{b.name}</p>
                  <p className="text-[10px] text-zinc-500">{b.min}+ คน</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> อันดับ Top 50
          </h3>

          {leaderboard.length === 0 ? (
            <div className="text-center py-16 text-zinc-600 text-sm">ยังไม่มีข้อมูล</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => {
                const BadgeIcon = badgeIcons[entry.badge] || Medal
                return (
                  <div key={entry.rank}
                    className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r border transition-all ${getRankColor(entry.rank)}`}>
                    {/* Rank */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                      entry.rank <= 3 ? 'bg-black/30' : 'bg-black/20'
                    }`}>
                      {entry.rank <= 3 ? (
                        <span className="text-lg">{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
                      ) : entry.rank}
                    </div>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {entry.avatar ? (
                        <img src={entry.avatar} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white truncate">{entry.name}</span>
                          <BadgeIcon className="w-3.5 h-3.5 shrink-0" style={{ color: entry.badgeColor }} />
                        </div>
                        <p className="text-[10px] text-zinc-600">{entry.badge}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-white">{entry.referralCount} คน</p>
                      <p className="text-[10px] text-emerald-500 font-bold">{entry.totalEarned.toLocaleString()}฿</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
