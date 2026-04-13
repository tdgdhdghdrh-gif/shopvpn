'use client'

import { useEffect, useState } from 'react'
import {
  Key, Plus, Trash2, Copy, Check, X, Eye,
  RefreshCw, ToggleLeft, ToggleRight, Clock,
  Hash, Calendar, Shield, Zap, Users, CreditCard,
  Percent, FileText, AlertTriangle, ChevronDown, ChevronUp,
  Activity
} from 'lucide-react'

interface ApiKeyData {
  id: string
  key: string
  name: string
  description: string | null
  permissions: string[]
  isActive: boolean
  usageCount: number
  maxUsage: number | null
  expiresAt: string | null
  createdAt: string
  _count: { logs: number }
}

interface ApiLog {
  id: string
  action: string
  targetUser: string | null
  detail: string | null
  ipAddress: string | null
  success: boolean
  createdAt: string
}

const ALL_PERMISSIONS = [
  { value: 'user:read', label: 'ดึงข้อมูลผู้ใช้', icon: Users, color: 'blue' },
  { value: 'credit:add', label: 'เพิ่มเครดิต', icon: CreditCard, color: 'emerald' },
  { value: 'credit:deduct', label: 'หักเครดิต', icon: CreditCard, color: 'amber' },
  { value: 'promo:activate', label: 'รับส่วนลด', icon: Percent, color: 'purple' },
  { value: 'vpn:codes', label: 'ดึงโค้ด VPN', icon: Key, color: 'cyan' },
]

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPermissions, setFormPermissions] = useState<string[]>([])
  const [formMaxUsage, setFormMaxUsage] = useState('')
  const [formExpiresAt, setFormExpiresAt] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Logs modal
  const [showLogs, setShowLogs] = useState<string | null>(null)
  const [logsKey, setLogsKey] = useState<ApiKeyData | null>(null)
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Expanded key (show full key)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  useEffect(() => { fetchKeys() }, [])

  async function fetchKeys() {
    try {
      const res = await fetch('/api/admin/api-keys')
      const data = await res.json()
      if (data.success) setKeys(data.data)
    } catch (err) {
      console.error('Error fetching keys:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createKey(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDescription || undefined,
          permissions: formPermissions,
          maxUsage: formMaxUsage ? parseInt(formMaxUsage) : null,
          expiresAt: formExpiresAt || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreate(false)
        setFormName('')
        setFormDescription('')
        setFormPermissions([])
        setFormMaxUsage('')
        setFormExpiresAt('')
        fetchKeys()
      } else {
        setFormError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      setFormError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setFormLoading(false)
    }
  }

  async function toggleActive(key: ApiKeyData) {
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key.id, isActive: !key.isActive }),
      })
      const data = await res.json()
      if (data.success) fetchKeys()
    } catch (err) {
      console.error('Error toggling key:', err)
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('ต้องการลบ API key นี้?')) return
    try {
      const res = await fetch(`/api/admin/api-keys?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) fetchKeys()
    } catch (err) {
      console.error('Error deleting key:', err)
    }
  }

  function copyKey(keyValue: string, id: string) {
    navigator.clipboard.writeText(keyValue)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function togglePermission(perm: string) {
    setFormPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    )
  }

  async function openLogs(key: ApiKeyData) {
    setShowLogs(key.id)
    setLogsKey(key)
    setLogsLoading(true)
    setLogs([])
    try {
      const res = await fetch(`/api/admin/api-keys?keyId=${key.id}`)
      const data = await res.json()
      if (data.success) setLogs(data.data)
    } catch (err) {
      console.error('Error fetching logs:', err)
    } finally {
      setLogsLoading(false)
    }
  }

  function getKeyStatus(key: ApiKeyData) {
    if (!key.isActive) return { label: 'ปิดอยู่', color: 'zinc' }
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) return { label: 'หมดอายุ', color: 'red' }
    if (key.maxUsage !== null && key.usageCount >= key.maxUsage) return { label: 'เต็มแล้ว', color: 'amber' }
    return { label: 'ใช้งาน', color: 'emerald' }
  }

  function maskKey(key: string) {
    return key.substring(0, 7) + '••••••••••••' + key.substring(key.length - 4)
  }

  const permColors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  }

  const statusColors: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    zinc: 'bg-zinc-800 text-zinc-500 border-white/5',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase animate-pulse">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLogs(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  ประวัติการใช้งาน API
                </h3>
                {logsKey && <p className="text-[10px] text-zinc-500 mt-0.5">{logsKey.name} — ล่าสุด 100 รายการ</p>}
              </div>
              <button onClick={() => setShowLogs(null)} className="p-2 bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {logsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500 font-bold">กำลังโหลด...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Activity className="w-10 h-10 text-zinc-700" />
                  <p className="text-sm text-zinc-500 font-bold">ยังไม่มีประวัติการใช้งาน</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className={`bg-white/[0.03] border rounded-xl p-3 ${log.success ? 'border-white/5' : 'border-red-500/10'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span className="text-xs font-bold text-white">{log.action}</span>
                          {log.targetUser && <span className="text-[10px] text-zinc-500 truncate">{log.targetUser}</span>}
                        </div>
                        <span className="text-[10px] text-zinc-600 flex-shrink-0">
                          {new Date(log.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {log.detail && <p className="text-[10px] text-zinc-500 mt-1 ml-4">{log.detail}</p>}
                      {log.ipAddress && <p className="text-[10px] text-zinc-700 mt-0.5 ml-4">IP: {log.ipAddress}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 text-center">
              <p className="text-[10px] text-zinc-600">ทั้งหมด {logs.length} รายการ</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Key className="w-6 h-6 text-cyan-400" />
            API Keys
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">สร้าง API key สำหรับเชื่อมต่อบอทภายนอก</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); fetchKeys() }}
            className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">สร้าง API Key</span>
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-zinc-900/50 border border-cyan-500/10 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              สร้าง API Key ใหม่
            </h3>
            <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 font-bold">
              {formError}
            </div>
          )}

          <form onSubmit={createKey} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">ชื่อ API Key</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder='เช่น บอท Discord, ระบบแจกเครดิต'
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">รายละเอียด (ไม่บังคับ)</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="เช่น ใช้กับบอทแจกเครดิตในกลุ่ม"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            {/* Permissions */}
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Shield className="w-3 h-3" />
                สิทธิ์การใช้งาน (เลือกอย่างน้อย 1)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_PERMISSIONS.map((perm) => {
                  const Icon = perm.icon
                  const isSelected = formPermissions.includes(perm.value)
                  return (
                    <button
                      key={perm.value}
                      type="button"
                      onClick={() => togglePermission(perm.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all active:scale-95 ${
                        isSelected
                          ? `${permColors[perm.color]} border`
                          : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[11px] font-bold">{perm.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Hash className="w-3 h-3" />
                จำกัดจำนวนครั้ง (ไม่บังคับ)
              </label>
              <input
                type="number"
                value={formMaxUsage}
                onChange={(e) => setFormMaxUsage(e.target.value)}
                placeholder="เช่น 1000 (เว้นว่าง = ไม่จำกัด)"
                min={1}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <p className="text-[10px] text-zinc-600">เว้นว่างไว้ = ไม่จำกัดจำนวน</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                วันหมดอายุ (ไม่บังคับ)
              </label>
              <input
                type="datetime-local"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors [color-scheme:dark]"
              />
              <p className="text-[10px] text-zinc-600">เว้นว่างไว้ = ไม่มีวันหมดอายุ</p>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all">
                ยกเลิก
              </button>
              <button type="submit" disabled={formLoading || formPermissions.length === 0} className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition-all active:scale-95">
                {formLoading ? 'กำลังสร้าง...' : 'สร้าง API Key'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Docs hint */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          วิธีใช้ API
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-1">
            <p className="font-bold text-blue-400">GET /api/external/user?email=xxx</p>
            <p className="text-zinc-500">ดึงข้อมูลผู้ใช้ (ยอดเงิน, ส่วนลด, referral)</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-1">
            <p className="font-bold text-emerald-400">POST /api/external/credit</p>
            <p className="text-zinc-500">{'body: { email, amount, action: "add"|"deduct" }'}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-1">
            <p className="font-bold text-purple-400">POST /api/external/promo</p>
            <p className="text-zinc-500">{'body: { email, code }'} — ให้ผู้ใช้รับโปร</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-1">
            <p className="font-bold text-cyan-400">GET /api/external/vpn?email=xxx</p>
            <p className="text-zinc-500">ดึงโค้ด VPN ของผู้ใช้ (vlessLink, expiryTime, status)</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-1">
            <p className="font-bold text-zinc-300">Header ทุก request</p>
            <p className="text-zinc-500">Authorization: Bearer sk_xxxxx</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Key className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{keys.length}</p>
            <p className="text-[10px] text-zinc-500 font-bold">Key ทั้งหมด</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{keys.filter(k => k.isActive && getKeyStatus(k).color === 'emerald').length}</p>
            <p className="text-[10px] text-zinc-500 font-bold">ใช้งานอยู่</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{keys.reduce((sum, k) => sum + k.usageCount, 0)}</p>
            <p className="text-[10px] text-zinc-500 font-bold">เรียกใช้ทั้งหมด</p>
          </div>
        </div>
      </div>

      {/* Keys List */}
      {keys.length === 0 ? (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center space-y-3">
          <Key className="w-12 h-12 text-zinc-700 mx-auto" />
          <p className="text-sm text-zinc-500 font-bold">ยังไม่มี API Key</p>
          <p className="text-xs text-zinc-600">กดปุ่ม &quot;สร้าง API Key&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((apiKey) => {
            const status = getKeyStatus(apiKey)
            const isExpanded = expandedKey === apiKey.id

            return (
              <div key={apiKey.id} className={`bg-zinc-900/50 border rounded-2xl p-4 sm:p-5 transition-all ${status.color === 'emerald' ? 'border-white/5 hover:border-cyan-500/20' : 'border-white/5 opacity-70'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate">{apiKey.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${statusColors[status.color]}`}>
                        {status.color === 'red' && <AlertTriangle className="w-3 h-3" />}
                        {status.label}
                      </span>
                    </div>

                    {apiKey.description && (
                      <p className="text-xs text-zinc-500">{apiKey.description}</p>
                    )}

                    {/* API Key display */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 max-w-full">
                        <Key className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                        <code className="text-[11px] text-cyan-400 font-mono truncate">
                          {isExpanded ? apiKey.key : maskKey(apiKey.key)}
                        </code>
                      </div>
                      <button
                        onClick={() => setExpandedKey(isExpanded ? null : apiKey.id)}
                        className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-zinc-500 hover:text-white transition-all"
                        title={isExpanded ? 'ซ่อน' : 'แสดง'}
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Permissions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {apiKey.permissions.map(perm => {
                        const permDef = ALL_PERMISSIONS.find(p => p.value === perm)
                        if (!permDef) return null
                        return (
                          <span key={perm} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border ${permColors[permDef.color]}`}>
                            {permDef.label}
                          </span>
                        )
                      })}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 sm:gap-4 text-[10px] text-zinc-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {apiKey.usageCount} ครั้ง
                        {apiKey.maxUsage !== null && (
                          <span className="text-amber-400/70">/ {apiKey.maxUsage}</span>
                        )}
                      </span>
                      {apiKey.expiresAt && (
                        <span className={`flex items-center gap-1 ${new Date(apiKey.expiresAt) < new Date() ? 'text-red-400/70' : 'text-cyan-400/70'}`}>
                          <Clock className="w-3 h-3" />
                          หมดอายุ {new Date(apiKey.expiresAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <span>
                        สร้างเมื่อ {new Date(apiKey.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Usage bar */}
                    {apiKey.maxUsage !== null && (
                      <div className="max-w-xs">
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              apiKey.usageCount >= apiKey.maxUsage ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, (apiKey.usageCount / apiKey.maxUsage) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openLogs(apiKey)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-[10px] font-bold text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all active:scale-95"
                      title="ดูประวัติการใช้งาน"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{apiKey._count.logs}</span>
                    </button>

                    <button
                      onClick={() => copyKey(apiKey.key, apiKey.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                        copiedId === apiKey.id
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {copiedId === apiKey.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{copiedId === apiKey.id ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>

                    <button
                      onClick={() => toggleActive(apiKey)}
                      className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
                      title={apiKey.isActive ? 'ปิด Key' : 'เปิด Key'}
                    >
                      {apiKey.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => deleteKey(apiKey.id)}
                      className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-red-400 hover:border-red-500/20 transition-all active:scale-95"
                      title="ลบ Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
