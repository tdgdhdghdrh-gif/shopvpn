'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardList, Loader2, AlertTriangle, Search, User, Clock,
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string | null
  oldValue: string | null
  newValue: string | null
  userId: string
  userName: string
  ipAddress: string | null
  createdAt: string
}

const LIMIT = 50

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const fetchLogs = (p: number, s: string, a: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(p))
    params.set('limit', String(LIMIT))
    if (s.trim()) params.set('search', s.trim())
    if (a) params.set('action', a)

    fetch(`/api/admin/audit?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setLogs(d.logs)
          setTotal(d.total)
          setTotalPages(d.totalPages)
          setPage(d.page)
        } else {
          setError(d.error)
        }
      })
      .catch(() => setError('โหลดไม่ได้'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLogs(1, '', '')
  }, [])

  const fmtDate = (d: string) => new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'medium' })

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (action.includes('UPDATE')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    if (action.includes('DELETE')) return 'text-red-400 bg-red-500/10 border-red-500/20'
    if (action.includes('ENABLE')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    if (action.includes('DISABLE')) return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  }

  return (
    <div className="px-3 sm:px-0 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Audit Log</h1>
            <p className="text-xs sm:text-sm text-zinc-500">บันทึกทุกการกระทำของแอดมิน</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); fetchLogs(1, e.target.value, actionFilter) }}
            placeholder="ค้นหาชื่อแอดมิน, action, entity..."
            className="w-full bg-black/40 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/40 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <select
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); fetchLogs(1, search, e.target.value) }}
            className="bg-black/40 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/40 appearance-none min-w-[180px]"
          >
            <option value="">ทุก Action</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="ENABLE">ENABLE</option>
            <option value="DISABLE">DISABLE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl sm:rounded-3xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.04] text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-2">เวลา</div>
          <div className="col-span-2">แอดมิน</div>
          <div className="col-span-2">Action</div>
          <div className="col-span-2">Entity</div>
          <div className="col-span-4">รายละเอียด</div>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {loading && logs.length === 0 && (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-500">กำลังโหลด...</p>
            </div>
          )}

          {error && (
            <div className="py-16 text-center text-red-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && logs.length === 0 && (
            <div className="py-16 text-center">
              <ClipboardList className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">ไม่มีบันทึก</p>
            </div>
          )}

          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-4 sm:px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="sm:col-span-2 flex items-center gap-2 text-[11px] text-zinc-400">
                <Clock className="w-3 h-3 shrink-0" />
                {fmtDate(log.createdAt)}
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-sm text-white">{log.userName}</span>
              </div>
              <div className="sm:col-span-2">
                <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold border ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
              </div>
              <div className="sm:col-span-2 text-sm text-zinc-300">
                {log.entity} {log.entityId && <span className="text-zinc-600 text-[10px]">({log.entityId.slice(0, 8)}...)</span>}
              </div>
              <div className="sm:col-span-4 text-[11px] text-zinc-400">
                {log.newValue && (
                  <div className="bg-black/30 rounded-lg p-2 font-mono overflow-hidden text-ellipsis">
                    {log.newValue.slice(0, 100)}{log.newValue.length > 100 ? '...' : ''}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11px] text-zinc-500">หน้า {page} จาก {totalPages} ({total} รายการ)</p>
          <div className="flex gap-2">
            <button onClick={() => fetchLogs(page - 1, search, actionFilter)} disabled={page <= 1}
              className="px-3 py-2 rounded-lg bg-zinc-900/50 border border-white/[0.04] text-xs font-bold text-zinc-400 disabled:opacity-30">ก่อนหน้า</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
              return (
                <button key={p} onClick={() => fetchLogs(p, search, actionFilter)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold ${page === p ? 'bg-white text-black' : 'bg-zinc-900/50 border border-white/[0.04] text-zinc-400'}`}>{p}</button>
              )
            })}
            <button onClick={() => fetchLogs(page + 1, search, actionFilter)} disabled={page >= totalPages}
              className="px-3 py-2 rounded-lg bg-zinc-900/50 border border-white/[0.04] text-xs font-bold text-zinc-400 disabled:opacity-30">ถัดไป</button>
          </div>
        </div>
      )}
    </div>
  )
}
