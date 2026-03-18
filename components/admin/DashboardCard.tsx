'use client'

import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface DashboardCardProps {
  label: string
  value: string | number
  description: string
  icon: LucideIcon
  color?: string
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
}

export default function DashboardCard({
  label,
  value,
  description,
  icon: Icon,
  color = 'text-blue-400',
  trend,
  trendType = 'neutral'
}: DashboardCardProps) {
  return (
    <div className="relative group overflow-hidden bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 transition-all duration-300 hover:bg-zinc-900/80 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50">
      {/* Background Glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 blur-[60px] opacity-10 rounded-full transition-all duration-500 group-hover:opacity-20
        ${color.includes('blue') ? 'bg-blue-500' : 
          color.includes('cyan') ? 'bg-cyan-500' :
          color.includes('emerald') ? 'bg-emerald-500' :
          color.includes('purple') ? 'bg-purple-500' : 'bg-blue-500'}
      `} />

      <div className="relative flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <div className={`p-3 bg-zinc-950 border border-white/5 rounded-2xl ${color} shadow-inner`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border
              ${trendType === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                trendType === 'negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}
            `}>
              {trend}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-widest">{label}</p>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tighter leading-none">{value}</h3>
        </div>

        <p className="text-xs sm:text-sm font-medium text-zinc-400 mt-auto">{description}</p>
      </div>
    </div>
  )
}
