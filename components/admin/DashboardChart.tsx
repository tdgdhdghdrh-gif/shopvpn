'use client'

import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

interface ChartData {
  date: string
  amount?: number
  count?: number
}

interface DashboardChartProps {
  data: ChartData[]
  title: string
  type?: 'area' | 'bar'
  color?: string
  dataKey?: string
  height?: number
}

const TOOLTIP_STYLE = {
  backgroundColor: '#09090b',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  padding: '10px 14px',
}

function AreaChartContent({ data, color = '#3b82f6', dataKey = 'amount', height = 280 }: { data: ChartData[]; color?: string; dataKey?: string; height?: number }) {
  const gradientId = `gradient-${dataKey}-${color.replace('#', '')}`
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10, fontWeight: 600 }} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10, fontWeight: 600 }} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' as const, fontWeight: 'bold' }}
            formatter={(value: any) => [`${Number(value || 0).toLocaleString()} ${dataKey === 'count' ? '' : '฿'}`, dataKey === 'count' ? 'จำนวน' : 'ยอดเงิน']}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fillOpacity={1} fill={`url(#${gradientId})`} animationDuration={1200} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function BarChartContent({ data, color = '#8b5cf6', dataKey = 'count', height = 280 }: { data: ChartData[]; color?: string; dataKey?: string; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10, fontWeight: 600 }} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10, fontWeight: 600 }} allowDecimals={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' as const, fontWeight: 'bold' }}
            formatter={(value: any) => [`${Number(value || 0).toLocaleString()}`, 'จำนวน']}
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} animationDuration={1200} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Donut chart for topup method breakdown
interface DonutData { name: string; value: number; color: string }
export function DonutChart({ data, height = 220 }: { data: DonutData[]; height?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return <div style={{ height }} className="flex items-center justify-center text-xs text-zinc-600">ไม่มีข้อมูล</div>
  
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            dataKey="value"
            stroke="none"
            animationDuration={1200}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: any, name: string) => [`${Number(value).toLocaleString()} ฿`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function DashboardChart({ data, title, type = 'area', color, dataKey, height }: DashboardChartProps) {
  if (!title) {
    if (type === 'bar') return <BarChartContent data={data} color={color} dataKey={dataKey} height={height} />
    return <AreaChartContent data={data} color={color} dataKey={dataKey} height={height} />
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
      <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
      {type === 'bar' 
        ? <BarChartContent data={data} color={color} dataKey={dataKey} height={height} />
        : <AreaChartContent data={data} color={color} dataKey={dataKey} height={height} />
      }
    </div>
  )
}

export { AreaChartContent, BarChartContent }
