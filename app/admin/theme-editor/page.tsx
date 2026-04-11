'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Palette, Save, RotateCcw, Eye, Sliders, 
  Square, Droplets, Sun, Type, Sparkles,
  CreditCard, Globe, ShoppingBag, Star, Package,
  Home, Bell, User, ChevronRight, Menu, X, Check, Paintbrush
} from 'lucide-react'

// ===== Types =====
interface ThemeConfig {
  borderRadius: number
  borderWidth: number
  cardOpacity: number
  backdropBlur: number
  accentColor: string
  useCustomAccent: boolean
  textBrightness: number
  colorIntensity: number
  navbarBlur: number
  navbarOpacity: number
  backgroundColor: string
  useCustomBg: boolean
}

const defaultConfig: ThemeConfig = {
  borderRadius: 16,
  borderWidth: 1,
  cardOpacity: 100,
  backdropBlur: 0,
  accentColor: '#3b82f6',
  useCustomAccent: false,
  textBrightness: 100,
  colorIntensity: 100,
  navbarBlur: 12,
  navbarOpacity: 90,
  backgroundColor: '#000000',
  useCustomBg: false,
}

// Predefined accent colors
const presetAccentColors = [
  { name: 'น้ำเงิน', color: '#3b82f6' },
  { name: 'ม่วง', color: '#a855f7' },
  { name: 'ชมพู', color: '#ec4899' },
  { name: 'แดง', color: '#ef4444' },
  { name: 'ส้ม', color: '#f97316' },
  { name: 'เหลือง', color: '#eab308' },
  { name: 'เขียว', color: '#22c55e' },
  { name: 'ฟ้า', color: '#06b6d4' },
  { name: 'คราม', color: '#6366f1' },
  { name: 'ชมพูเข้ม', color: '#f43f5e' },
  { name: 'มิ้นท์', color: '#10b981' },
  { name: 'ทอง', color: '#d97706' },
]

// Predefined background colors
const presetBgColors = [
  { name: 'ดำสนิท', color: '#000000' },
  { name: 'เทาเข้มมาก', color: '#0a0a0a' },
  { name: 'เทาดำ', color: '#121212' },
  { name: 'กรมท่า', color: '#0f172a' },
  { name: 'น้ำเงินเข้ม', color: '#020b18' },
  { name: 'เขียวเข้ม', color: '#022c22' },
  { name: 'ม่วงเข้ม', color: '#1a0f2e' },
  { name: 'แดงเข้ม', color: '#1c1017' },
  { name: 'ส้มเข้ม', color: '#0f0503' },
  { name: 'น้ำเงินกลางคืน', color: '#0a0a0f' },
  { name: 'เขียวป่า', color: '#040d15' },
  { name: 'เหลืองเข้ม', color: '#1a1505' },
]

// ===== Helpers =====
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function adjustBrightness(hex: string, percent: number) {
  const { r, g, b } = hexToRgb(hex)
  const factor = percent / 100
  const nr = Math.min(255, Math.round(r * factor))
  const ng = Math.min(255, Math.round(g * factor))
  const nb = Math.min(255, Math.round(b * factor))
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

export default function ThemeEditorPage() {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig)
  const [savedConfig, setSavedConfig] = useState<ThemeConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [activeSection, setActiveSection] = useState<string>('border')

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // Load config
  useEffect(() => {
    fetch('/api/admin/theme-settings')
      .then(res => res.json())
      .then(data => {
        if (data.themeConfig) {
          const merged = { ...defaultConfig, ...data.themeConfig }
          setConfig(merged)
          setSavedConfig(merged)
        }
      })
      .catch(() => setToast({ msg: 'โหลดค่าไม่สำเร็จ', type: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/theme-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (data.success) {
        setSavedConfig(config)
        setToast({ msg: 'บันทึกสำเร็จ! รีเฟรชหน้าเว็บเพื่อดูผลลัพธ์', type: 'success' })
      } else {
        setToast({ msg: data.error || 'บันทึกไม่สำเร็จ', type: 'error' })
      }
    } catch {
      setToast({ msg: 'เกิดข้อผิดพลาด', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(defaultConfig)
  }

  const updateConfig = useCallback((key: keyof ThemeConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== Computed preview styles =====
  const previewCardStyle = {
    borderRadius: `${config.borderRadius}px`,
    borderWidth: `${config.borderWidth}px`,
    borderColor: `rgba(255,255,255,${0.05 * (config.colorIntensity / 100)})`,
    borderStyle: 'solid' as const,
    backgroundColor: `rgba(255,255,255,${0.02 * (config.cardOpacity / 100)})`,
    backdropFilter: config.backdropBlur > 0 ? `blur(${config.backdropBlur}px)` : undefined,
  }

  const previewTextStyle = {
    filter: `brightness(${config.textBrightness / 100})`,
  }

  const accentColorActive = config.useCustomAccent ? config.accentColor : 'var(--theme-accent, #3b82f6)'
  const accentRgb = config.useCustomAccent ? hexToRgb(config.accentColor) : { r: 59, g: 130, b: 246 }
  const accentLightBg = `rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},${0.1 * (config.colorIntensity / 100)})`

  const previewNavStyle = {
    backdropFilter: `blur(${config.navbarBlur}px)`,
    backgroundColor: `rgba(0,0,0,${config.navbarOpacity / 100})`,
    borderBottom: `${config.borderWidth}px solid rgba(255,255,255,${0.05 * (config.colorIntensity / 100)})`,
    borderRadius: `0 0 ${Math.min(config.borderRadius, 16)}px ${Math.min(config.borderRadius, 16)}px`,
  }

  // ===== Sections config =====
  const sections = [
    { id: 'border', label: 'ขอบ/กรอบ', icon: Square },
    { id: 'opacity', label: 'ความทึบแสง', icon: Droplets },
    { id: 'color', label: 'สีหลัก', icon: Palette },
    { id: 'background', label: 'พื้นหลัง', icon: Paintbrush },
    { id: 'text', label: 'ตัวหนังสือ', icon: Type },
    { id: 'intensity', label: 'ความเข้มสี', icon: Sun },
    { id: 'navbar', label: 'แถบเมนู', icon: Menu },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32 sm:pb-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">จัดการ UI / Theme</h1>
              <p className="text-xs sm:text-sm text-zinc-400">ปรับแต่งรูปลักษณ์ทั้งเว็บไซต์ — การ์ด, เมนู, สีสัน, ขอบ</p>
            </div>
          </div>
          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 hover:bg-zinc-700 text-sm transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              รีเซ็ต
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-medium text-sm transition-all hover:from-violet-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-violet-500/20"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* ===== LEFT: Controls ===== */}
        <div className="space-y-4">
          {/* Section tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {sections.map(s => {
              const Icon = s.icon
              const isActive = activeSection === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-zinc-900/50 text-zinc-400 border border-white/5 hover:border-white/10 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              )
            })}
          </div>

          {/* ===== Border/Frame Section ===== */}
          {activeSection === 'border' && (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Square className="w-5 h-5 text-violet-400" />
                <h2 className="text-base font-semibold text-white">ขอบ / กรอบการ์ด</h2>
              </div>

              {/* Border Radius */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">ความโค้งมน (Border Radius)</label>
                  <span className="text-sm font-mono text-violet-400">{config.borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min={0} max={32} step={1}
                  value={config.borderRadius}
                  onChange={e => updateConfig('borderRadius', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>เหลี่ยม (0)</span>
                  <span>กลม (32)</span>
                </div>
                {/* Presets */}
                <div className="flex gap-2 mt-2">
                  {[0, 4, 8, 12, 16, 24, 32].map(v => (
                    <button
                      key={v}
                      onClick={() => updateConfig('borderRadius', v)}
                      className={`px-2 py-1 text-[11px] rounded-lg border transition-all ${
                        config.borderRadius === v
                          ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                          : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Width */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">ความหนาขอบ (Border Width)</label>
                  <span className="text-sm font-mono text-violet-400">{config.borderWidth}px</span>
                </div>
                <input
                  type="range"
                  min={0} max={4} step={0.5}
                  value={config.borderWidth}
                  onChange={e => updateConfig('borderWidth', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex gap-2 mt-2">
                  {[0, 0.5, 1, 1.5, 2, 3, 4].map(v => (
                    <button
                      key={v}
                      onClick={() => updateConfig('borderWidth', v)}
                      className={`px-2 py-1 text-[11px] rounded-lg border transition-all ${
                        config.borderWidth === v
                          ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                          : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== Opacity Section ===== */}
          {activeSection === 'opacity' && (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-semibold text-white">ความทึบแสง</h2>
              </div>

              {/* Card Opacity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">ความทึบการ์ด</label>
                  <span className="text-sm font-mono text-cyan-400">{config.cardOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={0} max={100} step={5}
                  value={config.cardOpacity}
                  onChange={e => updateConfig('cardOpacity', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>โปร่งใส (0)</span>
                  <span>ทึบ (100)</span>
                </div>
              </div>

              {/* Backdrop Blur */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">เบลอพื้นหลัง (Backdrop Blur)</label>
                  <span className="text-sm font-mono text-cyan-400">{config.backdropBlur}px</span>
                </div>
                <input
                  type="range"
                  min={0} max={40} step={2}
                  value={config.backdropBlur}
                  onChange={e => updateConfig('backdropBlur', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>ไม่เบลอ (0)</span>
                  <span>เบลอมาก (40)</span>
                </div>
              </div>
            </div>
          )}

          {/* ===== Accent Color Section ===== */}
          {activeSection === 'color' && (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="w-5 h-5 text-pink-400" />
                <h2 className="text-base font-semibold text-white">สีหลัก (Accent Color)</h2>
              </div>

              {/* Toggle custom accent */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-300">ใช้สีกำหนดเอง (แทนสีจาก Theme)</label>
                <button
                  onClick={() => updateConfig('useCustomAccent', !config.useCustomAccent)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    config.useCustomAccent ? 'bg-violet-500' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${
                    config.useCustomAccent ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {config.useCustomAccent && (
                <>
                  {/* Color input */}
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={e => updateConfig('accentColor', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.accentColor}
                      onChange={e => {
                        if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                          updateConfig('accentColor', e.target.value)
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-zinc-800/50 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-violet-500/50"
                      placeholder="#3b82f6"
                    />
                  </div>

                  {/* Preset colors */}
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">สีสำเร็จรูป</p>
                    <div className="grid grid-cols-6 gap-2">
                      {presetAccentColors.map(p => (
                        <button
                          key={p.color}
                          onClick={() => updateConfig('accentColor', p.color)}
                          className={`group relative w-full aspect-square rounded-xl border-2 transition-all ${
                            config.accentColor === p.color
                              ? 'border-white scale-110 shadow-lg'
                              : 'border-transparent hover:border-white/30 hover:scale-105'
                          }`}
                          style={{ backgroundColor: p.color }}
                          title={p.name}
                        >
                          {config.accentColor === p.color && (
                            <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-lg" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== Background Color Section ===== */}
          {activeSection === 'background' && (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Paintbrush className="w-5 h-5 text-teal-400" />
                <h2 className="text-base font-semibold text-white">สีพื้นหลังเว็บ</h2>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                กำหนดสีพื้นหลังแบบ Solid Color แทนค่าเริ่มต้นจาก Theme ที่เลือก (ไม่รวมรูปพื้นหลัง — ตั้งค่ารูปพื้นหลังได้ที่หน้าตั้งค่าระบบ)
              </p>

              {/* Toggle custom background */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-300">ใช้สีพื้นหลังกำหนดเอง (แทนสีจาก Theme)</label>
                <button
                  onClick={() => updateConfig('useCustomBg', !config.useCustomBg)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    config.useCustomBg ? 'bg-teal-500' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${
                    config.useCustomBg ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {config.useCustomBg && (
                <>
                  {/* Color input */}
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={e => updateConfig('backgroundColor', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.backgroundColor}
                      onChange={e => {
                        if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                          updateConfig('backgroundColor', e.target.value)
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-zinc-800/50 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-teal-500/50"
                      placeholder="#000000"
                    />
                  </div>

                  {/* Preset background colors */}
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">สีพื้นหลังสำเร็จรูป</p>
                    <div className="grid grid-cols-6 gap-2">
                      {presetBgColors.map(p => (
                        <button
                          key={p.color}
                          onClick={() => updateConfig('backgroundColor', p.color)}
                          className={`group relative w-full aspect-square rounded-xl border-2 transition-all ${
                            config.backgroundColor === p.color
                              ? 'border-teal-400 scale-110 shadow-lg'
                              : 'border-white/10 hover:border-white/30 hover:scale-105'
                          }`}
                          style={{ backgroundColor: p.color }}
                          title={p.name}
                        >
                          {config.backgroundColor === p.color && (
                            <Check className="w-4 h-4 text-teal-400 absolute inset-0 m-auto drop-shadow-lg" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">ตัวอย่าง</p>
                    <div
                      className="w-full h-24 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: config.backgroundColor }}
                    >
                      <div className="text-center">
                        <p className="text-sm font-bold text-white/80">พื้นหลังเว็บ</p>
                        <p className="text-[10px] font-mono text-white/40">{config.backgroundColor}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== Text Section ===== */}
          {activeSection === 'text' && (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Type className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-semibold text-white">สีตัวหนังสือ</h2>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">ความสว่างตัวหนังสือ</label>
                  <span className="text-sm font-mono text-amber-400">{config.textBrightness}%</span>
                </div>
                <input
                  type="range"
                  min={70} max={130} step={5}
                  value={config.textBrightness}
                  onChange={e => updateConfig('textBrightness', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>หม่น (70%)</span>
                  <span>ปกติ (100%)</span>
                  <span>สว่าง (130%)</span>
                </div>
                {/* Preview text at different sizes */}
                <div className="mt-4 p-3 rounded-xl bg-zinc-950/50 border border-white/5 space-y-2" style={previewTextStyle}>
                  <p className="text-lg font-bold text-white">หัวข้อใหญ่ (Title)</p>
                  <p className="text-sm text-zinc-300">ข้อความปกติ เนื้อหาทั่วไปของหน้าเว็บ</p>
                  <p className="text-xs text-zinc-500">ข้อความรอง / ข้อมูลเพิ่มเติม</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== Color Intensity Section ===== */}
          {activeSection === 'intensity' && (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Sun className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-semibold text-white">ความเข้มสี</h2>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">ความเข้มของสีทั้งหมด</label>
                  <span className="text-sm font-mono text-emerald-400">{config.colorIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={50} max={150} step={5}
                  value={config.colorIntensity}
                  onChange={e => updateConfig('colorIntensity', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>จาง (50%)</span>
                  <span>ปกติ (100%)</span>
                  <span>เข้ม (150%)</span>
                </div>
                {/* Preview color swatches */}
                <div className="mt-4 flex gap-2">
                  {['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'].map(c => {
                    const { r, g, b } = hexToRgb(c)
                    const factor = config.colorIntensity / 100
                    return (
                      <div key={c} className="flex-1 space-y-1.5">
                        <div
                          className="w-full aspect-square rounded-lg"
                          style={{ backgroundColor: `rgba(${Math.round(r*factor)},${Math.round(g*factor)},${Math.round(b*factor)},1)` }}
                        />
                        <div
                          className="w-full h-6 rounded-lg"
                          style={{ backgroundColor: `rgba(${r},${g},${b},${0.1 * factor})` }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===== Navbar Section ===== */}
          {activeSection === 'navbar' && (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Menu className="w-5 h-5 text-rose-400" />
                <h2 className="text-base font-semibold text-white">แถบเมนูบน (Navbar)</h2>
              </div>

              {/* Navbar Blur */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">เบลอ Navbar</label>
                  <span className="text-sm font-mono text-rose-400">{config.navbarBlur}px</span>
                </div>
                <input
                  type="range"
                  min={0} max={40} step={2}
                  value={config.navbarBlur}
                  onChange={e => updateConfig('navbarBlur', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Navbar Opacity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">ความทึบ Navbar</label>
                  <span className="text-sm font-mono text-rose-400">{config.navbarOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={0} max={100} step={5}
                  value={config.navbarOpacity}
                  onChange={e => updateConfig('navbarOpacity', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>โปร่งใส (0)</span>
                  <span>ทึบ (100)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== RIGHT: Live Preview ===== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Eye className="w-4 h-4" />
            <span>ตัวอย่างแบบเรียลไทม์</span>
          </div>

          {/* Navbar Preview */}
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50">
            <div className="px-4 py-3 flex items-center justify-between" style={previewNavStyle}>
              <div className="flex items-center gap-2" style={previewTextStyle}>
                <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: accentColorActive, opacity: config.colorIntensity / 100 }} />
                <span className="text-sm font-bold text-white">MyShop</span>
              </div>
              <div className="flex items-center gap-3" style={previewTextStyle}>
                <Home className="w-4 h-4 text-zinc-400" />
                <Bell className="w-4 h-4 text-zinc-400" />
                <User className="w-4 h-4 text-zinc-400" />
                <Menu className="w-4 h-4 text-zinc-400" />
              </div>
            </div>

            {/* Content area */}
            <div className="p-4 space-y-3 bg-zinc-950/30">
              {/* Product cards grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Card 1 - Product */}
                <div style={previewCardStyle} className="overflow-hidden group">
                  <div className="h-20 w-full" style={{ background: `linear-gradient(135deg, ${accentColorActive}20, ${accentColorActive}05)` }}>
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-8 h-8" style={{ color: accentColorActive, opacity: config.colorIntensity / 100 }} />
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5" style={previewTextStyle}>
                    <p className="text-xs font-bold text-white truncate">Netflix Premium</p>
                    <p className="text-[10px] text-zinc-500">1 เดือน</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: accentColorActive }}>฿199</span>
                      <span className="text-[10px] text-zinc-600">สต็อก: 12</span>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Product */}
                <div style={previewCardStyle} className="overflow-hidden group">
                  <div className="h-20 w-full" style={{ background: `linear-gradient(135deg, rgba(236,72,153,${0.08 * config.colorIntensity / 100}), rgba(236,72,153,${0.02 * config.colorIntensity / 100}))` }}>
                    <div className="flex items-center justify-center h-full">
                      <Star className="w-8 h-8" style={{ color: '#ec4899', opacity: config.colorIntensity / 100 }} />
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5" style={previewTextStyle}>
                    <p className="text-xs font-bold text-white truncate">Spotify Premium</p>
                    <p className="text-[10px] text-zinc-500">3 เดือน</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-400">฿149</span>
                      <span className="text-[10px] text-zinc-600">สต็อก: 5</span>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Info */}
                <div style={previewCardStyle} className="p-3 space-y-2">
                  <div className="flex items-center gap-2" style={previewTextStyle}>
                    <Globe className="w-4 h-4 text-emerald-400" style={{ opacity: config.colorIntensity / 100 }} />
                    <span className="text-xs font-medium text-white">VPN Server</span>
                  </div>
                  <div style={previewTextStyle}>
                    <p className="text-[10px] text-zinc-500">สถานะ: ออนไลน์</p>
                    <p className="text-[10px] text-emerald-400" style={{ opacity: config.colorIntensity / 100 }}>Ping: 12ms</p>
                  </div>
                </div>

                {/* Card 4 - Featured */}
                <div
                  style={{
                    ...previewCardStyle,
                    background: `linear-gradient(135deg, ${accentColorActive}08, rgba(236,72,153,0.04))`,
                    borderColor: `${accentColorActive}33`,
                  }}
                  className="p-3 space-y-2"
                >
                  <div className="flex items-center gap-2" style={previewTextStyle}>
                    <Sparkles className="w-4 h-4" style={{ color: accentColorActive, opacity: config.colorIntensity / 100 }} />
                    <span className="text-xs font-medium text-white">แนะนำ</span>
                  </div>
                  <div style={previewTextStyle}>
                    <p className="text-[10px] text-zinc-500">สินค้ายอดนิยม</p>
                    <p className="text-[10px]" style={{ color: accentColorActive }}>ลด 20%</p>
                  </div>
                </div>
              </div>

              {/* Button preview */}
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2 text-xs font-medium text-white transition-all"
                  style={{
                    backgroundColor: accentColorActive,
                    borderRadius: `${config.borderRadius}px`,
                    opacity: config.colorIntensity / 100,
                  }}
                >
                  ซื้อเลย
                </button>
                <button
                  className="flex-1 py-2 text-xs font-medium transition-all"
                  style={{
                    ...previewCardStyle,
                    color: accentColorActive,
                  }}
                >
                  ดูรายละเอียด
                </button>
              </div>

              {/* Bottom nav preview */}
              <div className="flex items-center justify-around py-2" style={{
                ...previewCardStyle,
                borderWidth: `${config.borderWidth}px 0 0 0`,
              }}>
                {[
                  { icon: Home, label: 'หน้าแรก', active: true },
                  { icon: ShoppingBag, label: 'ร้านค้า', active: false },
                  { icon: CreditCard, label: 'เติมเงิน', active: false },
                  { icon: User, label: 'โปรไฟล์', active: false },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5" style={previewTextStyle}>
                    <item.icon className="w-4 h-4" style={{ color: item.active ? accentColorActive : '#71717a' }} />
                    <span className="text-[9px]" style={{ color: item.active ? accentColorActive : '#71717a' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current values summary */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">ค่าปัจจุบัน</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">มุมโค้ง</span>
                <span className="text-white font-mono">{config.borderRadius}px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ความหนาขอบ</span>
                <span className="text-white font-mono">{config.borderWidth}px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ทึบการ์ด</span>
                <span className="text-white font-mono">{config.cardOpacity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">เบลอ</span>
                <span className="text-white font-mono">{config.backdropBlur}px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">สว่างตัวอักษร</span>
                <span className="text-white font-mono">{config.textBrightness}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ความเข้มสี</span>
                <span className="text-white font-mono">{config.colorIntensity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">เบลอ Navbar</span>
                <span className="text-white font-mono">{config.navbarBlur}px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ทึบ Navbar</span>
                <span className="text-white font-mono">{config.navbarOpacity}%</span>
              </div>
              {config.useCustomAccent && (
                <div className="flex justify-between col-span-2">
                  <span className="text-zinc-500">สีกำหนดเอง</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.accentColor }} />
                    <span className="text-white font-mono">{config.accentColor}</span>
                  </div>
                </div>
              )}
              {config.useCustomBg && (
                <div className="flex justify-between col-span-2">
                  <span className="text-zinc-500">สีพื้นหลัง</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: config.backgroundColor }} />
                    <span className="text-white font-mono">{config.backgroundColor}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile floating save bar */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-3 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-shrink-0 px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-4 ${
          toast.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/20 border border-red-500/30 text-red-300'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
