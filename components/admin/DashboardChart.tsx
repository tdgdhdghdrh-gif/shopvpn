'use client'

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  ComposedChart, Line, RadialBarChart, RadialBar, LineChart
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

// ===================================================================
// Composed Chart — dual axis: bars (count) + line (amount)
// ===================================================================
export function ComposedRevenueChart({ data, height = 280 }: { data: any[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="composed-bar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10, fontWeight: 600 }} dy={8} />
          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10, fontWeight: 600 }} />
          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10, fontWeight: 600 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#fff', fontSize: '12px' }} labelStyle={{ color: '#71717a', fontSize: '10px', fontWeight: 'bold' }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
          <Bar yAxisId="left" dataKey="count" name="ครั้งเติม" fill="url(#composed-bar)" radius={[4, 4, 0, 0]} animationDuration={1200} />
          <Line yAxisId="right" dataKey="topup" name="ยอดเงิน (฿)" type="monotone" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} animationDuration={1200} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ===================================================================
// Hourly Bars — 24-hour distribution
// ===================================================================
export function HourlyBars({ data, height = 200 }: { data: any[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="hour-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 9, fontWeight: 600 }} interval={2} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10 }} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#fff', fontSize: '12px' }} labelStyle={{ color: '#71717a', fontSize: '10px', fontWeight: 'bold' }} formatter={(v: any) => [v, 'ออเดอร์']} />
          <Bar dataKey="count" fill="url(#hour-grad)" radius={[3, 3, 0, 0]} animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ===================================================================
// Day-of-Week Stacked Bars
// ===================================================================
export function DowChart({ data, height = 220 }: { data: any[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 700 }} dy={4} />
          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#fff', fontSize: '12px' }} labelStyle={{ color: '#71717a', fontSize: '10px', fontWeight: 'bold' }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
          <Bar yAxisId="left" dataKey="orders" name="ออเดอร์" fill="#a855f7" radius={[6, 6, 0, 0]} animationDuration={1000} />
          <Line yAxisId="right" type="monotone" dataKey="revenue" name="รายได้" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ===================================================================
// Radial Bar — package mix
// ===================================================================
export function PackageRadial({ data, height = 220 }: { data: any[]; height?: number }) {
  const total = data.reduce((s, d) => s + (d.count || 0), 0)
  if (total === 0) return <div style={{ height }} className="flex items-center justify-center text-xs text-zinc-600">ไม่มีข้อมูล</div>

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="22%" outerRadius="95%" barSize={14} data={data}>
          <RadialBar background dataKey="count" cornerRadius={8} animationDuration={1000} />
          <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#fff', fontSize: '12px' }} />
          <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 10 }} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ===================================================================
// Sparkline — small inline line chart
// ===================================================================
export function Sparkline({ data, color = '#10b981', height = 40, dataKey = 'count' }: { data: any[]; color?: string; height?: number; dataKey?: string }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} animationDuration={800} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
