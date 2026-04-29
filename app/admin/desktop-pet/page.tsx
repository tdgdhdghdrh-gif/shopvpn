'use client'

import { useState, useEffect } from 'react'
import {
  Cat, Save, Loader2, CheckCircle2, AlertCircle,
  ToggleLeft, ToggleRight, Image, Sliders, Zap,
  Gauge, ArrowUp
} from 'lucide-react'

const PRESET_PETS = [
  { name: 'สัตว์เลี้ยงวิ่ง', url: 'https://i.imgur.com/JYUB0m3.gif' },
  { name: 'แมวน้อย', url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' },
  { name: 'หมาป่าวิ่ง', url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif' },
  { name: 'เพนกวิน', url: 'https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif' },
  { name: 'ไดโนเสาร์', url: 'https://media.giphy.com/media/l0HlTy9x8FZo0XO1i/giphy.gif' },
  { name: 'นกบิน', url: 'https://media.giphy.com/media/3o7TKP9ln2rnAMzU6I/giphy.gif' },
  { name: 'ปลาฉลาม', url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif' },
]

export default function DesktopPetPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [enabled, setEnabled] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [size, setSize] = useState(60)
  const [speed, setSpeed] = useState(2)
  const [gravity, setGravity] = useState(0.4)
  const [jumpPower, setJumpPower] = useState(10)

  useEffect(() => {
    fetch('/api/admin/desktop-pet')
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setEnabled(data.desktopPetEnabled ?? false)
          setImageUrl(data.desktopPetImageUrl || '')
          setSize(data.desktopPetSize ?? 60)
          setSpeed(data.desktopPetSpeed ?? 2)
          setGravity(data.desktopPetGravity ?? 0.4)
          setJumpPower(data.desktopPetJumpPower ?? 10)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(t)
    }
  }, [message])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/desktop-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          desktopPetEnabled: enabled,
          desktopPetImageUrl: imageUrl,
          desktopPetSize: size,
          desktopPetSpeed: speed,
          desktopPetGravity: gravity,
          desktopPetJumpPower: jumpPower,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'บันทึกเรียบร้อย' })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto sm:w-96 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center border border-pink-500/20">
              <Cat className="w-4 h-4 text-pink-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">ตัวละครวิ่ง</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">ตั้งค่าตัวละครวิ่งบนหน้าจอ (Desktop Pet)</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">{enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
          <button onClick={() => setEnabled(!enabled)} className="transition-all">
            {enabled ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-zinc-600" />}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Image className="w-4 h-4 text-pink-400" /> เลือกตัวละคร
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {PRESET_PETS.map((pet) => (
            <button
              key={pet.url}
              onClick={() => setImageUrl(pet.url)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                imageUrl === pet.url
                  ? 'bg-pink-500/10 border-pink-500/30'
                  : 'bg-zinc-950 border-white/5 hover:border-white/10'
              }`}
            >
              <img src={pet.url} alt={pet.name} className="w-10 h-10 object-contain" />
              <span className={`text-[10px] font-bold ${imageUrl === pet.url ? 'text-pink-400' : 'text-zinc-500'}`}>{pet.name}</span>
            </button>
          ))}
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">หรือใส่ลิงก์ GIF เอง</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/pet.gif"
            className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* Preview */}
      {imageUrl && (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">ตัวอย่าง</h3>
          <div className="flex items-center justify-center py-6 bg-zinc-950 rounded-xl border border-white/5">
            <img src={imageUrl} alt="preview" className="object-contain" style={{ width: size, height: 'auto' }} />
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-pink-400" /> ตั้งค่าพฤติกรรม
        </h3>

        {/* Size */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ขนาด ({size}px)</label>
            <span className="text-xs text-zinc-400 font-mono">{size}px</span>
          </div>
          <input
            type="range" min="20" max="200" value={size} onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Speed */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ความเร็ว ({speed})</label>
            <span className="text-xs text-zinc-400 font-mono">{speed}</span>
          </div>
          <input
            type="range" min="0.5" max="10" step="0.5" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Gravity */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">แรงโน้มถ่วง ({gravity})</label>
            <span className="text-xs text-zinc-400 font-mono">{gravity}</span>
          </div>
          <input
            type="range" min="0.1" max="2" step="0.1" value={gravity} onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Jump Power */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">แรงกระโดด ({jumpPower})</label>
            <span className="text-xs text-zinc-400 font-mono">{jumpPower}</span>
          </div>
          <input
            type="range" min="1" max="30" step="1" value={jumpPower} onChange={(e) => setJumpPower(parseInt(e.target.value))}
            className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 border border-pink-500/30 rounded-xl text-sm font-bold text-white hover:bg-pink-500 transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>

      {/* Help */}
      <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-xl text-xs text-zinc-600 flex items-start gap-2">
        <Zap className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-zinc-500 mb-1">วิธีใช้งาน</p>
          <p>ตัวละครจะวิ่งไปมาในหน้าจอ ชนขอบแล้วเด้ง สุ่มกระโดด/บิน/นอน</p>
          <p className="mt-1">ลากด้วยเมาส์ได้ คลิก = กระโดดแรง</p>
        </div>
      </div>
    </div>
  )
}
