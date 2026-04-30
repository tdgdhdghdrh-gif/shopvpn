'use client'

import { useEffect, useState } from 'react'
import {
  Save, Shield, Smartphone, DollarSign, Loader2, CheckCircle2, AlertCircle,
  Power, Users, Info, ArrowRight
} from 'lucide-react'

interface VpnBuySettings {
  vpnBuyEnabled: boolean
  vpnBaseDeviceLimit: number
  vpnExtraDevicePrice: number
}

const INITIAL: VpnBuySettings = {
  vpnBuyEnabled: true,
  vpnBaseDeviceLimit: 1,
  vpnExtraDevicePrice: 1,
}

export default function VpnBuySettingsPage() {
  const [settings, setSettings] = useState<VpnBuySettings>(INITIAL)
  const [savedSettings, setSavedSettings] = useState<VpnBuySettings>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings)

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/vpn-buy-settings')
      const data = await res.json()
      if (data) {
        const s = {
          vpnBuyEnabled: data.vpnBuyEnabled ?? true,
          vpnBaseDeviceLimit: data.vpnBaseDeviceLimit ?? 1,
          vpnExtraDevicePrice: data.vpnExtraDevicePrice ?? 1,
        }
        setSettings(s)
        setSavedSettings(s)
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถดึงข้อมูลการตั้งค่าได้' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch('/api/admin/vpn-buy-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (data.success) {
        setSavedSettings({ ...settings })
        setMessage({ type: 'success', text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' })
      } else {
        setMessage({ type: 'error', text: data.error || 'การบันทึกล้มเหลว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSaving(false)
    }
  }

  function updateField<K extends keyof VpnBuySettings>(field: K, value: VpnBuySettings[K]) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const priceTable = Array.from({ length: 10 }, (_, i) => {
    const devices = i + 1
    const freeDevices = Math.min(devices, settings.vpnBaseDeviceLimit)
    const extraDevices = Math.max(0, devices - settings.vpnBaseDeviceLimit)
    const extraCost = extraDevices * settings.vpnExtraDevicePrice
    return { devices, freeDevices, extraDevices, extraCost }
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลดการตั้งค่า...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-right-10 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">ตั้งค่าการซื้อ VPN</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">จัดการการเปิด/ปิดหน้าซื้อ VPN และกำหนดจำนวนอุปกรณ์/ราคา</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-purple-600 border border-purple-500/30 rounded-xl text-sm font-bold text-white hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Column - Settings */}
        <div className="xl:col-span-2 space-y-5 sm:space-y-6">
          
          {/* ON/OFF Card */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-white/5 bg-gradient-to-r from-purple-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                  <Power className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">สถานะการซื้อ VPN</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">ควบคุมการเปิด/ปิดหน้า /vpn?server=xxx สำหรับลูกค้า</p>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-bold text-white">เปิดให้ซื้อ VPN</p>
                    <p className="text-[10px] text-zinc-500">
                      {settings.vpnBuyEnabled
                        ? 'ลูกค้าสามารถเข้าหน้าซื้อ VPN และทดลองใช้ฟรีได้ตามปกติ'
                        : 'ปิด — ลูกค้าไม่สามารถเข้าหน้าซื้อ VPN ได้ (จะถูก redirect กลับหน้าแรก)'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('vpnBuyEnabled', !settings.vpnBuyEnabled)}
                  className={`relative w-12 h-7 rounded-full transition-all ${settings.vpnBuyEnabled ? 'bg-purple-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.vpnBuyEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {settings.vpnBuyEnabled && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-bold text-emerald-400">หน้าซื้อ VPN เปิดอยู่</p>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    ลูกค้าสามารถเข้าหน้า /vpn?server=xxx เพื่อเลือกซื้อ VPN ได้
                    ระบบจะตรวจสอบว่าลูกค้ามีบัญชี VPN ที่ใช้งานอยู่บนเซิร์ฟเวอร์นั้นแล้วหรือไม่ ถ้ามีจะไม่สามารถซื้อซ้ำได้
                  </p>
                </div>
              )}

              {!settings.vpnBuyEnabled && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-xs font-bold text-red-400">หน้าซื้อ VPN ปิดอยู่</p>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    เมื่อปิด ลูกค้าที่พยายามเข้าหน้า /vpn?server=xxx จะถูก redirect กลับไปหน้าแรกอัตโนมัติ
                    แต่ยังสามารถใช้ระบบทดลองฟรีได้ (ถ้าเปิดไว้)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Device Pricing Card */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">ตั้งค่าอุปกรณ์และราคา</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">กำหนดจำนวนอุปกรณ์ฟรีและราคาอุปกรณ์เพิ่ม</p>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6 space-y-6">
              
              {/* Base Device Limit */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">จำนวนอุปกรณ์ฟรี (เครื่อง)</label>
                </div>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={settings.vpnBaseDeviceLimit}
                    onChange={(e) => updateField('vpnBaseDeviceLimit', Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-blue-500/50 transition-all font-medium placeholder:text-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    จำนวนอุปกรณ์ที่ลูกค้าได้ <span className="text-emerald-400 font-bold">ฟรี</span> เมื่อซื้อ VPN 1 ครั้ง
                  </p>
                  <ul className="space-y-1 text-[11px] text-zinc-600 ml-4">
                    <li>• ตั้งเป็น 1 = ลูกค้าได้ 1 เครื่องฟรี (ค่าเริ่มต้น แนะนำ)</li>
                    <li>• ตั้งเป็น 0 = ไม่มีฟรี ทุกเครื่องเสียเงินหมด</li>
                    <li>• ตั้งเป็น 2-10 = ได้ฟรีตามจำนวน เกินจากนั้นคิดเงิน</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-white/5" />

              {/* Extra Device Price */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ราคาอุปกรณ์เพิ่ม (฿/เครื่อง)</label>
                </div>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={settings.vpnExtraDevicePrice}
                    onChange={(e) => updateField('vpnExtraDevicePrice', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-amber-500/50 transition-all font-medium placeholder:text-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    ราคาที่ลูกค้าต้องจ่าย <span className="text-amber-400 font-bold">เพิ่ม</span> ต่อ 1 อุปกรณ์ หากต้องการใช้มากกว่าจำนวนฟรี
                  </p>
                  <ul className="space-y-1 text-[11px] text-zinc-600 ml-4">
                    <li>• ตั้งเป็น 1 = บวก 1 ฿ ต่อเครื่องที่เกิน (ค่าเริ่มต้น)</li>
                    <li>• ตั้งเป็น 0 = ไม่คิดเงินเพิ่ม ลูกค้าใช้ได้ไม่จำกัดเลย</li>
                    <li>• ตั้งเป็น 5 = บวก 5 ฿ ต่อเครื่องที่เกิน</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-white/5" />

              {/* Current Config Summary */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">สรุปการตั้งค่าปัจจุบัน</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-lg font-bold text-emerald-400">{settings.vpnBaseDeviceLimit}</p>
                    <p className="text-[10px] text-zinc-500">เครื่องฟรี</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-lg font-bold text-amber-400">{settings.vpnExtraDevicePrice}</p>
                    <p className="text-[10px] text-zinc-500">฿/เครื่องเพิ่ม</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-lg font-bold text-blue-400">{settings.vpnBuyEnabled ? 'เปิด' : 'ปิด'}</p>
                    <p className="text-[10px] text-zinc-500">สถานะ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview Table */}
        <div className="space-y-5 sm:space-y-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" /> ตารางคิดราคาอุปกรณ์
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1">ตัวอย่างราคาที่ลูกค้าจะจ่ายตามจำนวนอุปกรณ์</p>
            </div>
            <div className="p-0">
              <div className="grid grid-cols-4 gap-0 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5">
                <div className="p-3 text-center">เครื่อง</div>
                <div className="p-3 text-center">ฟรี</div>
                <div className="p-3 text-center">เสียเงิน</div>
                <div className="p-3 text-center">บวกเพิ่ม</div>
              </div>
              {priceTable.map((row) => (
                <div key={row.devices} className="grid grid-cols-4 gap-0 text-xs border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <div className="p-3 text-center text-white font-bold">{row.devices}</div>
                  <div className="p-3 text-center text-emerald-400">{row.freeDevices}</div>
                  <div className="p-3 text-center text-amber-400">{row.extraDevices}</div>
                  <div className="p-3 text-center text-white font-bold">{row.extraCost > 0 ? `+${row.extraCost} ฿` : 'ฟรี'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-blue-600/[0.06] to-transparent border border-blue-500/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Info className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">วิธีคิดราคา</h3>
            </div>
            <div className="space-y-2 text-xs text-zinc-400 font-medium leading-relaxed">
              <p>1. ลูกค้าเลือกจำนวนวัน + จำนวนอุปกรณ์</p>
              <p>2. อุปกรณ์ตามจำนวนฟรี = ไม่คิดเงินเพิ่ม</p>
              <p>3. อุปกรณ์เกินจากฟรี = คิดตามราคาที่ตั้ง</p>
              <p>4. ราคารวม = ราคาวัน + ราคาอุปกรณ์เพิ่ม</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-zinc-500">ตัวอย่าง:</p>
              <p className="text-xs text-zinc-300 mt-1">
                ซื้อ 7 วัน (14 ฿) + 3 เครื่อง<br/>
                ฟรี {settings.vpnBaseDeviceLimit} เครื่อง + เสียเงิน {(3 - settings.vpnBaseDeviceLimit > 0 ? 3 - settings.vpnBaseDeviceLimit : 0)} เครื่อง<br/>
                รวม = 14 + {((3 - settings.vpnBaseDeviceLimit > 0 ? 3 - settings.vpnBaseDeviceLimit : 0) * settings.vpnExtraDevicePrice)} = <span className="text-emerald-400 font-bold">{14 + ((3 - settings.vpnBaseDeviceLimit > 0 ? 3 - settings.vpnBaseDeviceLimit : 0) * settings.vpnExtraDevicePrice)} ฿</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-3 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 border border-purple-500/30 rounded-xl text-sm font-bold text-white active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
        </button>
      </div>
    </div>
  )
}
