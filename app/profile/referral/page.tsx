'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Gift, Copy, CheckCircle2, Users, Coins, AlertCircle, Loader2 } from 'lucide-react'

interface ReferralStats {
  referralCode: string
  referralCount: number
  totalEarned: number
  referralUrl: string
}

interface ReferralHistory {
  id: string
  referredName: string
  amount: number
  createdAt: string
}

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [history, setHistory] = useState<ReferralHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReferralData()
  }, [])

  async function fetchReferralData() {
    try {
      const res = await fetch('/api/user/referral')
      const data = await res.json()
      
      if (data.success) {
        setStats(data)
        setHistory(data.history || [])
      } else {
        setError(data.error || 'ไม่สามารถโหลดข้อมูลได้')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    if (!stats) return
    
    try {
      await navigator.clipboard.writeText(stats.referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = stats.referralUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-semibold">เชิญเพื่อน</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-pink-400" />
                <span className="text-xs text-zinc-400">เพื่อนที่เชิญ</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.referralCount}</div>
              <div className="text-[10px] text-zinc-500">คน</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-zinc-400">ได้รับทั้งหมด</span>
              </div>
              <div className="text-2xl font-bold text-amber-400">{stats.totalEarned}</div>
              <div className="text-[10px] text-zinc-500">เครดิต</div>
            </div>
          </div>
        )}

        {/* Referral Link */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="font-semibold">ลิงก์เชิญเพื่อน</h2>
              <p className="text-xs text-zinc-500">แชร์ลิงก์นี้ให้เพื่อน</p>
            </div>
          </div>

          {stats && (
            <>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-400 truncate">
                  {stats.referralUrl}
                </div>
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                </button>
              </div>

              {/* Rules */}
              <div className="space-y-2 text-xs text-zinc-400 bg-black/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>เพื่อนเติมเงิน 100฿ ขึ้นไป คุณได้รับ 20 เครดิต</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>เพื่อนที่ถูกเชิญได้รับ 0.50 เครดิต (สะสมครบ 2 คน = 1 เครดิต)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>ระบบจดจำอุปกรณ์เพื่อป้องกันการปั้ม</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* History */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="font-medium text-sm">ประวัติการได้รับ</h3>
          </div>
          {history.length === 0 ? (
            <div className="p-8 text-center">
              <Gift className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">ยังไม่มีประวัติ</p>
              <p className="text-zinc-600 text-xs mt-1">เริ่มเชิญเพื่อนเพื่อรับเครดิตฟรี!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {history.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-300">{item.referredName}</p>
                    <p className="text-[10px] text-zinc-500">
                      {new Date(item.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="text-emerald-400 font-medium text-sm">+{item.amount} เครดิต</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
