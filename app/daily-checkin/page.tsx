'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Flame, Gift, Loader2, Calendar, Coins, TrendingUp, Star } from 'lucide-react'

interface CheckinHistory {
  date: string
  reward: number
  streak: number
}

const STREAK_REWARDS = [
  { day: 1, reward: 1 },
  { day: 2, reward: 1 },
  { day: 3, reward: 2 },
  { day: 4, reward: 2 },
  { day: 5, reward: 3 },
  { day: 6, reward: 3 },
  { day: 7, reward: 5 },
]

export default function DailyCheckinPage() {
  const [checkedInToday, setCheckedInToday] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [nextReward, setNextReward] = useState(1)
  const [history, setHistory] = useState<CheckinHistory[]>([])
  const [totalRewards, setTotalRewards] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [earnedReward, setEarnedReward] = useState(0)

  useEffect(() => { fetchStatus() }, [])

  async function fetchStatus() {
    try {
      const res = await fetch('/api/daily-checkin')
      if (!res.ok) {
        if (res.status === 401) return
        return
      }
      const data = await res.json()
      setCheckedInToday(data.checkedInToday)
      setCurrentStreak(data.currentStreak)
      setNextReward(data.nextReward)
      setHistory(data.history || [])
      setTotalRewards(data.totalRewards || 0)
      setTotalDays(data.totalDays || 0)
    } catch {} finally { setLoading(false) }
  }

  async function handleCheckin() {
    setChecking(true)
    try {
      const res = await fetch('/api/daily-checkin', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'เกิดข้อผิดพลาด')
        return
      }
      setEarnedReward(data.reward)
      setSuccessMessage(data.message)
      setShowSuccess(true)
      setCheckedInToday(true)
      setCurrentStreak(data.streak)
      fetchStatus()
    } catch {
      alert('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    } finally { setChecking(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
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
              <Calendar className="w-5 h-5 text-emerald-400" />
              เช็คอินรายวัน
            </h1>
            <p className="text-zinc-500 text-xs">เช็คอินทุกวัน รับเครดิตฟรี!</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
            <p className="text-white text-xl font-black">{currentStreak}</p>
            <p className="text-zinc-500 text-[10px] uppercase font-medium">Streak</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-white text-xl font-black">{totalRewards}</p>
            <p className="text-zinc-500 text-[10px] uppercase font-medium">เครดิตรวม</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <p className="text-white text-xl font-black">{totalDays}</p>
            <p className="text-zinc-500 text-[10px] uppercase font-medium">วันทั้งหมด</p>
          </div>
        </div>

        {/* Streak Progress */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            รางวัลตาม Streak (เช็คอินติดต่อกัน)
          </h3>
          <div className="flex items-center justify-between gap-1">
            {STREAK_REWARDS.map((item) => {
              const isCompleted = currentStreak >= item.day
              const isCurrent = currentStreak + 1 === item.day && !checkedInToday
              return (
                <div key={item.day} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : isCurrent
                        ? 'bg-yellow-400/20 text-yellow-400 border-2 border-yellow-400 animate-pulse'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `${item.reward}฿`}
                  </div>
                  <p className={`text-[10px] mt-1 font-medium ${isCompleted ? 'text-emerald-400' : isCurrent ? 'text-yellow-400' : 'text-zinc-600'}`}>
                    วัน {item.day}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Checkin Button */}
        <div className="text-center">
          {checkedInToday ? (
            <div className="inline-flex flex-col items-center gap-2 px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <p className="text-emerald-400 font-bold">เช็คอินวันนี้แล้ว!</p>
              <p className="text-zinc-500 text-xs">กลับมาเช็คอินอีกครั้งพรุ่งนี้</p>
            </div>
          ) : (
            <button
              onClick={handleCheckin}
              disabled={checking}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black rounded-2xl hover:from-emerald-400 hover:to-green-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 text-lg"
            >
              {checking ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Gift className="w-6 h-6" />
              )}
              {checking ? 'กำลังเช็คอิน...' : `เช็คอินรับ ${nextReward} บาท`}
            </button>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-3">ประวัติเช็คอิน</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map(h => (
                <div key={h.date} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-zinc-300 text-sm">{new Date(h.date + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 text-xs flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {h.streak}
                    </span>
                    <span className="text-yellow-400 font-bold text-sm">+{h.reward}฿</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules */}
        <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            กติกา
          </h3>
          <ul className="space-y-1.5 text-zinc-400 text-xs">
            <li>• เช็คอินได้วันละ 1 ครั้ง (รีเซ็ตเที่ยงคืน)</li>
            <li>• เช็คอินติดต่อกันจะได้ Streak bonus เครดิตเพิ่ม</li>
            <li>• วันที่ 1-2: 1 บาท | วันที่ 3-4: 2 บาท | วันที่ 5-6: 3 บาท | วันที่ 7: 5 บาท!</li>
            <li>• ครบ 7 วันจะรีเซ็ต Streak เริ่มนับใหม่</li>
            <li>• ถ้าขาดเช็คอิน 1 วัน Streak จะรีเซ็ตเป็น 0</li>
            <li>• เครดิตจะเข้าบัญชีทันที</li>
          </ul>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowSuccess(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-sm mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-black text-emerald-400 mb-2">เช็คอินสำเร็จ!</h3>
            <p className="text-3xl font-black text-yellow-400 mb-2">+{earnedReward} บาท</p>
            <p className="text-zinc-400 text-sm mb-6">{successMessage}</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-xl font-medium text-sm hover:bg-zinc-700 transition-all"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
