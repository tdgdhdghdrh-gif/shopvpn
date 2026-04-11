'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  ShoppingBag,
  Search,
  User,
  Server,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react'

interface OrderData {
  id: string
  buyerId: string
  buyer: { name: string; email: string }
  server: { name: string; flag: string }
  days: number
  totalPrice: number
  resellerEarning: number
  adminEarning: number
  expiryTime: string
  createdAt: string
  isActive: boolean
}

export default function ResellerOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/reseller/orders')
        if (res.ok) {
          const json = await res.json()
          setOrders(json.orders ?? [])
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter((o) => o.buyer.name.toLowerCase().includes(q))
  }, [orders, search])

  const totalEarnings = useMemo(
    () => filtered.reduce((sum, o) => sum + o.resellerEarning, 0),
    [filtered],
  )
  const totalRevenue = useMemo(
    () => filtered.reduce((sum, o) => sum + o.totalPrice, 0),
    [filtered],
  )

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-cyan-400" />
            ประวัติการขาย
          </h1>
          <p className="text-sm text-white/40 mt-1">
            รายการขายทั้งหมด {orders.length} รายการ
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-500/50 focus:bg-white/[0.07]"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <ShoppingBag className="h-3.5 w-3.5" />
            จำนวนรายการ
          </div>
          <p className="text-xl font-bold text-white">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <DollarSign className="h-3.5 w-3.5" />
            ยอดขายรวม
          </div>
          <p className="text-xl font-bold text-white">
            ฿{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-emerald-400/70 text-xs mb-1">
            <DollarSign className="h-3.5 w-3.5" />
            รายได้ของคุณ
          </div>
          <p className="text-xl font-bold text-emerald-400">
            ฿{totalEarnings.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            ใช้งานอยู่
          </div>
          <p className="text-xl font-bold text-white">
            {filtered.filter((o) => o.isActive).length}
          </p>
        </div>
      </div>

      {/* Orders Table / Card List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-white/10 mb-3" />
          <p className="text-white/40">
            {search ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีรายการขาย'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-white/50">
                    <th className="px-5 py-3.5 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        ลูกค้า
                      </span>
                    </th>
                    <th className="px-5 py-3.5 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5" />
                        เซิร์ฟเวอร์
                      </span>
                    </th>
                    <th className="px-5 py-3.5 font-medium text-center">วัน</th>
                    <th className="px-5 py-3.5 font-medium text-right">
                      <span className="inline-flex items-center gap-1.5 justify-end">
                        <DollarSign className="h-3.5 w-3.5" />
                        ราคา
                      </span>
                    </th>
                    <th className="px-5 py-3.5 font-medium text-right">รายได้คุณ</th>
                    <th className="px-5 py-3.5 font-medium text-right">ส่วนแบ่งแอดมิน</th>
                    <th className="px-5 py-3.5 font-medium text-center">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        หมดอายุ
                      </span>
                    </th>
                    <th className="px-5 py-3.5 font-medium text-center">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        วันที่สร้าง
                      </span>
                    </th>
                    <th className="px-5 py-3.5 font-medium text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-white">{order.buyer.name}</td>
                      <td className="px-5 py-3.5">
                        <span className="mr-1.5">{order.server.flag}</span>
                        <span className="text-white">{order.server.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-white">{order.days}</td>
                      <td className="px-5 py-3.5 text-right text-white">
                        ฿{order.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-emerald-400 font-medium">
                        ฿{order.resellerEarning.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-white/40">
                        ฿{order.adminEarning.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-center text-white/50 text-xs">
                        {new Date(order.expiryTime).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-center text-white/50 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {order.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            ใช้งาน
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                            <XCircle className="h-3 w-3" />
                            หมดอายุ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
              >
                {/* Top row: buyer + status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-cyan-400" />
                    <span className="font-medium text-white">{order.buyer.name}</span>
                  </div>
                  {order.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      ใช้งาน
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                      <XCircle className="h-3 w-3" />
                      หมดอายุ
                    </span>
                  )}
                </div>

                {/* Server info */}
                <div className="flex items-center gap-2 text-sm">
                  <Server className="h-3.5 w-3.5 text-white/40" />
                  <span className="mr-1">{order.server.flag}</span>
                  <span className="text-white">{order.server.name}</span>
                  <span className="text-white/30 mx-1">•</span>
                  <span className="text-white/60">{order.days} วัน</span>
                </div>

                {/* Pricing row */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-white/5 p-2 text-center">
                    <p className="text-white/40 mb-0.5">ราคา</p>
                    <p className="text-white font-medium">฿{order.totalPrice.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/5 p-2 text-center">
                    <p className="text-emerald-400/60 mb-0.5">รายได้คุณ</p>
                    <p className="text-emerald-400 font-medium">
                      ฿{order.resellerEarning.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2 text-center">
                    <p className="text-white/40 mb-0.5">แอดมิน</p>
                    <p className="text-white/50 font-medium">
                      ฿{order.adminEarning.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-white/40">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    หมดอายุ{' '}
                    {new Date(order.expiryTime).toLocaleDateString('th-TH', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
