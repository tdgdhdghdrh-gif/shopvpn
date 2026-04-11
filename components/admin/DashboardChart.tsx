'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface ChartData {
  date: string
  amount: number
}

interface DashboardChartProps {
  data: ChartData[]
  title: string
}

function ChartContent({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[250px] sm:h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="rgba(255,255,255,0.03)" 
          />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 11, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 11, fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#09090b', 
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '12px 16px',
            }}
            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}
            formatter={(value: any) => [`${Number(value || 0).toLocaleString()} ฿`, 'จำนวนเงิน']}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function DashboardChart({ data, title }: DashboardChartProps) {
  // If no title, render just the chart (for embedding in custom containers)
  if (!title) {
    return <ChartContent data={data} />
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs sm:text-sm font-medium text-zinc-500">อัตราการเติบโตและรายได้สะสมย้อนหลัง</p>
        </div>
        <div className="flex bg-zinc-950 border border-white/5 rounded-xl p-1 w-fit">
          <button className="px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-white bg-zinc-800 rounded-lg shadow-lg">7 วัน</button>
          <button className="px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-zinc-500 hover:text-zinc-300">30 วัน</button>
        </div>
      </div>

      <ChartContent data={data} />
    </div>
  )
}
