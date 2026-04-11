'use client'

import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, ShoppingBag, Server, Loader2 } from 'lucide-react'
import DashboardCard from '@/components/admin/DashboardCard'

interface DashboardData {
  resellerBalance: number
  totalEarnings: number
  totalOrderCount: number
  todayEarnings: number
  todayOrderCount: number
  activeServers: number
  pendingWithdrawals: number
  pendingWithdrawalAmount: number
}

interface ResellerOrder {
  id: string
  days: number
  totalPrice: number
  resellerEarning: number
  createdAt: string
  buyer: { name: string; email: string }
  server: { name: string; flag: string }
}

export default function ResellerPanelPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [orders, setOrders] = useState<ResellerOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          fetch('/api/reseller/dashboard'),
          fetch('/api/reseller/orders'),
        ])

        if (dashRes.ok) {
          const dashJson = await dashRes.json()
          if (dashJson.success) setDashboard(dashJson.dashboard)
        }

        if (ordersRes.ok) {
          const ordersJson = await ordersRes.json()
          if (ordersJson.success) setOrders(ordersJson.orders?.slice(0, 10) || [])
        }
      } catch (err) {
        console.error('Failed to fetch reseller dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">แดชบอร์ดตัวแทน</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          label="ยอดเงินสะสม"
          value={`${(dashboard?.resellerBalance ?? 0).toLocaleString('th-TH')} ฿`}
          description="ยอดคงเหลือพร้อมถอน"
          icon={Wallet}
          color="text-emerald-400"
          trend="ถอนได้"
          trendType="positive"
        />
        <DashboardCard
          label="รายได้วันนี้"
          value={`${(dashboard?.todayEarnings ?? 0).toLocaleString('th-TH')} ฿`}
          description={`${dashboard?.todayOrderCount ?? 0} ออเดอร์`}
          icon={TrendingUp}
          color="text-cyan-400"
          trend="วันนี้"
          trendType="neutral"
        />
        <DashboardCard
          label="รายการขายทั้งหมด"
          value={(dashboard?.totalOrderCount ?? 0).toLocaleString()}
          description={`รายได้สะสม ${(dashboard?.totalEarnings ?? 0).toLocaleString('th-TH')} ฿`}
          icon={ShoppingBag}
          color="text-blue-400"
          trend="สะสม"
          trendType="positive"
        />
        <DashboardCard
          label="เซิร์ฟเวอร์ออนไลน์"
          value={(dashboard?.activeServers ?? 0).toLocaleString()}
          description="กำลังให้บริการ"
          icon={Server}
          color="text-purple-400"
          trend="พร้อมขาย"
          trendType="positive"
        />
      </div>

      {/* Pending Withdrawals Banner */}
      {(dashboard?.pendingWithdrawals ?? 0) > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
          <Wallet className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-400">
            มี {dashboard?.pendingWithdrawals} รายการถอนเงินรอดำเนินการ ({(dashboard?.pendingWithdrawalAmount ?? 0).toLocaleString('th-TH')} ฿)
          </p>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">รายการขายล่าสุด</h2>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingBag className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">ยังไม่มีรายการขาย</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">ลูกค้า</th>
                    <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">เซิร์ฟเวอร์</th>
                    <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">จำนวนวัน</th>
                    <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">ราคา</th>
                    <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">รายได้</th>
                    <th className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-3 text-white">{order.buyer?.name || order.buyer?.email}</td>
                      <td className="px-6 py-3 text-zinc-300">
                        <span className="mr-1.5">{order.server?.flag}</span>
                        {order.server?.name}
                      </td>
                      <td className="px-6 py-3 text-center text-zinc-300">{order.days}</td>
                      <td className="px-6 py-3 text-right text-zinc-300">
                        {order.totalPrice.toLocaleString('th-TH')} ฿
                      </td>
                      <td className="px-6 py-3 text-right text-emerald-400 font-bold">
                        +{order.resellerEarning.toLocaleString('th-TH')} ฿
                      </td>
                      <td className="px-6 py-3 text-right text-zinc-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('th-TH', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/5">
              {orders.map((order) => (
                <div key={order.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{order.buyer?.name || order.buyer?.email}</p>
                      <p className="text-xs text-zinc-500">{order.server?.flag} {order.server?.name} - {order.days} วัน</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">+{order.resellerEarning.toLocaleString('th-TH')} ฿</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-600">
                    <span>ราคา: {order.totalPrice.toLocaleString('th-TH')} ฿</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
