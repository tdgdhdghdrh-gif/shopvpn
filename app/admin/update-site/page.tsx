'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  RefreshCw, GitBranch, CheckCircle2, XCircle, Loader2, 
  AlertTriangle, ArrowDownCircle, CloudDownload, Clock, 
  GitCommit, Zap, Terminal, ChevronDown, Shield
} from 'lucide-react'

interface GitStatus {
  currentCommit: string
  currentBranch: string
  hasUpdates: boolean
  remoteCommit: string | null
  lastUpdated: string | null
}

const UPDATE_STEPS = [
  { label: 'ดึงโค้ดล่าสุด', desc: 'Git Pull', icon: CloudDownload },
  { label: 'ติดตั้ง Dependencies', desc: 'NPM Install', icon: Zap },
  { label: 'อัพเดท Database', desc: 'Prisma Generate', icon: Shield },
  { label: 'Build โปรเจค', desc: 'Next.js Build', icon: Terminal },
  { label: 'รีสตาร์ทเว็บ', desc: 'PM2 Restart', icon: RefreshCw },
]

export default function UpdateSitePage() {
  const [status, setStatus] = useState<GitStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string; logs?: string[] } | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [showLogs, setShowLogs] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/update-site')
      const data = await res.json()
      if (res.ok) setStatus(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [showLogs, result])

  const handleUpdate = async () => {
    if (updating) return
    
    setUpdating(true)
    setResult(null)
    setCurrentStep(0)
    setShowLogs(false)

    try {
      // Animate through steps
      const stepTimings = [0, 8000, 25000, 40000, 120000]
      const timers: NodeJS.Timeout[] = []
      
      stepTimings.forEach((time, i) => {
        if (i > 0) {
          timers.push(setTimeout(() => setCurrentStep(i), time))
        }
      })

      const res = await fetch('/api/admin/update-site', { method: 'POST' })
      
      timers.forEach(t => clearTimeout(t))
      const data = await res.json()
      setResult(data)
      
      if (data.success) {
        setCurrentStep(UPDATE_STEPS.length)
        setTimeout(() => fetchStatus(), 3000)
      }
    } catch (err: any) {
      setResult({ success: false, error: err.message || 'Connection error' })
    }
    
    setUpdating(false)
  }

  return (
    <div className="px-3 sm:px-0 max-w-2xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <CloudDownload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">อัพเดทเว็บไซต์</h1>
            <p className="text-xs sm:text-sm text-zinc-500">ดึงโค้ดล่าสุดจาก Repository</p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-zinc-900/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl sm:rounded-3xl overflow-hidden mb-4 sm:mb-5">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-sm text-white">สถานะปัจจุบัน</span>
          </div>
          <button 
            onClick={fetchStatus} 
            disabled={loading}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 transition-all active:scale-90"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {loading && !status ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="text-xs text-zinc-500">กำลังตรวจสอบ...</span>
            </div>
          ) : status ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Branch & Commit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-zinc-800/40 rounded-xl p-3 sm:p-4 border border-white/[0.03]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <GitBranch className="w-3 h-3 text-zinc-600" />
                    <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">Branch</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{status.currentBranch || 'main'}</div>
                </div>
                <div className="bg-zinc-800/40 rounded-xl p-3 sm:p-4 border border-white/[0.03]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <GitCommit className="w-3 h-3 text-zinc-600" />
                    <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">Commit</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono truncate">{status.currentCommit || '-'}</div>
                </div>
              </div>

              {/* Update Status Banner */}
              {status.hasUpdates ? (
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl" />
                  <div className="relative flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ArrowDownCircle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-amber-400 mb-1">มีอัพเดทใหม่พร้อมติดตั้ง!</div>
                      {status.remoteCommit && (
                        <div className="text-[11px] text-amber-400/60 font-mono leading-relaxed break-all line-clamp-3">{status.remoteCommit}</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-400">เวอร์ชันล่าสุดแล้ว</div>
                    <div className="text-[11px] text-emerald-400/50">ไม่มีอัพเดทใหม่</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400 py-4">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">ไม่สามารถตรวจสอบสถานะได้</span>
            </div>
          )}
        </div>
      </div>

      {/* Update Action Card */}
      <div className="bg-zinc-900/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl sm:rounded-3xl overflow-hidden mb-4 sm:mb-5">
        <div className="p-4 sm:p-6">
          {/* Update Button */}
          {!updating ? (
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="group relative w-full overflow-hidden rounded-xl sm:rounded-2xl p-[1px] transition-all active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl animate-gradient-x" />
              <div className="relative bg-gradient-to-r from-blue-600/90 to-cyan-500/90 rounded-[11px] sm:rounded-[15px] px-6 py-4 sm:py-5 flex items-center justify-center gap-3 group-hover:from-blue-500/90 group-hover:to-cyan-400/90 transition-all">
                <CloudDownload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="font-bold text-base sm:text-lg text-white">อัพเดทเว็บไซต์</span>
              </div>
            </button>
          ) : (
            /* Progress Steps */
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-sm font-bold text-white">กำลังอัพเดท...</span>
                <span className="text-xs text-zinc-600 ml-auto">อย่าปิดหน้านี้</span>
              </div>
              
              {UPDATE_STEPS.map((s, i) => {
                const Icon = s.icon
                const isDone = currentStep > i
                const isActive = currentStep === i
                const isPending = currentStep < i
                
                return (
                  <div key={i} className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-500 ${
                    isDone ? 'bg-emerald-500/[0.06]' : isActive ? 'bg-blue-500/[0.08] border border-blue-500/20' : 'bg-zinc-800/20'
                  } ${isPending ? 'opacity-40' : ''}`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      isDone ? 'bg-emerald-500/20' : isActive ? 'bg-blue-500/20' : 'bg-zinc-800/50'
                    }`}>
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                      ) : isActive ? (
                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 animate-spin" />
                      ) : (
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs sm:text-sm font-semibold transition-colors ${
                        isDone ? 'text-emerald-400' : isActive ? 'text-blue-400' : 'text-zinc-600'
                      }`}>{s.label}</div>
                    </div>
                    <span className={`text-[10px] font-mono transition-colors ${
                      isDone ? 'text-emerald-500/50' : isActive ? 'text-blue-400/50' : 'text-zinc-700'
                    }`}>{s.desc}</span>
                  </div>
                )
              })}

              {/* Progress Bar */}
              <div className="mt-2 w-full bg-zinc-800/50 rounded-full h-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((currentStep / UPDATE_STEPS.length) * 100, 95)}%` }}
                />
              </div>
              <p className="text-center text-[11px] text-zinc-600">ใช้เวลาประมาณ 2-5 นาที</p>
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`border rounded-2xl sm:rounded-3xl overflow-hidden mb-4 sm:mb-5 ${
          result.success 
            ? 'bg-emerald-500/[0.04] border-emerald-500/15' 
            : 'bg-red-500/[0.04] border-red-500/15'
        }`}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                result.success ? 'bg-emerald-500/15' : 'bg-red-500/15'
              }`}>
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <h3 className={`font-bold text-base ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.success ? 'อัพเดทสำเร็จ!' : 'อัพเดทล้มเหลว'}
                </h3>
                {result.error && <p className="text-xs text-red-400/70 mt-0.5">{result.error}</p>}
                {result.success && <p className="text-xs text-emerald-400/50 mt-0.5">เว็บจะรีสตาร์ทอัตโนมัติภายในไม่กี่วินาที</p>}
              </div>
            </div>

            {/* Logs Toggle */}
            {result.logs && result.logs.length > 0 && (
              <div>
                <button 
                  onClick={() => setShowLogs(!showLogs)}
                  className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>รายละเอียดการอัพเดท</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLogs ? 'rotate-180' : ''}`} />
                </button>

                {showLogs && (
                  <div className="mt-2 bg-black/40 rounded-xl border border-white/[0.04] max-h-60 sm:max-h-80 overflow-y-auto">
                    <div className="p-3 sm:p-4 space-y-1">
                      {result.logs.map((log, i) => {
                        const isError = log.includes('ERROR')
                        const isWarning = log.includes('WARNING')
                        return (
                          <div key={i} className={`text-[11px] font-mono py-1 px-2 rounded leading-relaxed break-all ${
                            isError ? 'text-red-400/80 bg-red-500/5' :
                            isWarning ? 'text-amber-400/80 bg-amber-500/5' :
                            'text-zinc-500'
                          }`}>
                            {log}
                          </div>
                        )
                      })}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* How it works - Compact */}
      <div className="bg-zinc-900/30 border border-white/[0.04] rounded-2xl sm:rounded-3xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">ขั้นตอนการทำงาน</span>
        </div>
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {UPDATE_STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex flex-col items-center text-center gap-1.5 py-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800/60 rounded-lg flex items-center justify-center">
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-600" />
                </div>
                <span className="text-[9px] sm:text-[10px] text-zinc-600 font-medium leading-tight">{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Gradient animation keyframes */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}
