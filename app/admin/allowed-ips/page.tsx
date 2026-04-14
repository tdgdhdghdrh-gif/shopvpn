'use client'

import { useEffect, useState } from 'react'
import {
  ShieldCheck, Plus, Trash2, Copy, Check, X,
  RefreshCw, ToggleLeft, ToggleRight, Search,
  Wifi, WifiOff, Globe, Edit3, Save, FileText, Server
} from 'lucide-react'

interface AllowedIpData {
  id: string
  ipAddress: string
  hostname: string | null
  label: string | null
  isActive: boolean
  createdAt: string
}

export default function AdminAllowedIpsPage() {
  const [ips, setIps] = useState<AllowedIpData[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Form
  const [formMode, setFormMode] = useState<'ip' | 'hostname'>('ip')
  const [formIp, setFormIp] = useState('')
  const [formHostname, setFormHostname] = useState('')
  const [formLabel, setFormLabel] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editIp, setEditIp] = useState('')

  useEffect(() => { fetchIps() }, [])

  async function fetchIps() {
    try {
      const res = await fetch('/api/admin/allowed-ips')
      const data = await res.json()
      if (data.success) setIps(data.data)
    } catch (err) {
      console.error('Error fetching IPs:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createIp(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    setFormSuccess('')

    try {
      const body: any = { label: formLabel || undefined }
      if (formMode === 'hostname') {
        body.hostname = formHostname
      } else {
        body.ipAddress = formIp
      }

      const res = await fetch('/api/admin/allowed-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        // แสดง success message ถ้ามี resolved IPs
        if (data.resolvedIps) {
          setFormSuccess(`Resolve "${data.hostname}" ได้ ${data.resolvedIps.length} IP: ${data.resolvedIps.join(', ')}`)
        } else if (data.resolvedFrom) {
          setFormSuccess(`Resolve "${data.resolvedFrom}" → ${data.data?.ipAddress}`)
        }
        setFormIp('')
        setFormHostname('')
        setFormLabel('')
        fetchIps()
        if (!data.resolvedIps && !data.resolvedFrom) {
          setShowCreate(false)
        }
      } else {
        setFormError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch {
      setFormError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setFormLoading(false)
    }
  }

  async function toggleActive(ip: AllowedIpData) {
    try {
      const res = await fetch('/api/admin/allowed-ips', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ip.id, isActive: !ip.isActive }),
      })
      const data = await res.json()
      if (data.success) fetchIps()
    } catch (err) {
      console.error('Error toggling IP:', err)
    }
  }

  async function deleteIp(id: string) {
    if (!confirm('ต้องการลบ IP นี้?')) return
    try {
      const res = await fetch(`/api/admin/allowed-ips?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) fetchIps()
    } catch (err) {
      console.error('Error deleting IP:', err)
    }
  }

  function copyIp(ipAddress: string, id: string) {
    navigator.clipboard.writeText(ipAddress)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function startEdit(ip: AllowedIpData) {
    setEditingId(ip.id)
    setEditLabel(ip.label || '')
    setEditIp(ip.ipAddress)
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch('/api/admin/allowed-ips', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, label: editLabel, ipAddress: editIp }),
      })
      const data = await res.json()
      if (data.success) {
        setEditingId(null)
        fetchIps()
      }
    } catch (err) {
      console.error('Error saving:', err)
    }
  }

  const filtered = ips.filter(ip => {
    if (!search) return true
    const q = search.toLowerCase()
    return ip.ipAddress.includes(q) || (ip.label || '').toLowerCase().includes(q) || (ip.hostname || '').toLowerCase().includes(q)
  })

  const activeCount = ips.filter(ip => ip.isActive).length
  const inactiveCount = ips.length - activeCount

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase animate-pulse">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            IP ที่อนุญาต
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">จัดการ IP Address ที่อนุญาตให้เชื่อมต่อ API ในค่ายของเรา</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); fetchIps() }}
            className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">เพิ่ม IP</span>
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-zinc-900/50 border border-emerald-500/10 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              เพิ่ม IP ที่อนุญาต
            </h3>
            <button onClick={() => { setShowCreate(false); setFormError(''); setFormSuccess('') }} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-xl w-fit">
            <button
              onClick={() => setFormMode('ip')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                formMode === 'ip'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              IP Address
            </button>
            <button
              onClick={() => setFormMode('hostname')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                formMode === 'hostname'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              Hostname
            </button>
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 font-bold">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 font-bold">
              {formSuccess}
            </div>
          )}

          <form onSubmit={createIp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formMode === 'ip' ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">IP Address</label>
                <input
                  type="text"
                  value={formIp}
                  onChange={(e) => setFormIp(e.target.value)}
                  placeholder="เช่น 203.150.166.82"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Hostname</label>
                <input
                  type="text"
                  value={formHostname}
                  onChange={(e) => setFormHostname(e.target.value)}
                  placeholder="เช่น example.com, server1.mysite.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                />
                <p className="text-[10px] text-zinc-600">ระบบจะ resolve DNS เป็น IP ให้อัตโนมัติ</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">ชื่อ / หมายเหตุ (ไม่บังคับ)</label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="เช่น เซิร์ฟเวอร์หลัก, สำนักงาน"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowCreate(false); setFormError(''); setFormSuccess('') }} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all">
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={formLoading || (formMode === 'ip' ? !formIp.trim() : !formHostname.trim())}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              >
                {formLoading ? 'กำลังเพิ่ม...' : formMode === 'hostname' ? 'Resolve & เพิ่ม' : 'เพิ่ม IP'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Docs hint */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          วิธีใช้ API
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-1">
            <p className="font-bold text-emerald-400">GET /api/allowed-ips/check?ip=xxx.xxx.xxx.xxx</p>
            <p className="text-zinc-500">เช็ค IP เดียว — ได้ {'{ allowed: true/false, ip, label }'}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-1">
            <p className="font-bold text-blue-400">POST /api/allowed-ips/check</p>
            <p className="text-zinc-500">{'body: { ip: "xxx" }'} หรือ {'{ ips: ["xxx","yyy"] }'} — เช็คหลาย IP</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-1.5">
            <p className="font-bold text-amber-400">POST /api/allowed-ips/add</p>
            <p className="text-zinc-500">เพิ่ม IP ผ่าน API (ต้องใช้ API Key + permission: ip:manage)</p>
            <p className="text-zinc-600 font-mono">Header: Authorization: Bearer sk_xxx</p>
            <div className="space-y-0.5 text-zinc-600">
              <p>{'{ "ip": "203.150.x.x", "label": "ชื่อ" }'}</p>
              <p>{'{ "hostname": "example.com", "label": "ชื่อ" }'}</p>
              <p>{'{ "ip": "auto" }'} — ใช้ IP ผู้เรียก</p>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-1.5">
            <p className="font-bold text-red-400">DELETE /api/allowed-ips/add</p>
            <p className="text-zinc-500">ลบ IP ผ่าน API (ต้องใช้ API Key + permission: ip:manage)</p>
            <p className="text-zinc-600 font-mono">Header: Authorization: Bearer sk_xxx</p>
            <div className="space-y-0.5 text-zinc-600">
              <p>{'{ "ip": "203.150.x.x" }'}</p>
              <p>{'{ "hostname": "example.com" }'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{ips.length}</p>
            <p className="text-[10px] text-zinc-500 font-bold">IP ทั้งหมด</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{activeCount}</p>
            <p className="text-[10px] text-zinc-500 font-bold">เปิดใช้งาน</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <WifiOff className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{inactiveCount}</p>
            <p className="text-[10px] text-zinc-500 font-bold">ปิดอยู่</p>
          </div>
        </div>
      </div>

      {/* Search */}
      {ips.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา IP, hostname หรือชื่อ..."
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 transition-colors"
          />
        </div>
      )}

      {/* IP List */}
      {filtered.length === 0 && ips.length === 0 ? (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-zinc-700 mx-auto" />
          <p className="text-sm text-zinc-500 font-bold">ยังไม่มี IP ที่อนุญาต</p>
          <p className="text-xs text-zinc-600">กดปุ่ม &quot;เพิ่ม IP&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 text-center space-y-2">
          <Search className="w-8 h-8 text-zinc-700 mx-auto" />
          <p className="text-sm text-zinc-500 font-bold">ไม่พบ IP ที่ค้นหา</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ip) => {
            const isEditing = editingId === ip.id

            return (
              <div
                key={ip.id}
                className={`bg-zinc-900/50 border rounded-2xl p-4 transition-all ${
                  ip.isActive ? 'border-white/5 hover:border-emerald-500/20' : 'border-white/5 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={editIp}
                          onChange={(e) => setEditIp(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50 w-full sm:w-48"
                          placeholder="IP Address หรือ Hostname"
                        />
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 flex-1"
                          placeholder="ชื่อ / หมายเหตุ"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-bold font-mono text-emerald-400">{ip.ipAddress}</code>
                          {ip.hostname && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Server className="w-3 h-3" />
                              {ip.hostname}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                            ip.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-500 border-white/5'
                          }`}>
                            {ip.isActive ? 'เปิดใช้งาน' : 'ปิดอยู่'}
                          </span>
                        </div>
                        {ip.label && (
                          <p className="text-xs text-zinc-500">{ip.label}</p>
                        )}
                        <p className="text-[10px] text-zinc-700">
                          เพิ่มเมื่อ {new Date(ip.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(ip.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">บันทึก</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => copyIp(ip.ipAddress, ip.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                            copiedId === ip.id
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {copiedId === ip.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => startEdit(ip)}
                          className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
                          title="แก้ไข"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleActive(ip)}
                          className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
                          title={ip.isActive ? 'ปิด IP' : 'เปิด IP'}
                        >
                          {ip.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => deleteIp(ip.id)}
                          className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-red-400 hover:border-red-500/20 transition-all active:scale-95"
                          title="ลบ IP"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
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
