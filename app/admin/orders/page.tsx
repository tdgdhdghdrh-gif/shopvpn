'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  ShoppingCart, Search, User, Server, Calendar, Clock,
  CheckCircle2, XCircle, Loader2, Wifi, Package
} from 'lucide-react'

interface Order {
  id: string
  userId: string
  serverId: string
  packageType: string
  price: number
  duration: number
  remark: string
  expiryTime: string
  isActive: boolean
  ipLimit: number
  createdAt: string
  user: { username: string; email: string }
  server: { name: string; flag: string }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(d => { if (d.orders) setOrders(d.orders) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = orders
    if (filter === 'active') list = list.filter(o => o.isActive)
    if (filter === 'expired') list = list.filter(o => !o.isActive)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.user?.username?.toLowerCase().includes(q) ||
        o.server?.name?.toLowerCase().includes(q) ||
        o.remark?.toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, search, filter])

  const stats = useMemo(() => ({
    total: orders.length,
    active: orders.filter(o => o.isActive).length,
    expired: orders.filter(o => !o.isActive).length,
    revenue: orders.reduce((s, o) => s + (o.price || 0), 0),
  }), [orders])

  const fmtDate = (d: string) => new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
  const daysLeft = (expiry: string) => {
    const diff = new Date(expiry).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-zinc-500">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-0 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">คำสั่งซื้อ</h1>
            <p className="text-xs sm:text-sm text-zinc-500">ดูคำสั่งซื้อ VPN ทั้งหมดในระบบ</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'ทั้งหมด', value: stats.total, icon: Package, color: 'text-white' },
          { label: 'ใช้งานอยู่', value: stats.active, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'หมดอายุ', value: stats.expired, icon: XCircle, color: 'text-red-400' },
          { label: 'รายได้รวม', value: `${stats.revenue.toLocaleString('th-TH')} ฿`, icon: Wifi, color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900/50 border border-white/[0.04] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{s.label}</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อผู้ใช้, เซิร์ฟเวอร์, ชื่อบัญชี..."
            className="w-full bg-black/40 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/40 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'active', label: 'ใช้งานอยู่' },
            { id: 'expired', label: 'หมดอายุ' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                filter === f.id
                  ? 'bg-white text-black border-white'
                  : 'bg-zinc-900/40 text-zinc-500 border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table / Cards */}
      <div className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.04] text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-3">ผู้ใช้ / บัญชี</div>
          <div className="col-span-3">เซิร์ฟเวอร์ / แพ็กเกจ</div>
          <div className="col-span-2">ราคา / ระยะเวลา</div>
          <div className="col-span-2">วันหมดอายุ</div>
          <div className="col-span-2">สถานะ</div>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Package className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">ไม่พบคำสั่งซื้อ</p>
            </div>
          )}
          {filtered.map(order => {
            const dl = daysLeft(order.expiryTime)
            return (
              <div key={order.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-4 sm:px-5 py-4 hover:bg-white/[0.02] transition-colors">
                {/* User */}
                <div className="sm:col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{order.user?.username || 'ไม่ทราบ'}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{order.remark || order.user?.email || '-'}</p>
                  </div>
                </div>

                {/* Server */}
                <div className="sm:col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/[0.04] flex items-center justify-center shrink-0 text-lg">
                    {order.server?.flag || '🌐'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{order.server?.name || 'ไม่ทราบ'}</p>
                    <p className="text-[11px] text-zinc-500">{order.packageType} • {order.duration} วัน</p>
                  </div>
                </div>

                {/* Price */}
                <div className="sm:col-span-2 flex flex-col justify-center">
                  <p className="text-sm font-bold text-white">{order.price.toLocaleString('th-TH')} ฿</p>
                  <p className="text-[11px] text-zinc-500">{order.ipLimit > 0 ? `จำกัด ${order.ipLimit} เครื่อง` : 'ไม่จำกัดเครื่อง'}</p>
                </div>

                {/* Expiry */}
                <div className="sm:col-span-2 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Calendar className="w-3 h-3" />
                    {fmtDate(order.expiryTime)}
                  </div>
                  {order.isActive ? (
                    <p className={`text-[11px] font-medium ${dl <= 3 ? 'text-red-400' : dl <= 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      เหลือ {dl} วัน
                    </p>
                  ) : (
                    <p className="text-[11px] text-zinc-600">หมดอายุแล้ว</p>
                  )}
                </div>

                {/* Status */}
                <div className="sm:col-span-2 flex items-center">
                  {order.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> ใช้งานอยู่
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] font-bold text-red-400">
                      <XCircle className="w-3 h-3" /> หมดอายุ
                    </span>
                  )}
                </div>

                {/* Mobile: order date */}
                <div className="sm:hidden col-span-1 flex items-center gap-1.5 text-[10px] text-zinc-600">
                  <Clock className="w-3 h-3" />
                  สั่งซื้อ {fmtDate(order.createdAt)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {filtered.length > 0 && (
        <p className="mt-3 text-[11px] text-zinc-600 text-center">แสดง {filtered.length} รายการ จากทั้งหมด {orders.length} รายการ</p>
      )}
    </div>
  )
}
