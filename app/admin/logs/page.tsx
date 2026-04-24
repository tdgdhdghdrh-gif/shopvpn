'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  RefreshCw,
  Loader2,
  Terminal,
  AlertTriangle,
  ChevronDown,
  Trash2,
  Download,
} from 'lucide-react'

interface LogFile {
  key: string
  label: string
  file: string
}

interface LogData {
  success: boolean
  files: LogFile[]
  current: LogFile
  content: string
  size: number
  lines: number
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState('simonvpn-error')
  const [lines, setLines] = useState(200)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  async function fetchLogs() {
    try {
      setRefreshing(true)
      const res = await fetch(`/api/admin/logs?file=${selectedFile}&lines=${lines}`)
      const data = await res.json()
      if (data.success) {
        setLogs(data)
      }
    } catch {
      console.error('Failed to fetch logs')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [selectedFile, lines])

  // Auto refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, selectedFile, lines])

  function downloadLog() {
    if (!logs?.content) return
    const blob = new Blob([logs.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${logs.current.file}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearDisplay() {
    if (logs) {
      setLogs({ ...logs, content: '', lines: 0 })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-zinc-500 to-zinc-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">ดู Log ระบบ</h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">ตรวจสอบ error และ output ของแอพ</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-white'
            }`}
          >
            {autoRefresh ? 'หยุดรีเฟรช' : 'รีเฟรชอัตโนมัติ'}
          </button>
          <button
            onClick={downloadLog}
            className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-zinc-500 hover:text-white transition-all"
            title="ดาวน์โหลด"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearDisplay}
            className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-zinc-500 hover:text-red-400 transition-all"
            title="ล้างหน้าจอ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={fetchLogs}
            disabled={refreshing}
            className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-zinc-500 hover:text-white transition-all"
            title="รีเฟรช"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* File selector */}
        <div className="flex-1 flex flex-wrap gap-2">
          {logs?.files.map((f) => (
            <button
              key={f.key}
              onClick={() => setSelectedFile(f.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedFile === f.key
                  ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-white hover:border-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {f.label}
            </button>
          ))}
        </div>

        {/* Lines selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">บรรทัดล่าสุด:</span>
          {[100, 200, 500, 1000].map((n) => (
            <button
              key={n}
              onClick={() => setLines(n)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                lines === n
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Info bar */}
      {logs && (
        <div className="flex items-center gap-4 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3 h-3" />
            {logs.current.file}
          </span>
          <span>{logs.lines.toLocaleString()} บรรทัด</span>
          <span>{(logs.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      )}

      {/* Log content */}
      <div className="bg-black/80 border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px] font-bold text-zinc-500">LOG OUTPUT</span>
          </div>
          {logs?.content && (
            <span className="text-[10px] text-zinc-600">
              {logs.content.split('\n').length} บรรทัด
            </span>
          )}
        </div>
        <div className="p-4 overflow-auto max-h-[70vh]">
          {logs?.content ? (
            <pre className="text-[11px] sm:text-xs font-mono leading-relaxed whitespace-pre-wrap break-all">
              {logs.content.split('\n').map((line, i) => {
                const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')
                const isWarn = line.toLowerCase().includes('warn')
                return (
                  <div key={i} className="flex gap-3 hover:bg-white/[0.02] px-1 rounded">
                    <span className="text-zinc-700 select-none shrink-0 w-10 text-right">{i + 1}</span>
                    <span
                      className={`${
                        isError ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-zinc-400'
                      }`}
                    >
                      {line || ' '}
                    </span>
                  </div>
                )
              })}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertTriangle className="w-8 h-8 text-zinc-600" />
              <p className="text-xs text-zinc-600">ไม่มีข้อมูล log</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
