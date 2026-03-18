'use client'

import { useEffect, useState } from 'react'
import { 
  Server, 
  TrendingUp, 
  Wallet,
  Calendar,
  DollarSign,
  ShoppingCart,
  Activity,
  RefreshCw,
  Globe,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ServerOff
} from 'lucide-react'
import DashboardCard from '@/components/admin/DashboardCard'

interface ServerRevenue {
  id: string
  name: string
  host: string
  flag: string
  isActive: boolean
  totalOrders: number
  totalRevenue: number
  todayRevenue: number
  monthRevenue: number
}

interface Summary {
  totalRevenue: number
  todayRevenue: number
  monthRevenue: number
  totalOrders: number
  activeServers: number
  totalServers: number
}

export default function AdminRevenuePage() {
  const [servers, setServers] = useState<ServerRevenue[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/revenue')
      const data = await res.json()
      
      if (data.servers) {
        setServers(data.servers)
      }
      if (data.summary) {
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch revenue data')
    } finally {
      setLoading(false)
    }
  }

  // เรียงลำดับเซิร์ฟเวอร์ตามรายได้รวม (มากไปน้อย)
  const sortedServers = [...servers].sort((a, b) => b.totalRevenue - a.totalRevenue)

  return (
    <div className="space-y-6 sm:space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
               <TrendingUp className="w-4 h-4 text-blue-400" />
             </div>
             <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">รายได้ตามเซิร์ฟเวอร์</h2>
          </div>
          <p className="text-gray-500 text-sm font-medium">สถิติรายได้และยอดขายของแต่ละเครื่องเซิร์ฟเวอร์</p>
        </div>
        
        <button 
          onClick={fetchData}
          className="p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-gray-400 hover:text-white transition-all group active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard 
          label="รายได้วันนี้" 
          value={`฿${summary?.todayRevenue.toLocaleString() || '0'}`} 
          description="ยอดขายรวมวันนี้"
          icon={Calendar}
          color="text-emerald-400"
          trend="+8%"
          trendType="positive"
        />
        <DashboardCard 
          label="รายได้เดือนนี้" 
          value={`฿${summary?.monthRevenue.toLocaleString() || '0'}`} 
          description="ยอดขายสะสมเดือนนี้"
          icon={TrendingUp}
          color="text-blue-400"
          trend="สะสม"
          trendType="neutral"
        />
        <DashboardCard 
          label="รายได้รวมทั้งหมด" 
          value={`฿${summary?.totalRevenue.toLocaleString() || '0'}`} 
          description="รายได้ตลอดกาล"
          icon={Wallet}
          color="text-purple-400"
          trend="+12%"
          trendType="positive"
        />
        <DashboardCard 
          label="คำสั่งซื้อทั้งหมด" 
          value={summary?.totalOrders.toLocaleString() || '0'} 
          description={`จาก ${summary?.activeServers || 0}/${summary?.totalServers || 0} เซิร์ฟเวอร์`}
          icon={ShoppingCart}
          color="text-amber-400"
          trend="+5%"
          trendType="positive"
        />
      </div>

      {/* Servers Revenue Table */}
      <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-3">
             <Server className="w-5 h-5 text-blue-400" /> รายได้แยกตามเซิร์ฟเวอร์
           </h3>
           <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">เรียงตามรายได้สูงสุด</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-widest text-center">กำลังโหลดข้อมูล...</p>
             </div>
          ) : sortedServers.length === 0 ? (
             <div className="p-16 sm:p-20 text-center space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <ServerOff className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" />
                </div>
                <h3 className="text-lg font-bold text-white">ไม่พบข้อมูลเซิร์ฟเวอร์</h3>
                <p className="text-gray-500 max-w-xs mx-auto text-xs">ยังไม่มีเซิร์ฟเวอร์ในระบบ หรือยังไม่มีคำสั่งซื้อ</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px] sm:min-w-0">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">เซิร์ฟเวอร์</th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">สถานะ</th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">คำสั่งซื้อ</th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">วันนี้</th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">เดือนนี้</th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">รายได้รวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedServers.map((server) => (
                  <tr key={server.id} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 sm:py-5 px-6 sm:px-8">
                      <div className="flex items-center gap-3 sm:gap-4">
                         <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-500/10 border border-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center text-xl">
                            {server.flag}
                         </div>
                         <div className="min-w-0">
                            <p className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">{server.name}</p>
                            <p className="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-widest truncate">{server.host}</p>
                         </div>
                      </div>
                    </td>
                    <td className="py-4 sm:py-5 px-6 sm:px-8">
                       <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${server.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className={`text-[10px] sm:text-xs font-bold ${server.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {server.isActive ? 'ออนไลน์' : 'ออฟไลน์'}
                          </span>
                       </div>
                    </td>
                    <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                       <span className="text-xs sm:text-sm font-bold text-white">{server.totalOrders.toLocaleString()}</span>
                    </td>
                    <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                       <span className={`text-xs sm:text-sm font-bold ${server.todayRevenue > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
                         ฿{server.todayRevenue.toLocaleString()}
                       </span>
                    </td>
                    <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                       <span className={`text-xs sm:text-sm font-bold ${server.monthRevenue > 0 ? 'text-blue-400' : 'text-gray-600'}`}>
                         ฿{server.monthRevenue.toLocaleString()}
                       </span>
                    </td>
                    <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                       <div className="flex items-center justify-end gap-1.5 text-purple-400 font-black tracking-tight">
                          <span className="text-[10px] sm:text-xs">฿</span>
                          <span className="text-base sm:text-lg">{server.totalRevenue.toLocaleString()}</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Total Row */}
              <tfoot className="bg-white/[0.02]">
                <tr className="border-t border-white/10">
                  <td className="py-4 sm:py-5 px-6 sm:px-8" colSpan={2}>
                    <span className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest">รวมทั้งหมด</span>
                  </td>
                  <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                    <span className="text-sm sm:text-base font-bold text-white">{summary?.totalOrders.toLocaleString()}</span>
                  </td>
                  <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                    <span className="text-sm sm:text-base font-bold text-emerald-400">฿{summary?.todayRevenue.toLocaleString()}</span>
                  </td>
                  <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                    <span className="text-sm sm:text-base font-bold text-blue-400">฿{summary?.monthRevenue.toLocaleString()}</span>
                  </td>
                  <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-purple-400 font-black tracking-tight">
                      <span className="text-xs">฿</span>
                      <span className="text-lg sm:text-xl">{summary?.totalRevenue.toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* Charts Section */}
      {!loading && sortedServers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Revenue Distribution Chart */}
          <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 space-y-6">
             <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
               <PieChart className="w-5 h-5 text-blue-400" /> สัดส่วนรายได้ตามเซิร์ฟเวอร์
             </h3>
             
             <div className="space-y-4">
               {sortedServers.slice(0, 5).map((server, index) => {
                 const percentage = summary?.totalRevenue ? (server.totalRevenue / summary.totalRevenue) * 100 : 0
                 const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500']
                 return (
                   <div key={server.id} className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs">
                         <div className="flex items-center gap-2">
                           <span className="text-base">{server.flag}</span>
                           <span className="font-bold text-white truncate max-w-[150px]">{server.name}</span>
                         </div>
                         <span className="font-black text-gray-400">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className={`h-full ${colors[index]} rounded-full transition-all duration-1000`}
                           style={{ width: `${percentage}%` }}
                         />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-500">฿{server.totalRevenue.toLocaleString()}</span>
                      </div>
                   </div>
                 )
               })}
             </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 space-y-6">
             <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
               <Activity className="w-5 h-5 text-blue-400" /> สถิติเซิร์ฟเวอร์
             </h3>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">เซิร์ฟเวอร์ทั้งหมด</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-white">{summary?.totalServers || 0}</p>
               </div>
               
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">ออนไลน์</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">{summary?.activeServers || 0}</p>
               </div>
               
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">เฉลี่ย/เซิร์ฟเวอร์</span>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-white">
                    ฿{summary?.totalServers ? Math.round((summary.totalRevenue / summary.totalServers)).toLocaleString() : 0}
                  </p>
               </div>
               
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">คำสั่งซื้อ/เซิร์ฟ</span>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-white">
                    {summary?.totalServers ? Math.round((summary.totalOrders / summary.totalServers) * 10) / 10 : 0}
                  </p>
               </div>
             </div>

             <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-gray-500">เซิร์ฟเวอร์ทำเงินสูงสุด</span>
                   <span className="text-xs font-bold text-blue-400">
                     {sortedServers[0]?.name || '-'}
                   </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                   <span className="text-xs font-bold text-gray-500">ยอดรวม</span>
                   <span className="text-lg font-black text-emerald-400">
                     ฿{sortedServers[0]?.totalRevenue.toLocaleString() || 0}
                   </span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
