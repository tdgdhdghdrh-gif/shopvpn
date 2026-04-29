'use client'

import { useState, useEffect } from 'react'
import {
  Activity, RefreshCw, Wallet, Receipt, TrendingUp, Calendar,
  AlertCircle, CheckCircle2, Loader2, Zap, Server, CreditCard,
  Phone, KeyRound, BarChart3, ChevronDown, ChevronUp, Clock,
  ArrowLeft, ArrowRight, Filter, X, Copy, Check
} from 'lucide-react'

interface ApiCallLog {
  id: string
  apiType: string
  endpoint: string
  method: string
  requestBody: string | null
  responseBody: string | null
  statusCode: number | null
  success: boolean
  durationMs: number | null
  error: string | null
  userId: string | null
  createdAt: string
}

interface ApiUsageData {
  settings: {
    truemoneyPhone: string | null
    truemoneyConfigured: boolean
    slipConfigured: boolean
  }
  stats: {
    wallet: { totalCalls: number; todayCalls: number; monthCalls: number; totalAmount: number }
    slip: { totalCalls: number; todayCalls: number; monthCalls: number; totalAmount: number }
  }
  logs: {
    data: ApiCallLog[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
  avgDurationMs: number
  liveStatus: {
    truemoney: { ok: boolean; remainingTokens?: number | null; operator?: string | null; responseTime?: string | null; timestamp?: string | null; msg?: string | null; error?: string } | null
    slip: { ok: boolean; configured?: boolean; msg?: string | null; error?: string } | null
  }
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string
}) {
  const c: Record<string, string> = {
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  }
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 ${c[color] || c.orange} border rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-[11px] text-zinc-600 mt-1">{sub}</p>}
    </div>
  )
}

function DurationBadge({ ms }: { ms: number | null }) {
  if (ms === null || ms === undefined) return <span className="text-zinc-600">-</span>
  const color = ms < 300 ? 'text-emerald-400' : ms < 1000 ? 'text-amber-400' : 'text-red-400'
  return <span className={`text-xs font-mono font-bold ${color}`}>{ms}ms</span>
}

function StatusBadge({ success, statusCode }: { success: boolean; statusCode: number | null }) {
  if (success) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
        <CheckCircle2 className="w-3 h-3" />{statusCode || 200}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
      <AlertCircle className="w-3 h-3" />{statusCode || 'ERR'}
    </span>
  )
}

function LogDetailPanel({ log, onClose }: { log: ApiCallLog; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'response'>('overview')

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const formatJson = (str: string | null) => {
    if (!str) return null
    try { return JSON.stringify(JSON.parse(str), null, 2) } catch { return str }
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'medium' })
  }

  const formatDateFull = (d: string) => {
    const date = new Date(d)
    return date.toLocaleString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <StatusBadge success={log.success} statusCode={log.statusCode} />
            <span className="text-sm font-bold text-white uppercase">{log.apiType}</span>
            <DurationBadge ms={log.durationMs} />
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="flex border-b border-zinc-800">
          {(['overview', 'request', 'response'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-white border-b-2 border-orange-500 bg-zinc-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {tab === 'overview' ? 'ภาพรวม' : tab === 'request' ? 'Request' : 'Response'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                  <p className="text-zinc-500 mb-1">เวลาเรียก</p>
                  <p className="text-zinc-300 font-mono">{formatDateFull(log.createdAt)}</p>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                  <p className="text-zinc-500 mb-1">ระยะเวลาตอบสนอง</p>
                  <p className="text-zinc-300 font-mono"><DurationBadge ms={log.durationMs} /></p>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                  <p className="text-zinc-500 mb-1">Method</p>
                  <p className="text-zinc-300 font-mono font-bold">{log.method}</p>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                  <p className="text-zinc-500 mb-1">Status Code</p>
                  <p className="text-zinc-300 font-mono font-bold">{log.statusCode || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                <p className="text-zinc-500 mb-1">Endpoint</p>
                <div className="flex items-center gap-2">
                  <p className="text-zinc-300 font-mono text-xs break-all">{log.endpoint}</p>
                  <button onClick={() => copyToClipboard(log.endpoint, 'endpoint')} className="shrink-0">
                    {copied === 'endpoint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400" />}
                  </button>
                </div>
              </div>
              {log.error && (
                <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                  <p className="text-red-400 text-xs font-bold mb-1">Error</p>
                  <p className="text-red-400/80 text-xs font-mono">{log.error}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'request' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500 font-bold uppercase">Request Body</p>
                {log.requestBody && (
                  <button onClick={() => copyToClipboard(log.requestBody, 'req')} className="text-zinc-600 hover:text-zinc-400">
                    {copied === 'req' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              {log.requestBody ? (
                <pre className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 overflow-x-auto">{formatJson(log.requestBody)}</pre>
              ) : (
                <p className="text-zinc-600 text-xs italic">ไม่มี Request Body</p>
              )}
            </div>
          )}

          {activeTab === 'response' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500 font-bold uppercase">Response Body</p>
                {log.responseBody && (
                  <button onClick={() => copyToClipboard(log.responseBody, 'res')} className="text-zinc-600 hover:text-zinc-400">
                    {copied === 'res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              {log.responseBody ? (
                <pre className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 overflow-x-auto">{formatJson(log.responseBody)}</pre>
              ) : (
                <p className="text-zinc-600 text-xs italic">ไม่มี Response Body</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ApiUsagePage() {
  const [data, setData] = useState<ApiUsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [selectedLog, setSelectedLog] = useState<ApiCallLog | null>(null)
  const [page, setPage] = useState(1)
  const [apiTypeFilter, setApiTypeFilter] = useState<string>('')
  const [successFilter, setSuccessFilter] = useState<string>('')

  async function fetchData(checkLive = false, pageNum = page) {
    if (checkLive) setChecking(true)
    else if (pageNum === 1) setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (checkLive) params.append('check', 'true')
      params.append('page', String(pageNum))
      params.append('limit', '20')
      if (apiTypeFilter) params.append('apiType', apiTypeFilter)
      if (successFilter) params.append('success', successFilter)

      const res = await fetch(`/api/admin/api-usage?${params.toString()}`)
      const json = await res.json()
      if (json.error) {
        setError(json.error)
      } else {
        setData(json)
      }
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  useEffect(() => { fetchData(false, 1) }, [apiTypeFilter, successFilter])

  const goToPage = (p: number) => {
    if (p < 1 || p > (data?.logs.totalPages || 1)) return
    setPage(p)
    fetchData(false, p)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center border border-orange-500/20">
              <Activity className="w-4 h-4 text-orange-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">การใช้งาน API</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">ตรวจสอบสถานะและสถิติการใช้งาน API ภายนอกแบบ Real-time</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={checking}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-zinc-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {checking ? 'กำลังเช็ค...' : 'เช็คสถานะ API'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="font-semibold text-sm">{error}</span>
        </div>
      )}

      {/* API Config Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className={`p-4 sm:p-5 rounded-2xl border ${data?.settings.truemoneyConfigured ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-900/50 border-white/5'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${data?.settings.truemoneyConfigured ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-white/10 text-zinc-500'}`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">TrueMoney Wallet API</h3>
              <p className="text-[11px] text-zinc-500">api.darkx.shop/tools/truemoney</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              {data?.settings.truemoneyConfigured ? (
                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">พร้อมใช้งาน</span></>
              ) : (
                <><AlertCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">ยังไม่ได้ตั้งค่า</span></>
              )}
            </div>
            {data?.settings.truemoneyPhone && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Phone className="w-3.5 h-3.5" />
                เบอร์รับเงิน: <span className="text-zinc-300 font-mono">{data.settings.truemoneyPhone}</span>
              </div>
            )}
          </div>
          {data?.liveStatus?.truemoney && (
            <div className="mt-3 pt-3 border-t border-white/5">
              {data.liveStatus.truemoney.ok ? (
                <div className="space-y-1.5">
                  {data.liveStatus.truemoney.remainingTokens !== undefined && data.liveStatus.truemoney.remainingTokens !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Token คงเหลือ</span>
                      <span className={`text-sm font-bold ${(data.liveStatus.truemoney.remainingTokens || 0) < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {data.liveStatus.truemoney.remainingTokens}
                      </span>
                    </div>
                  )}
                  {data.liveStatus.truemoney.responseTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Response Time</span>
                      <span className="text-xs text-zinc-300">{data.liveStatus.truemoney.responseTime}</span>
                    </div>
                  )}
                  {data.liveStatus.truemoney.operator && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Operator</span>
                      <span className="text-xs text-zinc-300">{data.liveStatus.truemoney.operator}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {data.liveStatus.truemoney.error || data.liveStatus.truemoney.msg || 'เชื่อมต่อ API ไม่สำเร็จ'}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border ${data?.settings.slipConfigured ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-900/50 border-white/5'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${data?.settings.slipConfigured ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-white/10 text-zinc-500'}`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Slip Check API</h3>
              <p className="text-[11px] text-zinc-500">api.darkx.shop/tools/slipcheck</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              {data?.settings.slipConfigured ? (
                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">พร้อมใช้งาน</span></>
              ) : (
                <><AlertCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">ยังไม่ได้ตั้งค่า</span></>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <KeyRound className="w-3.5 h-3.5" />
              API Key: {data?.settings.slipConfigured ? <span className="text-emerald-400">ตั้งค่าแล้ว</span> : <span className="text-red-400">ยังไม่มี</span>}
            </div>
          </div>
          {data?.liveStatus?.slip && (
            <div className="mt-3 pt-3 border-t border-white/5">
              {data.liveStatus.slip.ok ? (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {data.liveStatus.slip.msg || 'พร้อมใช้งาน'}
                </div>
              ) : (
                <div className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {data.liveStatus.slip.error || data.liveStatus.slip.msg || 'เชื่อมต่อ API ไม่สำเร็จ'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {data?.stats && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-white">สถิติการใช้งาน</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="TrueMoney ทั้งหมด" value={data.stats.wallet.totalCalls.toLocaleString()} sub={`ยอดเงินรวม ${data.stats.wallet.totalAmount.toLocaleString()} ฿`} icon={Wallet} color="orange" />
            <StatCard label="TrueMoney วันนี้" value={data.stats.wallet.todayCalls.toLocaleString()} icon={Calendar} color="emerald" />
            <StatCard label="สลิป ทั้งหมด" value={data.stats.slip.totalCalls.toLocaleString()} sub={`ยอดเงินรวม ${data.stats.slip.totalAmount.toLocaleString()} ฿`} icon={Receipt} color="blue" />
            <StatCard label="สลิป วันนี้" value={data.stats.slip.todayCalls.toLocaleString()} icon={Calendar} color="violet" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="TrueMoney เดือนนี้" value={data.stats.wallet.monthCalls.toLocaleString()} icon={TrendingUp} color="orange" />
            <StatCard label="ยอดเงิน Wallet" value={`${data.stats.wallet.totalAmount.toLocaleString()} ฿`} icon={CreditCard} color="emerald" />
            <StatCard label="สลิป เดือนนี้" value={data.stats.slip.monthCalls.toLocaleString()} icon={TrendingUp} color="blue" />
            <StatCard label="ยอดเงินสลิป" value={`${data.stats.slip.totalAmount.toLocaleString()} ฿`} icon={CreditCard} color="violet" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard label="เฉลี่ย Response Time" value={`${data.avgDurationMs}ms`} sub={data.avgDurationMs < 300 ? 'เร็วมาก' : data.avgDurationMs < 1000 ? 'ปานกลาง' : 'ช้า'} icon={Clock} color={data.avgDurationMs < 300 ? 'emerald' : data.avgDurationMs < 1000 ? 'orange' : 'red'} />
            <StatCard label="API Call ทั้งหมด" value={((data?.logs?.total) || 0).toLocaleString()} icon={Server} color="blue" />
            <StatCard label="Success Rate" value={`${data?.logs?.total ? Math.round((data.logs.data.filter(l => l.success).length / Math.max(data.logs.data.length, 1)) * 100) : 0}%`} icon={CheckCircle2} color="emerald" />
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-white">ประวัติการเรียก API</h3>
            <span className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">{data?.logs?.total || 0} รายการ</span>
          </div>
          <div className="flex gap-2">
            <select value={apiTypeFilter} onChange={e => { setApiTypeFilter(e.target.value); setPage(1); }}
              className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
              <option value="">ทั้งหมด</option>
              <option value="truemoney">TrueMoney</option>
              <option value="slipcheck">SlipCheck</option>
            </select>
            <select value={successFilter} onChange={e => { setSuccessFilter(e.target.value); setPage(1); }}
              className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
              <option value="">ทั้งหมด</option>
              <option value="true">สำเร็จ</option>
              <option value="false">ล้มเหลว</option>
            </select>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-2">Status</div>
            <div className="col-span-2">API</div>
            <div className="col-span-3">Endpoint</div>
            <div className="col-span-1">Method</div>
            <div className="col-span-2">เวลา</div>
            <div className="col-span-1 text-right">Duration</div>
            <div className="col-span-1 text-right">Size</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-zinc-800/50">
            {data?.logs?.data.length === 0 && (
              <div className="px-4 py-12 text-center text-zinc-600 text-sm">ยังไม่มีประวัติการเรียก API</div>
            )}
            {data?.logs?.data.map((log) => (
              <button key={log.id} onClick={() => setSelectedLog(log)}
                className="w-full grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 px-4 py-3 text-left hover:bg-zinc-900/50 transition-colors items-start sm:items-center">
                <div className="sm:col-span-2 flex items-center gap-2">
                  <StatusBadge success={log.success} statusCode={log.statusCode} />
                  <span className="sm:hidden text-xs text-zinc-500">{log.apiType}</span>
                </div>
                <div className="sm:col-span-2 hidden sm:block">
                  <span className="text-xs font-bold text-zinc-300 uppercase">{log.apiType}</span>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-[11px] font-mono text-zinc-500 truncate block">{log.endpoint.replace('https://api.darkx.shop/tools/', '')}</span>
                </div>
                <div className="sm:col-span-1">
                  <span className="text-[11px] font-mono font-bold text-zinc-400">{log.method}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[11px] text-zinc-500">{new Date(log.createdAt).toLocaleString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <div className="sm:col-span-1 text-right">
                  <DurationBadge ms={log.durationMs} />
                </div>
                <div className="sm:col-span-1 text-right">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {log.responseBody ? `${Math.round(new Blob([log.responseBody]).size / 1024 * 10) / 10}KB` : '-'}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {data?.logs && data.logs.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
              <span className="text-[11px] text-zinc-600">
                หน้า {data.logs.page} จาก {data.logs.totalPages} ({data.logs.total} รายการ)
              </span>
              <div className="flex gap-1">
                <button onClick={() => goToPage(page - 1)} disabled={page <= 1}
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-30 transition-all">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => goToPage(page + 1)} disabled={page >= data.logs.totalPages}
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white disabled:opacity-30 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-xl text-xs text-zinc-600 flex items-start gap-2">
        <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-zinc-500 mb-1">หมายเหตุ</p>
          <p>การกด &quot;เช็คสถานะ API&quot; จะทำการเชื่อมต่อกับ api.darkx.shop เพื่อดึงข้อมูล Token คงเหลือ โดยการเช็คแต่ละครั้งจะใช้ 1 Token</p>
          <p className="mt-1">หากต้องการเติม Token ให้ติดต่อผู้ให้บริการ API โดยตรงที่ <a href="https://api.darkx.shop" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">api.darkx.shop</a></p>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedLog && <LogDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  )
}
