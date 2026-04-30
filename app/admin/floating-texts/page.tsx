'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Type, Loader2, CheckCircle2, AlertTriangle, Save, Plus, X,
  Eye, EyeOff, Play, Pause, Settings2
} from 'lucide-react'

export default function AdminFloatingTextsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [preview, setPreview] = useState(false)

  const [form, setForm] = useState({
    enabled: false,
    interval: 2000,
    minDuration: 8,
    maxDuration: 14,
    fontSize: '16px',
    textColor: '#22d3ee',
    glowColor: 'rgba(34,211,238,0.8)',
    showRealData: true,
    customTexts: [] as string[],
    newText: '',
    position: 'full',
  })

  const fetchSettings = () => {
    fetch('/api/admin/floating-texts')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setSettings(d.settings)
          setForm(prev => ({
            ...prev,
            enabled: d.settings.enabled,
            interval: d.settings.interval,
            minDuration: d.settings.minDuration,
            maxDuration: d.settings.maxDuration,
            fontSize: d.settings.fontSize,
            textColor: d.settings.textColor,
            glowColor: d.settings.glowColor,
            showRealData: d.settings.showRealData,
            customTexts: d.settings.customTexts || [],
            position: d.settings.position,
          }))
        }
      })
      .catch(() => setErrorMsg('โหลดไม่ได้'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const save = async () => {
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/admin/floating-texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: form.enabled,
          interval: parseInt(String(form.interval)),
          minDuration: parseInt(String(form.minDuration)),
          maxDuration: parseInt(String(form.maxDuration)),
          fontSize: form.fontSize,
          textColor: form.textColor,
          glowColor: form.glowColor,
          showRealData: form.showRealData,
          customTexts: form.customTexts,
          position: form.position,
        }),
      })

      const d = await res.json()
      if (d.success) {
        setSettings(d.settings)
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

  const addCustomText = () => {
    if (!form.newText.trim()) return
    setForm(prev => ({
      ...prev,
      customTexts: [...prev.customTexts, prev.newText.trim()],
      newText: '',
    }))
  }

  const removeCustomText = (index: number) => {
    setForm(prev => ({
      ...prev,
      customTexts: prev.customTexts.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-0 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Type className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">ข้อความลอย</h1>
            <p className="text-xs sm:text-sm text-zinc-500">ข้อความวิ่งบนหน้าจอเหมือนแจ้งเตือนโดเมน</p>
          </div>
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className="px-4 py-2.5 bg-white/10 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors"
        >
          {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {preview ? 'ปิด Preview' : 'Preview'}
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </motion.div>
      )}
      {errorMsg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {errorMsg}
        </motion.div>
      )}

      {/* Preview */}
      {preview && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-zinc-900/50 border border-white/[0.04] rounded-2xl p-4 mb-6 overflow-hidden relative h-48">
          <div className="absolute inset-0 overflow-hidden">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ x: '-100%' }}
                animate={{ x: '120vw' }}
                transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 2, ease: 'linear' }}
                className="absolute whitespace-nowrap font-bold"
                style={{
                  top: `${15 + i * 22}%`,
                  fontSize: form.fontSize,
                  color: form.textColor,
                  textShadow: `0 0 10px ${form.glowColor}`,
                }}
              >
                💸 ผู้ใช้เติมเงิน 100฿ • 🎉 ซื้อ VPN 30 วัน • 👋 สมัครใหม่
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Settings Form */}
      <div className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-6 space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">เปิดใช้งาน</p>
            <p className="text-xs text-zinc-500">แสดงข้อความลอยบนทุกหน้า</p>
          </div>
          <button
            onClick={() => setForm(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative w-14 h-8 rounded-full transition-colors ${form.enabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${form.enabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Position */}
        <div>
          <label className="block text-[11px] text-zinc-500 mb-2">ตำแหน่งแสดง</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'full', label: 'ทั้งจอ' },
              { id: 'top-half', label: 'ครึ่งบน' },
              { id: 'bottom-half', label: 'ครึ่งล่าง' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setForm(prev => ({ ...prev, position: p.id }))}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  form.position === p.id
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900/40 text-zinc-500 border-white/[0.04] hover:border-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Settings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] text-zinc-500 mb-1">ความเร็วต่ำสุด (วิ)</label>
            <input
              type="number"
              value={form.minDuration}
              onChange={e => setForm(prev => ({ ...prev, minDuration: parseInt(e.target.value) || 5 }))}
              min={3}
              max={30}
              className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
            />
          </div>
          <div>
            <label className="block text-[11px] text-zinc-500 mb-1">ความเร็วสูงสุด (วิ)</label>
            <input
              type="number"
              value={form.maxDuration}
              onChange={e => setForm(prev => ({ ...prev, maxDuration: parseInt(e.target.value) || 10 }))}
              min={5}
              max={60}
              className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
            />
          </div>
          <div>
            <label className="block text-[11px] text-zinc-500 mb-1">ระยะห่าง (ms)</label>
            <input
              type="number"
              value={form.interval}
              onChange={e => setForm(prev => ({ ...prev, interval: parseInt(e.target.value) || 1500 }))}
              min={500}
              max={10000}
              step={100}
              className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
            />
          </div>
          <div>
            <label className="block text-[11px] text-zinc-500 mb-1">ขนาดตัวอักษร</label>
            <input
              value={form.fontSize}
              onChange={e => setForm(prev => ({ ...prev, fontSize: e.target.value }))}
              className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-zinc-500 mb-1">สีตัวอักษร</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.textColor}
                onChange={e => setForm(prev => ({ ...prev, textColor: e.target.value }))}
                className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                value={form.textColor}
                onChange={e => setForm(prev => ({ ...prev, textColor: e.target.value }))}
                className="flex-1 bg-black/40 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-zinc-500 mb-1">สี Glow (rgba)</label>
            <input
              value={form.glowColor}
              onChange={e => setForm(prev => ({ ...prev, glowColor: e.target.value }))}
              className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40 font-mono"
            />
          </div>
        </div>

        {/* Real Data Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">แสดงข้อมูลจริง</p>
            <p className="text-xs text-zinc-500">เติมเงิน ซื้อ VPN สมัครใหม่ จาก database</p>
          </div>
          <button
            onClick={() => setForm(prev => ({ ...prev, showRealData: !prev.showRealData }))}
            className={`relative w-14 h-8 rounded-full transition-colors ${form.showRealData ? 'bg-emerald-500' : 'bg-zinc-700'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${form.showRealData ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Custom Texts */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">ข้อความ Custom</label>
          <div className="flex gap-2 mb-3">
            <input
              value={form.newText}
              onChange={e => setForm(prev => ({ ...prev, newText: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addCustomText()}
              placeholder="เช่น 🎉 โปรโมชั่นพิเศษวันนี้!"
              className="flex-1 bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/40"
            />
            <button
              onClick={addCustomText}
              className="px-4 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {form.customTexts.map((text, i) => (
              <div key={i} className="flex items-center justify-between bg-black/30 rounded-xl px-4 py-2.5">
                <span className="text-sm text-zinc-300">{text}</span>
                <button
                  onClick={() => removeCustomText(i)}
                  className="w-7 h-7 rounded-lg bg-zinc-800/50 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  )
}
