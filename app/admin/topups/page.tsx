'use client'

import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  Users, 
  Calendar,
  Clock,
  Wallet,
  BarChart3,
  PieChart,
  RefreshCw,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  History,
  List as ListIcon
} from 'lucide-react'
import DashboardCard from '@/components/admin/DashboardCard'

interface Topup {
  id: string
  amount: number
  method: string
  note: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface Stats {
  totalToday: number
  totalMonth: number
  totalAllTime: number
  countToday: number
  countMonth: number
  countAllTime: number
  uniqueUsersToday: number
  uniqueUsersMonth: number
}

export default function AdminTopupsPage() {
  const [topups, setTopups] = useState<Topup[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [topupsRes, statsRes] = await Promise.all([
        fetch('/api/admin/topups'),
        fetch('/api/admin/topups/stats')
      ])
      
      const topupsData = await topupsRes.json()
      const statsData = await statsRes.json()
      
      if (topupsData.topups) {
        setTopups(topupsData.topups)
      }
      if (statsData.stats) {
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error('Failed to fetch financial data')
    } finally {
      setLoading(false)
    }
  }

  const chartData = topups.slice(0, 50).reduce((acc: any[], t) => {
    const date = new Date(t.createdAt).toLocaleDateString('th-TH', { 
      month: 'short', 
      day: 'numeric' 
    })
    const existing = acc.find(item => item.date === date)
    if (existing) {
      existing.amount += t.amount
    } else {
      acc.push({ date, amount: t.amount })
    }
    return acc
  }, []).reverse().slice(-10)

  const maxAmount = Math.max(...chartData.map(d => d.amount), 1)

  const filteredTopups = topups.filter(t => 
    t.user.name.toLowerCase().includes(search.toLowerCase()) ||
    t.user.email.toLowerCase().includes(search.toLowerCase()) ||
    t.note?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 sm:space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
               <Wallet className="w-4 h-4 text-emerald-400" />
             </div>
             <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">สมุดบัญชีรายได้</h2>
          </div>
          <p className="text-gray-500 text-sm font-medium">ตรวจสอบธุรกรรมแบบเรียลไทม์และการไหลของเงินในระบบ</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
           <button 
             onClick={fetchData}
             className="p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-gray-400 hover:text-white transition-all group active:scale-95"
           >
             <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
           </button>
           <div className="flex bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('chart')}
                className={`p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === 'chart' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* Analytics Overview - Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard 
          label="วันนี้" 
          value={`฿${stats?.totalToday.toLocaleString() || '0'}`} 
          description={`${stats?.countToday || 0} รายการ`}
          icon={Calendar}
          color="text-emerald-400"
          trend="+12%"
          trendType="positive"
        />
        <DashboardCard 
          label="เดือนนี้" 
          value={`฿${stats?.totalMonth.toLocaleString() || '0'}`} 
          description="ยอดเงินรวม"
          icon={Clock}
          color="text-blue-400"
          trend="สะสม"
          trendType="neutral"
        />
        <DashboardCard 
          label="รวมทั้งหมด" 
          value={`฿${stats?.totalAllTime.toLocaleString() || '0'}`} 
          description="สะสมสูงสุด"
          icon={TrendingUp}
          color="text-purple-400"
          trend="+5%"
          trendType="positive"
        />
        <DashboardCard 
          label="ผู้ใช้ (วัน)" 
          value={stats?.uniqueUsersToday || 0} 
          description="ไม่ซ้ำคน"
          icon={Users}
          color="text-amber-400"
          trend="+8%"
          trendType="positive"
        />
      </div>

      {/* Main Content Area - Stack on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        <div className="xl:col-span-2 space-y-6 sm:space-y-8">
           {/* Chart Analysis - Better Mobile Sizing */}
           {viewMode === 'chart' && chartData.length > 0 && (
             <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
               <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-3">
                     <Activity className="w-5 h-5 text-emerald-400" /> แนวโน้มรายได้ (10 วันล่าสุด)
                  </h3>
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">ข้อมูลสด</span>
                  </div>
               </div>
               
               <div className="flex items-end gap-2 sm:gap-3 h-48 sm:h-64 px-2">
                  {chartData.map((data, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 sm:gap-4 group">
                      <div className="relative w-full flex items-end justify-center h-full">
                         <div 
                           className="w-full max-w-[30px] sm:max-w-[40px] bg-gradient-to-t from-emerald-600/40 to-emerald-400 rounded-xl sm:rounded-2xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-emerald-300"
                           style={{ height: `${(data.amount / maxAmount) * 100}%`, minHeight: '6px' }}
                         >
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-2 py-1 rounded-lg text-[9px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                             ฿{data.amount.toLocaleString()}
                           </div>
                         </div>
                      </div>
                      <span className="text-[8px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">{data.date}</span>
                    </div>
                  ))}
               </div>
             </div>
           )}

           {/* Transaction History - Responsive Scroll */}
           <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-3">
                   <History className="w-5 h-5 text-gray-400" /> ประวัติรายการ
                 </h3>
                 <div className="relative group w-full sm:max-w-xs">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                   <input
                     type="text"
                     placeholder="ค้นหาตามชื่อ หรือบันทึก..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-11 pr-4 py-2.5 text-[11px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                   />
                 </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                   <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
                      <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      <p className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-widest text-center">กำลังซิงค์ข้อมูลบัญชี...</p>
                   </div>
                ) : filteredTopups.length === 0 ? (
                   <div className="p-16 sm:p-20 text-center space-y-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" />
                      </div>
                      <h3 className="text-lg font-bold text-white">ไม่พบรายการ</h3>
                      <p className="text-gray-500 max-w-xs mx-auto text-xs">ไม่พบประวัติการทำรายการในฐานข้อมูลระบบ</p>
                   </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[650px] sm:min-w-0">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">ผู้ใช้</th>
                        <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">วันเวลา</th>
                        <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">ช่องทาง</th>
                        <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">จำนวนเงิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTopups.map((topup) => (
                        <tr key={topup.id} className="group hover:bg-white/[0.03] transition-colors">
                          <td className="py-4 sm:py-5 px-6 sm:px-8">
                            <div className="flex items-center gap-3 sm:gap-4">
                               <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-lg sm:rounded-xl flex items-center justify-center text-emerald-400 font-bold text-[10px] sm:text-xs">
                                  {topup.user.name.charAt(0).toUpperCase()}
                               </div>
                               <div className="min-w-0">
                                  <p className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">{topup.user.name}</p>
                                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-widest truncate">{topup.user.email}</p>
                               </div>
                            </div>
                          </td>
                          <td className="py-4 sm:py-5 px-6 sm:px-8">
                             <div className="flex flex-col min-w-0">
                                <span className="text-[11px] sm:text-xs font-bold text-gray-400 tracking-tight truncate">
                                  {new Date(topup.createdAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                  {new Date(topup.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                             </div>
                          </td>
                          <td className="py-4 sm:py-5 px-6 sm:px-8">
                             <div className="flex flex-col gap-1 min-w-0">
                                <span className="inline-flex items-center w-fit px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[100px]">
                                   {topup.method || 'ช่องทางอื่น'}
                                </span>
                                {topup.note && <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 truncate max-w-[120px]">{topup.note}</p>}
                             </div>
                          </td>
                          <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                             <div className="flex items-center justify-end gap-1.5 text-emerald-400 font-black tracking-tight">
                                <span className="text-[10px] sm:text-xs">฿</span>
                                <span className="text-base sm:text-lg">+{topup.amount.toLocaleString()}</span>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
           </div>
        </div>

        {/* Sidebar Insights - Responsive Columns on md */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6 sm:gap-8">
           <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/10 rounded-[1.5rem] sm:rounded-3xl space-y-6 h-fit">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 tracking-tight">
                <PieChart className="w-5 h-5 text-emerald-400" /> อัตราการเติบโต
              </h3>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                       <span className="text-gray-500">เป้าหมายรายเดือน</span>
                       <span className="text-emerald-400">72% สำเร็จ</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[72%] bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                 </div>

                 <div className="p-4 sm:p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">เฉลี่ย/สลิป</span>
                       <span className="text-xs sm:text-sm font-bold text-white tracking-tight">฿{(stats && stats.countAllTime > 0 ? stats.totalAllTime / stats.countAllTime : 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">ความสม่ำเสมอ</span>
                       <span className="text-xs sm:text-sm font-bold text-white tracking-tight uppercase">High</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 space-y-6 h-fit">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" /> ตัวกรองช่องทาง
                 </h3>
                 <button className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">ล้างค่า</button>
              </div>
              
              <div className="space-y-3">
                 {['TrueMoney', 'Bank Slip', 'Manual'].map((method) => (
                   <label key={method} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]">
                      <span className="text-xs font-bold text-gray-400">{method}</span>
                      <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-black/50 text-emerald-500 focus:ring-emerald-500/20" />
                   </label>
                 ))}
              </div>
              
              <button className="w-full py-3.5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95">
                <Download className="w-3.5 h-3.5" /> ส่งออกรายงาน
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
