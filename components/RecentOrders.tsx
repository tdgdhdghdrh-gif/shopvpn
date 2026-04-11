'use client'

import { ShoppingBag, Clock } from 'lucide-react'

interface RecentOrder {
  id: string
  userName: string
  serverName: string
  serverFlag: string
  price: number
  duration: number
  createdAt: string
}

function maskName(name: string) {
  if (name.length <= 2) return name[0] + '***'
  return name[0] + '***' + name[name.length - 1]
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'เมื่อกี้'
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`
  if (diffHr < 24) return `${diffHr} ชม.ที่แล้ว`
  return `${diffDay} วันที่แล้ว`
}

function OrderChip({ order }: { order: RecentOrder }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-white/5 whitespace-nowrap shrink-0">
      <span className="text-sm leading-none">{order.serverFlag}</span>
      <span className="text-[10px] font-semibold text-white">{maskName(order.userName)}</span>
      <span className="text-[9px] text-zinc-600">ซื้อ</span>
      <span className="text-[10px] text-cyan-400 font-medium">{order.serverName}</span>
      <span className="text-[10px] text-emerald-400 font-bold">{order.price}฿</span>
      <span className="flex items-center gap-0.5 text-[9px] text-zinc-600">
        <Clock className="w-2.5 h-2.5" />
        {timeAgo(order.createdAt)}
      </span>
    </div>
  )
}

export default function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) return null

  return (
    <div className="mb-5 rounded-2xl bg-zinc-900/50 border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ShoppingBag className="w-3 h-3 text-emerald-400" />
        </div>
        <span className="text-[11px] font-medium text-zinc-400">รายการซื้อล่าสุด</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden py-2 px-2">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-zinc-900/95 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-zinc-900/95 to-transparent z-10 pointer-events-none" />

        <div className="marquee-orders-track flex hover:[animation-play-state:paused]">
          <div className="marquee-orders-scroll flex gap-2.5 shrink-0 pr-2.5">
            {orders.map((order) => (
              <OrderChip key={order.id} order={order} />
            ))}
          </div>
          <div className="marquee-orders-scroll flex gap-2.5 shrink-0 pr-2.5">
            {orders.map((order) => (
              <OrderChip key={`dup-${order.id}`} order={order} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .marquee-orders-track {
          width: max-content;
        }
        .marquee-orders-scroll {
          animation: marquee-slide 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
