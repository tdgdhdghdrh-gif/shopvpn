'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Construction, Loader2, AlertTriangle, Power, Clock, Shield,
  Save, Globe
} from 'lucide-react'

interface MaintenanceMode {
  id: string
  enabled: boolean
  message: string
  startTime: string | null
  endTime: string | null
  allowedIps: string[]
  updatedAt: string
}

export default function AdminMaintenancePage() {
  const [data, setData] = useState<MaintenanceMode | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [allowedIps, setAllowedIps] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchStatus = () => {
    fetch('/api/admin/maintenance')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setData(d.maintenance)
          setMessage(d.maintenance.message)
          setStartTime(d.maintenance.startTime ? new Date(d.maintenance.startTime).toISOString().slice(0, 16) : '')
          setEndTime(d.maintenance.endTime ? new Date(d.maintenance.endTime).toISOString().slice(0, 16) : '')
          setAllowedIps(d.maintenance.allowedIps.join('\n'))
        }
      })
      .catch(() => setError('โหลดไม่ได้'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const toggleMaintenance = async (enabled: boolean) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          message,
          startTime: startTime || null,
          endTime: endTime || null,
          allowedIps: allowedIps.split('\n').map(s => s.trim()).filter(Boolean),
        }),
      })

      const d = await res.json()
      if (d.success) {
        setData(d.maintenance)
        setSuccess(enabled ? 'เปิดโหมดปรับปรุงแล้ว' : 'ปิดโหมดปรับปรุงแล้ว')
      } else {
        setError(d.error || 'ไม่สำเร็จ')
      }
    } catch {
      setError('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-0 max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <Construction className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Maintenance Mode</h1>
            <p className="text-xs sm:text-sm text-zinc-500">ปิดปรับปรุงเว็บไซต์ชั่วคราว</p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-6 mb-6 ${
          data?.enabled
            ? 'bg-amber-500/5 border-amber-500/20'
            : 'bg-emerald-500/5 border-emerald-500/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              data?.enabled ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {data?.enabled ? <AlertTriangle className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {data?.enabled ? 'อยู่ในโหมดปรับปรุง' : 'เว็บไซต์เปิดให้บริการปกติ'}
              </p>
              <p className="text-[11px] text-zinc-500">
                {data?.enabled ? 'ผู้ใช้ทั่วไปจะเห็นหน้าปรับปรุง' : 'ทุกคนเข้าใช้งานได้'}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleMaintenance(!data?.enabled)}
            disabled={saving}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              data?.enabled
                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                : 'bg-amber-500 text-black hover:bg-amber-400'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
            {data?.enabled ? 'ปิดโหมดปรับปรุง' : 'เปิดโหมดปรับปรุง'}
          </button>
        </div>
      </motion.div>

      {/* Settings Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-zinc-400" />
          ตั้งค่าหน้าปรับปรุง
        </h2>

        <div>
          <label className="block text-[11px] text-zinc-500 mb-2">ข้อความที่แสดง</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-zinc-500 mb-2">เริ่มต้น (ไม่บังคับ)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-zinc-500 mb-2">สิ้นสุด (ไม่บังคับ)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/40"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-zinc-500 mb-2">IP ที่อนุญาต (1 IP ต่อบรรทัด)</label>
          <textarea
            value={allowedIps}
            onChange={e => setAllowedIps(e.target.value)}
            placeholder="127.0.0.1&#10;192.168.1.1"
            rows={4}
            className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all resize-none font-mono"
          />
          <p className="text-[10px] text-zinc-600 mt-1">แอดมินที่ใช้ IP เหล่านี้จะยังเข้าเว็บได้ปกติแม้เปิดโหมดปรับปรุง</p>
        </div>

        <button
          onClick={() => toggleMaintenance(data?.enabled ?? false)}
          disabled={saving}
          className="w-full px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          บันทึกการตั้งค่า
        </button>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        {success && <p className="text-sm text-emerald-400 text-center">{success}</p>}
      </motion.div>
    </div>
  )
}
