'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Palette, Sun, Moon, Monitor, Loader2, Check, Snowflake, TreePine,
  Heart, Sparkles, CloudRain, Flame, Waves, Sunset, Gem, Coffee, CheckCircle2,
  X
} from 'lucide-react'

interface Appearance {
  themeMode: string
  seasonalTheme: string | null
  moodColor: string | null
  customPrimaryColor: string | null
  customBgColor: string | null
  enableParticles: boolean
  particleType: string | null
  enableConfetti: boolean
}

const themeModes = [
  { id: 'dark', label: 'มืด', icon: Moon, desc: 'ธีมมืดตลอดเวลา' },
  { id: 'light', label: 'สว่าง', icon: Sun, desc: 'ธีมสว่างตลอดเวลา' },
  { id: 'system', label: 'ตามระบบ', icon: Monitor, desc: 'สลับตามการตั้งค่าอุปกรณ์' },
]

const seasonalThemes = [
  { id: 'songkran', label: 'สงกรานต์', icon: CloudRain, color: 'from-sky-400 to-cyan-400', emoji: '💦' },
  { id: 'halloween', label: 'ฮาโลวีน', icon: Flame, color: 'from-orange-500 to-purple-600', emoji: '🎃' },
  { id: 'christmas', label: 'คริสต์มาส', icon: TreePine, color: 'from-red-500 to-green-500', emoji: '🎄' },
  { id: 'chinese-new-year', label: 'ตรุษจีน', icon: Sparkles, color: 'from-red-500 to-amber-500', emoji: '🧧' },
  { id: 'valentine', label: 'วาเลนไทน์', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '💝' },
  { id: 'loy-krathong', label: 'ลอยกระทง', icon: Waves, color: 'from-indigo-400 to-purple-400', emoji: '🪷' },
  { id: 'new-year', label: 'ปีใหม่', icon: Sparkles, color: 'from-amber-400 to-yellow-300', emoji: '🎆' },
]

const moodColors = [
  { id: 'chill', label: 'Chill', desc: 'ฟ้าสบายตา', color: '#3b82f6', bg: '#0f172a' },
  { id: 'energy', label: 'Energy', desc: 'ส้มสดใส', color: '#f97316', bg: '#1a0f00' },
  { id: 'luxury', label: 'Luxury', desc: 'ทองหรูหรา', color: '#eab308', bg: '#1a1500' },
  { id: 'night', label: 'Night', desc: 'ม่วงลึกลับ', color: '#8b5cf6', bg: '#0f0518' },
  { id: 'ocean', label: 'Ocean', desc: 'เขียวน้ำทะเล', color: '#06b6d4', bg: '#001020' },
  { id: 'forest', label: 'Forest', desc: 'เขียวป่าไม้', color: '#22c55e', bg: '#0a1a0a' },
  { id: 'sunset', label: 'Sunset', desc: 'ส้มชมพูอบอุ่น', color: '#f43f5e', bg: '#2d1b4e' },
]

const particleTypes = [
  { id: 'snow', label: 'หิมะตก', emoji: '❄️' },
  { id: 'stars', label: 'ดาวกระจาย', emoji: '✨' },
  { id: 'bubbles', label: 'ฟองสบู่', emoji: '🫧' },
  { id: 'leaves', label: 'ใบไม้ร่วง', emoji: '🍂' },
  { id: 'rain', label: 'ฝนตก', emoji: '🌧️' },
  { id: 'fireflies', label: 'หิ่งห้อย', emoji: '🪲' },
]

export default function AdminThemeMoodPage() {
  const [appearance, setAppearance] = useState<Appearance | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchAppearance = () => {
    fetch('/api/site-appearance')
      .then(r => r.json())
      .then(d => {
        if (d.success) setAppearance(d.appearance)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAppearance()
  }, [])

  const save = async (updates: Partial<Appearance>) => {
    if (!appearance) return
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/site-appearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const d = await res.json()
      if (d.success) {
        setAppearance(d.appearance)
        setSuccessMsg('บันทึกแล้ว!')
        setTimeout(() => setSuccessMsg(''), 2000)
      } else {
        setErrorMsg(d.error || 'ไม่สำเร็จ')
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-0 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-violet-600 rounded-2xl flex items-center justify-center">
            <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Theme & Mood</h1>
            <p className="text-xs sm:text-sm text-zinc-500">ตกแต่งบรรยากาศเว็บไซต์</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </motion.div>
      )}
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
          <X className="w-4 h-4" /> {errorMsg}
        </motion.div>
      )}

      {/* 1. Dark/Light Mode */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-zinc-400" />
          Dark / Light Mode
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeModes.map(m => (
            <button
              key={m.id}
              onClick={() => save({ themeMode: m.id })}
              disabled={saving}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                appearance?.themeMode === m.id
                  ? 'bg-white/10 border-white/20'
                  : 'bg-black/20 border-white/[0.04] hover:border-white/10'
              }`}
            >
              <m.icon className={`w-5 h-5 ${appearance?.themeMode === m.id ? 'text-white' : 'text-zinc-500'}`} />
              <div>
                <p className={`text-sm font-bold ${appearance?.themeMode === m.id ? 'text-white' : 'text-zinc-400'}`}>{m.label}</p>
                <p className="text-[10px] text-zinc-600">{m.desc}</p>
              </div>
              {appearance?.themeMode === m.id && <Check className="w-4 h-4 text-emerald-400 ml-auto" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 2. Seasonal Themes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Snowflake className="w-4 h-4 text-zinc-400" />
          Seasonal Themes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {seasonalThemes.map(s => (
            <button
              key={s.id}
              onClick={() => save({ seasonalTheme: appearance?.seasonalTheme === s.id ? null : s.id })}
              disabled={saving}
              className={`relative p-4 rounded-xl border transition-all text-center overflow-hidden ${
                appearance?.seasonalTheme === s.id
                  ? 'bg-gradient-to-br ' + s.color + ' border-white/20'
                  : 'bg-black/20 border-white/[0.04] hover:border-white/10'
              }`}
            >
              <span className="text-2xl mb-1 block">{s.emoji}</span>
              <p className={`text-xs font-bold ${appearance?.seasonalTheme === s.id ? 'text-white' : 'text-zinc-400'}`}>{s.label}</p>
              {appearance?.seasonalTheme === s.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}
            </button>
          ))}
        </div>
        {appearance?.seasonalTheme && (
          <button onClick={() => save({ seasonalTheme: null })}
            className="mt-3 text-[11px] text-zinc-500 hover:text-white transition-colors">
            ยกเลิกธีมเทศกาล
          </button>
        )}
      </motion.div>

      {/* 3. Mood Colors */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Coffee className="w-4 h-4 text-zinc-400" />
          Mood Colors
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {moodColors.map(m => (
            <button
              key={m.id}
              onClick={() => save({ moodColor: appearance?.moodColor === m.id ? null : m.id })}
              disabled={saving}
              className={`relative p-4 rounded-xl border transition-all text-center ${
                appearance?.moodColor === m.id
                  ? 'border-white/20'
                  : 'bg-black/20 border-white/[0.04] hover:border-white/10'
              }`}
              style={appearance?.moodColor === m.id ? { backgroundColor: m.bg } : {}}
            >
              <div className="w-6 h-6 rounded-full mx-auto mb-2" style={{ backgroundColor: m.color }} />
              <p className={`text-xs font-bold ${appearance?.moodColor === m.id ? 'text-white' : 'text-zinc-400'}`}>{m.label}</p>
              <p className="text-[10px] text-zinc-600">{m.desc}</p>
              {appearance?.moodColor === m.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}
            </button>
          ))}
        </div>
        {appearance?.moodColor && (
          <button onClick={() => save({ moodColor: null })}
            className="mt-3 text-[11px] text-zinc-500 hover:text-white transition-colors">
            ยกเลิก Mood Color
          </button>
        )}
      </motion.div>

      {/* 4. Particles */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-zinc-400" />
          Particles Background
        </h2>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => save({ enableParticles: !appearance?.enableParticles })}
            disabled={saving}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              appearance?.enableParticles ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
              appearance?.enableParticles ? 'left-7' : 'left-1'
            }`} />
          </button>
          <span className="text-sm text-zinc-400">
            {appearance?.enableParticles ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </span>
        </div>

        {appearance?.enableParticles && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {particleTypes.map(p => (
              <button
                key={p.id}
                onClick={() => save({ particleType: p.id })}
                disabled={saving}
                className={`p-3 rounded-xl border text-center transition-all ${
                  appearance?.particleType === p.id
                    ? 'bg-white/10 border-white/20'
                    : 'bg-black/20 border-white/[0.04] hover:border-white/10'
                }`}
              >
                <span className="text-lg block">{p.emoji}</span>
                <p className="text-[10px] text-zinc-400 mt-1">{p.label}</p>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* 5. Confetti */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Gem className="w-4 h-4 text-zinc-400" />
          Confetti Celebration
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => save({ enableConfetti: !appearance?.enableConfetti })}
            disabled={saving}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              appearance?.enableConfetti ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
              appearance?.enableConfetti ? 'left-7' : 'left-1'
            }`} />
          </button>
          <div>
            <span className="text-sm text-zinc-400">
              {appearance?.enableConfetti ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </span>
            <p className="text-[10px] text-zinc-600">แสดง confetti เมื่อผู้ใช้ซื้อสำเร็จหรือเติมเงิน</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
