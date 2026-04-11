'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, Wifi, Zap, Users, AlertTriangle, ArrowUpDown,
  Signal, Shield, Globe, Activity, ChevronRight, Server as ServerIcon
} from 'lucide-react'

interface ServerData {
  id: string
  name: string
  flag: string
  protocol: string
  status: string
  ping: number
  speed: number
  load: number
  tlsType: string
  network: string
  supportsAis: boolean
  supportsTrue: boolean
  supportsDtac: boolean
  category: string
  activeUsers: number
  slowReports: number
  reportDetails: Record<string, number>
}

type SortKey = 'ping' | 'speed' | 'load' | 'activeUsers' | 'slowReports'

export default function ServerComparePage() {
  const [servers, setServers] = useState<ServerData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortKey>('ping')
  const [sortAsc, setSortAsc] = useState(true)
  const [filterCarrier, setFilterCarrier] = useState<'all' | 'ais' | 'true' | 'dtac'>('all')

  useEffect(() => { fetchServers() }, [])

  async function fetchServers() {
    try {
      const res = await fetch('/api/servers/compare')
      const data = await res.json()
      setServers(data.servers || [])
    } catch {} finally { setLoading(false) }
  }

  function handleSort(key: SortKey) {
    if (sortBy === key) { setSortAsc(!sortAsc) }
    else { setSortBy(key); setSortAsc(key === 'ping') }
  }

  const filteredServers = servers
    .filter(s => {
      if (filterCarrier === 'ais') return s.supportsAis
      if (filterCarrier === 'true') return s.supportsTrue
      if (filterCarrier === 'dtac') return s.supportsDtac
      return true
    })
    .sort((a, b) => {
      const diff = (a[sortBy] as number) - (b[sortBy] as number)
      return sortAsc ? diff : -diff
    })

  function getPingColor(ping: number) {
    if (ping <= 20) return 'text-emerald-400'
    if (ping <= 50) return 'text-yellow-400'
    return 'text-rose-400'
  }

  function getLoadColor(load: number) {
    if (load <= 40) return 'text-emerald-400'
    if (load <= 70) return 'text-yellow-400'
    return 'text-rose-400'
  }

  function getStatusColor(status: string) {
    if (status === 'Online') return 'bg-emerald-500'
    if (status === 'Maintenance') return 'bg-yellow-500'
    return 'bg-rose-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              เปรียบเทียบเซิร์ฟเวอร์
            </h1>
            <p className="text-zinc-500 text-xs">เทียบ Ping, Speed, Load ก่อนตัดสินใจซื้อ</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-zinc-500 text-xs self-center mr-1">เครือข่าย:</span>
          {[
            { key: 'all', label: 'ทั้งหมด' },
            { key: 'ais', label: 'AIS' },
            { key: 'true', label: 'TRUE' },
            { key: 'dtac', label: 'DTAC' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterCarrier(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterCarrier === f.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2">
          <span className="text-zinc-500 text-xs self-center mr-1">เรียงตาม:</span>
          {[
            { key: 'ping', label: 'Ping', icon: Signal },
            { key: 'speed', label: 'Speed', icon: Zap },
            { key: 'load', label: 'Load', icon: Activity },
            { key: 'activeUsers', label: 'ผู้ใช้', icon: Users },
            { key: 'slowReports', label: 'รายงาน', icon: AlertTriangle },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => handleSort(s.key as SortKey)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sortBy === s.key
                  ? 'bg-zinc-700 text-white'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <s.icon className="w-3 h-3" />
              {s.label}
              {sortBy === s.key && <ArrowUpDown className="w-3 h-3" />}
            </button>
          ))}
        </div>

        {/* Server Cards */}
        <div className="space-y-2">
          {filteredServers.length === 0 ? (
            <p className="text-zinc-500 text-center py-10">ไม่พบเซิร์ฟเวอร์</p>
          ) : (
            filteredServers.map((server, idx) => (
              <div key={server.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800/50 transition-all">
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                    idx === 0 ? 'bg-yellow-400/20 text-yellow-400' :
                    idx === 1 ? 'bg-zinc-300/20 text-zinc-300' :
                    idx === 2 ? 'bg-amber-700/20 text-amber-600' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    #{idx + 1}
                  </div>

                  {/* Server Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{server.flag}</span>
                      <p className="text-white font-bold text-sm truncate">{server.name}</p>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(server.status)}`} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-zinc-500 text-[10px]">{server.protocol.toUpperCase()}</span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-zinc-500 text-[10px]">{server.tlsType}</span>
                      <span className="text-zinc-700">•</span>
                      <div className="flex gap-1">
                        {server.supportsAis && <span className="text-[9px] px-1 py-0.5 bg-green-500/10 text-green-400 rounded font-bold">AIS</span>}
                        {server.supportsTrue && <span className="text-[9px] px-1 py-0.5 bg-red-500/10 text-red-400 rounded font-bold">TRUE</span>}
                        {server.supportsDtac && <span className="text-[9px] px-1 py-0.5 bg-blue-500/10 text-blue-400 rounded font-bold">DTAC</span>}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="text-center">
                      <p className={`font-black text-sm ${getPingColor(server.ping)}`}>{server.ping}ms</p>
                      <p className="text-zinc-600 text-[9px] uppercase">Ping</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-sm text-blue-400">{server.speed >= 1000 ? `${(server.speed/1000).toFixed(0)}G` : `${server.speed}M`}</p>
                      <p className="text-zinc-600 text-[9px] uppercase">Speed</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-black text-sm ${getLoadColor(server.load)}`}>{server.load}%</p>
                      <p className="text-zinc-600 text-[9px] uppercase">Load</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-sm text-zinc-300">{server.activeUsers}</p>
                      <p className="text-zinc-600 text-[9px] uppercase">Users</p>
                    </div>
                    {server.slowReports > 0 && (
                      <div className="text-center">
                        <p className="font-black text-sm text-rose-400">{server.slowReports}</p>
                        <p className="text-zinc-600 text-[9px] uppercase">Reports</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile stats */}
                <div className="flex sm:hidden items-center gap-3 mt-3 pt-3 border-t border-zinc-800">
                  <div className="flex-1 text-center">
                    <p className={`font-bold text-xs ${getPingColor(server.ping)}`}>{server.ping}ms</p>
                    <p className="text-zinc-600 text-[8px]">PING</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="font-bold text-xs text-blue-400">{server.speed >= 1000 ? `${(server.speed/1000).toFixed(0)}G` : `${server.speed}M`}</p>
                    <p className="text-zinc-600 text-[8px]">SPEED</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className={`font-bold text-xs ${getLoadColor(server.load)}`}>{server.load}%</p>
                    <p className="text-zinc-600 text-[8px]">LOAD</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="font-bold text-xs text-zinc-300">{server.activeUsers}</p>
                    <p className="text-zinc-600 text-[8px]">USERS</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <p className="text-zinc-500 text-xs">
            <span className="text-emerald-400 font-bold">Ping ต่ำ</span> = ตอบสนองเร็ว &bull;
            <span className="text-blue-400 font-bold ml-1">Speed สูง</span> = ความเร็วดี &bull;
            <span className="text-emerald-400 font-bold ml-1">Load ต่ำ</span> = ยังไม่แน่น &bull;
            Reports = จำนวนรายงานปัญหาจากผู้ใช้
          </p>
        </div>
      </div>
    </div>
  )
}
