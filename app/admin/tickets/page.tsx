'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Ticket,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  ChevronRight,
  User,
  Trash2,
  AlertTriangle,
  Inbox,
} from 'lucide-react'

interface TicketItem {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  user: { name: string; email: string }
  messages: { message: string; isAdmin: boolean }[]
  _count: { messages: number }
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }> = {
  open: { label: 'รอตอบ', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', dot: 'bg-yellow-400', icon: <Clock className="w-3.5 h-3.5" /> },
  answered: { label: 'ตอบแล้ว', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', dot: 'bg-emerald-400', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  closed: { label: 'ปิดแล้ว', color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/30', dot: 'bg-zinc-500', icon: <XCircle className="w-3.5 h-3.5" /> },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'ต่ำ', color: 'text-zinc-500' },
  normal: { label: 'ปกติ', color: 'text-blue-400' },
  high: { label: 'ด่วน', color: 'text-red-400' },
}

const categoryLabels: Record<string, string> = {
  general: 'ทั่วไป',
  payment: 'การชำระเงิน',
  vpn: 'VPN',
  account: 'บัญชี',
  bug: 'แจ้งบัค',
  other: 'อื่นๆ',
}

export default function AdminTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [counts, setCounts] = useState<{ status: string; _count: { id: number } }[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 8000)
    return () => clearInterval(interval)
  }, [filter, search])

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/tickets?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setTickets(data.tickets)
      setCounts(data.counts)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }

  const deleteTicket = async (ticketId: string) => {
    if (!confirm('ต้องการลบ Ticket นี้?')) return
    setDeleting(ticketId)
    try {
      await fetch(`/api/admin/tickets/${ticketId}`, { method: 'DELETE' })
      fetchTickets()
    } catch {
      // error
    } finally {
      setDeleting(null)
    }
  }

  const getCount = (status: string) => {
    if (status === 'all') return counts.reduce((sum, c) => sum + c._count.id, 0)
    return counts.find((c) => c.status === status)?._count?.id || 0
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'เมื่อสักครู่'
    if (mins < 60) return `${mins} นาทีที่แล้ว`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} ชม.ที่แล้ว`
    const days = Math.floor(hrs / 24)
    return `${days} วันที่แล้ว`
  }

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-xl border border-violet-500/30">
            <Ticket className="w-5 h-5 text-violet-400" />
          </div>
          Ticket ทั้งหมด
        </h1>
        <p className="text-zinc-500 text-sm mt-1">จัดการ Ticket จากผู้ใช้ทั้งหมด</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'all', label: 'ทั้งหมด', color: 'from-violet-500/20 to-cyan-500/20', border: 'border-violet-500/30' },
          { key: 'open', label: 'รอตอบ', color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' },
          { key: 'answered', label: 'ตอบแล้ว', color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/30' },
          { key: 'closed', label: 'ปิดแล้ว', color: 'from-zinc-500/20 to-zinc-600/20', border: 'border-zinc-600/30' },
        ].map((s) => (
          <motion.button
            key={s.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(s.key)}
            className={`p-4 rounded-xl bg-gradient-to-br ${s.color} border ${
              filter === s.key ? 'border-violet-400/60 ring-1 ring-violet-500/30' : s.border
            } text-left transition-all cursor-pointer`}
          >
            <p className="text-xs text-zinc-400">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{getCount(s.key)}</p>
          </motion.button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="ค้นหาผู้ใช้หรือหัวข้อ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-zinc-900/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">ไม่มี Ticket</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {tickets.map((ticket, i) => {
              const st = statusConfig[ticket.status] || statusConfig.open
              const pr = priorityConfig[ticket.priority] || priorityConfig.normal
              const lastMsg = ticket.messages[0]
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group bg-zinc-900/40 border border-zinc-800/50 hover:border-violet-500/30 rounded-xl p-3 sm:p-4 transition-all cursor-pointer"
                  onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                >
                  <div className="flex items-start gap-3">
                    {/* Priority dot + status */}
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${st.dot} ${ticket.status === 'open' ? 'animate-pulse' : ''}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${st.bg} ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                        {ticket.priority === 'high' && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                            <AlertTriangle className="w-3 h-3" /> {pr.label}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-600">{categoryLabels[ticket.category] || ticket.category}</span>
                        <span className="text-[10px] text-zinc-700">#{ticket.id.slice(-6)}</span>
                      </div>

                      <h3 className="text-white text-sm font-medium group-hover:text-violet-300 transition-colors truncate">
                        {ticket.subject}
                      </h3>

                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-zinc-600" />
                          <span className="text-xs text-zinc-500">{ticket.user.name}</span>
                          <span className="text-[10px] text-zinc-700">({ticket.user.email})</span>
                        </div>
                      </div>

                      {lastMsg && (
                        <p className="text-zinc-600 text-xs mt-1 truncate">
                          {lastMsg.isAdmin ? '🛡️ แอดมิน: ' : '👤 ผู้ใช้: '}
                          {lastMsg.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-[10px] text-zinc-600">{timeAgo(ticket.updatedAt)}</span>
                      <div className="flex items-center gap-1 text-zinc-600">
                        <MessageCircle className="w-3 h-3" />
                        <span className="text-[10px]">{ticket._count.messages}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteTicket(ticket.id) }}
                          className="p-1 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          disabled={deleting === ticket.id}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-violet-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
