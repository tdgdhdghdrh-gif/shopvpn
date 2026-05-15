'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, Save, CheckCircle2, X, GripVertical, Palette,
  LayoutGrid, Sparkles, Type, Plus, Trash2, Image as ImageIcon,
  ChevronUp, ChevronDown
} from 'lucide-react'

type Tab = 'reorder' | 'card' | 'section' | 'widgets'

interface Server {
  id: string
  name: string
  flag: string
  sortOrder: number
  isHidden?: boolean
  imageUrl?: string | null
}

interface Preset {
  id: string
  name: string
  emoji: string
  description?: string
}

interface Widget {
  id: string
  type: 'banner' | 'text' | 'divider' | 'image'
  position: 'before' | 'after'
  config: any
}

const newWidgetId = () => `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

export default function ServerPageDecoratorPage() {
  const [tab, setTab] = useState<Tab>('reorder')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [servers, setServers] = useState<Server[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const [cardStylePresets, setCardStylePresets] = useState<Preset[]>([])
  const [sectionThemePresets, setSectionThemePresets] = useState<Preset[]>([])
  const [config, setConfig] = useState({
    serverCardStyle: 'default',
    serverSectionTheme: 'default',
    serverSectionTitle: '',
    serverSectionSubtitle: '',
    serverPageWidgets: [] as Widget[],
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/server-page-decorator').then(r => r.json()),
      fetch('/api/admin/servers').then(r => r.json()),
    ])
      .then(([decoData, serversData]) => {
        if (decoData.success) {
          setCardStylePresets(decoData.cardStylePresets)
          setSectionThemePresets(decoData.sectionThemePresets)
          setConfig({
            serverCardStyle: decoData.config.serverCardStyle,
            serverSectionTheme: decoData.config.serverSectionTheme,
            serverSectionTitle: decoData.config.serverSectionTitle || '',
            serverSectionSubtitle: decoData.config.serverSectionSubtitle || '',
            serverPageWidgets: Array.isArray(decoData.config.serverPageWidgets) ? decoData.config.serverPageWidgets : [],
          })
        }
        if (serversData.servers) {
          const sorted = [...serversData.servers].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          setServers(sorted)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const flashMsg = (kind: 'success' | 'error', msg: string) => {
    if (kind === 'success') setSuccessMsg(msg)
    else setErrorMsg(msg)
    setTimeout(() => { setSuccessMsg(''); setErrorMsg('') }, 3000)
  }

  // === Drag-drop ===
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
  const onDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!draggingId || draggingId === overId) return
    setServers(prev => {
      const fromIdx = prev.findIndex(s => s.id === draggingId)
      const toIdx = prev.findIndex(s => s.id === overId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const copy = [...prev]
      const [removed] = copy.splice(fromIdx, 1)
      copy.splice(toIdx, 0, removed)
      return copy
    })
  }
  const onDragEnd = () => setDraggingId(null)

  const moveServer = (idx: number, dir: -1 | 1) => {
    setServers(prev => {
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const [removed] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, removed)
      return copy
    })
  }

  const saveOrder = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/servers/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: servers.map(s => s.id) }),
      })
      const d = await res.json()
      if (d.success) flashMsg('success', `บันทึกลำดับสำเร็จ (${d.count} servers)`)
      else flashMsg('error', d.error || 'ไม่สำเร็จ')
    } catch {
      flashMsg('error', 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/server-page-decorator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const d = await res.json()
      if (d.success) flashMsg('success', 'บันทึกแล้ว — reload หน้า user เพื่อดูผล')
      else flashMsg('error', d.error || 'ไม่สำเร็จ')
    } catch {
      flashMsg('error', 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  // === Widget operations ===
  const addWidget = (type: Widget['type']) => {
    const defaults: Record<Widget['type'], any> = {
      banner: { text: 'แบนเนอร์ใหม่', bgColor: '#1e293b', textColor: '#ffffff', emoji: '🎉' },
      text: { content: 'ข้อความตกแต่ง', size: 'md', align: 'center', color: '#94a3b8' },
      divider: { style: 'line', color: '#27272a' },
      image: { url: '', alt: '' },
    }
    setConfig(c => ({
      ...c,
      serverPageWidgets: [
        ...c.serverPageWidgets,
        { id: newWidgetId(), type, position: 'before', config: defaults[type] },
      ],
    }))
  }
  const removeWidget = (id: string) => {
    setConfig(c => ({ ...c, serverPageWidgets: c.serverPageWidgets.filter(w => w.id !== id) }))
  }
  const updateWidget = (id: string, patch: Partial<Widget> | { config: any }) => {
    setConfig(c => ({
      ...c,
      serverPageWidgets: c.serverPageWidgets.map(w =>
        w.id === id ? { ...w, ...patch, config: 'config' in patch ? { ...w.config, ...patch.config } : w.config } : w
      ),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'reorder', label: 'ลำดับ Server', icon: GripVertical },
    { id: 'card', label: 'สไตล์การ์ด', icon: LayoutGrid },
    { id: 'section', label: 'หัวข้อ Section', icon: Type },
    { id: 'widgets', label: 'Widget ตกแต่ง', icon: Sparkles },
  ]

  return (
    <div className="px-3 sm:px-0 max-w-5xl mx-auto pb-10">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
            <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">ตกแต่งหน้าขาย VPN</h1>
            <p className="text-xs sm:text-sm text-zinc-500">จัดลำดับ server / สไตล์การ์ด / หัวข้อ / widget</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
          <X className="w-4 h-4" /> {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-950/40 border border-white/[0.04] rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              tab === t.id
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* === Tab: Reorder === */}
      {tab === 'reorder' && (
        <div className="space-y-3">
          <div className="px-4 py-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-blue-300/80">
              <strong>วิธีใช้:</strong> ลากบนไอคอน <GripVertical className="w-3 h-3 inline" /> ที่ซ้ายมือ (desktop) หรือกดปุ่มลูกศร <ChevronUp className="w-3 h-3 inline" /> <ChevronDown className="w-3 h-3 inline" /> เพื่อจัดลำดับ — server ด้านบนสุดจะแสดงก่อนในหน้าเว็บ
            </p>
          </div>

          {servers.map((s, idx) => (
            <div
              key={s.id}
              onDragOver={(e) => onDragOver(e, s.id)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-2 sm:gap-3 p-3 rounded-xl bg-zinc-950/60 border transition-all ${
                draggingId === s.id ? 'opacity-50 border-cyan-500/50' : 'border-white/[0.06] hover:border-white/15'
              } ${s.isHidden ? 'opacity-50' : ''}`}
            >
              <div
                draggable
                onDragStart={(e) => onDragStart(e, s.id)}
                className="p-1 cursor-grab active:cursor-grabbing touch-none"
                title="ลากเพื่อจัดลำดับ"
              >
                <GripVertical className="w-5 h-5 text-zinc-500" />
              </div>
              <span className="text-xl">{s.flag}</span>
              <span className="flex-1 text-sm font-bold text-white truncate">{s.name}</span>
              {s.isHidden && <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">ซ่อน</span>}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => moveServer(idx, -1)}
                  disabled={idx === 0}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="ขึ้น"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveServer(idx, 1)}
                  disabled={idx === servers.length - 1}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="ลง"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={saveOrder}
            disabled={saving}
            className="mt-4 w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            บันทึกลำดับ
          </button>
        </div>
      )}

      {/* === Tab: Card Style === */}
      {tab === 'card' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cardStylePresets.map(p => (
              <button
                key={p.id}
                onClick={() => setConfig(c => ({ ...c, serverCardStyle: p.id }))}
                className={`p-4 rounded-xl border text-left transition-all ${
                  config.serverCardStyle === p.id
                    ? 'bg-white/10 border-white/30 ring-2 ring-white/20'
                    : 'bg-zinc-950/40 border-white/[0.04] hover:border-white/15'
                }`}
              >
                <div className="text-3xl mb-2">{p.emoji}</div>
                <p className="text-sm font-bold text-white">{p.name}</p>
                {p.description && <p className="text-[11px] text-zinc-500 mt-1">{p.description}</p>}
                {/* Mini preview */}
                <div className={`mt-3 h-14 rounded-lg border ${cardStyleClass(p.id)}`}>
                  <div className="h-full flex items-center justify-center text-[10px] text-white/60">Preview</div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={saveConfig}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            บันทึก
          </button>
        </div>
      )}

      {/* === Tab: Section Theme === */}
      {tab === 'section' && (
        <div className="space-y-4">
          <div className="bg-zinc-950/40 border border-white/[0.04] rounded-xl p-5 space-y-3">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">หัวข้อ Section</label>
              <input
                type="text"
                value={config.serverSectionTitle}
                placeholder="เลือกเซิร์ฟเวอร์"
                onChange={e => setConfig(c => ({ ...c, serverSectionTitle: e.target.value }))}
                maxLength={100}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">คำอธิบายใต้หัวข้อ (ไม่จำเป็น)</label>
              <input
                type="text"
                value={config.serverSectionSubtitle}
                placeholder="เลือกเซิร์ฟเวอร์ที่ดีที่สุดสำหรับคุณ"
                onChange={e => setConfig(c => ({ ...c, serverSectionSubtitle: e.target.value }))}
                maxLength={200}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {sectionThemePresets.map(p => (
              <button
                key={p.id}
                onClick={() => setConfig(c => ({ ...c, serverSectionTheme: p.id }))}
                className={`p-4 rounded-xl border text-center transition-all ${
                  config.serverSectionTheme === p.id
                    ? 'bg-white/10 border-white/30 ring-2 ring-white/20'
                    : 'bg-zinc-950/40 border-white/[0.04] hover:border-white/15'
                }`}
              >
                <div className="text-2xl mb-1">{p.emoji}</div>
                <p className="text-xs font-bold text-white">{p.name}</p>
              </button>
            ))}
          </div>

          <button
            onClick={saveConfig}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            บันทึก
          </button>
        </div>
      )}

      {/* === Tab: Widgets === */}
      {tab === 'widgets' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addWidget('banner')} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white flex items-center gap-1 hover:bg-white/10"><Plus className="w-3 h-3" /> แบนเนอร์</button>
            <button onClick={() => addWidget('text')} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white flex items-center gap-1 hover:bg-white/10"><Plus className="w-3 h-3" /> ข้อความ</button>
            <button onClick={() => addWidget('divider')} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white flex items-center gap-1 hover:bg-white/10"><Plus className="w-3 h-3" /> เส้นคั่น</button>
            <button onClick={() => addWidget('image')} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white flex items-center gap-1 hover:bg-white/10"><Plus className="w-3 h-3" /> รูปภาพ</button>
          </div>

          {config.serverPageWidgets.length === 0 && (
            <div className="py-10 text-center bg-zinc-950/40 border border-dashed border-white/10 rounded-xl">
              <p className="text-sm text-zinc-500">ยังไม่มี widget — กดปุ่มด้านบนเพื่อเพิ่ม</p>
            </div>
          )}

          {config.serverPageWidgets.map(w => (
            <div key={w.id} className="bg-zinc-950/40 border border-white/[0.04] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-cyan-400 uppercase">{w.type}</p>
                <div className="flex items-center gap-2">
                  <select
                    value={w.position}
                    onChange={e => updateWidget(w.id, { position: e.target.value as 'before' | 'after' })}
                    className="px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-white"
                  >
                    <option value="before">ก่อนรายการ server</option>
                    <option value="after">หลังรายการ server</option>
                  </select>
                  <button onClick={() => removeWidget(w.id)} className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {w.type === 'banner' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input value={w.config.emoji || ''} placeholder="emoji เช่น 🎉" onChange={e => updateWidget(w.id, { config: { emoji: e.target.value } })} className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white" />
                  <input value={w.config.text || ''} placeholder="ข้อความแบนเนอร์" onChange={e => updateWidget(w.id, { config: { text: e.target.value } })} className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white" />
                  <label className="flex items-center gap-2 text-xs text-zinc-400">สีพื้น <input type="color" value={w.config.bgColor || '#1e293b'} onChange={e => updateWidget(w.id, { config: { bgColor: e.target.value } })} className="w-10 h-8 rounded cursor-pointer" /></label>
                  <label className="flex items-center gap-2 text-xs text-zinc-400">สีข้อความ <input type="color" value={w.config.textColor || '#ffffff'} onChange={e => updateWidget(w.id, { config: { textColor: e.target.value } })} className="w-10 h-8 rounded cursor-pointer" /></label>
                </div>
              )}

              {w.type === 'text' && (
                <div className="space-y-2">
                  <textarea value={w.config.content || ''} placeholder="ข้อความ..." onChange={e => updateWidget(w.id, { config: { content: e.target.value } })} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white" rows={2} />
                  <div className="flex gap-2 flex-wrap">
                    <select value={w.config.size || 'md'} onChange={e => updateWidget(w.id, { config: { size: e.target.value } })} className="px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-white">
                      <option value="sm">เล็ก</option>
                      <option value="md">กลาง</option>
                      <option value="lg">ใหญ่</option>
                      <option value="xl">ใหญ่มาก</option>
                    </select>
                    <select value={w.config.align || 'center'} onChange={e => updateWidget(w.id, { config: { align: e.target.value } })} className="px-2 py-1 rounded bg-black/40 border border-white/10 text-xs text-white">
                      <option value="left">ซ้าย</option>
                      <option value="center">กลาง</option>
                      <option value="right">ขวา</option>
                    </select>
                    <input type="color" value={w.config.color || '#94a3b8'} onChange={e => updateWidget(w.id, { config: { color: e.target.value } })} className="w-10 h-8 rounded cursor-pointer" />
                  </div>
                </div>
              )}

              {w.type === 'divider' && (
                <select value={w.config.style || 'line'} onChange={e => updateWidget(w.id, { config: { style: e.target.value } })} className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white">
                  <option value="line">เส้นบาง</option>
                  <option value="dashed">เส้นประ</option>
                  <option value="gradient">ไล่สี</option>
                  <option value="space">ระยะห่างเฉยๆ</option>
                </select>
              )}

              {w.type === 'image' && (
                <div className="space-y-2">
                  <input value={w.config.url || ''} placeholder="URL รูปภาพ" onChange={e => updateWidget(w.id, { config: { url: e.target.value } })} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white" />
                  <input value={w.config.alt || ''} placeholder="คำอธิบายรูป (alt)" onChange={e => updateWidget(w.id, { config: { alt: e.target.value } })} className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white" />
                  {w.config.url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={w.config.url} alt="" className="max-h-40 rounded-lg" />
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={saveConfig}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            บันทึก Widgets
          </button>
        </div>
      )}
    </div>
  )
}

function cardStyleClass(id: string): string {
  switch (id) {
    case 'glass': return 'bg-white/5 backdrop-blur-md border-white/10'
    case 'neon': return 'bg-zinc-950 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
    case 'premium': return 'bg-gradient-to-br from-amber-900/30 to-amber-700/20 border-amber-500/40'
    case 'minimal': return 'bg-zinc-950 border-zinc-800'
    case 'gaming': return 'bg-gradient-to-br from-violet-900/30 to-blue-900/30 border-violet-500/30'
    default: return 'bg-zinc-900 border-white/10'
  }
}
