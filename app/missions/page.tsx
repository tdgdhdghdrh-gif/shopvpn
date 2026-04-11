'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy, Loader2, CheckCircle2, Lock, Target, Star, Flame } from 'lucide-react'

interface Mission {
  id: string
  category: string
  icon: string
  title: string
  description: string
  target: number
  progress: number
  completed: boolean
  percent: number
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [completedCount, setCompletedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [completionPercent, setCompletionPercent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'achievement' | 'milestone'>('all')

  useEffect(() => { fetchMissions() }, [])

  async function fetchMissions() {
    try {
      const res = await fetch('/api/missions')
      const data = await res.json()
      setMissions(data.missions || [])
      setCompletedCount(data.completedCount || 0)
      setTotalCount(data.totalCount || 0)
      setCompletionPercent(data.completionPercent || 0)
    } catch {} finally { setLoading(false) }
  }

  const filteredMissions = tab === 'all' ? missions : missions.filter(m => m.category === tab)
  const achievements = missions.filter(m => m.category === 'achievement')
  const milestones = missions.filter(m => m.category === 'milestone')

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-violet-400" />
              ภารกิจ & ความสำเร็จ
            </h1>
            <p className="text-zinc-500 text-xs">สะสม Badge ปลดล็อกความสำเร็จ!</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Overall Progress */}
        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-bold text-lg">{completedCount}/{totalCount} ภารกิจสำเร็จ</p>
              <p className="text-zinc-400 text-xs">ทำภารกิจให้ครบเพื่อแสดงความเป็นตัวจริง!</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-zinc-800 border-4 border-violet-500/30 flex items-center justify-center">
              <span className="text-violet-400 font-black text-lg">{completionPercent}%</span>
            </div>
          </div>
          <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'ทั้งหมด', count: missions.length },
            { key: 'achievement', label: 'ความสำเร็จ', count: achievements.length },
            { key: 'milestone', label: 'เป้าหมาย', count: milestones.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t.key
                  ? 'bg-violet-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Mission List */}
        <div className="space-y-2">
          {filteredMissions.map(mission => (
            <div
              key={mission.id}
              className={`p-4 rounded-xl border transition-all ${
                mission.completed
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  mission.completed ? 'bg-emerald-500/10' : 'bg-zinc-800'
                }`}>
                  {mission.completed ? mission.icon : <Lock className="w-5 h-5 text-zinc-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${mission.completed ? 'text-emerald-400' : 'text-white'}`}>
                      {mission.title}
                    </p>
                    {mission.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-zinc-500 text-xs">{mission.description}</p>
                  {!mission.completed && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-zinc-500 text-[10px]">{mission.progress}/{mission.target}</span>
                        <span className="text-zinc-500 text-[10px]">{mission.percent}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${mission.percent}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
