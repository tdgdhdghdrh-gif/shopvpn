'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Copy, CheckCircle2, Clock } from 'lucide-react'

interface VpnOrder {
  id: string
  packageType: string
  price: number
  duration: number
  clientUUID: string
  remark: string
  vlessLink: string
  isActive: boolean
  expiryTime: string
  createdAt: string
  server: {
    name: string
    flag: string
  }
}

// Countdown Timer Component
function CountdownTimer({ expiryTime, isActive }: { expiryTime: string; isActive: boolean }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setTimeLeft('หมดอายุแล้ว')
      setIsExpired(true)
      return
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiryTime).getTime()
      const difference = expiry - now

      if (difference <= 0) {
        setTimeLeft('หมดอายุแล้ว')
        setIsExpired(true)
        return
      }

      setIsExpired(false)

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}วัน ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [expiryTime, isActive])

  return (
    <div className={`flex items-center gap-1.5 text-sm font-mono ${
      isExpired ? 'text-red-400' : 'text-green-400'
    }`}>
      <Clock className="w-4 h-4" />
      <span>{timeLeft}</span>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<VpnOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/profile/orders')
      const data = await res.json()
      if (data.orders) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  async function copyLink(link: string, id: string) {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link)
      } else {
        // Fallback for older browsers or non-secure context
        const textArea = document.createElement('textarea')
        textArea.value = link
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (!successful) {
          throw new Error('execCommand failed')
        }
      }
      
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
      alert('คัดลอกไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  function getPackageLabel(type: string) {
    switch (type) {
      case 'TRIAL': return 'ทดลองใช้'
      case 'DAILY': return 'รายวัน'
      case 'WEEKLY': return 'รายอาทิตย์'
      case 'MONTHLY': return 'รายเดือน'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-semibold">ประวัติการซื้อ</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Orders List */}
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">ยังไม่มีประวัติการซื้อ</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">VPN {getPackageLabel(order.packageType)}</p>
                      <p className="text-sm text-gray-500">{order.server.flag} {order.server.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.isActive 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {order.isActive ? 'ใช้งานได้' : 'หมดอายุ'}
                    </span>
                  </div>
                  
                  {/* Connection Link */}
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="text" 
                      defaultValue={order.vlessLink}
                      readOnly
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-400 truncate"
                    />
                    <button
                      onClick={() => copyLink(order.vlessLink, order.id)}
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors"
                    >
                      {copiedId === order.id ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-400" />
                      )}
                    </button>
                  </div>

                  {/* Countdown Timer */}
                  <div className="mb-3">
                    <CountdownTimer expiryTime={order.expiryTime} isActive={order.isActive} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      หมดอายุ: {new Date(order.expiryTime).toLocaleDateString('th-TH')}
                    </span>
                    <span className="text-amber-400 font-semibold">{order.price} ฿</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
