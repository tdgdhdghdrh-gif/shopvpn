'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save, CheckCircle2, X, Sparkles, Plus, Trash2, Wand2 } from 'lucide-react'

interface GradientConfig {
  gradientEnabled: boolean
  gradientType: string
  gradientColors: string[]
  gradientAngle: number
  gradientAnimated: boolean
  gradientSpeed: number
}

interface Preset {
  id: string
  name: string
  emoji: string
  type: string
  colors: string[]
  angle: number
  animated: boolean
  speed: number
}

function gradientCss(c: GradientConfig): string {
  const colors = c.gradientColors.length >= 2 ? c.gradientColors : ['#1a2980', '#26d0ce']
  if (c.gradientType === 'linear') return `linear-gradient(${c.gradientAngle}deg, ${colors.join(', ')})`
  if (c.gradientType === 'radial') return `radial-gradient(circle at 50% 50%, ${colors.join(', ')})`
  if (c.gradientType === 'conic') return `conic-gradient(from 0deg at 50% 50%, ${colors.join(', ')})`
  if (c.gradientType === 'mesh') {
    return colors.map((color, i) => {
      const x = (i * 37) % 100, y = (i * 53) % 100
      return `radial-gradient(at ${x}% ${y}%, ${color} 0px, transparent 50%)`
    }).join(', ')
  }
  return `linear-gradient(135deg, ${colors.join(', ')})`
}

export default function GradientBackgroundPage() {
  const [config, setConfig] = useState<GradientConfig | null>(null)
  const [presets, setPresets] = useState<Preset[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/gradient-background')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setConfig(d.config)
          setPresets(d.presets)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const update = (patch: Partial<GradientConfig>) => {
    if (!config) return
    setConfig({ ...config, ...patch })
  }

  const applyPreset = (p: Preset) => {
    if (!config) return
    setConfig({
      ...config,
      gradientEnabled: true,
      gradientType: p.type,
      gradientColors: p.colors,
      gradientAngle: p.angle,
      gradientAnimated: p.animated,
      gradientSpeed: p.speed,
    })
  }

  const save = async () => {
    if (!config) return
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/admin/gradient-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const d = await res.json()
      if (d.success) {
        setSuccessMsg('บันทึกแล้ว — รีโหลดหน้า user เพื่อดูผล')
        setTimeout(() => setSuccessMsg(''), 4000)
      } else {
        setErrorMsg(d.error || 'ไม่สำเร็จ')
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const addColor = () => {
    if (!config || config.gradientColors.length >= 5) return
    update({ gradientColors: [...config.gradientColors, '#ffffff'] })
  }

  const removeColor = (idx: number) => {
    if (!config || config.gradientColors.length <= 2) return
    update({ gradientColors: config.gradientColors.filter((_, i) => i !== idx) })
  }

  const setColor = (idx: number, value: string) => {
    if (!config) return
    const c = [...config.gradientColors]
    c[idx] = value
    update({ gradientColors: c })
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  const previewStyle: React.CSSProperties = {
    backgroundImage: gradientCss(config),
    backgroundSize: '100% 100%',
  }

  return (
    <div className="px-3 sm:px-0 max-w-5xl mx-auto pb-10">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Gradient Background</h1>
            <p className="text-xs sm:text-sm text-zinc-500">พื้นหลังไล่สีแบบ animated สวยหรู</p>
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

      {/* Live Preview */}
      <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 relative" style={{ height: 200 }}>
        <div className="absolute inset-0" style={previewStyle} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xl font-black drop-shadow-lg">Live Preview</span>
        </div>
      </div>

      {/* Enable toggle */}
      <div className="mb-6 bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">เปิดใช้งาน Gradient Background</h2>
            <p className="text-xs text-zinc-500 mt-1">เปิดเพื่อทับพื้นหลังเดิมด้วย gradient</p>
          </div>
          <button
            onClick={() => update({ gradientEnabled: !config.gradientEnabled })}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              config.gradientEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
              config.gradientEnabled ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="mb-6 bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-5">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-cyan-400" />
          เทมเพลตสำเร็จรูป
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="group rounded-xl overflow-hidden border border-white/[0.04] hover:border-white/20 transition-all"
            >
              <div className="h-16 w-full" style={{
                backgroundImage: gradientCss({ ...config, gradientType: p.type, gradientColors: p.colors, gradientAngle: p.angle, gradientAnimated: false, gradientSpeed: p.speed, gradientEnabled: true }),
                backgroundSize: '100% 100%',
              }} />
              <div className="p-2 bg-black/40">
                <p className="text-[11px] font-bold text-white text-left">{p.emoji} {p.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="mb-6 bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-5">
        <h2 className="text-sm font-bold text-white mb-3">รูปแบบ Gradient</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'linear', label: 'Linear' },
            { id: 'radial', label: 'Radial' },
            { id: 'conic', label: 'Conic' },
            { id: 'mesh', label: 'Mesh' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => update({ gradientType: t.id })}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                config.gradientType === t.id
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-black/20 border-white/[0.04] text-zinc-400 hover:border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6 bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">สี ({config.gradientColors.length}/5)</h2>
          <button
            onClick={addColor}
            disabled={config.gradientColors.length >= 5}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white flex items-center gap-1 disabled:opacity-40"
          >
            <Plus className="w-3 h-3" /> เพิ่มสี
          </button>
        </div>
        <div className="space-y-2">
          {config.gradientColors.map((color, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={e => setColor(idx, e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
              />
              <input
                type="text"
                value={color}
                onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setColor(idx, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white font-mono"
              />
              {config.gradientColors.length > 2 && (
                <button
                  onClick={() => removeColor(idx)}
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Angle (linear only) */}
      {config.gradientType === 'linear' && (
        <div className="mb-6 bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white mb-3">มุม: {config.gradientAngle}°</h2>
          <input
            type="range"
            min={0}
            max={360}
            value={config.gradientAngle}
            onChange={e => update({ gradientAngle: Number(e.target.value) })}
            className="w-full accent-cyan-500"
          />
        </div>
      )}

      {/* Animation */}
      <div className="mb-6 bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Animation</h2>
            <p className="text-xs text-zinc-500 mt-0.5">เคลื่อนไหวอัตโนมัติ</p>
          </div>
          <button
            onClick={() => update({ gradientAnimated: !config.gradientAnimated })}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              config.gradientAnimated ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
              config.gradientAnimated ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
        {config.gradientAnimated && (
          <div>
            <p className="text-xs text-zinc-400 mb-2">ความเร็ว: {config.gradientSpeed}s / รอบ</p>
            <input
              type="range"
              min={5}
              max={60}
              value={config.gradientSpeed}
              onChange={e => update({ gradientSpeed: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
              <span>เร็ว (5s)</span>
              <span>ช้า (60s)</span>
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  )
}
