'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search, RefreshCw, Globe, Shield, Users, Wifi, Activity,
  ChevronLeft, ChevronRight, X, Eye, Clock, Server, Hash,
  Signal, AlertTriangle, CheckCircle2, XCircle, Copy, ExternalLink,
  Filter, ArrowUpDown, Fingerprint, MapPin, Zap, Monitor, TrendingUp,
  ArrowDown, ArrowUp
} from 'lucide-react'

interface VpnOrderItem {
  id: string
  clientUUID: string
  remark: string
  ipLimit: number
  expiryTime: string
  isActive: boolean
  createdAt: string
  duration: number
  price: number
  serverName: string
  serverFlag: string
  serverId: string
  serverHost: string
  userName: string
  userId: string
}

interface ServerOption {
  id: string
  name: string
  flag: string
}

interface IpDetail {
  ips: string[]
  ipCount: number
  isOnline: boolean
  traffic: { up: number; down: number; total: number } | null
  order: {
    id: string
    clientUUID: string
    remark: string
    ipLimit: number
    expiryTime: string
    isActive: boolean
    serverName: string
    serverFlag: string
    userName: string
    userId: string
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' }) + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

function timeUntilExpiry(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return 'หมดอายุแล้ว'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `เหลือ ${days} วัน ${hours} ชม.`
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `เหลือ ${hours} ชม. ${mins} นาที`
}

export default function AdminUuidIpsPage() {
  const [orders, setOrders] = useState<VpnOrderItem[]>([])
  const [servers, setServers] = useState<ServerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'expired' | 'all'>('active')
  const [serverFilter, setServerFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState({ type: '', text: '' })

  // IP detail modal
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [ipDetail, setIpDetail] = useState<IpDetail | null>(null)
  const [loadingIps, setLoadingIps] = useState(false)
  const [copiedText, setCopiedText] = useState('')

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        status: statusFilter,
      })
      if (search) params.set('search', search)
      if (serverFilter) params.set('serverId', serverFilter)

      const res = await fetch(`/api/admin/uuid-ips?${params}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.orders)
        setTotalPages(data.totalPages)
        setTotal(data.total)
        if (data.servers) setServers(data.servers)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, serverFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(t)
    }
  }, [message])

  async function fetchIpDetail(orderId: string) {
    setSelectedOrder(orderId)
    setLoadingIps(true)
    setIpDetail(null)
    try {
      const res = await fetch(`/api/admin/uuid-ips?action=getIps&orderId=${orderId}`)
      const data = await res.json()
      if (data.success) {
        setIpDetail(data)
      } else {
        setMessage({ type: 'error', text: data.error || 'ดึงข้อมูล IP ไม่สำเร็จ' })
        setSelectedOrder(null)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
      setSelectedOrder(null)
    } finally {
      setLoadingIps(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(''), 2000)
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 sm:pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-sm z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 ${
          message.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/15 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="font-bold text-xs flex-1">{message.text}</span>
        </div>
      )}

      {/* ============ HERO HEADER ============ */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900 border border-white/[0.06] p-5 sm:p-7">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-500/[0.07] via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/[0.05] via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/10">
              <Fingerprint className="w-6 h-6 sm:w-7 sm:h-7 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">UUID IP Tracker</h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">ตรวจสอบ IP ที่เชื่อมต่อผ่าน UUID แต่ละตัว</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchOrders}
              className="h-10 px-4 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="relative grid grid-cols-3 gap-2 sm:gap-3 mt-5">
          <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Hash className="w-3 h-3 text-cyan-400" />
              </div>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">ทั้งหมด</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-cyan-400">{total}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">แอคทีฟ</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-emerald-400">{statusFilter === 'active' ? total : '-'}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Server className="w-3 h-3 text-violet-400" />
              </div>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">เซิร์ฟเวอร์</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-violet-400">{servers.length}</p>
          </div>
        </div>
      </div>

      {/* ============ SEARCH + FILTERS ============ */}
      <div className="space-y-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center group-focus-within:bg-violet-500/10 transition-colors">
            <Search className="w-3.5 h-3.5 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="ค้นหา UUID, ชื่อ remark, ชื่อผู้ใช้..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl pl-14 pr-24 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/30 focus:bg-zinc-900/80 focus:ring-1 focus:ring-violet-500/10 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            )}
            <button type="submit" className="h-8 px-3 bg-violet-600 hover:bg-violet-500 rounded-lg text-[10px] font-bold text-white transition-all active:scale-95">
              ค้นหา
            </button>
          </div>
        </form>

        {/* Filter row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {/* Status */}
          {(['active', 'expired', 'all'] as const).map((status) => {
            const label = status === 'active' ? 'แอคทีฟ' : status === 'expired' ? 'หมดอายุ' : 'ทั้งหมด'
            const isActive = statusFilter === status
            const activeStyle = status === 'active' 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
              : status === 'expired' 
                ? 'bg-red-500/15 text-red-400 border-red-500/20'
                : 'bg-white/10 text-white border-white/15'
            return (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1) }}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                  isActive ? activeStyle : 'bg-zinc-900/60 text-zinc-500 border border-white/[0.04] hover:text-zinc-300'
                }`}
              >
                {label}
              </button>
            )
          })}

          {/* Server filter */}
          {servers.length > 0 && (
            <>
              <div className="w-px h-5 bg-white/[0.08] flex-shrink-0 mx-0.5" />
              <select
                value={serverFilter}
                onChange={(e) => { setServerFilter(e.target.value); setPage(1) }}
                className="flex-shrink-0 bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2 text-[11px] font-bold text-zinc-400 focus:outline-none focus:border-violet-500/30 transition-all"
              >
                <option value="">เซิร์ฟเวอร์ทั้งหมด</option>
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>{s.flag} {s.name}</option>
                ))}
              </select>
            </>
          )}

          <span className="flex-shrink-0 text-[10px] font-bold text-zinc-600 ml-auto pl-2">
            {total} รายการ
          </span>
        </div>
      </div>

      {/* ============ ORDER TABLE ============ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-[3px] border-violet-500/10 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs font-bold text-zinc-400">กำลังโหลดข้อมูล...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-zinc-900/30 border border-white/[0.05] border-dashed rounded-2xl p-10 text-center space-y-3">
          <div className="w-14 h-14 bg-zinc-900 border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto">
            <Fingerprint className="w-7 h-7 text-zinc-700" />
          </div>
          <h3 className="text-base font-bold text-white">ไม่พบ UUID</h3>
          <p className="text-sm text-zinc-500">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
        </div>
      ) : (
        <>
          {/* Mobile: Cards / Desktop: Table */}
          {/* Desktop table */}
          <div className="hidden sm:block">
            <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-wider">ผู้ใช้ / Remark</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-wider">UUID</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-wider">เซิร์ฟเวอร์</th>
                    <th className="text-center px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-wider">IP Limit</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-wider">หมดอายุ</th>
                    <th className="text-center px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-wider">สถานะ</th>
                    <th className="text-center px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-wider">ตรวจ IP</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={order.id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-white truncate max-w-[150px]">{order.userName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">{order.remark}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-violet-400/80 truncate max-w-[180px]">{order.clientUUID}</span>
                          <button 
                            onClick={() => copyToClipboard(order.clientUUID)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
                            title="คัดลอก UUID"
                          >
                            <Copy className={`w-3 h-3 ${copiedText === order.clientUUID ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-zinc-400">{order.serverFlag} {order.serverName}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.ipLimit === 0 
                            ? 'bg-zinc-800 text-zinc-500' 
                            : 'bg-violet-500/10 text-violet-400 border border-violet-500/15'
                        }`}>
                          {order.ipLimit === 0 ? 'ไม่จำกัด' : `${order.ipLimit} IP`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] text-zinc-400">{formatDate(order.expiryTime)}</p>
                        <p className={`text-[9px] font-bold ${isExpired(order.expiryTime) ? 'text-red-400' : 'text-emerald-400/70'}`}>
                          {timeUntilExpiry(order.expiryTime)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          order.isActive && !isExpired(order.expiryTime)
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${order.isActive && !isExpired(order.expiryTime) ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {order.isActive && !isExpired(order.expiryTime) ? 'ใช้งาน' : 'หมดอายุ'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => fetchIpDetail(order.id)}
                          className="h-8 px-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-lg text-[10px] font-bold text-white transition-all active:scale-95 shadow-sm shadow-violet-600/20 inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3 h-3" />
                          ดู IP
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: Cards */}
          <div className="sm:hidden space-y-2.5">
            {orders.map((order) => (
              <div key={order.id} className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white truncate">{order.userName}</p>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                        order.isActive && !isExpired(order.expiryTime)
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${order.isActive && !isExpired(order.expiryTime) ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {order.isActive && !isExpired(order.expiryTime) ? 'ใช้งาน' : 'หมดอายุ'}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{order.remark}</p>
                  </div>
                  <span className="text-xs">{order.serverFlag}</span>
                </div>

                {/* UUID row */}
                <div className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                  <Fingerprint className="w-3.5 h-3.5 text-violet-400/60 flex-shrink-0" />
                  <span className="text-[10px] font-mono text-violet-400/80 truncate flex-1">{order.clientUUID}</span>
                  <button onClick={() => copyToClipboard(order.clientUUID)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 flex-shrink-0">
                    <Copy className={`w-3 h-3 ${copiedText === order.clientUUID ? 'text-emerald-400' : 'text-zinc-600'}`} />
                  </button>
                </div>

                {/* Info pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-zinc-500">{order.serverFlag} {order.serverName}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    order.ipLimit === 0 ? 'bg-zinc-800 text-zinc-500' : 'bg-violet-500/10 text-violet-400'
                  }`}>
                    {order.ipLimit === 0 ? 'IP ไม่จำกัด' : `${order.ipLimit} IP`}
                  </span>
                  <span className={`text-[9px] font-bold ${isExpired(order.expiryTime) ? 'text-red-400' : 'text-emerald-400/70'}`}>
                    {timeUntilExpiry(order.expiryTime)}
                  </span>
                </div>

                {/* Check IP button */}
                <button
                  onClick={() => fetchIpDetail(order.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  ตรวจสอบ IP ที่เชื่อมต่อ
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center bg-zinc-900 border border-white/[0.06] rounded-xl text-zinc-500 hover:text-white hover:border-white/10 disabled:opacity-30 transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p: number
                  if (totalPages <= 5) {
                    p = i + 1
                  } else if (page <= 3) {
                    p = i + 1
                  } else if (page >= totalPages - 2) {
                    p = totalPages - 4 + i
                  } else {
                    p = page - 2 + i
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        page === p 
                          ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20' 
                          : 'bg-zinc-900 border border-white/[0.06] text-zinc-500 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center bg-zinc-900 border border-white/[0.06] rounded-xl text-zinc-500 hover:text-white hover:border-white/10 disabled:opacity-30 transition-all active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ============ IP DETAIL MODAL ============ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-md" 
            onClick={() => { setSelectedOrder(null); setIpDetail(null) }}
          />
          <div className="relative bg-zinc-950 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            {/* Drag handle */}
            <div className="sm:hidden w-10 h-1 bg-white/10 rounded-full mx-auto mt-3" />
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">IP ที่เชื่อมต่อ</h2>
                  <p className="text-[11px] text-zinc-600">ดึงข้อมูลจาก Panel แบบ Realtime</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedOrder(null); setIpDetail(null) }}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors active:scale-90"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loadingIps ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-[3px] border-violet-500/10 rounded-full" />
                    <div className="absolute inset-0 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-xs font-bold text-zinc-400">กำลังดึงข้อมูล IP จาก Panel...</p>
                </div>
              ) : ipDetail ? (
                <>
                  {/* Order info */}
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{ipDetail.order.userName}</p>
                        <p className="text-[10px] text-zinc-500">{ipDetail.order.remark}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{ipDetail.order.serverFlag}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          ipDetail.isOnline 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ipDetail.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                          {ipDetail.isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                        </span>
                      </div>
                    </div>

                    {/* UUID */}
                    <div className="flex items-center gap-2 p-2 bg-black/30 rounded-lg">
                      <Fingerprint className="w-3.5 h-3.5 text-violet-400/60 flex-shrink-0" />
                      <span className="text-[10px] font-mono text-violet-400/80 truncate flex-1">{ipDetail.order.clientUUID}</span>
                      <button onClick={() => copyToClipboard(ipDetail.order.clientUUID)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 flex-shrink-0">
                        <Copy className={`w-3 h-3 ${copiedText === ipDetail.order.clientUUID ? 'text-emerald-400' : 'text-zinc-600'}`} />
                      </button>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-black/20 rounded-lg">
                        <p className="text-[9px] text-zinc-600 font-bold">IP Limit</p>
                        <p className="text-sm font-black text-white">{ipDetail.order.ipLimit === 0 ? '∞' : ipDetail.order.ipLimit}</p>
                      </div>
                      <div className="text-center p-2 bg-black/20 rounded-lg">
                        <p className="text-[9px] text-zinc-600 font-bold">IP ที่ใช้</p>
                        <p className={`text-sm font-black ${
                          ipDetail.order.ipLimit > 0 && ipDetail.ipCount >= ipDetail.order.ipLimit 
                            ? 'text-red-400' 
                            : ipDetail.ipCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>{ipDetail.ipCount}</p>
                      </div>
                      <div className="text-center p-2 bg-black/20 rounded-lg">
                        <p className="text-[9px] text-zinc-600 font-bold">หมดอายุ</p>
                        <p className={`text-[10px] font-bold ${isExpired(ipDetail.order.expiryTime) ? 'text-red-400' : 'text-emerald-400'}`}>
                          {formatDate(ipDetail.order.expiryTime).split(' ')[0]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Traffic */}
                  {ipDetail.traffic && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <ArrowUp className="w-3 h-3 text-blue-400" />
                          <span className="text-[9px] font-bold text-blue-400/70">Upload</span>
                        </div>
                        <p className="text-xs font-black text-blue-400">{formatBytes(ipDetail.traffic.up)}</p>
                      </div>
                      <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <ArrowDown className="w-3 h-3 text-cyan-400" />
                          <span className="text-[9px] font-bold text-cyan-400/70">Download</span>
                        </div>
                        <p className="text-xs font-black text-cyan-400">{formatBytes(ipDetail.traffic.down)}</p>
                      </div>
                      <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-violet-400" />
                          <span className="text-[9px] font-bold text-violet-400/70">รวม</span>
                        </div>
                        <p className="text-xs font-black text-violet-400">{formatBytes(ipDetail.traffic.total)}</p>
                      </div>
                    </div>
                  )}

                  {/* IP List */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-400" />
                        IP Address ({ipDetail.ipCount})
                      </h3>
                      {ipDetail.order.ipLimit > 0 && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ipDetail.ipCount >= ipDetail.order.ipLimit 
                            ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {ipDetail.ipCount}/{ipDetail.order.ipLimit} IP
                        </span>
                      )}
                    </div>

                    {ipDetail.ips.length === 0 ? (
                      <div className="text-center py-8 bg-white/[0.02] border border-white/[0.04] border-dashed rounded-xl">
                        <Globe className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500 font-bold">ไม่พบ IP ที่เชื่อมต่อ</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">UUID นี้ยังไม่เคยเชื่อมต่อ หรือ Panel ยังไม่มีข้อมูล</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ipDetail.ips.map((ip, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-all group">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                              <Globe className="w-4 h-4 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-mono font-bold text-white">{ip}</p>
                              <p className="text-[9px] text-zinc-600">IP #{i + 1}</p>
                            </div>
                            <button 
                              onClick={() => copyToClipboard(ip)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all flex-shrink-0"
                            >
                              <Copy className={`w-3.5 h-3.5 ${copiedText === ip ? 'text-emerald-400' : 'text-zinc-600'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Warning if over limit */}
                  {ipDetail.order.ipLimit > 0 && ipDetail.ipCount > ipDetail.order.ipLimit && (
                    <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/15 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-400">เกินจำนวน IP ที่กำหนด!</p>
                        <p className="text-[10px] text-red-400/70 mt-0.5">
                          UUID นี้มี {ipDetail.ipCount} IP เชื่อมต่อ แต่กำหนดไว้ {ipDetail.order.ipLimit} IP — Panel จะจัดการบล็อคเอง
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.06] flex-shrink-0 bg-zinc-950/90">
              <button
                onClick={() => { setSelectedOrder(null); setIpDetail(null) }}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-400 transition-all active:scale-95"
              >
                ปิด
              </button>
              <div className="h-2 sm:hidden" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
