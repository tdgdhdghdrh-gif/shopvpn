'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Check, Loader2, Sparkles, CheckCircle2, X, RotateCcw } from 'lucide-react'

interface Preset {
  id: string
  name: string
  description: string
  emoji: string
  gradient: string
}

export default function ThemePresetsPage() {
  const [presets, setPresets] = useState<Preset[]>([])
  const [defaultPreset, setDefaultPreset] = useState<Preset | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchData = () => {
    fetch('/api/admin/theme-presets')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setPresets(d.presets)
          setDefaultPreset(d.defaultPreset)
          setActiveId(d.activePresetId)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const apply = async (id: string) => {
    setApplying(id)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/admin/theme-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId: id }),
      })
      const d = await res.json()
      if (d.success) {
        setActiveId(id)
        setSuccessMsg('เปลี่ยนธีมสำเร็จ — กำลังรีโหลดหน้า...')
        setTimeout(() => {
          window.location.reload()
        }, 800)
      } else {
        setErrorMsg(d.error || 'ไม่สำเร็จ')
        setApplying(null)
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาด')
      setApplying(null)
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Theme Presets</h1>
            <p className="text-xs sm:text-sm text-zinc-500">เลือกธีมสำเร็จรูป กดปุ่มเดียวเปลี่ยนทั้งเว็บ</p>
          </div>
        </div>
      </div>

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

      <div className="mb-6 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <p className="text-xs text-amber-300/80">
          <strong>หมายเหตุ:</strong> การเลือกธีมจะเขียนทับค่าใน <code className="text-amber-200">/admin/theme-editor</code> และ <code className="text-amber-200">/admin/theme-mood</code> ทั้งหมด
          หลังกด ระบบจะ reload หน้าให้อัตโนมัติ
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {presets.map((preset, idx) => (
          <motion.button
            key={preset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => apply(preset.id)}
            disabled={applying !== null}
            className={`relative group p-5 rounded-2xl border transition-all text-left overflow-hidden ${
              activeId === preset.id
                ? 'bg-white/10 border-white/30 ring-2 ring-white/20'
                : 'bg-zinc-950/40 border-white/[0.04] hover:border-white/15 hover:bg-zinc-900/40'
            } ${applying === preset.id ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${preset.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{preset.emoji}</span>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${preset.gradient} opacity-80`} />
              </div>

              <h3 className="text-lg font-black text-white mb-1">{preset.name}</h3>
              <p className="text-xs text-zinc-400 mb-4">{preset.description}</p>

              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeId === preset.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-zinc-300 border border-white/10 group-hover:bg-white/10'
              }`}>
                {applying === preset.id ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> กำลังเปลี่ยน...</>
                ) : activeId === preset.id ? (
                  <><Check className="w-3 h-3" /> ใช้งานอยู่</>
                ) : (
                  <><Palette className="w-3 h-3" /> เลือกธีมนี้</>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Reset to default — separate prominent section */}
      {defaultPreset && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-t border-white/5 pt-6"
        >
          <h2 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            รีเซ็ตเป็นค่าเริ่มต้น
          </h2>
          <button
            onClick={() => apply(defaultPreset.id)}
            disabled={applying !== null}
            className={`w-full sm:w-auto flex items-center gap-3 px-6 py-4 rounded-xl border transition-all ${
              activeId === defaultPreset.id
                ? 'bg-emerald-500/10 border-emerald-500/30 ring-2 ring-emerald-500/20'
                : 'bg-zinc-950/40 border-white/[0.04] hover:border-white/15 hover:bg-zinc-900/40'
            } ${applying === defaultPreset.id ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
          >
            <span className="text-2xl">{defaultPreset.emoji}</span>
            <div className="text-left">
              <p className="text-sm font-bold text-white">{defaultPreset.name}</p>
              <p className="text-xs text-zinc-500">{defaultPreset.description}</p>
            </div>
            <div className={`ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
              activeId === defaultPreset.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/5 text-zinc-300 border border-white/10'
            }`}>
              {applying === defaultPreset.id ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> กำลังรีเซ็ต...</>
              ) : activeId === defaultPreset.id ? (
                <><Check className="w-3 h-3" /> ค่าเริ่มต้น</>
              ) : (
                <><RotateCcw className="w-3 h-3" /> รีเซ็ต</>
              )}
            </div>
          </button>
        </motion.div>
      )}
    </div>
  )
}
