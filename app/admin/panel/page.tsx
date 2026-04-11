'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Server, RefreshCw, Search, ChevronDown, ChevronRight,
  Users, Activity, Wifi, Trash2, Power, Eye, EyeOff,
  BarChart3, RotateCcw, AlertTriangle, CheckCircle2, XCircle,
  Globe, Monitor, ArrowUpDown, Download, Upload, Clock,
  Shield, Zap, Copy, ExternalLink
} from 'lucide-react'

interface VpnServer {
  id: string
  name: string
  flag: string
  host: string
  port: number
  path: string
  inboundId: number
  isActive: boolean
}

interface InboundData {
  id: number
  remark: string
  protocol: string
  port: number
  enable: boolean
  up: number
  down: number
  total: number
  settings: string
  streamSettings: string
  clientStats?: any[]
}

interface ClientInfo {
  id: string
  email: string
  enable: boolean
  expiryTime: number
  up: number
  down: number
  total: number
  limitIp: number
  totalGB: number
  flow: string
  subId: string
  tgId: string
  reset: number
}

type TabType = 'inbounds' | 'clients' | 'traffic' | 'reset'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(timestamp: number): string {
  if (!timestamp || timestamp === 0) return 'ไม่จำกัด'
  return new Date(timestamp).toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function isExpired(timestamp: number): boolean {
  if (!timestamp || timestamp === 0) return false
  return timestamp < Date.now()
}

function timeRemaining(timestamp: number): string {
  if (!timestamp || timestamp === 0) return 'ไม่จำกัด'
  const diff = timestamp - Date.now()
  if (diff <= 0) return 'หมดอายุแล้ว'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days} วัน ${hours} ชม.`
  if (hours > 0) return `${hours} ชม. ${mins} นาที`
  return `${mins} นาที`
}

export default function AdminPanelPage() {
  const [servers, setServers] = useState<VpnServer[]>([])
  const [selectedServer, setSelectedServer] = useState<VpnServer | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('inbounds')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Inbound state
  const [inbounds, setInbounds] = useState<InboundData[]>([])
  const [selectedInbound, setSelectedInbound] = useState<InboundData | null>(null)
  const [clients, setClients] = useState<ClientInfo[]>([])
  const [clientSearch, setClientSearch] = useState('')

  // Traffic state
  const [trafficEmail, setTrafficEmail] = useState('')
  const [trafficData, setTrafficData] = useState<any>(null)
  const [clientIps, setClientIps] = useState<string[]>([])
  const [onlineClients, setOnlineClients] = useState<string[]>([])

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null)

  useEffect(() => {
    fetchServers()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchServers() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/servers')
      const data = await res.json()
      if (data.servers) {
        setServers(data.servers)
        if (data.servers.length > 0 && !selectedServer) {
          setSelectedServer(data.servers[0])
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'โหลดเซิร์ฟเวอร์ไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  async function fetchInbounds() {
    if (!selectedServer) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/panel?action=listInbounds&serverId=${selectedServer.id}`)
      const data = await res.json()
      if (data.success && data.data) {
        setInbounds(data.data)
      } else {
        setMessage({ type: 'error', text: data.error || 'โหลด Inbound ไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ' })
    } finally {
      setActionLoading(false)
    }
  }

  async function fetchInboundClients(inbound: InboundData) {
    setSelectedInbound(inbound)
    const settings = typeof inbound.settings === 'string' ? JSON.parse(inbound.settings) : inbound.settings
    const clientList = settings?.clients || []

    // Merge with clientStats for traffic data
    const stats = inbound.clientStats || []
    const merged = clientList.map((c: any) => {
      const stat = stats.find((s: any) => s.email === c.email)
      return {
        ...c,
        up: stat?.up || 0,
        down: stat?.down || 0,
        total: (stat?.up || 0) + (stat?.down || 0),
      }
    })
    setClients(merged)
  }

  async function fetchClientIps(email: string) {
    if (!selectedServer) return
    try {
      const res = await fetch(`/api/admin/panel?action=clientIps&serverId=${selectedServer.id}&email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.success && data.data && data.data !== 'No IP Record') {
        let ips: string[] = []
        if (typeof data.data === 'string') {
          try { ips = JSON.parse(data.data) } catch { ips = data.data.split(',').map((s: string) => s.trim()).filter(Boolean) }
        } else if (Array.isArray(data.data)) {
          ips = data.data
        }
        setClientIps(ips.filter((ip: string) => ip && ip.trim()))
      } else {
        setClientIps([])
      }
    } catch {
      setClientIps([])
    }
  }

  async function fetchClientTraffic(email: string) {
    if (!selectedServer) return
    try {
      const res = await fetch(`/api/admin/panel?action=clientTraffic&serverId=${selectedServer.id}&email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.success) {
        setTrafficData(data.data)
      } else {
        setTrafficData(null)
      }
    } catch {
      setTrafficData(null)
    }
  }

  async function fetchOnlineClients() {
    if (!selectedServer) return
    try {
      const res = await fetch(`/api/admin/panel?action=onlines&serverId=${selectedServer.id}`)
      const data = await res.json()
      if (data.success && data.data) {
        // Flatten the array of email arrays
        const emails = Array.isArray(data.data)
          ? data.data.flat().filter(Boolean)
          : []
        setOnlineClients(emails)
      } else {
        setOnlineClients([])
      }
    } catch {
      setOnlineClients([])
    }
  }

  async function toggleClient(client: ClientInfo, enable: boolean) {
    if (!selectedServer || !selectedInbound) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleClient',
          serverId: selectedServer.id,
          inboundId: selectedInbound.id,
          clientData: client,
          enable,
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `${enable ? 'เปิด' : 'ปิด'}ใช้งาน ${client.email} สำเร็จ` })
        // Refresh inbound to get updated client list
        const inboundRes = await fetch(`/api/admin/panel?action=getInbound&serverId=${selectedServer.id}&inboundId=${selectedInbound.id}`)
        const inboundData = await inboundRes.json()
        if (inboundData.success && inboundData.data) {
          fetchInboundClients(inboundData.data)
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'ดำเนินการไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setActionLoading(false)
    }
  }

  async function deleteClient(clientUUID: string) {
    if (!selectedServer || !selectedInbound) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteClient',
          serverId: selectedServer.id,
          inboundId: selectedInbound.id,
          clientUUID,
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'ลบ Client สำเร็จ' })
        setDeleteTarget(null)
        // Refresh
        const inboundRes = await fetch(`/api/admin/panel?action=getInbound&serverId=${selectedServer.id}&inboundId=${selectedInbound.id}`)
        const inboundData = await inboundRes.json()
        if (inboundData.success && inboundData.data) {
          fetchInboundClients(inboundData.data)
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'ลบไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setActionLoading(false)
    }
  }

  async function resetInboundTraffics(inboundId: number) {
    if (!selectedServer) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resetInboundTraffics',
          serverId: selectedServer.id,
          inboundId,
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'รีเซ็ต Traffic ของ Inbound สำเร็จ' })
      } else {
        setMessage({ type: 'error', text: data.error || 'รีเซ็ตไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setActionLoading(false)
    }
  }

  async function resetAllTraffics() {
    if (!selectedServer) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resetAllTraffics',
          serverId: selectedServer.id,
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'รีเซ็ต Traffic ทั้งหมดสำเร็จ' })
      } else {
        setMessage({ type: 'error', text: data.error || 'รีเซ็ตไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setActionLoading(false)
    }
  }

  function handleTabChange(tab: TabType) {
    setActiveTab(tab)
    if (tab === 'inbounds' && selectedServer) {
      fetchInbounds()
    }
    if (tab === 'traffic' && selectedServer) {
      fetchOnlineClients()
    }
  }

  function handleServerChange(serverId: string) {
    const server = servers.find(s => s.id === serverId)
    if (server) {
      setSelectedServer(server)
      setInbounds([])
      setSelectedInbound(null)
      setClients([])
      setTrafficData(null)
      setClientIps([])
      setOnlineClients([])
    }
  }

  async function lookupTraffic() {
    if (!trafficEmail.trim()) return
    setActionLoading(true)
    await Promise.all([
      fetchClientTraffic(trafficEmail.trim()),
      fetchClientIps(trafficEmail.trim()),
    ])
    setActionLoading(false)
  }

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients
    const q = clientSearch.toLowerCase()
    return clients.filter(c =>
      c.email.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    )
  }, [clients, clientSearch])

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'inbounds', label: 'Inbound', icon: Server },
    { key: 'clients', label: 'Client', icon: Users },
    { key: 'traffic', label: 'Traffic', icon: BarChart3 },
    { key: 'reset', label: 'Reset', icon: RotateCcw },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-right-10 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="font-bold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center">
              <Monitor className="w-4 h-4 text-violet-400" />
            </div>
            จัดการ 3X-UI Panel
          </h2>
          <p className="text-xs text-zinc-500 mt-1">จัดการ Inbound, Client, Traffic และ Reset ผ่าน API</p>
        </div>
      </div>

      {/* Server Selector */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-3 h-3" />
            เลือกเซิร์ฟเวอร์
          </label>
          <select
            value={selectedServer?.id || ''}
            onChange={(e) => handleServerChange(e.target.value)}
            className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/30 transition-all"
          >
            {servers.map(s => (
              <option key={s.id} value={s.id}>
                {s.flag} {s.name} ({s.host}:{s.port}) - Inbound #{s.inboundId}
              </option>
            ))}
          </select>
          <button
            onClick={fetchServers}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-900/50 border border-white/5 rounded-xl p-1 overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.key
                  ? 'bg-violet-500/15 text-violet-400 shadow-lg'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[40vh]">
        {/* ===== INBOUND TAB ===== */}
        {activeTab === 'inbounds' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">รายการ Inbound</h3>
              <button
                onClick={fetchInbounds}
                disabled={actionLoading}
                className="flex items-center gap-2 px-3 py-2 bg-violet-600 rounded-xl text-xs font-bold text-white hover:bg-violet-500 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                โหลด Inbounds
              </button>
            </div>

            {inbounds.length === 0 ? (
              <div className="bg-zinc-900/30 border border-white/5 border-dashed rounded-2xl p-12 text-center">
                <Server className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">กดปุ่ม "โหลด Inbounds" เพื่อดึงข้อมูลจาก Panel</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {inbounds.map((inbound) => (
                  <div
                    key={inbound.id}
                    className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-violet-500/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${inbound.enable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          #{inbound.id} - {inbound.remark || 'Unnamed'}
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {inbound.protocol?.toUpperCase()} | Port: {inbound.port}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          fetchInboundClients(inbound)
                          setActiveTab('clients')
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Users className="w-3 h-3" />
                        ดู Clients
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2.5 bg-black/20 border border-white/[0.03] rounded-xl">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Upload</p>
                        <p className="text-xs font-bold text-emerald-400">{formatBytes(inbound.up || 0)}</p>
                      </div>
                      <div className="p-2.5 bg-black/20 border border-white/[0.03] rounded-xl">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Download</p>
                        <p className="text-xs font-bold text-blue-400">{formatBytes(inbound.down || 0)}</p>
                      </div>
                      <div className="p-2.5 bg-black/20 border border-white/[0.03] rounded-xl">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">รวม</p>
                        <p className="text-xs font-bold text-white">{formatBytes((inbound.up || 0) + (inbound.down || 0))}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== CLIENTS TAB ===== */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white">
                {selectedInbound ? `Clients - Inbound #${selectedInbound.id} (${selectedInbound.remark})` : 'เลือก Inbound ก่อน'}
              </h3>
              {!selectedInbound && (
                <button
                  onClick={() => setActiveTab('inbounds')}
                  className="px-3 py-2 bg-violet-600 rounded-xl text-xs font-bold text-white hover:bg-violet-500 transition-all active:scale-95"
                >
                  ไปเลือก Inbound
                </button>
              )}
            </div>

            {selectedInbound && (
              <>
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="ค้นหา Client ด้วย email หรือ UUID..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/30 transition-all"
                  />
                </div>

                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  {filteredClients.length} clients
                </p>

                {/* Client List */}
                <div className="space-y-3">
                  {filteredClients.map((client) => {
                    const expired = isExpired(client.expiryTime)
                    const isOnline = onlineClients.includes(client.email)
                    return (
                      <div
                        key={client.id}
                        className={`bg-zinc-900/50 border rounded-2xl p-4 sm:p-5 transition-all ${
                          !client.enable ? 'border-red-500/10 opacity-70' :
                          expired ? 'border-amber-500/10' :
                          'border-white/5 hover:border-violet-500/20'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                !client.enable ? 'bg-red-500' :
                                isOnline ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' :
                                'bg-zinc-600'
                              }`} />
                              <h4 className="text-sm font-bold text-white truncate">{client.email}</h4>
                              {!client.enable && (
                                <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-black text-red-400">ปิดใช้งาน</span>
                              )}
                              {expired && client.enable && (
                                <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-black text-amber-400">หมดอายุ</span>
                              )}
                              {isOnline && (
                                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-400">ออนไลน์</span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-0.5 truncate font-mono">{client.id}</p>
                          </div>

                          <div className="flex gap-1 flex-shrink-0 ml-2">
                            <button
                              onClick={() => {
                                setTrafficEmail(client.email)
                                setActiveTab('traffic')
                                setTimeout(() => lookupTraffic(), 100)
                              }}
                              className="p-2 bg-white/5 border border-white/5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all active:scale-95"
                              title="ดู Traffic"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleClient(client, !client.enable)}
                              disabled={actionLoading}
                              className={`p-2 border rounded-lg transition-all active:scale-95 disabled:opacity-50 ${
                                client.enable
                                  ? 'bg-amber-500/5 border-amber-500/10 text-amber-400 hover:bg-amber-500/10'
                                  : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title={client.enable ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                            >
                              {client.enable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'client', id: client.id, name: client.email })}
                              className="p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="p-2 bg-black/20 border border-white/[0.03] rounded-xl">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">หมดอายุ</p>
                            <p className={`text-[11px] font-bold mt-0.5 ${expired ? 'text-red-400' : 'text-zinc-300'}`}>
                              {timeRemaining(client.expiryTime)}
                            </p>
                          </div>
                          <div className="p-2 bg-black/20 border border-white/[0.03] rounded-xl">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Upload</p>
                            <p className="text-[11px] font-bold text-emerald-400 mt-0.5">{formatBytes(client.up)}</p>
                          </div>
                          <div className="p-2 bg-black/20 border border-white/[0.03] rounded-xl">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Download</p>
                            <p className="text-[11px] font-bold text-blue-400 mt-0.5">{formatBytes(client.down)}</p>
                          </div>
                          <div className="p-2 bg-black/20 border border-white/[0.03] rounded-xl">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Limit IP</p>
                            <p className="text-[11px] font-bold text-zinc-300 mt-0.5">{client.limitIp || 'ไม่จำกัด'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== TRAFFIC TAB ===== */}
        {activeTab === 'traffic' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">สถิติ Traffic & IP</h3>

            {/* Search box */}
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type="text"
                  placeholder="ใส่ email (remark) ของ Client..."
                  value={trafficEmail}
                  onChange={(e) => setTrafficEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && lookupTraffic()}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/30 transition-all"
                />
              </div>
              <button
                onClick={lookupTraffic}
                disabled={actionLoading || !trafficEmail.trim()}
                className="px-4 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'ค้นหา'}
              </button>
            </div>

            {/* Online clients list */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  ผู้ใช้ออนไลน์ ({onlineClients.length})
                </h4>
                <button
                  onClick={fetchOnlineClients}
                  className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors"
                >
                  รีเฟรช
                </button>
              </div>
              {onlineClients.length === 0 ? (
                <p className="text-xs text-zinc-600">ไม่มีผู้ใช้ออนไลน์ หรือยังไม่ได้โหลดข้อมูล</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {onlineClients.map((email, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTrafficEmail(email)
                        lookupTraffic()
                      }}
                      className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                      {email}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Traffic Data */}
            {trafficData && (
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  ข้อมูล Traffic: {trafficData.email || trafficEmail}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-black/20 border border-white/[0.03] rounded-xl">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Upload</p>
                    <p className="text-lg font-black text-emerald-400 mt-1">{formatBytes(trafficData.up || 0)}</p>
                  </div>
                  <div className="p-3 bg-black/20 border border-white/[0.03] rounded-xl">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Download</p>
                    <p className="text-lg font-black text-blue-400 mt-1">{formatBytes(trafficData.down || 0)}</p>
                  </div>
                  <div className="p-3 bg-black/20 border border-white/[0.03] rounded-xl">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">รวม</p>
                    <p className="text-lg font-black text-white mt-1">{formatBytes((trafficData.up || 0) + (trafficData.down || 0))}</p>
                  </div>
                  <div className="p-3 bg-black/20 border border-white/[0.03] rounded-xl">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">หมดอายุ</p>
                    <p className={`text-xs font-bold mt-1 ${isExpired(trafficData.expiryTime) ? 'text-red-400' : 'text-zinc-300'}`}>
                      {formatDate(trafficData.expiryTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    trafficData.enable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {trafficData.enable ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                  {trafficData.inboundId && (
                    <span className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-zinc-400">
                      Inbound #{trafficData.inboundId}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Client IPs */}
            {clientIps.length > 0 && (
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  IP ที่เชื่อมต่อ ({clientIps.length})
                </h4>
                <div className="space-y-1.5">
                  {clientIps.map((ip, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-black/20 border border-white/[0.03] rounded-xl">
                      <span className="text-xs font-mono font-bold text-zinc-300">{ip}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(ip)}
                        className="p-1 hover:bg-white/5 rounded transition-colors"
                        title="คัดลอก"
                      >
                        <Copy className="w-3 h-3 text-zinc-600 hover:text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== RESET TAB ===== */}
        {activeTab === 'reset' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">รีเซ็ต Traffic</h3>

            {/* Reset All */}
            <div className="bg-zinc-900/50 border border-red-500/10 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">รีเซ็ต Traffic ทั้งหมด</h4>
                  <p className="text-[11px] text-zinc-500">ล้าง Traffic ทุก Inbound บนเซิร์ฟเวอร์นี้ (ไม่สามารถย้อนกลับ)</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget({ type: 'resetAll', id: '', name: selectedServer?.name || '' })}
                disabled={actionLoading}
                className="px-5 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50"
              >
                รีเซ็ต Traffic ทั้งหมด
              </button>
            </div>

            {/* Reset per Inbound */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">รีเซ็ต Traffic รายการ Inbound</h4>
                  <p className="text-[11px] text-zinc-500">เลือก Inbound ที่ต้องการรีเซ็ต Traffic</p>
                </div>
              </div>

              {inbounds.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-500 mb-2">ยังไม่ได้โหลดข้อมูล Inbound</p>
                  <button
                    onClick={fetchInbounds}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                  >
                    โหลด Inbounds
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {inbounds.map((inbound) => (
                    <div key={inbound.id} className="flex items-center justify-between p-3 bg-black/20 border border-white/[0.03] rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-white">#{inbound.id} - {inbound.remark}</p>
                        <p className="text-[10px] text-zinc-500">Traffic: {formatBytes((inbound.up || 0) + (inbound.down || 0))}</p>
                      </div>
                      <button
                        onClick={() => setDeleteTarget({ type: 'resetInbound', id: String(inbound.id), name: `#${inbound.id} ${inbound.remark}` })}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-[10px] font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                      >
                        รีเซ็ต
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete/Reset Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !actionLoading && setDeleteTarget(null)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {deleteTarget.type === 'client' ? 'ลบ Client?' :
                   deleteTarget.type === 'resetAll' ? 'รีเซ็ต Traffic ทั้งหมด?' :
                   'รีเซ็ต Traffic Inbound?'}
                </h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  {deleteTarget.type === 'client'
                    ? <>ต้องการลบ <span className="text-white font-bold">{deleteTarget.name}</span>? การลบนี้ไม่สามารถย้อนกลับ</>
                    : deleteTarget.type === 'resetAll'
                    ? <>ล้าง Traffic ทุก Inbound บน <span className="text-white font-bold">{deleteTarget.name}</span>?</>
                    : <>รีเซ็ต Traffic ของ <span className="text-white font-bold">{deleteTarget.name}</span>?</>
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-400 transition-all active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (deleteTarget.type === 'client') deleteClient(deleteTarget.id)
                  else if (deleteTarget.type === 'resetAll') { resetAllTraffics(); setDeleteTarget(null) }
                  else if (deleteTarget.type === 'resetInbound') { resetInboundTraffics(parseInt(deleteTarget.id)); setDeleteTarget(null) }
                }}
                disabled={actionLoading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 active:scale-95"
              >
                {actionLoading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
