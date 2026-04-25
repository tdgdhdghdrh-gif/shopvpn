'use client'

import { useState, useRef } from 'react'
import {
  Download,
  Upload,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRightLeft,
  FileJson,
  Trash2,
} from 'lucide-react'

interface ExportCounts {
  [key: string]: number
}

interface ImportResult {
  [key: string]: { imported: number; skipped?: number }
}

export default function AdminMigratePage() {
  const [exportData, setExportData] = useState<any>(null)
  const [exportCounts, setExportCounts] = useState<ExportCounts | null>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<ImportResult | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    setExporting(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/admin/export')
      const data = await res.json()
      if (data.success) {
        setExportData(data.data)
        setExportCounts(data.counts)
        setMessage('ดึงข้อมูลสำเร็จ กรุณากด ดาวน์โหลดไฟล์')
      } else {
        setError(data.error || 'ดึงข้อมูลไม่สำเร็จ')
      }
    } catch {
      setError('เกิดข้อผิดพลาด')
    } finally {
      setExporting(false)
    }
  }

  function handleDownload() {
    if (!exportData) return
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `simonvpn-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('ดาวน์โหลดไฟล์สำเร็จ')
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setMessage('')
    setError('')
    setImportResults(null)

    try {
      const text = await file.text()
      const json = JSON.parse(text)

      if (!json._meta || json._meta.source !== 'simonvpn-export') {
        setError('ไฟล์ไม่ถูกต้อง ต้องเป็นไฟล์สำรองจาก SimonVPN เท่านั้น')
        setImporting(false)
        return
      }

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: json }),
      })

      const data = await res.json()
      if (data.success) {
        setImportResults(data.results)
        setMessage(`นำเข้าสำเร็จ ${data.summary.totalImported} รายการ (ข้าม ${data.summary.totalSkipped})`)
      } else {
        setError(data.error || 'นำเข้าไม่สำเร็จ')
      }
    } catch {
      setError('ไฟล์ JSON ไม่ถูกต้อง')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <ArrowRightLeft className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">ย้ายข้อมูล</h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">สำรอง/นำเข้าข้อมูลทั้งหมดของเว็บ</p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl text-sm font-medium flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl text-sm font-medium flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span>{error}</span>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/10 flex items-center justify-center">
            <Database className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block leading-tight">สำรองข้อมูล (Export)</span>
            <span className="text-[11px] text-zinc-500">ดึงข้อมูลทั้งหมดจากฐานข้อมูลเป็นไฟล์ JSON</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 active:scale-95 flex items-center gap-2"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {exporting ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลทั้งหมด'}
          </button>

          {exportData && (
            <button
              onClick={handleDownload}
              className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 transition-all active:scale-95 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลดไฟล์ JSON
            </button>
          )}
        </div>

        {exportCounts && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(exportCounts)
              .filter(([, count]) => count > 0)
              .map(([key, count]) => (
                <div key={key} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 text-center">
                  <p className="text-lg font-black text-white">{count}</p>
                  <p className="text-[9px] text-zinc-500 uppercase">{key}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Import Section */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block leading-tight">นำเข้าข้อมูล (Import)</span>
            <span className="text-[11px] text-zinc-500">อัปโหลดไฟล์ JSON ที่สำรองไว้เข้าเว็บนี้</span>
          </div>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-zinc-700 hover:border-amber-500/50 rounded-2xl p-8 text-center transition-all cursor-pointer"
        >
          <FileJson className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">คลิกเพื่อเลือกไฟล์ JSON</p>
          <p className="text-[11px] text-zinc-600 mt-1">รองรับเฉพาะไฟล์สำรองจาก SimonVPN</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {importing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-sm text-zinc-400">กำลังนำเข้าข้อมูล...</span>
          </div>
        )}

        {importResults && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white">ผลการนำเข้า</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
              {Object.entries(importResults).map(([key, result]) => (
                <div key={key} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
                  <p className="text-[9px] text-zinc-500 uppercase">{key}</p>
                  <p className="text-sm font-bold text-emerald-400">{result.imported}</p>
                  {result.skipped && result.skipped > 0 && (
                    <p className="text-[9px] text-amber-400">ข้าม {result.skipped}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-400">คำเตือน</p>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            การนำเข้าข้อมูลจะเพิ่มข้อมูลใหม่ลงในฐานข้อมูลปัจจุบัน ไม่มีการลบข้อมูลเก่า.
            ถ้ามีข้อมูลซ้ำกันระบบจะข้ามไป. แนะนำให้สำรองข้อมูลปัจจุบันก่อนนำเข้า.
          </p>
        </div>
      </div>
    </div>
  )
}
