'use client'

import { useEffect, useState } from 'react'
import {
  Server, CheckCircle, Loader2, AlertCircle, Upload, X, Image as ImageIcon,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VpnServer {
  id: string
  name: string
  flag: string
  imageUrl: string | null
  status: string
  category: string
  pricePerDay: number
  [key: string]: any // เก็บ field อื่นๆ ทั้งหมดจาก API เพื่อส่งกลับตอน update
}

export default function ServerTemplatePage() {
  const [template, setTemplate] = useState('detailed')
  const [savedTemplate, setSavedTemplate] = useState('detailed')
  const [servers, setServers] = useState<VpnServer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchData() {
    try {
      const [settingsRes, serversRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/servers'),
      ])
      const settingsData = await settingsRes.json()
      const serversData = await serversRes.json()

      if (settingsData.settings) {
        const t = settingsData.settings.serverListTemplate || 'detailed'
        setTemplate(t)
        setSavedTemplate(t)
      }
      if (serversData.servers) {
        setServers(serversData.servers)
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถโหลดข้อมูลได้' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveTemplate() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverListTemplate: template }),
      })
      const data = await res.json()
      if (data.success) {
        setSavedTemplate(template)
        setMessage({ type: 'success', text: 'บันทึกรูปแบบเรียบร้อยแล้ว' })
      } else {
        setMessage({ type: 'error', text: data.error || 'บันทึกล้มเหลว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(serverId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'ขนาดไฟล์เกิน 2MB' })
      return
    }

    setUploading(serverId)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        // 1. Upload image
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, type: 'server' }),
        })
        const uploadData = await uploadRes.json()
        if (!uploadData.success || !uploadData.url) {
          setMessage({ type: 'error', text: uploadData.error || 'อัปโหลดรูปล้มเหลว' })
          setUploading(null)
          return
        }

        // 2. Update server imageUrl
        const server = servers.find(s => s.id === serverId)
        if (!server) { setUploading(null); return }

        const updateRes = await fetch(`/api/admin/servers/${serverId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...server, imageUrl: uploadData.url }),
        })
        const updateData = await updateRes.json()
        if (updateData.success) {
          setServers(prev => prev.map(s => s.id === serverId ? { ...s, imageUrl: uploadData.url } : s))
          setMessage({ type: 'success', text: `อัปโหลดรูป ${server.name} สำเร็จ` })
        } else {
          setMessage({ type: 'error', text: updateData.error || 'บันทึกรูปล้มเหลว' })
        }
        setUploading(null)
      }
      reader.readAsDataURL(file)
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
      setUploading(null)
    }
  }

  async function handleRemoveImage(serverId: string) {
    const server = servers.find(s => s.id === serverId)
    if (!server) return

    setUploading(serverId)
    try {
      const res = await fetch(`/api/admin/servers/${serverId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...server, imageUrl: '' }),
      })
      const data = await res.json()
      if (data.success) {
        setServers(prev => prev.map(s => s.id === serverId ? { ...s, imageUrl: null } : s))
        setMessage({ type: 'success', text: `ลบรูป ${server.name} แล้ว` })
      }
    } catch {
      setMessage({ type: 'error', text: 'ลบรูปล้มเหลว' })
    } finally {
      setUploading(null)
    }
  }

  const hasChanges = template !== savedTemplate

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-right-10 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">รูปแบบหน้าเซิร์ฟเวอร์</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">เลือกแบบการแสดงรายการเซิร์ฟเวอร์ และจัดการรูปภาพเซิร์ฟเวอร์</p>
        </div>
        <button
          onClick={handleSaveTemplate}
          disabled={saving || !hasChanges}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 border border-blue-500/30 rounded-xl text-sm font-bold text-white hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึก' : 'ไม่มีการเปลี่ยนแปลง'}
        </button>
      </div>

      {/* ===================== เลือกรูปแบบ ===================== */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" /> เลือกรูปแบบแสดงเซิร์ฟเวอร์
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Template 1: Detailed */}
            <button
              type="button"
              onClick={() => setTemplate('detailed')}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all",
                template === 'detailed'
                  ? "border-cyan-500/50 bg-cyan-500/5"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
              )}
            >
              {template === 'detailed' && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                </div>
              )}
              <div className="w-full h-28 rounded-lg bg-zinc-800/50 border border-white/5 mb-3 p-3 flex gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center text-xl shrink-0">🇹🇭</div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-2/3 bg-zinc-700 rounded" />
                  <div className="h-2 w-1/2 bg-zinc-800 rounded" />
                  <div className="flex gap-1 mt-1.5">
                    <div className="h-2 w-10 bg-zinc-700/50 rounded" />
                    <div className="h-2 w-10 bg-zinc-700/50 rounded" />
                    <div className="h-2 w-10 bg-zinc-700/50 rounded" />
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    <div className="h-6 w-6 bg-zinc-700/30 rounded" />
                    <div className="h-6 w-6 bg-zinc-700/30 rounded" />
                    <div className="h-6 w-6 bg-zinc-700/30 rounded" />
                  </div>
                  <div className="h-5 w-20 bg-cyan-500/20 rounded mt-1.5" />
                </div>
              </div>
              <p className="text-sm font-bold text-white">แบบรายละเอียด</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">แสดงข้อมูลครบ: สถิติ, แอพรองรับ, ราคา, ปุ่มเชื่อมต่อ</p>
            </button>

            {/* Template 2: Image Card */}
            <button
              type="button"
              onClick={() => setTemplate('image-card')}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all",
                template === 'image-card'
                  ? "border-cyan-500/50 bg-cyan-500/5"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
              )}
            >
              {template === 'image-card' && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                </div>
              )}
              <div className="w-full h-28 rounded-lg bg-zinc-800/50 border border-white/5 mb-3 overflow-hidden flex flex-col">
                <div className="flex-1 bg-gradient-to-br from-amber-900/30 to-orange-900/30 flex items-center justify-center">
                  <span className="text-3xl">🖼️</span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="h-2.5 w-20 bg-zinc-700 rounded" />
                  <div className="h-2.5 w-12 bg-cyan-500/30 rounded" />
                </div>
              </div>
              <p className="text-sm font-bold text-white">แบบรูปภาพ</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">เน้นรูปภาพเซิร์ฟเวอร์ขนาดใหญ่ ชื่อ + ราคาด้านล่าง</p>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== รูปภาพเซิร์ฟเวอร์ ===================== */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" /> รูปภาพเซิร์ฟเวอร์
            </h3>
            <span className="text-[10px] text-zinc-600 font-medium">{servers.filter(s => s.imageUrl).length}/{servers.length} มีรูป</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">อัปโหลดรูปภาพสำหรับแต่ละเซิร์ฟเวอร์ (ใช้กับแบบรูปภาพ ถ้าไม่มีจะแสดงธงชาติแทน)</p>
        </div>
        <div className="p-5">
          {servers.length === 0 ? (
            <div className="py-12 text-center">
              <Server className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">ยังไม่มีเซิร์ฟเวอร์</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {servers.map((server) => (
                <ServerImageUploadCard
                  key={server.id}
                  server={server}
                  uploading={uploading === server.id}
                  onUpload={(e) => handleImageUpload(server.id, e)}
                  onRemove={() => handleRemoveImage(server.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Save */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-3 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <button
          onClick={handleSaveTemplate}
          disabled={saving || !hasChanges}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 border border-blue-500/30 rounded-xl text-sm font-bold text-white active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกรูปแบบ' : 'ไม่มีการเปลี่ยนแปลง'}
        </button>
      </div>
    </div>
  )
}

/* ── Server Image Upload Card (ย้ายออกมาเป็น top-level เพื่อป้องกัน re-create ทุก render) ── */
function ServerImageUploadCard({ server, uploading, onUpload, onRemove }: {
  server: VpnServer
  uploading: boolean
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}) {
  const inputId = `img-${server.id}`
  
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-all">
      {/* Image Area */}
      <div className="relative aspect-[16/10] bg-zinc-800/50">
        {server.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={server.imageUrl}
              alt={server.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onRemove}
              disabled={uploading}
              className="absolute top-2 right-2 w-7 h-7 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg active:scale-90 transition-all disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/[0.02] transition-all"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            ) : (
              <>
                <div className="text-3xl">{server.flag}</div>
                <Upload className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">อัปโหลดรูป</span>
              </>
            )}
          </label>
        )}
        {uploading && server.imageUrl && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{server.flag}</span>
          <span className="text-xs font-bold text-white truncate">{server.name}</span>
        </div>
        <label
          htmlFor={inputId}
          className="shrink-0 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white hover:border-white/[0.15] cursor-pointer transition-all uppercase tracking-wider"
        >
          {server.imageUrl ? 'เปลี่ยน' : 'อัปโหลด'}
        </label>
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
      />
    </div>
  )
}
