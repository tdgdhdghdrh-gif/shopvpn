'use client'

import { useEffect, useState } from 'react'
import {
  Send,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Bell,
  BellOff,
  UserPlus,
  ShoppingCart,
  AlertOctagon,
  Bot,
  Hash,
  MessageSquare,
  Link2,
} from 'lucide-react'

interface TelegramConfig {
  id: string
  botToken: string
  chatId: string
  notifyTopup: boolean
  notifyRegister: boolean
  notifyBuyVpn: boolean
  notifyError: boolean
  isEnabled: boolean
  discordWebhookUrl: string | null
  discordEnabled: boolean
}

export default function AdminTelegramPage() {
  const [config, setConfig] = useState<TelegramConfig | null>(null)
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [notifyTopup, setNotifyTopup] = useState(true)
  const [notifyRegister, setNotifyRegister] = useState(true)
  const [notifyBuyVpn, setNotifyBuyVpn] = useState(true)
  const [notifyError, setNotifyError] = useState(true)
  const [isEnabled, setIsEnabled] = useState(false)
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('')
  const [discordEnabled, setDiscordEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/telegram-config')
      .then((r) => r.json())
      .then((d) => {
        if (d.config) {
          setConfig(d.config)
          setBotToken(d.config.botToken)
          setChatId(d.config.chatId)
          setNotifyTopup(d.config.notifyTopup)
          setNotifyRegister(d.config.notifyRegister)
          setNotifyBuyVpn(d.config.notifyBuyVpn)
          setNotifyError(d.config.notifyError)
          setIsEnabled(d.config.isEnabled)
          setDiscordWebhookUrl(d.config.discordWebhookUrl || '')
          setDiscordEnabled(d.config.discordEnabled)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken,
          chatId,
          notifyTopup,
          notifyRegister,
          notifyBuyVpn,
          notifyError,
          isEnabled,
          discordWebhookUrl,
          discordEnabled,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('บันทึกสำเร็จ')
        setConfig(data.config)
      } else {
        setMessage(data.error || 'บันทึกไม่สำเร็จ')
      }
    } catch {
      setMessage('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  async function sendTest() {
    setMessage('')
    try {
      const res = await fetch('/api/admin/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken,
          chatId,
          notifyTopup,
          notifyRegister,
          notifyBuyVpn,
          notifyError,
          isEnabled: true,
          discordWebhookUrl,
          discordEnabled,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('ส่งข้อความทดสอบแล้ว ตรวจสอบ Telegram')
        setConfig(data.config)
      } else {
        setMessage(data.error || 'ส่งไม่สำเร็จ')
      }
    } catch {
      setMessage('เกิดข้อผิดพลาด')
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
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">ตั้งค่า Telegram Bot</h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">แจ้งเตือนแอดมินผ่าน Telegram</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={sendTest}
            className="px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-2 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            ทดสอบ
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-cyan-600/25 disabled:opacity-50 active:scale-95 flex items-center gap-2 shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            บันทึก
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3.5 rounded-2xl text-sm font-medium flex items-center gap-3 ${message.includes('สำเร็จ') || message.includes('ทดสอบ') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${message.includes('สำเร็จ') || message.includes('ทดสอบ') ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            {message.includes('สำเร็จ') || message.includes('ทดสอบ') ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <span>{message}</span>
        </div>
      )}

      {/* Master Toggle */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
              {isEnabled ? <Bell className="w-3.5 h-3.5 text-emerald-400" /> : <BellOff className="w-3.5 h-3.5 text-zinc-500" />}
            </div>
            <div>
              <span className="text-sm font-semibold text-white block leading-tight">เปิดใช้งานแจ้งเตือน</span>
              <span className="text-[11px] text-zinc-500">{isEnabled ? 'กำลังทำงาน' : 'ปิดอยู่'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${isEnabled ? 'bg-emerald-500 shadow-inner shadow-emerald-600/50' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <div className={`absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-300 ${isEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Bot Credentials */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">ข้อมูลบอท</h3>
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">Bot Token</label>
          <input
            type="text"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all text-sm font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">Chat ID</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="123456789 หรือ -1001234567890"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all text-sm font-mono"
            />
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 leading-relaxed">
          1. สร้างบอทผ่าน @BotFather ใน Telegram → รับ Token
          2. เพิ่มบอทเข้ากลุ่ม/แชต → ส่งข้อความใดๆ
          3. เปิด https://api.telegram.org/bot&lt;token&gt;/getUpdates → หา chat.id
        </p>
      </div>

      {/* Discord Webhook */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Discord Webhook</h3>
          <button
            type="button"
            onClick={() => setDiscordEnabled(!discordEnabled)}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${discordEnabled ? 'bg-indigo-500 shadow-inner shadow-indigo-600/50' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <div className={`absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-300 ${discordEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">Webhook URL</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={discordWebhookUrl}
              onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/123456789/abcdefghij..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm font-mono"
            />
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 leading-relaxed">
          1. ไปที่ Discord Server → Channel Settings → Integrations → Webhooks
          2. สร้าง Webhook → Copy Webhook URL
          3. วาง URL ด้านบน → เปิดสวิตช์
        </p>
      </div>

      {/* Notification Types */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-white mb-2">เหตุการณ์ที่แจ้งเตือน</h3>

        <button
          type="button"
          onClick={() => setNotifyTopup(!notifyTopup)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all active:scale-[0.99] ${
            notifyTopup ? 'bg-emerald-500/5 border border-emerald-500/15' : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-medium text-white block">มีคนเติมเงิน</span>
              <span className="text-[10px] text-zinc-500">แจ้งเตือนเมื่อผู้ใช้เติมเงินสำเร็จ</span>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full transition-all ${notifyTopup ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-all mt-0.5 ${notifyTopup ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setNotifyRegister(!notifyRegister)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all active:scale-[0.99] ${
            notifyRegister ? 'bg-blue-500/5 border border-blue-500/15' : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <UserPlus className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <span className="text-sm font-medium text-white block">มีคนสมัครใหม่</span>
              <span className="text-[10px] text-zinc-500">แจ้งเตือนเมื่อมีผู้ใช้สมัครสมาชิกใหม่</span>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full transition-all ${notifyRegister ? 'bg-blue-500' : 'bg-zinc-700'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-all mt-0.5 ${notifyRegister ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setNotifyBuyVpn(!notifyBuyVpn)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all active:scale-[0.99] ${
            notifyBuyVpn ? 'bg-violet-500/5 border border-violet-500/15' : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div>
              <span className="text-sm font-medium text-white block">มีคนซื้อเน็ต</span>
              <span className="text-[10px] text-zinc-500">แจ้งเตือนเมื่อมีคนสั่งซื้อ VPN</span>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full transition-all ${notifyBuyVpn ? 'bg-violet-500' : 'bg-zinc-700'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-all mt-0.5 ${notifyBuyVpn ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setNotifyError(!notifyError)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all active:scale-[0.99] ${
            notifyError ? 'bg-red-500/5 border border-red-500/15' : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div>
              <span className="text-sm font-medium text-white block">ระบบมีปัญหา</span>
              <span className="text-[10px] text-zinc-500">แจ้งเตือนเมื่อระบบเติมเงินหรือ API ขัดข้อง</span>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full transition-all ${notifyError ? 'bg-red-500' : 'bg-zinc-700'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-all mt-0.5 ${notifyError ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>
    </div>
  )
}
