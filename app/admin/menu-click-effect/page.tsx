'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Wand2, CheckCircle, Loader2, Save, Eye, Power, PowerOff,
  Waves, Sparkles, Zap, Sun, CircleDot, Lightbulb,
  MoveUpRight, Paintbrush, PartyPopper, Hexagon
} from 'lucide-react'
import { MENU_CLICK_EFFECTS, MenuClickEffectPreview } from '@/components/MenuClickEffect'

export default function MenuClickEffectPage() {
  const [selected, setSelected] = useState('none')
  const [saved, setSaved] = useState('none')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Icon map for effect cards
  const effectIcons: Record<string, React.ElementType> = {
    none: PowerOff,
    ripple: Waves,
    glow: Sun,
    particle: Sparkles,
    shockwave: CircleDot,
    neon: Lightbulb,
    slide: MoveUpRight,
    morphGlow: Paintbrush,
    electricArc: Zap,
    hologram: Hexagon,
    confettiBurst: PartyPopper,
  }

  // Gradient/color map for cards
  const effectGradients: Record<string, { gradient: string; border: string }> = {
    none: { gradient: 'from-zinc-500 to-zinc-600', border: 'border-zinc-500' },
    ripple: { gradient: 'from-blue-400 to-cyan-500', border: 'border-blue-400' },
    glow: { gradient: 'from-amber-400 to-orange-500', border: 'border-amber-400' },
    particle: { gradient: 'from-pink-400 to-rose-500', border: 'border-pink-400' },
    shockwave: { gradient: 'from-purple-400 to-indigo-500', border: 'border-purple-400' },
    neon: { gradient: 'from-emerald-400 to-teal-500', border: 'border-emerald-400' },
    slide: { gradient: 'from-sky-400 to-blue-500', border: 'border-sky-400' },
    morphGlow: { gradient: 'from-violet-400 to-fuchsia-500', border: 'border-violet-400' },
    electricArc: { gradient: 'from-cyan-400 to-blue-500', border: 'border-cyan-400' },
    hologram: { gradient: 'from-teal-400 to-emerald-500', border: 'border-teal-400' },
    confettiBurst: { gradient: 'from-yellow-400 to-red-500', border: 'border-yellow-400' },
  }

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Load current setting
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings')
        const data = await res.json()
        if (data.settings?.menuClickEffect) {
          setSelected(data.settings.menuClickEffect)
          setSaved(data.settings.menuClickEffect)
        }
      } catch {
        // use default
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Save
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuClickEffect: selected }),
      })
      if (!res.ok) throw new Error('Failed')
      setSaved(selected)
      showToast('บันทึกเอฟเฟกต์เมนูสำเร็จ!', 'success')
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = selected !== saved

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-300 flex items-center gap-2 ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
              <Wand2 className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">เอฟเฟกต์คลิก</h1>
              <p className="text-xs text-zinc-500">เลือกเอฟเฟกต์แอนิเมชันที่จะแสดงเมื่อผู้ใช้คลิก/แตะที่ใดก็ได้บนเว็บ</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              hasChanges
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center gap-2">
            {saved !== 'none' ? (
              <Power className="w-4 h-4 text-emerald-400" />
            ) : (
              <PowerOff className="w-4 h-4 text-zinc-500" />
            )}
            <span className="text-xs text-zinc-400">
              สถานะ: {saved !== 'none' ? (
                <span className="text-emerald-400 font-medium">เปิดใช้งาน — {MENU_CLICK_EFFECTS.find(e => e.id === saved)?.name || saved}</span>
              ) : (
                <span className="text-zinc-500">ปิดอยู่</span>
              )}
            </span>
          </div>
          {hasChanges && (
            <span className="text-xs text-amber-400 flex items-center gap-1 ml-auto">
              <CircleDot className="w-3 h-3" />
              มีการเปลี่ยนแปลง (ยังไม่ได้บันทึก)
            </span>
          )}
        </div>

        {/* Live Preview */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">ตัวอย่าง (กดเพื่อดูเอฟเฟกต์)</span>
            <span className="text-xs text-zinc-500 ml-auto">
              {MENU_CLICK_EFFECTS.find(e => e.id === selected)?.emoji} {MENU_CLICK_EFFECTS.find(e => e.id === selected)?.name}
            </span>
          </div>
          <div className="p-6 flex justify-center">
            <div className="w-full max-w-sm space-y-1 bg-zinc-900 rounded-xl p-3 border border-zinc-800">
              <MenuClickEffectPreview effectId={selected} />
              <MenuClickEffectPreview effectId={selected} />
              <MenuClickEffectPreview effectId={selected} />
            </div>
          </div>
        </div>

        {/* Effect Grid */}
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            เลือกเอฟเฟกต์ ({MENU_CLICK_EFFECTS.length} แบบ)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MENU_CLICK_EFFECTS.map((effect) => {
              const isSelected = selected === effect.id
              const isSaved = saved === effect.id
              const IconComp = effectIcons[effect.id] || Sparkles
              const colors = effectGradients[effect.id] || effectGradients.none

              return (
                <button
                  key={effect.id}
                  onClick={() => setSelected(effect.id)}
                  className={`relative group text-left p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? `${colors.border} bg-gradient-to-br ${colors.gradient}/10 shadow-lg`
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}
                  {/* Saved indicator */}
                  {isSaved && !isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${colors.gradient}/20 border ${colors.border}/30 group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{effect.emoji}</span>
                        <span className="text-sm font-bold">{effect.name}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        {effect.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Info footer */}
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs text-zinc-500 space-y-1">
          <p>💡 <strong className="text-zinc-400">วิธีใช้:</strong> เลือกเอฟเฟกต์จากรายการด้านบน → กดปุ่ม &quot;บันทึก&quot; → เอฟเฟกต์จะทำงานทันทีเมื่อผู้ใช้คลิก/แตะที่ใดก็ได้บนเว็บ</p>
          <p>📱 เอฟเฟกต์ทำงานทั้งบนมือถือและคอมพิวเตอร์ (touch + click)</p>
          <p>⚡ เอฟเฟกต์ใช้ CSS animations + Web Animations API ไม่กระทบ performance</p>
          <p>🛡️ เอฟเฟกต์จะไม่ทำงานตอนพิมพ์ในช่องกรอกข้อมูล (input/textarea)</p>
        </div>
      </div>
    </div>
  )
}
