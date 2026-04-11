'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Gift, Send, Download, Loader2, Copy, Check, Clock, Heart, Sparkles } from 'lucide-react'

interface GiftItem {
  id: string
  type: string
  value: number
  giftCode: string
  message: string | null
  isRedeemed: boolean
  createdAt: string
  expiresAt: string
  sender?: { name: string }
  receiver?: { name: string }
}

export default function GiftPage() {
  const [tab, setTab] = useState<'create' | 'redeem' | 'history'>('create')
  const [loading, setLoading] = useState(false)
  const [sentGifts, setSentGifts] = useState<GiftItem[]>([])
  const [receivedGifts, setReceivedGifts] = useState<GiftItem[]>([])

  // Create form
  const [amount, setAmount] = useState(10)
  const [message, setMessage] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [copied, setCopied] = useState(false)

  // Redeem form
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => { fetchHistory() }, [])

  async function fetchHistory() {
    try {
      const res = await fetch('/api/gift')
      if (!res.ok) return
      const data = await res.json()
      setSentGifts(data.sent || [])
      setReceivedGifts(data.received || [])
    } catch {}
  }

  async function handleCreate() {
    if (amount < 5) return alert('ขั้นต่ำ 5 บาท')
    setLoading(true)
    setCreatedCode('')
    try {
      const res = await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'credit', value: amount, message })
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error)
        return
      }
      setCreatedCode(data.giftCode)
      fetchHistory()
    } catch {
      alert('เกิดข้อผิดพลาด')
    } finally { setLoading(false) }
  }

  async function handleRedeem() {
    if (!redeemCode) return alert('กรุณากรอกรหัส')
    setLoading(true)
    setRedeemResult(null)
    try {
      const res = await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem', code: redeemCode })
      })
      const data = await res.json()
      setRedeemResult({ success: res.ok, message: data.message || data.error })
      if (res.ok) fetchHistory()
    } catch {
      setRedeemResult({ success: false, message: 'เกิดข้อผิดพลาด' })
    } finally { setLoading(false) }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const PRESETS = [5, 10, 20, 50, 100, 200]

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-400" />
              ส่งของขวัญ
            </h1>
            <p className="text-zinc-500 text-xs">ส่งเครดิตให้เพื่อนด้วยรหัสของขวัญ</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'create', label: 'สร้างของขวัญ', icon: Send },
            { key: 'redeem', label: 'รับของขวัญ', icon: Download },
            { key: 'history', label: 'ประวัติ', icon: Clock },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t.key
                  ? 'bg-pink-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Create Tab */}
        {tab === 'create' && (
          <div className="space-y-5">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-bold text-sm">สร้างของขวัญเครดิต</h3>

              <div>
                <label className="text-zinc-400 text-xs mb-2 block">จำนวนเครดิต (บาท)</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {PRESETS.map(v => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        amount === v ? 'bg-pink-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {v}฿
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  min={5}
                  max={1000}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-pink-400 outline-none"
                  placeholder="หรือกรอกจำนวนเอง (5-1,000)"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-xs mb-1 block">ข้อความแนบ (ไม่จำเป็น)</label>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-pink-400 outline-none"
                  placeholder="เช่น สุขสันต์วันเกิดนะ!"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-400 hover:to-rose-400 transition-all active:scale-95 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                {loading ? 'กำลังสร้าง...' : `สร้างของขวัญ ${amount} บาท`}
              </button>

              <p className="text-zinc-600 text-[10px] text-center">* เครดิตจะถูกหักจากบัญชีคุณทันที | หมดอายุใน 7 วัน</p>
            </div>

            {/* Created Gift Code */}
            {createdCode && (
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-2xl p-6 text-center">
                <Sparkles className="w-10 h-10 text-pink-400 mx-auto mb-3" />
                <p className="text-white font-bold mb-2">สร้างของขวัญสำเร็จ!</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <code className="text-2xl font-black text-pink-400 tracking-wider">{createdCode}</code>
                  <button onClick={() => copyCode(createdCode)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
                <p className="text-zinc-400 text-xs">แชร์รหัสนี้ให้เพื่อนเพื่อรับของขวัญ</p>
              </div>
            )}
          </div>
        )}

        {/* Redeem Tab */}
        {tab === 'redeem' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              รับของขวัญ
            </h3>
            <input
              type="text"
              value={redeemCode}
              onChange={e => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="กรอกรหัสของขวัญ เช่น GIFT-A1B2C3D4"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-center text-lg font-mono tracking-wider focus:ring-1 focus:ring-emerald-400 outline-none uppercase"
            />
            <button
              onClick={handleRedeem}
              disabled={loading || !redeemCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-green-400 transition-all active:scale-95 text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
              {loading ? 'กำลังตรวจสอบ...' : 'รับของขวัญ'}
            </button>
            {redeemResult && (
              <div className={`p-3 rounded-xl text-sm text-center ${redeemResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {redeemResult.message}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="space-y-4">
            {/* Sent */}
            <div>
              <h3 className="text-white font-bold text-sm mb-2">ส่งแล้ว ({sentGifts.length})</h3>
              {sentGifts.length === 0 ? (
                <p className="text-zinc-500 text-xs py-4 text-center">ยังไม่เคยส่งของขวัญ</p>
              ) : (
                <div className="space-y-2">
                  {sentGifts.map(g => (
                    <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
                      <Send className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{g.value} บาท</p>
                        <p className="text-zinc-500 text-xs truncate">
                          {g.isRedeemed ? `รับแล้วโดย ${g.receiver?.name || 'ไม่ระบุ'}` : `รหัส: ${g.giftCode}`}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${g.isRedeemed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {g.isRedeemed ? 'รับแล้ว' : 'รอรับ'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Received */}
            <div>
              <h3 className="text-white font-bold text-sm mb-2">ได้รับ ({receivedGifts.length})</h3>
              {receivedGifts.length === 0 ? (
                <p className="text-zinc-500 text-xs py-4 text-center">ยังไม่เคยได้รับของขวัญ</p>
              ) : (
                <div className="space-y-2">
                  {receivedGifts.map(g => (
                    <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
                      <Download className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{g.value} บาท</p>
                        <p className="text-zinc-500 text-xs">จาก {g.sender?.name || 'ไม่ระบุ'} {g.message && `- "${g.message}"`}</p>
                      </div>
                      <span className="text-zinc-600 text-[10px]">{new Date(g.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
