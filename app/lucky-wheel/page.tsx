'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Gift, Star, Sparkles, RotateCcw, Clock, Trophy } from 'lucide-react'

interface Prize {
  id: string
  label: string
  type: string
  value: number
  color: string
  probability: number
}

export default function LuckyWheelPage() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [canSpin, setCanSpin] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<{ label: string; type: string; value: number; rewardMessage: string } | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetchWheel()
    checkLogin()
  }, [])

  useEffect(() => {
    if (prizes.length > 0) drawWheel()
  }, [prizes, rotation])

  async function checkLogin() {
    try {
      const res = await fetch('/api/user/me')
      const data = await res.json()
      setIsLoggedIn(!!data.user)
    } catch {
      setIsLoggedIn(false)
    }
  }

  async function fetchWheel() {
    try {
      const res = await fetch('/api/lucky-wheel')
      const data = await res.json()
      setPrizes(data.prizes || [])
      setCanSpin(data.canSpin || false)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  function drawWheel() {
    const canvas = canvasRef.current
    if (!canvas || prizes.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 8
    const sliceAngle = (2 * Math.PI) / prizes.length

    ctx.clearRect(0, 0, size, size)

    // Draw slices
    prizes.forEach((prize, i) => {
      const startAngle = i * sliceAngle + (rotation * Math.PI) / 180
      const endAngle = startAngle + sliceAngle

      // Slice
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = prize.color
      ctx.fill()

      // Border
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Text
      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.max(10, Math.min(14, 160 / prizes.length))}px sans-serif`
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 3

      const text = prize.label.length > 12 ? prize.label.slice(0, 11) + '…' : prize.label
      ctx.fillText(text, radius - 16, 5)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(center, center, 28, 0, 2 * Math.PI)
    ctx.fillStyle = '#18181b'
    ctx.fill()
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3
    ctx.stroke()

    // Center text
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SPIN', center, center + 4)
  }

  async function handleSpin() {
    if (!canSpin || isSpinning || prizes.length === 0) return
    setIsSpinning(true)
    setResult(null)
    setShowResult(false)

    try {
      const res = await fetch('/api/lucky-wheel', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'เกิดข้อผิดพลาด')
        setIsSpinning(false)
        return
      }

      // Find prize index
      const prizeIndex = prizes.findIndex(p => p.id === data.prize.id)
      if (prizeIndex === -1) {
        setIsSpinning(false)
        return
      }

      // Calculate target rotation
      const sliceAngle = 360 / prizes.length
      // The pointer is at top (270 degrees in canvas). We want the winning slice to land there.
      const targetSliceCenter = prizeIndex * sliceAngle + sliceAngle / 2
      const targetRotation = 360 * 8 + (360 - targetSliceCenter) // 8 full rotations + offset

      // Animate
      const startRotation = rotation
      const totalRotation = targetRotation
      const duration = 5000
      const startTime = Date.now()

      function animate() {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setRotation(startRotation + totalRotation * eased)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Show result
          setResult({
            label: data.prize.label,
            type: data.prize.type,
            value: data.prize.value,
            rewardMessage: data.rewardMessage
          })
          setShowResult(true)
          setCanSpin(false)
          setIsSpinning(false)
        }
      }
      requestAnimationFrame(animate)
    } catch {
      alert('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
      setIsSpinning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    )
  }

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
              <Sparkles className="w-5 h-5 text-yellow-400" />
              กงล้อนำโชค
            </h1>
            <p className="text-zinc-500 text-xs">หมุนฟรีวันละ 1 ครั้ง ลุ้นรางวัลมากมาย!</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {prizes.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg font-medium">กงล้อยังไม่พร้อมใช้งาน</p>
            <p className="text-zinc-600 text-sm mt-1">แอดมินกำลังเตรียมรางวัล กลับมาใหม่เร็วๆ นี้!</p>
          </div>
        ) : (
          <>
            {/* Wheel */}
            <div className="relative flex justify-center mb-8">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
              </div>

              {/* Outer glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-[340px] h-[340px] rounded-full ${isSpinning ? 'bg-yellow-400/10 animate-pulse' : 'bg-zinc-800/30'} transition-all duration-500`} />
              </div>

              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="rounded-full border-4 border-zinc-700 shadow-2xl"
              />
            </div>

            {/* Spin Button */}
            {!isLoggedIn ? (
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 text-black font-bold rounded-2xl hover:bg-yellow-300 transition-all active:scale-95 text-sm"
                >
                  เข้าสู่ระบบเพื่อหมุนกงล้อ
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleSpin}
                  disabled={!canSpin || isSpinning}
                  className={`inline-flex items-center gap-2 px-8 py-3 font-bold rounded-2xl transition-all active:scale-95 text-sm ${
                    canSpin && !isSpinning
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-300 hover:to-amber-400 shadow-lg shadow-yellow-400/20'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  }`}
                >
                  {isSpinning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      กำลังหมุน...
                    </>
                  ) : canSpin ? (
                    <>
                      <RotateCcw className="w-5 h-5" />
                      หมุนเลย! (ฟรี)
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5" />
                      หมุนได้อีกครั้งพรุ่งนี้
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Result Modal */}
            {showResult && result && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowResult(false)}>
                <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-sm mx-4 text-center animate-bounce-in" onClick={e => e.stopPropagation()}>
                  {result.type !== 'nothing' ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-10 h-10 text-black" />
                      </div>
                      <h3 className="text-2xl font-black text-yellow-400 mb-2">🎉 ยินดีด้วย!</h3>
                      <p className="text-white font-bold text-lg mb-1">{result.label}</p>
                      <p className="text-zinc-400 text-sm mb-6">{result.rewardMessage}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <Star className="w-10 h-10 text-zinc-500" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-300 mb-2">เสียใจด้วย 😢</h3>
                      <p className="text-zinc-400 text-sm mb-6">{result.rewardMessage}</p>
                    </>
                  )}
                  <button
                    onClick={() => setShowResult(false)}
                    className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-xl font-medium text-sm hover:bg-zinc-700 transition-all"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            )}

            {/* Rules */}
            <div className="mt-10 p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-yellow-400" />
                กติกา
              </h3>
              <ul className="space-y-1.5 text-zinc-400 text-xs">
                <li>• หมุนได้ฟรีวันละ 1 ครั้ง (รีเซ็ตเที่ยงคืน)</li>
                <li>• ต้องเข้าสู่ระบบก่อนจึงจะหมุนได้</li>
                <li>• รางวัลเครดิตจะเข้าบัญชีทันที</li>
                <li>• รางวัล VPN ฟรี ติดต่อแอดมินเพื่อรับสิทธิ์</li>
                <li>• ผลการหมุนถือเป็นที่สิ้นสุด</li>
              </ul>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.4s ease-out; }
      `}</style>
    </div>
  )
}
