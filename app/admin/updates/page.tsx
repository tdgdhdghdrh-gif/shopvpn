'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Monitor,
  Users,
  CheckCircle2,
} from 'lucide-react'

interface SiteUpdateData {
  id: string
  title: string
  htmlContent: string
  isEnabled: boolean
  showToUsers: boolean
  showToAdmin: boolean
  bypassIps: string[]
}

export default function AdminUpdatesPage() {
  const [update, setUpdate] = useState<SiteUpdateData | null>(null)
  const [title, setTitle] = useState('กำลังอัปเดตระบบ')
  const [htmlContent, setHtmlContent] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)
  const [showToUsers, setShowToUsers] = useState(true)
  const [showToAdmin, setShowToAdmin] = useState(false)
  const [bypassIps, setBypassIps] = useState('')
  const [myIp, setMyIp] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchData()
    fetch('/api/whoami')
      .then((r) => r.json())
      .then((d) => {
        if (d.ip) setMyIp(d.ip)
      })
      .catch(() => {})
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/site-update/config')
      const data = await res.json()
      if (data.update) {
        setUpdate(data.update)
        setTitle(data.update.title)
        setHtmlContent(data.update.htmlContent)
        setIsEnabled(data.update.isEnabled)
        setShowToUsers(data.update.showToUsers)
        setShowToAdmin(data.update.showToAdmin)
        setBypassIps((data.update.bypassIps || []).join('\n'))
      }
    } catch {
      console.error('Failed to fetch site update')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const ips = bypassIps
        .split(/[\n,]/)
        .map((ip) => ip.trim())
        .filter((ip) => ip.length > 0)
      const res = await fetch('/api/admin/site-update/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          htmlContent,
          isEnabled,
          showToUsers,
          showToAdmin,
          bypassIps: ips,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('บันทึกสำเร็จ')
        setUpdate(data.update)
      } else {
        setMessage(data.error || 'บันทึกไม่สำเร็จ')
      }
    } catch {
      setMessage('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                ระบบอัปเดต
              </h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                เปิดปิดหน้าอัปเดตและใส่โค้ด HTML แจ้งลูกค้า
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-cyan-600/25 disabled:opacity-50 active:scale-95 flex items-center gap-2 shrink-0"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          บันทึก
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-2xl text-sm font-medium flex items-center gap-3 ${
            message.includes('สำเร็จ')
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              message.includes('สำเร็จ') ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}
          >
            {message.includes('สำเร็จ') ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>
          <span>{message}</span>
        </div>
      )}

      {/* Toggle Status */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block leading-tight">
                สถานะระบบอัปเดต
              </span>
              <span className="text-[11px] text-zinc-500">
                {isEnabled ? 'เปิดอยู่ — ลูกค้าจะเห็นหน้าอัปเดต' : 'ปิดอยู่'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
              isEnabled
                ? 'bg-emerald-500 shadow-inner shadow-emerald-600/50'
                : 'bg-zinc-800 border border-zinc-700'
            }`}
          >
            <div
              className={`absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-300 ${
                isEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Visibility Toggles */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-white mb-2">แสดงผลให้ใครเห็น</h3>

        <button
          type="button"
          onClick={() => setShowToUsers(!showToUsers)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all active:scale-[0.99] ${
            showToUsers
              ? 'bg-emerald-500/5 border border-emerald-500/15'
              : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">ลูกค้า (หน้าเว็บทั่วไป)</span>
          </div>
          {showToUsers ? (
            <Eye className="w-4 h-4 text-emerald-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-zinc-600" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowToAdmin(!showToAdmin)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all active:scale-[0.99] ${
            showToAdmin
              ? 'bg-amber-500/5 border border-amber-500/15'
              : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Monitor className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">แอดมิน (preview)</span>
          </div>
          {showToAdmin ? (
            <Eye className="w-4 h-4 text-amber-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-zinc-600" />
          )}
        </button>
      </div>

      {/* Bypass IPs */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-white block">IP ที่ยกเว้น (ไม่โดนบัง)</label>
          {myIp && (
            <button
              type="button"
              onClick={() => {
                const current = bypassIps.split(/[\n,]/).map((ip) => ip.trim()).filter(Boolean)
                if (!current.includes(myIp)) {
                  setBypassIps(current.length > 0 ? bypassIps + '\n' + myIp : myIp)
                }
              }}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
            >
              + เพิ่ม IP ของฉัน ({myIp})
            </button>
          )}
        </div>
        <textarea
          value={bypassIps}
          onChange={(e) => setBypassIps(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all text-sm font-mono min-h-[100px]"
          placeholder="1.2.3.4&#10;5.6.7.8"
          rows={4}
        />
        <p className="text-[10px] text-zinc-600">
          ใส่ IP ที่ต้องการให้เข้าเว็บได้ปกติ (คั่นด้วยบรรทัดใหม่ หรือเครื่องหมายจุลภาค) ใส่ * เพื่อยกเว้นทั้งหมด
        </p>
      </div>

      {/* Title */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <label className="text-sm font-bold text-white block">หัวข้อ</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all text-sm"
          placeholder="กำลังอัปเดตระบบ"
        />
      </div>

      {/* HTML Content */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <label className="text-sm font-bold text-white block">โค้ด HTML</label>
        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all text-sm font-mono min-h-[200px]"
          placeholder="<div class='text-center'><h1>กำลังอัปเดต</h1></div>"
          rows={10}
        />
        <p className="text-[10px] text-zinc-600">
          รองรับ HTML แท็กพื้นฐาน สไตล์ inline CSS ได้ เช่น &lt;div&gt;, &lt;h1&gt;, &lt;p&gt;, &lt;img&gt;
        </p>
      </div>

      {/* Preview */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">ตัวอย่าง (Preview)</h3>
        <div className="rounded-xl border border-white/5 overflow-hidden" style={{ height: 400 }}>
          <iframe
            srcDoc={htmlContent}
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
            scrolling="no"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
              background: '#000',
            }}
          />
        </div>
      </div>
    </div>
  )
}
