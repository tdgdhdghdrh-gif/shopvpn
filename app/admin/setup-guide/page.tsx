'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, AlertCircle,
  CheckCircle2, Smartphone, ChevronDown, GripVertical,
  RotateCcw, Eye, Star, X, ChevronUp,
} from 'lucide-react'

interface SetupGuideItem {
  id: string
  stepLabel: string
  title: string
  code: string
  price: string
  description: string
  recommended: boolean
}

interface SetupGuideSection {
  id: string
  title: string
  subtitle: string
  color: string
  items: SetupGuideItem[]
  extraCodes: { code: string; label: string }[]
  recommendationText: string
  recommendationSub: string
}

interface SetupGuideConfig {
  heroTitle: string
  heroSubtitle: string
  importantNotice: string
  sections: SetupGuideSection[]
  summaryTitle: string
  summaryItems: { label: string; operator: string; price: string; highlight: boolean; highlightLabel?: string }[]
  ctaText: string
}

const COLORS = [
  { value: 'emerald', label: 'เขียว', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'blue', label: 'น้ำเงิน', class: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 'red', label: 'แดง', class: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { value: 'amber', label: 'เหลือง', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { value: 'cyan', label: 'ฟ้า', class: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { value: 'purple', label: 'ม่วง', class: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { value: 'rose', label: 'กุหลาบ', class: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
]

function getColorClass(color: string) {
  return COLORS.find(c => c.value === color)?.class || COLORS[0].class
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

const defaultConfig: SetupGuideConfig = {
  heroTitle: 'โปรเสริมที่ต้องสมัคร',
  heroSubtitle: 'สมัครโปรเสริมก่อนใช้ VPN เพื่อความเสถียรสูงสุด',
  importantNotice: 'ควรเติมเงินไว้ในซิมให้พอสำหรับการต่ออายุอัตโนมัติในเดือนถัดไป เพื่อไม่ให้โปรหลุดกลางทาง',
  sections: [],
  summaryTitle: 'สรุปค่าใช้จ่ายต่อเดือน',
  summaryItems: [],
  ctaText: 'เลือกเซิร์ฟเวอร์ VPN',
}

export default function SetupGuideAdminPage() {
  const [config, setConfig] = useState<SetupGuideConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchConfig()
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function fetchConfig() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/setup-guide')
      const data = await res.json()
      if (data.success && data.config) {
        setConfig(data.config)
      } else {
        // Use default with sections
        setConfig({
          ...defaultConfig,
          sections: [
            {
              id: 'ais',
              title: 'AIS One-2-Call',
              subtitle: 'ซิม AIS ต้องสมัครโปรกันรั่วก่อนใช้งาน',
              color: 'emerald',
              items: [
                { id: generateId(), stepLabel: 'ขั้นตอนที่ 1 - เปลี่ยนแพ็คเกจหลัก', title: 'Easy Free Net กันรั่ว 64kbps', code: '*777*44#', price: 'ครั้งแรกฟรี / ครั้งต่อไป 10 บาท', description: 'ลูกค้าใหม่กด *777*44# / ลูกค้าเดิมใช้งานเกิน 30 วัน กด *777*1043#', recommended: false },
                { id: generateId(), stepLabel: 'ขั้นตอนที่ 2 - เลือกโปรกันรั่ว (เลือก 1 อย่าง)', title: 'กันเน็ตรั่ว 64kbps', code: '*777*7067#', price: '32 บาท/เดือน (รวม VAT)', description: '', recommended: false },
                { id: generateId(), stepLabel: '', title: 'กันรั่ว 128kbps', code: '*777*7068#', price: '36 บาท/เดือน (รวม VAT)', description: '', recommended: false },
                { id: generateId(), stepLabel: '', title: 'กันรั่ว 7 วัน', code: '*777*7311#', price: '20 บาท / 7 วัน', description: 'เหมาะสำหรับทดลองใช้ระยะสั้น', recommended: false },
                { id: generateId(), stepLabel: 'ขั้นตอนที่ 3 - เสริมความเสถียร (แนะนำ)', title: 'AIS PLAY', code: '*777*885#', price: '64 บาท/เดือน (รวม VAT)', description: 'แนะนำสมัครเพิ่มเพื่อความเสถียรสูงสุด เน็ตไม่หลุดง่าย', recommended: true },
              ],
              extraCodes: [{ code: '*777*1043#', label: 'สำหรับลูกค้าเดิมใช้งานเกิน 30 วัน' }],
              recommendationText: 'เหมาะสำหรับ: สายเกม, สายไลฟ์สด, สายโหลด, สายดูหนัง, เล่นโซเซียลมีเดีย',
              recommendationSub: 'งบน้อยสมัครแค่กันรั่วก็พอ แต่ถ้าอยากเสถียรแนะนำสมัคร AIS Play ด้วย',
            },
            {
              id: 'true',
              title: 'True Zoom',
              subtitle: 'ซิม True สมัครโปร Zoom เพื่อใช้งาน VPN',
              color: 'red',
              items: [
                { id: generateId(), stepLabel: '', title: 'True Zoom', code: '*900*8234#', price: '81 บาท / 30 วัน (รวม VAT)', description: 'ความเร็วสูงสุด 10Mbps เหมาะสำหรับดูหนัง ฟังเพลง ท่องโซเซียล', recommended: true },
              ],
              extraCodes: [],
              recommendationText: 'เหมาะสำหรับ: ดูหนัง, ฟังเพลง, ท่องโซเซียล (MaxSpeed 10Mbps)',
              recommendationSub: '',
            },
          ],
          summaryItems: [
            { label: 'กันรั่ว 64kbps อย่างเดียว', operator: 'AIS', price: '32 บาท/ด.', highlight: false },
            { label: 'กันรั่ว 64kbps + AIS Play', operator: 'AIS', price: '96 บาท/ด.', highlight: true, highlightLabel: 'แนะนำ' },
            { label: 'กันรั่ว 128kbps + AIS Play', operator: 'AIS', price: '100 บาท/ด.', highlight: false },
            { label: 'True Zoom 10Mbps', operator: 'TRUE', price: '81 บาท/ด.', highlight: false },
          ],
        })
      }
    } catch {
      setToast({ type: 'error', message: 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/setup-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: 'บันทึกสำเร็จ' })
      } else {
        setToast({ type: 'error', message: data.error || 'บันทึกไม่สำเร็จ' })
      }
    } catch {
      setToast({ type: 'error', message: 'บันทึกไม่สำเร็จ' })
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!confirm('ยืนยันรีเซ็ตเป็นค่าเริ่มต้น? ข้อมูลที่แก้ไขจะหายทั้งหมด')) return
    try {
      const res = await fetch('/api/admin/setup-guide', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: 'รีเซ็ตสำเร็จ' })
        fetchConfig()
      }
    } catch {
      setToast({ type: 'error', message: 'รีเซ็ตไม่สำเร็จ' })
    }
  }

  function updateField(field: keyof SetupGuideConfig, value: any) {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  function addSection() {
    const newSection: SetupGuideSection = {
      id: generateId(),
      title: 'เครือข่ายใหม่',
      subtitle: '',
      color: 'emerald',
      items: [],
      extraCodes: [],
      recommendationText: '',
      recommendationSub: '',
    }
    setConfig(prev => ({ ...prev, sections: [...prev.sections, newSection] }))
    setExpandedSections(prev => ({ ...prev, [newSection.id]: true }))
  }

  function removeSection(sectionId: string) {
    setConfig(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sectionId) }))
  }

  function updateSection(sectionId: string, field: keyof SetupGuideSection, value: any) {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s)
    }))
  }

  function addItem(sectionId: string) {
    const newItem: SetupGuideItem = {
      id: generateId(),
      stepLabel: '',
      title: '',
      code: '',
      price: '',
      description: '',
      recommended: false,
    }
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
      )
    }))
  }

  function removeItem(sectionId: string, itemId: string) {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
      )
    }))
  }

  function updateItem(sectionId: string, itemId: string, field: keyof SetupGuideItem, value: any) {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) }
          : s
      )
    }))
  }

  function moveItem(sectionId: string, itemIndex: number, direction: number) {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s
        const items = [...s.items]
        const newIndex = itemIndex + direction
        if (newIndex < 0 || newIndex >= items.length) return s
        const [moved] = items.splice(itemIndex, 1)
        items.splice(newIndex, 0, moved)
        return { ...s, items }
      })
    }))
  }

  function moveSection(sectionIndex: number, direction: number) {
    setConfig(prev => {
      const sections = [...prev.sections]
      const newIndex = sectionIndex + direction
      if (newIndex < 0 || newIndex >= sections.length) return prev
      const [moved] = sections.splice(sectionIndex, 1)
      sections.splice(newIndex, 0, moved)
      return { ...prev, sections }
    })
  }

  function addExtraCode(sectionId: string) {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, extraCodes: [...s.extraCodes, { code: '', label: '' }] } : s
      )
    }))
  }

  function removeExtraCode(sectionId: string, index: number) {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, extraCodes: s.extraCodes.filter((_, i) => i !== index) } : s
      )
    }))
  }

  function updateExtraCode(sectionId: string, index: number, field: 'code' | 'label', value: string) {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, extraCodes: s.extraCodes.map((ec, i) => i === index ? { ...ec, [field]: value } : ec) }
          : s
      )
    }))
  }

  function addSummaryItem() {
    setConfig(prev => ({
      ...prev,
      summaryItems: [...prev.summaryItems, { label: '', operator: 'AIS', price: '', highlight: false }]
    }))
  }

  function removeSummaryItem(index: number) {
    setConfig(prev => ({
      ...prev,
      summaryItems: prev.summaryItems.filter((_, i) => i !== index)
    }))
  }

  function updateSummaryItem(index: number, field: string, value: any) {
    setConfig(prev => ({
      ...prev,
      summaryItems: prev.summaryItems.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-lg font-bold">จัดการหน้า Setup Guide</h1>
              <p className="text-[11px] text-zinc-500">แก้ไขเนื้อหา /setup-guide โปรเสริมที่ต้องสมัคร</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              รีเซ็ต
            </button>
            <Link
              href="/setup-guide"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              ดูหน้าเว็บ
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-500/20 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              บันทึก
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero Settings */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                หัวข้อหลัก
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-zinc-500 mb-1.5 block">หัวข้อใหญ่</label>
                  <input
                    type="text"
                    value={config.heroTitle}
                    onChange={e => updateField('heroTitle', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-500 mb-1.5 block">คำอธิบายใต้หัวข้อ</label>
                  <input
                    type="text"
                    value={config.heroSubtitle}
                    onChange={e => updateField('heroSubtitle', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-500 mb-1.5 block">ข้อความเตือนสำคัญ</label>
                <textarea
                  value={config.importantNotice}
                  onChange={e => updateField('importantNotice', e.target.value)}
                  rows={2}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">เครือข่าย / หมวดหมู่</h2>
                <button
                  onClick={addSection}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มเครือข่าย
                </button>
              </div>

              {config.sections.map((section, sectionIndex) => (
                <div key={section.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 p-4 bg-white/[0.02]">
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                      className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${expandedSections[section.id] !== false ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={section.title}
                        onChange={e => updateSection(section.id, 'title', e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                        placeholder="ชื่อเครือข่าย"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSection(sectionIndex, -1)}
                        disabled={sectionIndex === 0}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                      </button>
                      <button
                        onClick={() => moveSection(sectionIndex, 1)}
                        disabled={sectionIndex === config.sections.length - 1}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                      </button>
                      <select
                        value={section.color}
                        onChange={e => updateSection(section.id, 'color', e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                      >
                        {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {expandedSections[section.id] !== false && (
                    <div className="p-4 space-y-4 border-t border-white/5">
                      <input
                        type="text"
                        value={section.subtitle}
                        onChange={e => updateSection(section.id, 'subtitle', e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-400 focus:border-cyan-500/50 focus:outline-none"
                        placeholder="คำอธิบายเครือข่าย"
                      />

                      {/* Recommendation */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-zinc-500">ข้อความแนะนำด้านบน</label>
                        <input
                          type="text"
                          value={section.recommendationText}
                          onChange={e => updateSection(section.id, 'recommendationText', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
                          placeholder="เหมาะสำหรับ: ..."
                        />
                        <input
                          type="text"
                          value={section.recommendationSub}
                          onChange={e => updateSection(section.id, 'recommendationSub', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-400 focus:border-cyan-500/50 focus:outline-none"
                          placeholder="คำอธิบายเพิ่มเติม..."
                        />
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-500">รายการโปร</span>
                          <button
                            onClick={() => addItem(section.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            เพิ่มรายการ
                          </button>
                        </div>

                        {section.items.map((item, itemIndex) => (
                          <div key={item.id} className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-3.5 h-3.5 text-zinc-600" />
                              <input
                                type="text"
                                value={item.stepLabel}
                                onChange={e => updateItem(section.id, item.id, 'stepLabel', e.target.value)}
                                className="flex-1 bg-transparent text-[11px] font-bold text-zinc-500 uppercase tracking-wider focus:outline-none"
                                placeholder="ขั้นตอนที่ X - ..."
                              />
                              <button
                                onClick={() => updateItem(section.id, item.id, 'recommended', !item.recommended)}
                                className={`p-1.5 rounded-lg transition-colors ${item.recommended ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-white/5 text-zinc-600'}`}
                                title="แนะนำ"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveItem(section.id, itemIndex, -1)}
                                disabled={itemIndex === 0}
                                className="p-1 hover:bg-white/5 rounded disabled:opacity-30"
                              >
                                <ChevronUp className="w-3 h-3 text-zinc-500" />
                              </button>
                              <button
                                onClick={() => moveItem(section.id, itemIndex, 1)}
                                disabled={itemIndex === section.items.length - 1}
                                className="p-1 hover:bg-white/5 rounded disabled:opacity-30"
                              >
                                <ChevronDown className="w-3 h-3 text-zinc-500" />
                              </button>
                              <button
                                onClick={() => removeItem(section.id, item.id)}
                                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={item.title}
                                onChange={e => updateItem(section.id, item.id, 'title', e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
                                placeholder="ชื่อโปร"
                              />
                              <input
                                type="text"
                                value={item.code}
                                onChange={e => updateItem(section.id, item.id, 'code', e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-400 focus:border-cyan-500/50 focus:outline-none"
                                placeholder="*777*xxxx#"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={item.price}
                                onChange={e => updateItem(section.id, item.id, 'price', e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
                                placeholder="ราคา"
                              />
                              <input
                                type="text"
                                value={item.description}
                                onChange={e => updateItem(section.id, item.id, 'description', e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 focus:border-cyan-500/50 focus:outline-none"
                                placeholder="คำอธิบาย (ไม่บังคับ)"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Extra Codes */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-500">รหัสเพิ่มเติม</span>
                          <button
                            onClick={() => addExtraCode(section.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            เพิ่มรหัส
                          </button>
                        </div>
                        {section.extraCodes.map((ec, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={ec.code}
                              onChange={e => updateExtraCode(section.id, i, 'code', e.target.value)}
                              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-400 focus:border-cyan-500/50 focus:outline-none"
                              placeholder="*777*xxxx#"
                            />
                            <input
                              type="text"
                              value={ec.label}
                              onChange={e => updateExtraCode(section.id, i, 'label', e.target.value)}
                              className="flex-[2] bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 focus:border-cyan-500/50 focus:outline-none"
                              placeholder="คำอธิบาย"
                            />
                            <button
                              onClick={() => removeExtraCode(section.id, i)}
                              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">สรุปค่าใช้จ่าย</h2>
                <button
                  onClick={addSummaryItem}
                  className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  เพิ่มรายการ
                </button>
              </div>
              <input
                type="text"
                value={config.summaryTitle}
                onChange={e => updateField('summaryTitle', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="หัวข้อสรุป"
              />
              <div className="space-y-2">
                {config.summaryItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={item.operator}
                      onChange={e => updateSummaryItem(i, 'operator', e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="AIS">AIS</option>
                      <option value="TRUE">TRUE</option>
                      <option value="DTAC">DTAC</option>
                      <option value="Other">อื่นๆ</option>
                    </select>
                    <input
                      type="text"
                      value={item.label}
                      onChange={e => updateSummaryItem(i, 'label', e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
                      placeholder="ชื่อแพ็คเกจ"
                    />
                    <input
                      type="text"
                      value={item.price}
                      onChange={e => updateSummaryItem(i, 'price', e.target.value)}
                      className="w-28 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
                      placeholder="ราคา"
                    />
                    <button
                      onClick={() => updateSummaryItem(i, 'highlight', !item.highlight)}
                      className={`p-1.5 rounded-lg transition-colors ${item.highlight ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-white/5 text-zinc-600'}`}
                      title="แนะนำ"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeSummaryItem(i)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
              <label className="text-[11px] font-medium text-zinc-500 mb-1.5 block">ข้อความปุ่มกลับหน้าแรก</label>
              <input
                type="text"
                value={config.ctaText}
                onChange={e => updateField('ctaText', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
