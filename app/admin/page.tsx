'use client'

import { useEffect, useState } from 'react'
import { 
  Server, 
  Users, 
  Wallet,
  Activity,
  Globe,
  LayoutDashboard,
  Zap,
  Clock,
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react'
import DashboardCard from '@/components/admin/DashboardCard'
import DashboardChart from '@/components/admin/DashboardChart'

interface Stats {
  servers: number
  users: number
  orders: number
  totalBalance: number
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ servers: 0, users: 0, orders: 0, totalBalance: 0 })
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [usersRes, serversRes, topupsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/servers'),
        fetch('/api/admin/topups')
      ])
      
      const usersData = await usersRes.json()
      const serversData = await serversRes.json()
      const topupsData = await topupsRes.json()
      
      setStats({
        servers: serversData.servers?.length || 0,
        users: usersData.users?.length || 0,
        orders: 0,
        totalBalance: usersData.users?.reduce((sum: number, u: any) => sum + u.balance, 0) || 0
      })

      // Generate chart data from topups
      if (topupsData.topups) {
        const processed = topupsData.topups.slice(0, 50).reduce((acc: any[], t: any) => {
          const date = new Date(t.createdAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })
          const existing = acc.find(item => item.date === date)
          if (existing) {
            existing.amount += t.amount
          } else {
            acc.push({ date, amount: t.amount })
          }
          return acc
        }, []).reverse().slice(-7)
        setChartData(processed)
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-[6px] border-blue-500/10 rounded-full" />
          <div className="absolute inset-0 border-[6px] border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.2)]" />
        </div>
        <p className="text-xs font-black text-zinc-600 tracking-[0.4em] uppercase animate-pulse">กำลังเชื่อมต่อฐานข้อมูลหลัก...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        <DashboardCard 
          label="โหนดออนไลน์" 
          value={stats.servers} 
          description="ระบบเครือข่ายเซิร์ฟเวอร์ที่ออนไลน์"
          icon={Globe}
          color="text-blue-400"
          trend="+2 ใหม่"
          trendType="positive"
        />
        <DashboardCard 
          label="ผู้ใช้ที่ลงทะเบียน" 
          value={stats.users.toLocaleString()} 
          description="บัญชีผู้ใช้ทั้งหมดในฐานข้อมูล"
          icon={Users}
          color="text-cyan-400"
          trend="8.5% ↗"
          trendType="positive"
        />
        <DashboardCard 
          label="สภาพคล่องระบบ" 
          value={`฿${stats.totalBalance.toLocaleString()}`} 
          description="ยอดเงินหมุนเวียนคงเหลือทั้งหมด"
          icon={Wallet}
          color="text-emerald-400"
          trend="เสถียร"
          trendType="neutral"
        />
        <DashboardCard 
          label="ความสมบูรณ์ของเครือข่าย" 
          value="99.9%" 
          description="ความพร้อมในการทำงานของระบบ"
          icon={Activity}
          color="text-purple-400"
          trend="สูงสุด"
          trendType="positive"
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        <div className="xl:col-span-2">
          <DashboardChart 
            data={chartData.length > 0 ? chartData : [
              { date: 'จ.', amount: 400 },
              { date: 'อ.', amount: 300 },
              { date: 'พ.', amount: 600 },
              { date: 'พฤ.', amount: 800 },
              { date: 'ศ.', amount: 500 },
              { date: 'ส.', amount: 900 },
              { date: 'อา.', amount: 1100 },
            ]} 
            title="บทวิเคราะห์ประสิทธิภาพรายได้" 
          />
        </div>

        {/* Sidebar Status Info */}
        <div className="space-y-6 sm:space-y-8">
           <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <Cpu className="w-5 h-5 text-blue-400" /> โครงสร้างพื้นฐาน
              </h3>
              
              <div className="space-y-6">
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span className="text-zinc-500">ภาระการประมวลผล</span>
                       <span className="text-blue-400">24%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 border border-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[24%] bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span className="text-zinc-500">ปริมาณการใช้งานทั่วโลก</span>
                       <span className="text-cyan-400">12%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 border border-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[12%] bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                 <div className="flex items-center gap-4 p-4 bg-zinc-950/50 border border-white/5 rounded-2xl group cursor-pointer hover:border-blue-500/30 transition-all">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                       <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-zinc-500 uppercase">สถานะไฟร์วอลล์</p>
                       <p className="text-xs font-bold text-white uppercase tracking-tighter">กำลังป้องกันอย่างแข็งแกร่ง</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-blue-400 transition-colors" />
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-5 h-5 text-blue-400" />
                 </div>
                 <h3 className="text-base font-black text-white uppercase tracking-tighter">ตัวตรวจสอบเหตุการณ์</h3>
              </div>
              
              <div className="space-y-4">
                 {[
                   { label: 'Security Handshake', time: '2นาที', color: 'bg-emerald-500' },
                   { label: 'เชื่อมต่อฐานข้อมูลสำเร็จ', time: '14นาที', color: 'bg-blue-500' },
                   { label: 'ตรวจสอบระบบ API', time: '1ชม.', color: 'bg-zinc-500' },
                 ].map((event, i) => (
                   <div key={i} className="flex items-center gap-4">
                      <div className={`w-1.5 h-1.5 rounded-full ${event.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                      <span className="text-xs font-bold text-zinc-300 flex-1">{event.label}</span>
                      <span className="text-[10px] font-black text-zinc-600 uppercase">{event.time} ที่แล้ว</span>
                   </div>
                 ))}
              </div>
              
              <button className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-all">
                เข้าถึงประวัติระบบ
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
