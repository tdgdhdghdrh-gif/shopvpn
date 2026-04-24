'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Music,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Link,
  Volume2,
  Play,
  Pause,
} from 'lucide-react'

interface MusicData {
  id: string
  fileName: string
  fileUrl: string
  isEnabled: boolean
  autoPlay: boolean
  volume: number
}

export default function AdminMusicPage() {
  const [music, setMusic] = useState<MusicData | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [previewPlaying, setPreviewPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/music')
      const data = await res.json()
      if (data.music) {
        setMusic(data.music)
        setFileUrl(data.music.fileUrl)
        setIsEnabled(data.music.isEnabled)
        setAutoPlay(data.music.autoPlay)
        setVolume(data.music.volume)
      }
    } catch {
      console.error('Failed to fetch music')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!fileUrl.trim()) {
      setMessage('กรุณาใส่ลิงก์เพลง')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: fileUrl.trim(),
          isEnabled,
          autoPlay,
          volume,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('บันทึกสำเร็จ')
        setMusic(data.music)
      } else {
        setMessage(data.error || 'บันทึกไม่สำเร็จ')
      }
    } catch {
      setMessage('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const togglePreview = () => {
    if (!fileUrl) return
    if (!audioRef.current) {
      audioRef.current = new Audio(fileUrl)
      audioRef.current.volume = volume
      audioRef.current.loop = true
    }
    if (previewPlaying) {
      audioRef.current.pause()
      setPreviewPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setPreviewPlaying(true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
              <Music className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">จัดการเพลง</h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">ใส่ลิงก์เพลงและตั้งค่าการเล่น</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-cyan-600/25 disabled:opacity-50 active:scale-95 flex items-center gap-2 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          บันทึก
        </button>
      </div>

      {message && (
        <div className={`p-3.5 rounded-2xl text-sm font-medium flex items-center gap-3 ${message.includes('สำเร็จ') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${message.includes('สำเร็จ') ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            {message.includes('สำเร็จ') ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <span>{message}</span>
        </div>
      )}

      {/* Toggle */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/10 flex items-center justify-center">
              <Music className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block leading-tight">เปิดใช้งานเพลง</span>
              <span className="text-[11px] text-zinc-500">{isEnabled ? 'เปิดอยู่' : 'ปิดอยู่'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${isEnabled ? 'bg-emerald-500 shadow-inner shadow-emerald-600/50' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <div className={`absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-300 ${isEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Auto Play */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/10 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block leading-tight">เล่นอัตโนมัติ</span>
              <span className="text-[11px] text-zinc-500">เล่นเพลงทันทีเมื่อผู้ใช้เข้าสู่ระบบ</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAutoPlay(!autoPlay)}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${autoPlay ? 'bg-emerald-500 shadow-inner shadow-emerald-600/50' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <div className={`absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-300 ${autoPlay ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Volume */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-white">ระดับเสียง {Math.round(volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full accent-cyan-500"
        />
      </div>

      {/* URL Input */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <label className="text-sm font-bold text-white block">ลิงก์เพลง MP3</label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all text-sm"
            placeholder="https://example.com/music.mp3"
          />
        </div>
        <p className="text-[10px] text-zinc-600">
          ใส่ลิงก์โดยตรงที่ลงท้ายด้วย .mp3 เช่น https://double-moccasin-yr87n4dklw.edgeone.app/พุ่งทะยานไร้พรมแดน.mp3
        </p>
        {music?.fileName && (
          <p className="text-xs text-emerald-400 font-medium">เพลงปัจจุบัน: {music.fileName}</p>
        )}
      </div>

      {/* Preview */}
      {fileUrl && (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">ฟังตัวอย่าง</h3>
            <button
              onClick={togglePreview}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white transition-all flex items-center gap-1.5"
            >
              {previewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {previewPlaying ? 'หยุด' : 'เล่น'}
            </button>
          </div>
          <audio src={fileUrl} controls className="w-full" />
        </div>
      )}
    </div>
  )
}
