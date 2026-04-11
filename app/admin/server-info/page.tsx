'use client'

import { useEffect, useState } from 'react'
import {
  Server, RefreshCw, Copy, Check, Eye, EyeOff,
  Globe, Lock, Hash, User, KeyRound, Wifi, WifiOff,
  Shield, Network, Fingerprint
} from 'lucide-react'

interface ServerData {
  id: string
  name: string
  host: string
  port: number
  path: string
  username: string
  password: string
  inboundId: number
  protocol: string
  isActive: boolean
  flag: string
  status: string
  clientPort: number
  sni: string
  tlsType: string
  network: string
  category: string
  createdAt: string
  updatedAt: string
}

export default function ServerInfoPage() {
  const [servers, setServers] = useState<ServerData[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  useEffect(() => { fetchServers() }, [])

  async function fetchServers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/server-info')
      const data = await res.json()
      if (data.success) setServers(data.servers)
    } catch (err) {
      console.error('Error fetching server info:', err)
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string, fieldId: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  function togglePasswordVisibility(serverId: string) {
    setVisiblePasswords(prev => {
      const next = new Set(prev)
      if (next.has(serverId)) {
        next.delete(serverId)
      } else {
        next.add(serverId)
      }
      return next
    })
  }

  function maskPassword(password: string) {
    return '*'.repeat(Math.min(password.length, 12))
  }

  const filteredServers = servers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.host.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = servers.filter(s => s.isActive).length
  const onlineCount = servers.filter(s => s.status === 'Online').length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-amber-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase animate-pulse">กำลังโหลดข้อมูลเซิร์ฟเวอร์...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-amber-400" />
            ข้อมูลเซิร์ฟเวอร์
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">ข้อมูลล็อกอินเซิร์ฟเวอร์ทั้งหมด (Super Admin Only)</p>
        </div>
        <button
          onClick={fetchServers}
          className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Warning */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-400">ข้อมูลลับ - เฉพาะ Super Admin</p>
          <p className="text-[10px] text-amber-500/60 mt-0.5">หน้านี้แสดงข้อมูลล็อกอินเซิร์ฟเวอร์ทั้งหมด รวมถึง IP, Username, Password กรุณาอย่าแชร์ข้อมูลนี้</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Server className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{servers.length}</p>
            <p className="text-[10px] text-zinc-500 font-bold">เซิร์ฟเวอร์ทั้งหมด</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{onlineCount}</p>
            <p className="text-[10px] text-zinc-500 font-bold">ออนไลน์</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{activeCount}</p>
            <p className="text-[10px] text-zinc-500 font-bold">เปิดใช้งาน</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาเซิร์ฟเวอร์... (ชื่อ, IP, ID)"
          className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/30 transition-colors"
        />
        <Server className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Server Cards */}
      {filteredServers.length === 0 ? (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center space-y-3">
          <Server className="w-12 h-12 text-zinc-700 mx-auto" />
          <p className="text-sm text-zinc-500 font-bold">
            {search ? 'ไม่พบเซิร์ฟเวอร์ที่ค้นหา' : 'ยังไม่มีเซิร์ฟเวอร์'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServers.map((server) => {
            const isPasswordVisible = visiblePasswords.has(server.id)
            const panelUrl = `http://${server.host}:${server.port}${server.path}`

            return (
              <div
                key={server.id}
                className={`bg-zinc-900/50 border rounded-2xl p-4 sm:p-5 transition-all ${
                  server.isActive && server.status === 'Online'
                    ? 'border-white/5 hover:border-amber-500/20'
                    : 'border-white/5 opacity-60'
                }`}
              >
                {/* Server Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{server.flag}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {server.name}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                          server.status === 'Online'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {server.status === 'Online' ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                          {server.status}
                        </span>
                        {!server.isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold border bg-zinc-800 text-zinc-500 border-white/5">
                            ปิดใช้งาน
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        {server.protocol.toUpperCase()} / {server.tlsType} / {server.network.toUpperCase()} — {server.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-zinc-600">
                      อัปเดต {new Date(server.updatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Login Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Server ID */}
                  <InfoField
                    icon={<Fingerprint className="w-3.5 h-3.5 text-zinc-500" />}
                    label="Server ID"
                    value={server.id}
                    onCopy={() => copyToClipboard(server.id, `id-${server.id}`)}
                    isCopied={copiedField === `id-${server.id}`}
                    mono
                  />

                  {/* Host / IP */}
                  <InfoField
                    icon={<Globe className="w-3.5 h-3.5 text-blue-400" />}
                    label="Host / IP"
                    value={server.host}
                    onCopy={() => copyToClipboard(server.host, `host-${server.id}`)}
                    isCopied={copiedField === `host-${server.id}`}
                    mono
                  />

                  {/* Port (Panel) */}
                  <InfoField
                    icon={<Network className="w-3.5 h-3.5 text-cyan-400" />}
                    label="Panel Port"
                    value={server.port.toString()}
                    onCopy={() => copyToClipboard(server.port.toString(), `port-${server.id}`)}
                    isCopied={copiedField === `port-${server.id}`}
                    mono
                  />

                  {/* Username */}
                  <InfoField
                    icon={<User className="w-3.5 h-3.5 text-emerald-400" />}
                    label="Username"
                    value={server.username}
                    onCopy={() => copyToClipboard(server.username, `user-${server.id}`)}
                    isCopied={copiedField === `user-${server.id}`}
                    mono
                  />

                  {/* Password */}
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Password</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-white font-mono flex-1 truncate">
                        {isPasswordVisible ? server.password : maskPassword(server.password)}
                      </code>
                      <button
                        onClick={() => togglePasswordVisibility(server.id)}
                        className="p-1 bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                        title={isPasswordVisible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      >
                        {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(server.password, `pass-${server.id}`)}
                        className="p-1 bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                        title="คัดลอก"
                      >
                        {copiedField === `pass-${server.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Inbound ID */}
                  <InfoField
                    icon={<Hash className="w-3.5 h-3.5 text-purple-400" />}
                    label="Inbound ID"
                    value={server.inboundId.toString()}
                    onCopy={() => copyToClipboard(server.inboundId.toString(), `inbound-${server.id}`)}
                    isCopied={copiedField === `inbound-${server.id}`}
                    mono
                  />

                  {/* Panel Path */}
                  <InfoField
                    icon={<KeyRound className="w-3.5 h-3.5 text-orange-400" />}
                    label="Panel Path"
                    value={server.path}
                    onCopy={() => copyToClipboard(server.path, `path-${server.id}`)}
                    isCopied={copiedField === `path-${server.id}`}
                    mono
                  />

                  {/* Client Port */}
                  <InfoField
                    icon={<Network className="w-3.5 h-3.5 text-pink-400" />}
                    label="Client Port"
                    value={server.clientPort.toString()}
                    onCopy={() => copyToClipboard(server.clientPort.toString(), `cport-${server.id}`)}
                    isCopied={copiedField === `cport-${server.id}`}
                    mono
                  />

                  {/* SNI */}
                  <InfoField
                    icon={<Shield className="w-3.5 h-3.5 text-teal-400" />}
                    label="SNI"
                    value={server.sni}
                    onCopy={() => copyToClipboard(server.sni, `sni-${server.id}`)}
                    isCopied={copiedField === `sni-${server.id}`}
                    mono
                  />
                </div>

                {/* Panel URL */}
                <div className="mt-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Globe className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex-shrink-0">Panel URL</span>
                      <code className="text-xs text-amber-400 font-mono truncate">{panelUrl}</code>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => copyToClipboard(panelUrl, `url-${server.id}`)}
                        className="p-1.5 bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                        title="คัดลอก URL"
                      >
                        {copiedField === `url-${server.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <a
                        href={panelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all active:scale-95"
                      >
                        เปิด Panel
                      </a>
                    </div>
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

// Reusable Info Field Component
function InfoField({
  icon,
  label,
  value,
  onCopy,
  isCopied,
  mono = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onCopy: () => void
  isCopied: boolean
  mono?: boolean
}) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs text-white flex-1 truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
        <button
          onClick={onCopy}
          className="p-1 bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors flex-shrink-0"
          title="คัดลอก"
        >
          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  )
}
