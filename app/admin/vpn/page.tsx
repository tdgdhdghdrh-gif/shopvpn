'use client'

import { useEffect, useState, useMemo } from 'react'
import { 
  Server, Plus, Trash2, Edit2, Wifi, Activity,
  CheckCircle2, XCircle, RefreshCw, Search, Power, Zap,
  Sparkles, Smartphone, Globe, Signal, Shield, ChevronDown,
  AlertTriangle, Gauge, Radio, Download, Tag, DollarSign, Palette, Users, Hash,
  Eye, EyeOff, ChevronRight, X, Settings2, BarChart3, 
  TrendingUp, Monitor, Cloud, MapPin, Clock, Package, Crown, Layers
} from 'lucide-react'

interface InboundConfig {
  inboundId: number
  carrier: string
  remark: string
  protocol: string
  port: number
  network: string
  security: string
  wsPath: string
  wsHost: string
  flow: string
  realityPbk: string
  realityFp: string
  realitySni: string
  realitySid: string
  realitySpx: string
  tlsServerName: string
  grpcServiceName: string
  clientCount: number
  enable: boolean
  customAddress: string
  customWsHost: string
  customPort: number | null
}

interface VpnServer {
  id: string
  name: string
  flag: string
  host: string
  port: number
  path: string
  username: string
  password: string
  inboundId: number
  protocol: string
  tlsType: string
  flow: string
  sni: string
  clientPort: number
  isActive: boolean
  ping: number
  load: number
  status: string
  supportsAis: boolean
  supportsTrue: boolean
  supportsDtac: boolean
  category: string
  speed: number
  inboundConfigs: InboundConfig[] | null
  createdAt: string
  pricePerDay: number
  priceWeekly: number | null
  priceMonthly: number | null
  customPackages: { days: number; price: number; label: string }[] | null
  description: string | null
  badge: string | null
  tags: string[]
  features: string[]
  themeColor: string | null
  themeGradient: string | null
  imageUrl: string | null
  sortOrder: number
  maxClients: number
  defaultIpLimit: number
  vlessTemplate: string | null
}

type FilterStatus = 'all' | 'online' | 'offline'
type FilterCategory = 'all' | 'general' | 'movie' | 'game' | 'streaming' | 'tiktok'

const categoryLabels: Record<string, string> = {
  all: 'ทั้งหมด',
  general: 'ทั่วไป',
  movie: 'ดูหนัง',
  game: 'เกม',
  streaming: 'สตรีม',
  tiktok: 'TikTok',
}

function getCategoryEmoji(cat: string) {
  switch (cat) {
    case 'movie': return '🎬'
    case 'game': return '🎮'
    case 'streaming': return '📺'
    case 'tiktok': return '✨'
    default: return '🌐'
  }
}

function getCategoryLabel(cat: string) {
  switch (cat) {
    case 'movie': return 'ดูหนัง'
    case 'game': return 'เกม'
    case 'streaming': return 'สตรีม'
    case 'tiktok': return 'TikTok'
    default: return 'ทั่วไป'
  }
}

function formatSpeed(mbps: number) {
  if (mbps >= 1000) return `${mbps / 1000}G`
  return `${mbps}M`
}

function getPingColor(ping: number) {
  if (ping <= 30) return 'text-emerald-400'
  if (ping <= 80) return 'text-cyan-400'
  if (ping <= 150) return 'text-amber-400'
  return 'text-red-400'
}

function getLoadColor(load: number) {
  if (load <= 50) return 'text-emerald-400'
  if (load <= 75) return 'text-amber-400'
  return 'text-red-400'
}

function getLoadBarColor(load: number) {
  if (load <= 50) return 'from-emerald-500 to-emerald-400'
  if (load <= 75) return 'from-amber-500 to-amber-400'
  return 'from-red-500 to-red-400'
}

// Reusable input class
const inputClass = "w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-cyan-500/20 transition-all"
const selectClass = "w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
const labelClass = "text-[10px] font-bold text-zinc-500 ml-0.5 block mb-1"

export default function AdminVpnPage() {
  const [servers, setServers] = useState<VpnServer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedServer, setSelectedServer] = useState<VpnServer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    flag: '',
    host: '',
    port: 2053,
    path: '',
    username: '',
    password: '',
    inboundId: 3,
    protocol: 'vless',
    tlsType: 'Reality',
    flow: 'xtls-rprx-vision',
    sni: 'google.co.th',
    clientPort: 443,
    supportsAis: true,
    supportsTrue: false,
    supportsDtac: false,
    category: 'general',
    speed: 1000,
    skipConnectionTest: false,
    pricePerDay: 2,
    priceWeekly: '' as string | number,
    priceMonthly: '' as string | number,
    customPackages: [] as { days: number; price: number; label: string }[],
    description: '',
    badge: '',
    tags: '' as string,
    features: '' as string,
    themeColor: '',
    themeGradient: '',
    imageUrl: '',
    sortOrder: 0,
    maxClients: 0,
    defaultIpLimit: 0,
    vlessTemplate: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [testingConnection, setTestingConnection] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<VpnServer | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [fetchingInbounds, setFetchingInbounds] = useState(false)
  const [panelInbounds, setPanelInbounds] = useState<any[]>([])
  const [inboundCarriers, setInboundCarriers] = useState<Record<number, string>>({})
  const [inboundOverrides, setInboundOverrides] = useState<Record<number, { customAddress: string; customWsHost: string; customPort: number | null }>>({})
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchServers()
  }, [])

  async function fetchServers() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/servers')
      const data = await res.json()
      if (data.servers) {
        setServers(data.servers)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'โหลดข้อมูลเซิร์ฟเวอร์ไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setModalMode('add')
    setSelectedServer(null)
    setFormData({
      name: '',
      flag: '',
      host: '',
      port: 2053,
      path: '',
      username: '',
      password: '',
      inboundId: 3,
      protocol: 'vless',
      tlsType: 'Reality',
      flow: 'xtls-rprx-vision',
      sni: 'google.co.th',
      clientPort: 443,
      supportsAis: true,
      supportsTrue: false,
      supportsDtac: false,
      category: 'general',
      speed: 1000,
      skipConnectionTest: false,
      pricePerDay: 2,
      priceWeekly: '',
      priceMonthly: '',
      customPackages: [],
      description: '',
      badge: '',
      tags: '',
      features: '',
      themeColor: '',
      themeGradient: '',
      imageUrl: '',
      sortOrder: 0,
      maxClients: 0,
      defaultIpLimit: 0,
      vlessTemplate: '',
    })
    setShowModal(true)
    setPanelInbounds([])
    setInboundCarriers({})
    setInboundOverrides({})
  }

  function openEditModal(server: VpnServer) {
    setModalMode('edit')
    setSelectedServer(server)
    setFormData({
      name: server.name,
      flag: server.flag,
      host: server.host,
      port: server.port,
      path: server.path,
      username: '',
      password: '',
      inboundId: server.inboundId,
      protocol: server.protocol,
      tlsType: server.tlsType,
      flow: server.flow,
      sni: server.sni,
      clientPort: server.clientPort ?? 443,
      supportsAis: server.supportsAis ?? true,
      supportsTrue: server.supportsTrue ?? false,
      supportsDtac: server.supportsDtac ?? false,
      category: server.category ?? 'general',
      speed: server.speed ?? 1000,
      skipConnectionTest: false,
      pricePerDay: server.pricePerDay ?? 2,
      priceWeekly: server.priceWeekly ?? '',
      priceMonthly: server.priceMonthly ?? '',
      customPackages: server.customPackages ?? [],
      description: server.description ?? '',
      badge: server.badge ?? '',
      tags: (server.tags ?? []).join(', '),
      features: (server.features ?? []).join('\n'),
      themeColor: server.themeColor ?? '',
      themeGradient: server.themeGradient ?? '',
      imageUrl: server.imageUrl ?? '',
      sortOrder: server.sortOrder ?? 0,
      maxClients: server.maxClients ?? 0,
      defaultIpLimit: server.defaultIpLimit ?? 0,
      vlessTemplate: server.vlessTemplate ?? '',
    })
    setShowModal(true)
    if (server.inboundConfigs && Array.isArray(server.inboundConfigs)) {
      setPanelInbounds(server.inboundConfigs.map((ic: InboundConfig) => ({
        id: ic.inboundId,
        remark: ic.remark,
        protocol: ic.protocol,
        port: ic.port,
        network: ic.network,
        security: ic.security,
        wsPath: ic.wsPath,
        wsHost: ic.wsHost,
        flow: ic.flow,
        realityPbk: ic.realityPbk,
        realityFp: ic.realityFp,
        realitySni: ic.realitySni,
        realitySid: ic.realitySid,
        realitySpx: ic.realitySpx,
        tlsServerName: ic.tlsServerName,
        grpcServiceName: ic.grpcServiceName,
        clientCount: ic.clientCount,
        enable: ic.enable,
      })))
      const carriers: Record<number, string> = {}
      const overrides: Record<number, { customAddress: string; customWsHost: string; customPort: number | null }> = {}
      server.inboundConfigs.forEach((ic: InboundConfig) => {
        if (ic.carrier) carriers[ic.inboundId] = ic.carrier
        if (ic.customAddress || ic.customWsHost || ic.customPort) {
          overrides[ic.inboundId] = {
            customAddress: ic.customAddress || '',
            customWsHost: ic.customWsHost || '',
            customPort: ic.customPort ?? null,
          }
        }
      })
      setInboundCarriers(carriers)
      setInboundOverrides(overrides)
    } else {
      setPanelInbounds([])
      setInboundCarriers({})
      setInboundOverrides({})
    }
  }

  async function testConnection() {
    setTestingConnection(true)
    setMessage({ type: '', text: '' })
    
    try {
      const res = await fetch('/api/admin/servers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: formData.host,
          port: formData.port,
          path: formData.path,
          username: formData.username,
          password: formData.password
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `เชื่อมต่อสำเร็จ! ใช้ ${data.useHttp ? 'HTTP' : 'HTTPS'}` 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: 'เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบข้อมูลให้ถูกต้อง' 
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการทดสอบ' })
    } finally {
      setTestingConnection(false)
    }
  }

  async function fetchInbounds() {
    setFetchingInbounds(true)
    setMessage({ type: '', text: '' })
    setPanelInbounds([])
    
    try {
      const res = await fetch('/api/admin/servers/inbounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: formData.host,
          port: formData.port,
          path: formData.path,
          username: formData.username,
          password: formData.password
        })
      })
      
      const data = await res.json()
      
      if (data.success && data.inbounds) {
        setPanelInbounds(data.inbounds)
        setMessage({ 
          type: 'success', 
          text: `Inbound ${data.inbounds.length} ตัว - เลือกค่ายให้แต่ละ Inbound` 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'ดึง Inbound ไม่สำเร็จ' 
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการดึง Inbound' })
    } finally {
      setFetchingInbounds(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const url = modalMode === 'add' 
        ? '/api/admin/servers/add' 
        : `/api/admin/servers/${selectedServer?.id}`
      
      const method = modalMode === 'add' ? 'POST' : 'PUT'

      const taggedInbounds = panelInbounds
        .filter(ib => inboundCarriers[ib.id])
        .map(ib => ({
          inboundId: ib.id,
          carrier: inboundCarriers[ib.id],
          remark: ib.remark,
          protocol: ib.protocol,
          port: ib.port,
          network: ib.network || 'ws',
          security: ib.security || 'none',
          wsPath: ib.wsPath || '/',
          wsHost: ib.wsHost || '',
          flow: ib.flow || '',
          realityPbk: ib.realityPbk || '',
          realityFp: ib.realityFp || '',
          realitySni: ib.realitySni || '',
          realitySid: ib.realitySid || '',
          realitySpx: ib.realitySpx || '',
          tlsServerName: ib.tlsServerName || '',
          grpcServiceName: ib.grpcServiceName || '',
          clientCount: ib.clientCount || 0,
          enable: ib.enable !== false,
          customAddress: inboundOverrides[ib.id]?.customAddress || '',
          customWsHost: inboundOverrides[ib.id]?.customWsHost || '',
          customPort: inboundOverrides[ib.id]?.customPort ?? null,
        }))

      const carriers = taggedInbounds.map(ib => ib.carrier)
      const submitData = {
        ...formData,
        inboundConfigs: taggedInbounds.length > 0 ? taggedInbounds : undefined,
        supportsAis: carriers.includes('ais') || (taggedInbounds.length === 0 && formData.supportsAis),
        supportsTrue: carriers.includes('true') || (taggedInbounds.length === 0 && formData.supportsTrue),
        supportsDtac: carriers.includes('dtac') || (taggedInbounds.length === 0 && formData.supportsDtac),
        inboundId: taggedInbounds.length > 0 ? taggedInbounds[0].inboundId : formData.inboundId,
        pricePerDay: formData.pricePerDay || 2,
        priceWeekly: formData.priceWeekly !== '' ? Number(formData.priceWeekly) : null,
        priceMonthly: formData.priceMonthly !== '' ? Number(formData.priceMonthly) : null,
        customPackages: formData.customPackages.length > 0 ? formData.customPackages : null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        features: formData.features ? formData.features.split('\n').map(f => f.trim()).filter(Boolean) : [],
        vlessTemplate: formData.vlessTemplate || null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: modalMode === 'add' ? 'เพิ่มเซิร์ฟเวอร์สำเร็จ' : 'อัปเดตเซิร์ฟเวอร์สำเร็จ' 
        })
        setShowModal(false)
        fetchServers()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || data.details || 'การดำเนินการล้มเหลว' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดไม่คาดคิด' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    
    try {
      const res = await fetch(`/api/admin/servers/${deleteTarget.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'ลบเซิร์ฟเวอร์สำเร็จ' })
        fetchServers()
      } else {
        setMessage({ type: 'error', text: 'ลบไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const stats = useMemo(() => {
    const active = servers.filter(s => s.isActive)
    const inactive = servers.filter(s => !s.isActive)
    const avgPing = active.length > 0 
      ? Math.round(active.reduce((sum, s) => sum + (s.ping || 0), 0) / active.length) 
      : 0
    const avgLoad = active.length > 0 
      ? Math.round(active.reduce((sum, s) => sum + (s.load || 0), 0) / active.length) 
      : 0
    const categories = new Set(servers.map(s => s.category || 'general'))
    return { total: servers.length, active: active.length, inactive: inactive.length, avgPing, avgLoad, categories: categories.size }
  }, [servers])

  const filteredServers = useMemo(() => {
    return servers.filter(s => {
      const matchSearch = search === '' || 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.host.toLowerCase().includes(search.toLowerCase()) ||
        s.flag.includes(search)
      const matchStatus = filterStatus === 'all' || 
        (filterStatus === 'online' && s.isActive) || 
        (filterStatus === 'offline' && !s.isActive)
      const matchCategory = filterCategory === 'all' || s.category === filterCategory
      return matchSearch && matchStatus && matchCategory
    })
  }, [servers, search, filterStatus, filterCategory])

  const availableCategories = useMemo(() => {
    const cats = new Set(servers.map(s => s.category || 'general'))
    return ['all', ...Array.from(cats)] as FilterCategory[]
  }, [servers])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 sm:pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-sm z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl transition-all animate-in slide-in-from-bottom-4 sm:slide-in-from-right-10 ${
          message.type === 'success' 
            ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/15 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="font-bold text-xs flex-1">{message.text}</span>
        </div>
      )}

      {/* ============ HERO HEADER ============ */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900 border border-white/[0.06] p-5 sm:p-7">
        {/* BG decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/[0.07] via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/[0.05] via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/10">
              <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">VPN Cluster</h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">จัดการโหนด VPN ทั้งหมดในระบบ</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchServers}
              className="h-10 px-4 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
            <button
              onClick={openAddModal}
              className="h-10 px-4 sm:px-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-xs font-bold text-white hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-600/25 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มโหนด</span>
            </button>
          </div>
        </div>

        {/* Mini stats row */}
        <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mt-5">
          {[
            { label: 'โหนดทั้งหมด', value: stats.total, icon: Server, color: 'cyan' },
            { label: 'ออนไลน์', value: stats.active, icon: Power, color: 'emerald' },
            { label: 'ออฟไลน์', value: stats.inactive, icon: XCircle, color: 'red' },
            { label: 'Avg Ping', value: `${stats.avgPing}ms`, icon: Zap, color: stats.avgPing <= 50 ? 'emerald' : stats.avgPing <= 100 ? 'amber' : 'red' },
            { label: 'Avg Load', value: `${stats.avgLoad}%`, icon: BarChart3, color: stats.avgLoad <= 50 ? 'emerald' : stats.avgLoad <= 75 ? 'amber' : 'red' },
            { label: 'หมวดหมู่', value: stats.categories, icon: Tag, color: 'violet' },
          ].map((stat, i) => {
            const colorMap: Record<string, string> = {
              cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/10',
              emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
              red: 'bg-red-500/10 text-red-400 border-red-500/10',
              amber: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
              violet: 'bg-violet-500/10 text-violet-400 border-violet-500/10',
            }
            const textColorMap: Record<string, string> = {
              cyan: 'text-cyan-400',
              emerald: 'text-emerald-400',
              red: 'text-red-400',
              amber: 'text-amber-400',
              violet: 'text-violet-400',
            }
            return (
              <div key={i} className={`relative bg-white/[0.03] border border-white/[0.04] rounded-xl p-3 sm:p-3.5 hover:bg-white/[0.05] transition-all ${i >= 3 ? 'hidden sm:block' : ''}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                    <stat.icon className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className={`text-lg sm:text-xl font-black ${textColorMap[stat.color] || 'text-white'}`}>{stat.value}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============ SEARCH + FILTER ============ */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center group-focus-within:bg-cyan-500/10 transition-colors">
            <Search className="w-3.5 h-3.5 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="ค้นหาชื่อโหนด, IP, ธง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl pl-14 pr-10 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-cyan-500/30 focus:bg-zinc-900/80 focus:ring-1 focus:ring-cyan-500/10 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {/* Status pills */}
          {(['all', 'online', 'offline'] as FilterStatus[]).map((status) => {
            const count = status === 'all' ? stats.total : status === 'online' ? stats.active : stats.inactive
            const isActive = filterStatus === status
            const activeStyle = status === 'online' 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10' 
              : status === 'offline' 
                ? 'bg-red-500/15 text-red-400 border-red-500/20 shadow-sm shadow-red-500/10'
                : 'bg-white/10 text-white border-white/15 shadow-sm'
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                  isActive ? activeStyle : 'bg-zinc-900/60 text-zinc-500 border border-white/[0.04] hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                {status === 'all' ? 'ทั้งหมด' : status === 'online' ? 'ออนไลน์' : 'ออฟไลน์'}
                {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
              </button>
            )
          })}

          {/* Divider */}
          {availableCategories.length > 2 && <div className="w-px h-5 bg-white/[0.08] flex-shrink-0 mx-0.5" />}

          {/* Category pills */}
          {availableCategories.length > 2 && availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap active:scale-95 ${
                filterCategory === cat 
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shadow-sm shadow-cyan-500/10' 
                  : 'bg-zinc-900/60 text-zinc-500 border border-white/[0.04] hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {getCategoryEmoji(cat)} {categoryLabels[cat]}
            </button>
          ))}

          {/* Count & View toggle */}
          <div className="flex items-center gap-2 ml-auto pl-2 flex-shrink-0">
            <span className="text-[10px] font-bold text-zinc-600">
              {filteredServers.length} โหนด
            </span>
            <div className="hidden sm:flex items-center bg-zinc-900 border border-white/[0.06] rounded-lg p-0.5">
              <button onClick={() => setViewMode('grid')} className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
              </button>
              <button onClick={() => setViewMode('list')} className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="3" rx="1"/><rect x="1" y="7" width="14" height="3" rx="1"/><rect x="1" y="12" width="14" height="3" rx="1"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ SERVER LIST ============ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[35vh] gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-[3px] border-cyan-500/10 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-[2px] border-blue-500/20 rounded-full" />
            <div className="absolute inset-2 border-[2px] border-blue-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-zinc-400">กำลังสแกนเครือข่าย</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">โปรดรอสักครู่...</p>
          </div>
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="bg-zinc-900/30 border border-white/[0.05] border-dashed rounded-2xl p-10 sm:p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-900 border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto">
            <Server className="w-8 h-8 text-zinc-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">ไม่พบโหนด</h3>
            <p className="text-sm text-zinc-500 mt-1.5">
              {search || filterStatus !== 'all' || filterCategory !== 'all' 
                ? 'ลองเปลี่ยนตัวกรองหรือคำค้นหา' 
                : 'ยังไม่มีเซิร์ฟเวอร์ในระบบ'}
            </p>
          </div>
          {servers.length === 0 && (
            <button onClick={openAddModal} className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-cyan-600/25">
              เพิ่มโหนดแรก
            </button>
          )}
        </div>
      ) : (
        <div className={`space-y-3 sm:space-y-0 ${viewMode === 'grid' ? 'sm:grid sm:grid-cols-2 xl:grid-cols-3 sm:gap-3' : 'sm:space-y-2.5'}`}>
          {filteredServers.map((server) => {
            const isExpanded = expandedCard === server.id
            const carrierCount = [server.supportsAis, server.supportsTrue, server.supportsDtac].filter(Boolean).length
            
            return (
              <div 
                key={server.id}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  server.isActive 
                    ? 'bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-900/80 border border-white/[0.06] hover:border-white/[0.12] hover:shadow-lg hover:shadow-cyan-500/[0.03]' 
                    : 'bg-gradient-to-br from-zinc-900/50 via-zinc-900/40 to-zinc-900/50 border border-red-500/10 hover:border-red-500/20 opacity-75 hover:opacity-100'
                }`}
              >
                {/* Top accent line */}
                {server.isActive && (
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                )}

                {/* Main card content */}
                <div className="p-4 sm:p-5">
                  {/* Row 1: Flag + Name + Badge + Actions */}
                  <div className="flex items-start gap-3">
                    {/* Flag with status ring */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl ${
                        server.isActive 
                          ? 'bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08]' 
                          : 'bg-red-500/5 border border-red-500/10'
                      }`}>
                        {server.flag}
                      </div>
                      {/* Status dot */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-zinc-900 ${
                        server.isActive 
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                          : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                      }`} />
                    </div>
                    
                    {/* Name + meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-sm sm:text-[15px] truncate leading-tight">{server.name}</h3>
                        {server.badge && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/20 rounded-full text-[9px] font-black text-amber-400 whitespace-nowrap">
                            <Crown className="w-2.5 h-2.5" />
                            {server.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/[0.04] rounded text-[9px] font-bold text-zinc-500">
                          <Shield className="w-2.5 h-2.5" />
                          {server.protocol.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/[0.04] rounded text-[9px] font-bold text-zinc-500">
                          {server.tlsType}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/[0.04] rounded text-[9px] font-bold text-zinc-500">
                          <Signal className="w-2.5 h-2.5" />
                          {formatSpeed(server.speed)}
                        </span>
                        {server.sortOrder > 0 && (
                          <span className="text-[9px] text-zinc-700 font-mono">#{server.sortOrder}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(server)}
                        className="w-9 h-9 flex items-center justify-center bg-white/[0.04] border border-white/[0.06] rounded-xl text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all active:scale-95"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(server)}
                        className="w-9 h-9 flex items-center justify-center bg-red-500/[0.04] border border-red-500/[0.08] rounded-xl text-red-400/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Info pills */}
                  <div className="flex items-center gap-1.5 mt-3.5 flex-wrap">
                    {/* Price pill */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border border-cyan-500/15 rounded-lg text-[10px] font-black text-cyan-400">
                      <DollarSign className="w-3 h-3" />
                      {server.pricePerDay}฿/วัน
                    </span>
                    {/* Category */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[10px] font-bold text-zinc-400">
                      {getCategoryEmoji(server.category)} {getCategoryLabel(server.category)}
                    </span>
                    {/* Carriers */}
                    {server.supportsAis && (
                      <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/15 rounded-lg text-[9px] font-black text-emerald-400">AIS</span>
                    )}
                    {server.supportsTrue && (
                      <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/15 rounded-lg text-[9px] font-black text-blue-400">TRUE</span>
                    )}
                    {server.supportsDtac && (
                      <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/15 rounded-lg text-[9px] font-black text-purple-400">DTAC</span>
                    )}
                    {/* Max clients */}
                    {server.maxClients > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-violet-500/10 border border-violet-500/15 rounded-lg text-[9px] font-bold text-violet-400">
                        <Users className="w-2.5 h-2.5" />{server.maxClients}
                      </span>
                    )}
                    {/* IP limit */}
                    {server.defaultIpLimit > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[9px] font-bold text-zinc-500">
                        IP:{server.defaultIpLimit}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Performance meters */}
                  <div className="flex items-center gap-4 mt-3.5 pt-3 border-t border-white/[0.04]">
                    {/* Ping */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Activity className="w-3 h-3 text-cyan-500/70" />
                      </div>
                      <div>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase">Ping</p>
                        <p className={`text-xs font-black ${getPingColor(server.ping)}`}>{server.ping}ms</p>
                      </div>
                    </div>
                    
                    {/* Load */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Gauge className="w-3 h-3 text-amber-500/70" />
                      </div>
                      <div>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase">Load</p>
                        <p className={`text-xs font-black ${getLoadColor(server.load)}`}>{server.load}%</p>
                      </div>
                    </div>

                    {/* Load bar */}
                    <div className="flex-1 space-y-1">
                      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${getLoadBarColor(server.load)} transition-all duration-500`}
                          style={{ width: `${Math.min(server.load, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Expand toggle (mobile) */}
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : server.id)}
                      className="sm:hidden w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all active:scale-90"
                    >
                      <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                <div className={`border-t border-white/[0.04] transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'} sm:max-h-none sm:opacity-100 sm:overflow-visible`}>
                  <div className="px-4 sm:px-5 py-3.5 space-y-2.5 bg-white/[0.01]">
                    {/* Description */}
                    {server.description && (
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{server.description}</p>
                    )}
                    {/* Host info */}
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-white/[0.04] flex items-center justify-center">
                        <Monitor className="w-2.5 h-2.5 text-zinc-600" />
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">{server.host}:{server.port}</span>
                    </div>
                    {/* Package prices */}
                    {(server.priceWeekly || server.priceMonthly || (server.customPackages && (server.customPackages as any[]).length > 0)) && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-5 h-5 rounded bg-white/[0.04] flex items-center justify-center">
                          <Package className="w-2.5 h-2.5 text-zinc-600" />
                        </div>
                        {server.priceWeekly && <span className="text-[10px] text-cyan-400/80 bg-cyan-500/5 px-2 py-0.5 rounded font-bold">7วัน: {server.priceWeekly}฿</span>}
                        {server.priceMonthly && <span className="text-[10px] text-cyan-400/80 bg-cyan-500/5 px-2 py-0.5 rounded font-bold">30วัน: {server.priceMonthly}฿</span>}
                        {server.customPackages && (server.customPackages as any[]).map((pkg: any, i: number) => (
                          <span key={i} className="text-[10px] text-violet-400/80 bg-violet-500/5 px-2 py-0.5 rounded font-bold">{pkg.label}: {pkg.price}฿</span>
                        ))}
                      </div>
                    )}
                    {/* Tags */}
                    {server.tags && server.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {server.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded-md text-[9px] font-bold text-zinc-500">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ============ DELETE MODAL ============ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative bg-zinc-950 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm p-6 space-y-5 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            {/* Drag handle mobile */}
            <div className="sm:hidden w-10 h-1 bg-white/10 rounded-full mx-auto -mt-1 mb-2" />
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">ลบเซิร์ฟเวอร์?</h3>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                  ต้องการลบ <span className="text-white font-bold">{deleteTarget.name} {deleteTarget.flag}</span> หรือไม่?
                </p>
                <p className="text-xs text-red-400/60 mt-1">การลบนี้จะไม่สามารถย้อนกลับได้</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-zinc-400 transition-all active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 active:scale-95"
              >
                {deleting ? 'กำลังลบ...' : 'ลบเลย'}
              </button>
            </div>
            <div className="h-2 sm:hidden" />
          </div>
        </div>
      )}

      {/* ============ ADD/EDIT MODAL ============ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-md" 
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-zinc-950 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            {/* Drag handle mobile */}
            <div className="sm:hidden w-10 h-1 bg-white/10 rounded-full mx-auto mt-3" />
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                  {modalMode === 'add' ? <Plus className="w-5 h-5 text-cyan-400" /> : <Edit2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {modalMode === 'add' ? 'เพิ่มโหนดใหม่' : 'แก้ไขโหนด'}
                  </h2>
                  <p className="text-[11px] text-zinc-600">ระบุรายละเอียดเซิร์ฟเวอร์</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors active:scale-90"
              >
                <X className="w-4.5 h-4.5 text-zinc-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <form id="vpn-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* === Basic Info === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Server className="w-3 h-3 text-cyan-400" />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">ข้อมูลพื้นฐาน</p>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="col-span-3">
                    <label className={labelClass}>ชื่อโหนด</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="AWS Tokyo 01" />
                  </div>
                  <div>
                    <label className={labelClass}>ธง</label>
                    <input type="text" value={formData.flag} onChange={(e) => setFormData({...formData, flag: e.target.value})} className={`${inputClass} text-center text-lg px-2`} placeholder="🇯🇵" />
                  </div>
                </div>
              </div>

              {/* === Connection === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Wifi className="w-3 h-3 text-blue-400" />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">การเชื่อมต่อ</p>
                </div>
                <div className="space-y-2.5">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <label className={labelClass}>โฮสต์ / IP</label>
                      <input type="text" required value={formData.host} onChange={(e) => setFormData({...formData, host: e.target.value})} className={inputClass} placeholder="1.2.3.4" />
                    </div>
                    <div>
                      <label className={labelClass}>พอร์ต</label>
                      <input type="number" required value={formData.port} onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Path</label>
                    <input type="text" required value={formData.path} onChange={(e) => setFormData({...formData, path: e.target.value})} className={inputClass} placeholder="/panel" />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Username</label>
                      <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className={inputClass} placeholder="Panel user" />
                    </div>
                    <div>
                      <label className={labelClass}>Password</label>
                      <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={inputClass} placeholder="Panel pass" />
                    </div>
                  </div>
                </div>
              </div>

              {/* === Protocol === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Shield className="w-3 h-3 text-violet-400" />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">โปรโตคอล</p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className={labelClass}>Protocol</label>
                    <select value={formData.protocol} onChange={(e) => setFormData({...formData, protocol: e.target.value})} className={selectClass}>
                      <option value="vless">VLESS</option>
                      <option value="vmess">VMess</option>
                      <option value="trojan">Trojan</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>TLS</label>
                    <select value={formData.tlsType} onChange={(e) => setFormData({...formData, tlsType: e.target.value})} className={selectClass}>
                      <option value="Reality">Reality</option>
                      <option value="XTLS">XTLS</option>
                      <option value="TLS">TLS</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Client Port</label>
                    <input type="number" value={formData.clientPort} onChange={(e) => setFormData({...formData, clientPort: parseInt(e.target.value) || 443})} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* === Category & Speed === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-amber-400" />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">ประเภท & ความเร็ว</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelClass}>ประเภท</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={selectClass}>
                      <option value="general">ทั่วไป</option>
                      <option value="movie">ดูหนังซีรี่ย์</option>
                      <option value="game">เล่นเกม</option>
                      <option value="streaming">สตรีมมิ่ง</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>ความเร็ว</label>
                    <select value={formData.speed} onChange={(e) => setFormData({...formData, speed: parseInt(e.target.value)})} className={selectClass}>
                      <option value={100}>100 Mbps</option>
                      <option value={500}>500 Mbps</option>
                      <option value={1000}>1 Gbps</option>
                      <option value={2000}>2 Gbps</option>
                      <option value={5000}>5 Gbps</option>
                      <option value={10000}>10 Gbps</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* === Pricing === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">ราคา</p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className={labelClass}>ราคา/วัน (฿)</label>
                    <input type="number" step="0.5" min="0" value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: parseFloat(e.target.value) || 0})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>7 วัน (฿)</label>
                    <input type="number" step="0.5" min="0" value={formData.priceWeekly} onChange={(e) => setFormData({...formData, priceWeekly: e.target.value === '' ? '' : parseFloat(e.target.value)})} className={inputClass} placeholder="auto" />
                  </div>
                  <div>
                    <label className={labelClass}>30 วัน (฿)</label>
                    <input type="number" step="0.5" min="0" value={formData.priceMonthly} onChange={(e) => setFormData({...formData, priceMonthly: e.target.value === '' ? '' : parseFloat(e.target.value)})} className={inputClass} placeholder="auto" />
                  </div>
                </div>
                <p className="text-[9px] text-zinc-600 ml-0.5">เว้นว่าง 7/30 วัน = คำนวณจากราคา/วัน x จำนวนวัน</p>

                {/* Custom Packages */}
                <div className="mt-1 pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-3 h-3 text-violet-400" />
                      <label className="text-[10px] font-bold text-zinc-500">แพ็กเกจเหมาจ่าย</label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        customPackages: [...formData.customPackages, { days: 90, price: 0, label: '' }]
                      })}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-emerald-500/10 transition-all"
                    >
                      <Plus className="w-3 h-3" /> เพิ่มแพ็กเกจ
                    </button>
                  </div>
                  {formData.customPackages.length === 0 && (
                    <p className="text-[10px] text-zinc-700 ml-0.5 py-2">ยังไม่มีแพ็กเกจ — กดปุ่ม "เพิ่มแพ็กเกจ" เพื่อสร้าง</p>
                  )}
                  <div className="space-y-2">
                    {formData.customPackages.map((pkg, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            min="1"
                            value={pkg.days}
                            onChange={(e) => {
                              const updated = [...formData.customPackages]
                              updated[idx] = { ...updated[idx], days: parseInt(e.target.value) || 1 }
                              setFormData({ ...formData, customPackages: updated })
                            }}
                            className={inputClass}
                            placeholder="วัน"
                          />
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={pkg.price}
                            onChange={(e) => {
                              const updated = [...formData.customPackages]
                              updated[idx] = { ...updated[idx], price: parseFloat(e.target.value) || 0 }
                              setFormData({ ...formData, customPackages: updated })
                            }}
                            className={inputClass}
                            placeholder="ราคา (฿)"
                          />
                          <input
                            type="text"
                            value={pkg.label}
                            onChange={(e) => {
                              const updated = [...formData.customPackages]
                              updated[idx] = { ...updated[idx], label: e.target.value }
                              setFormData({ ...formData, customPackages: updated })
                            }}
                            className={inputClass}
                            placeholder="ชื่อ เช่น 3 เดือน"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.customPackages.filter((_, i) => i !== idx)
                            setFormData({ ...formData, customPackages: updated })
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.customPackages.length > 0 && (
                    <p className="text-[9px] text-zinc-600 mt-2 ml-0.5">จำนวนวัน | ราคา (฿) | ชื่อที่แสดง — จะเป็นปุ่มให้ลูกค้าเลือกในหน้าซื้อ</p>
                  )}
                </div>
              </div>

              {/* === Features === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">จุดเด่น / รายละเอียด</p>
                </div>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  className={`${inputClass} resize-none`}
                  placeholder={"รองรับ Android / iOS\nแชร์ Wi-Fi ได้\n1000Mbps ไม่จำกัด GB\nเล่นเกมลื่นๆ ยูทูปปรับภาพสูง\nมีให้เทสฟรี"}
                  rows={5}
                />
                <p className="text-[9px] text-zinc-600 ml-0.5">ใส่ 1 บรรทัดต่อ 1 รายการ — แสดงเป็นรายการจุดเด่นในหน้าซื้อ</p>
              </div>

              {/* === Decoration === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Palette className="w-3 h-3 text-orange-400" />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">ตกแต่ง</p>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className={labelClass}>คำอธิบาย</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`${inputClass} resize-none`} placeholder="เซิร์ฟเวอร์เร็วสุดสำหรับ..." rows={2} maxLength={200} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>แบดจ์</label>
                      <select value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})} className={selectClass}>
                        <option value="">ไม่มี (สุ่ม)</option>
                        <option value="แนะนำ!">แนะนำ!</option>
                        <option value="ใหม่ล่าสุด">ใหม่ล่าสุด</option>
                        <option value="ขายดี!">ขายดี!</option>
                        <option value="ลดราคา!">ลดราคา!</option>
                        <option value="คุ้มสุดๆ">คุ้มสุดๆ</option>
                        <option value="แรงมาก!">แรงมาก!</option>
                        <option value="เสถียรสุด">เสถียรสุด</option>
                        <option value="ยอดนิยม">ยอดนิยม</option>
                        <option value="โปรพิเศษ">โปรพิเศษ</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>แท็ก (คั่น ,)</label>
                      <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className={inputClass} placeholder="เร็ว, ประหยัด" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className={labelClass}>สีธีม</label>
                      <div className="flex gap-2">
                        <input type="color" value={formData.themeColor || '#10b981'} onChange={(e) => setFormData({...formData, themeColor: e.target.value})} className="w-10 h-[38px] rounded-lg border border-white/10 bg-transparent cursor-pointer flex-shrink-0" />
                        <input type="text" value={formData.themeColor} onChange={(e) => setFormData({...formData, themeColor: e.target.value})} className={inputClass} placeholder="#10b981" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Gradient</label>
                      <select value={formData.themeGradient} onChange={(e) => setFormData({...formData, themeGradient: e.target.value})} className={selectClass}>
                        <option value="">ค่าเริ่มต้น</option>
                        <option value="linear-gradient(to right, #10b981, #06b6d4)">Emerald-Cyan</option>
                        <option value="linear-gradient(to right, #8b5cf6, #ec4899)">Violet-Pink</option>
                        <option value="linear-gradient(to right, #f59e0b, #ef4444)">Amber-Red</option>
                        <option value="linear-gradient(to right, #3b82f6, #8b5cf6)">Blue-Violet</option>
                        <option value="linear-gradient(to right, #ec4899, #f97316)">Pink-Orange</option>
                        <option value="linear-gradient(to right, #06b6d4, #3b82f6)">Cyan-Blue</option>
                        <option value="linear-gradient(to right, #fbbf24, #10b981)">Gold-Emerald</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>รูปภาพ URL</label>
                      <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className={inputClass} placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* === Limits & Sort === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <Users className="w-3 h-3 text-rose-400" />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">จำกัด & ลำดับ</p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className={labelClass}>ผู้ใช้สูงสุด</label>
                    <input type="number" min="0" value={formData.maxClients} onChange={(e) => setFormData({...formData, maxClients: parseInt(e.target.value) || 0})} className={inputClass} />
                    <p className="text-[8px] text-zinc-700 mt-0.5 ml-0.5">0 = ไม่จำกัด</p>
                  </div>
                  <div>
                    <label className={labelClass}>IP Limit</label>
                    <input type="number" min="0" max="10" value={formData.defaultIpLimit} onChange={(e) => setFormData({...formData, defaultIpLimit: parseInt(e.target.value) || 0})} className={inputClass} />
                    <p className="text-[8px] text-zinc-700 mt-0.5 ml-0.5">0 = ไม่จำกัด</p>
                  </div>
                  <div>
                    <label className={labelClass}>ลำดับแสดง</label>
                    <input type="number" min="0" value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})} className={inputClass} />
                    <p className="text-[8px] text-zinc-700 mt-0.5 ml-0.5">น้อย = ก่อน</p>
                  </div>
                </div>
              </div>

              {/* === Inbound & Carrier === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Download className="w-3 h-3 text-indigo-400" />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Inbound & ค่ายมือถือ</p>
                </div>
                
                <button
                  type="button"
                  onClick={fetchInbounds}
                  disabled={fetchingInbounds || !formData.host || !formData.username || !formData.password}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {fetchingInbounds ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> กำลังดึง...</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" /> ดึง Inbound จาก Panel</>
                  )}
                </button>

                {/* Inbound List */}
                {panelInbounds.length > 0 && (
                  <div className="space-y-2">
                    {panelInbounds.map((ib) => (
                      <div 
                        key={ib.id}
                        className={`p-3.5 border rounded-xl transition-all ${
                          inboundCarriers[ib.id] ? 'bg-cyan-500/5 border-cyan-500/15' : 'bg-white/[0.02] border-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ib.enable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className="text-xs font-bold text-white truncate">{ib.remark}</span>
                              <span className="text-[9px] text-zinc-600 flex-shrink-0 font-mono">#{ib.id}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="px-1.5 py-0.5 bg-white/[0.04] rounded text-[9px] font-bold text-zinc-500 uppercase">{ib.protocol}</span>
                              <span className="text-[9px] text-zinc-600">:{ib.port}</span>
                              <span className="text-[9px] text-zinc-700">|</span>
                              <span className="text-[9px] text-zinc-500">{ib.network}/{ib.security}</span>
                              {ib.clientCount > 0 && (
                                <span className="text-[9px] text-zinc-600">| {ib.clientCount} clients</span>
                              )}
                            </div>
                          </div>
                          <select
                            value={inboundCarriers[ib.id] || ''}
                            onChange={(e) => {
                              setInboundCarriers(prev => {
                                const next = { ...prev }
                                if (e.target.value) { next[ib.id] = e.target.value } else { delete next[ib.id] }
                                return next
                              })
                            }}
                            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-cyan-500/30 flex-shrink-0"
                          >
                            <option value="">-- ไม่ใช้ --</option>
                            <option value="ais">AIS</option>
                            <option value="true">TRUE</option>
                            <option value="dtac">DTAC</option>
                          </select>
                        </div>
                        
                        {inboundCarriers[ib.id] && (
                          <div className="mt-3 pt-3 border-t border-white/[0.05] space-y-2">
                            <p className="text-[9px] font-black text-amber-400/80 uppercase tracking-widest">Override (เว้นว่าง = ค่าเดิม)</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-zinc-600 ml-0.5 block mb-0.5">Address</label>
                                <input
                                  type="text"
                                  value={inboundOverrides[ib.id]?.customAddress || ''}
                                  onChange={(e) => {
                                    setInboundOverrides(prev => ({
                                      ...prev,
                                      [ib.id]: { customAddress: e.target.value, customWsHost: prev[ib.id]?.customWsHost || '', customPort: prev[ib.id]?.customPort ?? null }
                                    }))
                                  }}
                                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/30 transition-all"
                                  placeholder={formData.host}
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-zinc-600 ml-0.5 block mb-0.5">WS Host</label>
                                <input
                                  type="text"
                                  value={inboundOverrides[ib.id]?.customWsHost || ''}
                                  onChange={(e) => {
                                    setInboundOverrides(prev => ({
                                      ...prev,
                                      [ib.id]: { customAddress: prev[ib.id]?.customAddress || '', customWsHost: e.target.value, customPort: prev[ib.id]?.customPort ?? null }
                                    }))
                                  }}
                                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/30 transition-all"
                                  placeholder={ib.wsHost || 'ไม่มี'}
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-zinc-600 ml-0.5 block mb-0.5">Port</label>
                                <input
                                  type="number"
                                  value={inboundOverrides[ib.id]?.customPort ?? ''}
                                  onChange={(e) => {
                                    setInboundOverrides(prev => ({
                                      ...prev,
                                      [ib.id]: { customAddress: prev[ib.id]?.customAddress || '', customWsHost: prev[ib.id]?.customWsHost || '', customPort: e.target.value ? parseInt(e.target.value) : null }
                                    }))
                                  }}
                                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/30 transition-all"
                                  placeholder={`${ib.port}`}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {Object.keys(inboundCarriers).length > 0 && (
                      <div className="flex items-center gap-2 pt-1 px-1">
                        <Tag className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] text-cyan-400 font-bold">
                          {Object.entries(inboundCarriers).map(([id, c]) => `${c.toUpperCase()}(#${id})`).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback manual carrier toggles */}
                {panelInbounds.length === 0 && (
                  <div>
                    <p className="text-[10px] text-zinc-600 mb-2">เลือกค่ายด้วยตนเอง:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'supportsAis', label: 'AIS', activeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
                        { key: 'supportsTrue', label: 'TRUE', activeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
                        { key: 'supportsDtac', label: 'DTAC', activeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
                      ].map((network) => {
                        const isChecked = (formData as any)[network.key]
                        return (
                          <button
                            key={network.key}
                            type="button"
                            onClick={() => setFormData({...formData, [network.key]: !isChecked})}
                            className={`flex items-center justify-center gap-1.5 p-2.5 border rounded-xl text-xs font-bold transition-all active:scale-95 ${
                              isChecked ? network.activeClass : 'bg-white/[0.03] border-white/[0.05] text-zinc-600'
                            }`}
                          >
                            <Radio className="w-3.5 h-3.5" />
                            {network.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* === VLESS Template === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Settings2 className="w-3 h-3 text-teal-400" />
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">VLESS Template</p>
                </div>
                <div className="space-y-2.5">
                  <textarea
                    value={formData.vlessTemplate}
                    onChange={(e) => setFormData({...formData, vlessTemplate: e.target.value})}
                    className={`${inputClass} resize-none font-mono text-[11px] leading-relaxed`}
                    placeholder="vless://{UUID}@host:8080?type=tcp&encryption=none&path=%2F&host=speedtest.net&headerType=http&security=reality&pbk=xxx&fp=random&sni=speedtest.net&sid=xxx&spx=%2F#{REMARK}"
                    rows={4}
                  />
                  <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                    <p className="text-[10px] font-bold text-amber-400">วิธีใช้:</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      วาง VLESS URI ตัวอย่างที่ใช้งานได้จริง ใส่ <code className="px-1 py-0.5 bg-white/5 rounded text-amber-300 font-mono">{'{UUID}'}</code> ตรง UUID และ <code className="px-1 py-0.5 bg-white/5 rounded text-amber-300 font-mono">{'{REMARK}'}</code> ตรงชื่อ
                    </p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      ระบบจะแทนที่ตอนสร้างโค้ดให้ลูกค้าอัตโนมัติ ถ้าเว้นว่าง = ใช้ระบบสร้างเดิม (จาก Inbound)
                    </p>
                    <div className="mt-1.5 p-2.5 bg-black/30 rounded-lg overflow-x-auto">
                      <p className="text-[9px] font-mono text-zinc-500 whitespace-nowrap">
                        vless://<span className="text-amber-400">{'{UUID}'}</span>@host:8080?type=tcp&...&spx=%2F#<span className="text-amber-400">{'{REMARK}'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skip Connection Test */}
              {modalMode === 'add' && (
                <button
                  type="button"
                  onClick={() => setFormData({...formData, skipConnectionTest: !formData.skipConnectionTest})}
                  className={`w-full p-4 border rounded-xl flex items-center gap-3 text-left transition-all active:scale-[0.99] ${
                    formData.skipConnectionTest ? 'bg-amber-500/10 border-amber-500/15' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    formData.skipConnectionTest ? 'bg-amber-500 border-amber-500' : 'border-zinc-700'
                  }`}>
                    {formData.skipConnectionTest && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs font-bold ${formData.skipConnectionTest ? 'text-amber-400' : 'text-zinc-400'}`}>
                      ข้ามตรวจสอบการเชื่อมต่อ
                    </span>
                    <p className="text-[10px] text-zinc-600 mt-0.5">บันทึกโดยไม่ทดสอบ Panel</p>
                  </div>
                </button>
              )}
            </form>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-white/[0.06] flex-shrink-0 bg-zinc-950/90 backdrop-blur-sm">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-500 transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testingConnection || !formData.host}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-lg shadow-amber-600/15"
                >
                  {testingConnection ? (
                    <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> ทดสอบ...</span>
                  ) : 'ทดสอบ'}
                </button>
                <button
                  type="submit"
                  form="vpn-form"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-cyan-600/25 disabled:opacity-50 active:scale-95"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> บันทึก...</span>
                  ) : formData.skipConnectionTest ? 'บันทึก (ข้ามทดสอบ)' : 'บันทึก'}
                </button>
              </div>
              <div className="h-2 sm:hidden" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
