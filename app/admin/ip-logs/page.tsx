'use client'

import { useEffect, useState } from 'react'
import { 
  Globe, Search, Shield, ShieldOff, ShieldAlert, Ban, RefreshCw, 
  ChevronLeft, ChevronRight, Clock, MapPin, Monitor, Trash2, X,
  AlertTriangle, CheckCircle2, Eye, Copy, Filter
} from 'lucide-react'

interface IPLogEntry {
  id: string
  ipAddress: string
  path: string
  method: string
  userAgent: string | null
  userId: string | null
  country: string | null
  isBlocked: boolean
  createdAt: string
}

interface BlockedIPEntry {
  id: string
  ipAddress: string
  reason: string | null
  blockedBy: string | null
  createdAt: string
  expiresAt: string | null
}

interface TopIP {
  ip: string
  count: number
}

export default function AdminIPLogsPage() {
  const [logs, setLogs] = useState<IPLogEntry[]>([])
  const [blockedIPs, setBlockedIPs] = useState<BlockedIPEntry[]>([])
  const [topIPs, setTopIPs] = useState<TopIP[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [pathFilter, setPathFilter] = useState('')
  const [showBlocked, setShowBlocked] = useState<string>('')
  const [tab, setTab] = useState<'logs' | 'blocked' | 'top'>('logs')

  // Block IP modal
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockIP, setBlockIP] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blockHours, setBlockHours] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchLogs()
    fetchBlockedIPs()
  }, [page, search, pathFilter, showBlocked])

  async function fetchLogs() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '50' })
      if (search) params.set('ip', search)
      if (pathFilter) params.set('path', pathFilter)
      if (showBlocked) params.set('blocked', showBlocked)

      const res = await fetch(`/api/admin/ip-logs?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
      setTopIPs(data.topIPs || [])
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    }
    setLoading(false)
  }

  async function fetchBlockedIPs() {
    try {
      const res = await fetch('/api/admin/blocked-ips')
      const data = await res.json()
      setBlockedIPs(data.blockedIPs || [])
    } catch (err) {
      console.error('Failed to fetch blocked IPs:', err)
    }
  }

  async function handleBlockIP() {
    if (!blockIP.trim()) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/blocked-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress: blockIP.trim(),
          reason: blockReason || undefined,
          expiresInHours: blockHours ? parseInt(blockHours) : undefined,
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `บล็อก ${blockIP} สำเร็จ` })
        setShowBlockModal(false)
        setBlockIP('')
        setBlockReason('')
        setBlockHours('')
        fetchBlockedIPs()
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถบล็อก IP ได้' })
    }
    setActionLoading(false)
  }

  async function handleUnblockIP(ip: string) {
    if (!confirm(`ยืนยันปลดบล็อก ${ip}?`)) return
    try {
      const res = await fetch('/api/admin/blocked-ips', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress: ip })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `ปลดบล็อก ${ip} แล้ว` })
        fetchBlockedIPs()
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถปลดบล็อกได้' })
    }
  }

  function quickBlock(ip: string) {
    setBlockIP(ip)
    setShowBlockModal(true)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  function copyIP(ip: string) {
    navigator.clipboard.writeText(ip)
    setMessage({ type: 'success', text: `คัดลอก ${ip} แล้ว` })
    setTimeout(() => setMessage(null), 2000)
  }

  const isIPBlocked = (ip: string) => blockedIPs.some(b => b.ipAddress === ip)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />
            IP Logs & Security
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            บันทึก IP ทุก request &bull; บล็อก/ปลดบล็อก IP &bull; ทั้งหมด {total.toLocaleString()} รายการ
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchLogs(); fetchBlockedIPs() }}
            className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> รีเฟรช
          </button>
          <button
            onClick={() => setShowBlockModal(true)}
            className="px-3 py-2 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-1.5 transition-colors"
          >
            <Ban className="w-3.5 h-3.5" /> บล็อก IP
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg border text-sm flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        {[
          { key: 'logs' as const, label: 'IP Logs', icon: Globe },
          { key: 'blocked' as const, label: `บล็อก (${blockedIPs.length})`, icon: ShieldAlert },
          { key: 'top' as const, label: 'Top IPs', icon: Eye },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors ${
              tab === t.key 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab: IP Logs */}
      {tab === 'logs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="ค้นหา IP..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:border-blue-500/50 focus:outline-none"
              />
            </div>
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="กรอง path (เช่น /profile)..."
                value={pathFilter}
                onChange={e => { setPathFilter(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:border-blue-500/50 focus:outline-none"
              />
            </div>
            <select
              value={showBlocked}
              onChange={e => { setShowBlocked(e.target.value); setPage(1) }}
              className="px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-zinc-300 focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="true">ถูกบล็อก</option>
              <option value="false">ไม่ถูกบล็อก</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-zinc-600">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" /> กำลังโหลด...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-20 text-zinc-600">ไม่พบข้อมูล</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">IP</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Path</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Method</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">User Agent</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">สถานะ</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">เวลา</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${log.isBlocked ? 'bg-red-500/5' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => copyIP(log.ipAddress)} className="text-blue-400 hover:text-blue-300 font-mono text-xs" title="คลิกเพื่อคัดลอก">
                              {log.ipAddress}
                            </button>
                            {isIPBlocked(log.ipAddress) && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 rounded">BLOCKED</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs font-mono max-w-[200px] truncate">{log.path}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`px-1.5 py-0.5 text-[10px] rounded ${
                            log.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' :
                            log.method === 'POST' ? 'bg-blue-500/10 text-blue-400' :
                            log.method === 'DELETE' ? 'bg-red-500/10 text-red-400' :
                            'bg-white/5 text-zinc-400'
                          }`}>{log.method}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-zinc-600 text-[11px] max-w-[250px] truncate">{log.userAgent || '-'}</td>
                        <td className="px-4 py-3">
                          {log.isBlocked ? (
                            <span className="flex items-center gap-1 text-red-400 text-xs"><ShieldAlert className="w-3.5 h-3.5" /> บล็อก</span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs"><Shield className="w-3.5 h-3.5" /> ปกติ</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {!isIPBlocked(log.ipAddress) ? (
                            <button
                              onClick={() => quickBlock(log.ipAddress)}
                              className="px-2 py-1 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-colors"
                            >
                              <Ban className="w-3 h-3 inline mr-0.5" /> บล็อก
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblockIP(log.ipAddress)}
                              className="px-2 py-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded transition-colors"
                            >
                              <ShieldOff className="w-3 h-3 inline mr-0.5" /> ปลด
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                <span className="text-xs text-zinc-500">หน้า {page} / {totalPages}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-400"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-400"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Blocked IPs */}
      {tab === 'blocked' && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          {blockedIPs.length === 0 ? (
            <div className="text-center py-20 text-zinc-600">
              <ShieldOff className="w-10 h-10 mx-auto mb-3 opacity-30" />
              ไม่มี IP ที่ถูกบล็อก
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">IP Address</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">เหตุผล</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">บล็อกเมื่อ</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">หมดเวลา</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedIPs.map(b => (
                    <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <span className="text-red-400 font-mono text-xs">{b.ipAddress}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{b.reason || '-'}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(b.createdAt)}</td>
                      <td className="px-4 py-3 text-xs">
                        {b.expiresAt ? (
                          <span className={new Date(b.expiresAt) < new Date() ? 'text-zinc-600 line-through' : 'text-amber-400'}>
                            {formatDate(b.expiresAt)}
                          </span>
                        ) : (
                          <span className="text-red-400">ถาวร</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleUnblockIP(b.ipAddress)}
                          className="px-2 py-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded transition-colors"
                        >
                          <ShieldOff className="w-3 h-3 inline mr-0.5" /> ปลดบล็อก
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Top IPs */}
      {tab === 'top' && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-medium text-zinc-300">IP ที่เข้ามาบ่อยที่สุด (24 ชม.)</h3>
          </div>
          {topIPs.length === 0 ? (
            <div className="text-center py-20 text-zinc-600">ไม่มีข้อมูล</div>
          ) : (
            <div className="divide-y divide-white/5">
              {topIPs.map((t, i) => (
                <div key={t.ip} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i < 3 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-zinc-500'
                    }`}>{i + 1}</span>
                    <button onClick={() => copyIP(t.ip)} className="font-mono text-sm text-blue-400 hover:text-blue-300">
                      {t.ip}
                    </button>
                    {isIPBlocked(t.ip) && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 rounded">BLOCKED</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400">{t.count.toLocaleString()} <span className="text-zinc-600 text-xs">requests</span></span>
                    {!isIPBlocked(t.ip) && (
                      <button
                        onClick={() => quickBlock(t.ip)}
                        className="px-2 py-1 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-colors"
                      >
                        <Ban className="w-3 h-3 inline mr-0.5" /> บล็อก
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Block IP Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowBlockModal(false)}>
          <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-400" /> บล็อก IP
              </h3>
              <button onClick={() => setShowBlockModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">IP Address *</label>
                <input
                  type="text"
                  value={blockIP}
                  onChange={e => setBlockIP(e.target.value)}
                  placeholder="เช่น 192.168.1.1"
                  className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:border-red-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">เหตุผล</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  placeholder="เช่น สแปม, พฤติกรรมน่าสงสัย"
                  className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">ระยะเวลาบล็อก (ชั่วโมง) - เว้นว่าง = ถาวร</label>
                <input
                  type="number"
                  value={blockHours}
                  onChange={e => setBlockHours(e.target.value)}
                  placeholder="เช่น 24 = 1 วัน, 168 = 1 สัปดาห์"
                  className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleBlockIP}
                disabled={!blockIP.trim() || actionLoading}
                className="flex-1 px-4 py-2.5 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'กำลังบล็อก...' : 'ยืนยันบล็อก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
